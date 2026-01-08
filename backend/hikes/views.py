from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Hike, HikeMembership, JoinRequest
from .serializers import HikeSerializer, JoinRequestSerializer


def is_hike_admin(hike: Hike, user) -> bool:
    return HikeMembership.objects.filter(
        hike=hike, user=user, role=HikeMembership.ADMIN
    ).exists()


class HikeViewSet(viewsets.ModelViewSet):
    queryset = Hike.objects.all().order_by("-created_at")
    serializer_class = HikeSerializer

    @action(detail=False, methods=["GET"])
    def my(self, request):
        """
        GET /api/hikes/my/
        Returns hikes where the current user is a member (includes hikes they created,
        since the creator is auto-added as admin member).
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

    @action(detail=True, methods=["POST"])
    def join(self, request, pk=None):
        hike = self.get_object()
        user = request.user

        # already a member?
        if HikeMembership.objects.filter(hike=hike, user=user).exists():
            return Response({"detail": "Already joined."}, status=400)

        if hike.visibility == Hike.PUBLIC:
            HikeMembership.objects.create(hike=hike, user=user, role=HikeMembership.MEMBER)
            return Response({"detail": "Joined public hike."}, status=200)

        # private hike: create join request
        jr, created = JoinRequest.objects.get_or_create(hike=hike, user=user)
        if not created:
            return Response({"detail": f"Join request already {jr.status}."}, status=400)
        return Response({"detail": "Join request created."}, status=201)

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

        jr = JoinRequest.objects.get(id=req_id, hike=hike)
        jr.status = JoinRequest.APPROVED
        jr.save()

        HikeMembership.objects.get_or_create(
            hike=hike, user=jr.user, defaults={"role": HikeMembership.MEMBER}
        )
        return Response({"detail": "Approved."}, status=200)