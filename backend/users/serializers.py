from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(data["password"])
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)  # hashes password (never store plain text)
        user.save()
        return user


class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "is_public", "bio", "avatar_url")


# =========================
# Forgot Password serializers
# =========================

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password2"]:
            raise serializers.ValidationError({"new_password2": "Passwords do not match."})

        validate_password(attrs["new_password"])
        return attrs

    def save(self):
        uid = self.validated_data["uid"]
        token = self.validated_data["token"]
        new_password = self.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            raise serializers.ValidationError({"uid": "Invalid uid."})

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        user.set_password(new_password)
        user.save()
        return user