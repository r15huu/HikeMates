from rest_framework import serializers
from .models import Hike, JoinRequest, HikeMembership


class HikeSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source="creator.username", read_only=True)
    member_count = serializers.IntegerField(source="memberships.count", read_only=True)

    # NEW: user-specific fields
    is_member = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    join_request_status = serializers.SerializerMethodField()

    class Meta:
        model = Hike
        fields = "__all__"
        read_only_fields = ("creator", "created_at")

    def _get_user(self):
        request = self.context.get("request")
        return getattr(request, "user", None)

    def get_is_member(self, obj):
        user = self._get_user()
        if not user or not user.is_authenticated:
            return False
        return HikeMembership.objects.filter(hike=obj, user=user).exists()

    def get_is_admin(self, obj):
        user = self._get_user()
        if not user or not user.is_authenticated:
            return False
        return HikeMembership.objects.filter(
            hike=obj, user=user, role=HikeMembership.ADMIN
        ).exists()

    def get_join_request_status(self, obj):
        user = self._get_user()
        if not user or not user.is_authenticated:
            return None
        jr = JoinRequest.objects.filter(hike=obj, user=user).first()
        return jr.status if jr else None


class JoinRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = JoinRequest
        fields = "__all__"
        read_only_fields = ("user", "status", "created_at")