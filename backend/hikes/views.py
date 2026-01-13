from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Hike, HikeMembership, JoinRequest
from .serializers import HikeSerializer, JoinRequestSerializer


def is_hike_admin(hike: Hike, user) -> bool:
    return HikeMembership.objects.filter(
        hike=hike, user=user, role=HikeMembership.ADMIN
    ).exists()


def is_hike_member(hike: Hike, user) -> bool:
    return HikeMembership.objects.filter(hike=hike, user=user).exists()


class HikeViewSet(viewsets.ModelViewSet):
    serializer_class = HikeSerializer

    def get_queryset(self):
        """
        Privacy rule (IMPORTANT):
        - Anyone logged in can see all PUBLIC hikes
        - You can also see PRIVATE hikes ONLY if you are a member/admin
        This protects private hike details automatically because retrieve() uses queryset.
        """
        user = self.request.user

        # If your project ever allows anonymous users later, you can do:
        # if not user.is_authenticated: return Hike.objects.filter(visibility=Hike.PUBLIC)

        return (
            Hike.objects.filter(Q(visibility=Hike.PUBLIC) | Q(memberships__user=user))
            .distinct()
            .order_by("-created_at")
        )

    @action(detail=False, methods=["GET"])
    def my(self, request):
        """
        GET /api/hikes/my/
        Returns hikes where the current user is a member (includes created hikes).
        """
        user = request.user
        qs = Hike.objects.filter(memberships__user=user).distinct().order_by("-created_at")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        hike = serializer.save(creator=self.request.user)
        # creator automatically becomes admin
        HikeMembership.objects.create(
            hike=hike, user=self.request.user, role=HikeMembership.ADMIN
        )

    def update(self, request, *args, **kwargs):
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["POST"])
    def join(self, request, pk=None):
        hike = self.get_object()
        user = request.user

        # already a member?
        if is_hike_member(hike, user):
            return Response({"detail": "Already joined."}, status=400)

        if hike.visibility == Hike.PUBLIC:
            HikeMembership.objects.create(hike=hike, user=user, role=HikeMembership.MEMBER)
            return Response({"detail": "Joined public hike."}, status=200)

        # private hike: create join request (allow resubmitting if previously rejected)
        jr = JoinRequest.objects.filter(hike=hike, user=user).first()
        if jr:
            if jr.status == JoinRequest.PENDING:
                return Response({"detail": "Join request already pending."}, status=400)
            # if it was rejected/approved, reset to pending (approved would mean membership exists, but safe anyway)
            jr.status = JoinRequest.PENDING
            jr.save()
            return Response({"detail": "Join request created."}, status=201)

        JoinRequest.objects.create(hike=hike, user=user, status=JoinRequest.PENDING)
        return Response({"detail": "Join request created."}, status=201)

    @action(detail=True, methods=["POST"])
    def leave(self, request, pk=None):
        """
        POST /api/hikes/<id>/leave/
        Lets a member leave a hike.
        Safety: prevents the last admin from leaving (so the hike isn't orphaned).
        """
        hike = self.get_object()
        user = request.user

        membership = HikeMembership.objects.filter(hike=hike, user=user).first()
        if not membership:
            return Response({"detail": "You are not a member."}, status=400)

        if membership.role == HikeMembership.ADMIN:
            other_admins = HikeMembership.objects.filter(
                hike=hike, role=HikeMembership.ADMIN
            ).exclude(user=user)
            if not other_admins.exists():
                return Response({"detail": "You are the last admin. Assign another admin before leaving."}, status=400)

        membership.delete()
        return Response({"detail": "Left hike."}, status=200)

    @action(detail=True, methods=["POST"])
    def cancel_request(self, request, pk=None):
        """
        POST /api/hikes/<id>/cancel_request/
        User cancels their own pending join request (private hikes).
        We'll delete the row to keep model statuses simple.
        """
        hike = self.get_object()
        user = request.user

        jr = JoinRequest.objects.filter(hike=hike, user=user, status=JoinRequest.PENDING).first()
        if not jr:
            return Response({"detail": "No pending join request to cancel."}, status=400)

        jr.delete()
        return Response({"detail": "Join request cancelled."}, status=200)

    @action(detail=True, methods=["GET"])
    def join_requests(self, request, pk=None):
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)

        qs = hike.join_requests.all().order_by("-created_at")
        return Response(JoinRequestSerializer(qs, many=True).data)

    @action(detail=True, methods=["POST"])
    def approve_request(self, request, pk=None):
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)

        req_id = request.data.get("request_id")
        if not req_id:
            return Response({"detail": "request_id is required"}, status=400)

        jr = JoinRequest.objects.filter(id=req_id, hike=hike).first()
        if not jr:
            return Response({"detail": "Join request not found."}, status=404)

        jr.status = JoinRequest.APPROVED
        jr.save()

        HikeMembership.objects.get_or_create(
            hike=hike, user=jr.user, defaults={"role": HikeMembership.MEMBER}
        )
        return Response({"detail": "Approved."}, status=200)

    @action(detail=True, methods=["POST"])
    def reject_request(self, request, pk=None):
        """
        POST /api/hikes/<id>/reject_request/
        body: { "request_id": <id> }
        Admin rejects a pending request.
        """
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)

        req_id = request.data.get("request_id")
        if not req_id:
            return Response({"detail": "request_id is required"}, status=400)

        jr = JoinRequest.objects.filter(id=req_id, hike=hike).first()
        if not jr:
            return Response({"detail": "Join request not found."}, status=404)

        jr.status = JoinRequest.REJECTED
        jr.save()
        return Response({"detail": "Rejected."}, status=200)

    @action(detail=True, methods=["POST"])
    def remove_member(self, request, pk=None):
        """
        POST /api/hikes/<id>/remove_member/
        body: { "user_id": <id> }
        Admin removes a member from the hike.
        """
        hike = self.get_object()
        if not is_hike_admin(hike, request.user):
            return Response({"detail": "Admin only."}, status=403)

        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id is required"}, status=400)

        # Prevent removing yourself if you're the last admin
        if str(user_id) == str(request.user.id):
            last_admin = (
                HikeMembership.objects.filter(hike=hike, role=HikeMembership.ADMIN).count() == 1
            )
            if last_admin:
                return Response({"detail": "You are the last admin; cannot remove yourself."}, status=400)

        deleted, _ = HikeMembership.objects.filter(hike=hike, user_id=user_id).delete()
        if deleted == 0:
            return Response({"detail": "User is not a member."}, status=404)

        return Response({"detail": "Member removed."}, status=200)