from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    RegisterSerializer,
    UserMeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]  # signup must be open

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"detail": "User created", "username": user.username},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserMeSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/
    body: { "email": "user@example.com" }

    Sends a reset link (in dev we'll print it to backend console if using console email backend).
    Always returns the same response to prevent email enumeration.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@hikemates.local")

            send_mail(
                subject="Reset your HikeMates password",
                message=(
                    "Use this link to reset your password:\n\n"
                    f"{reset_link}\n\n"
                    "If you didn’t request this, you can ignore this email."
                ),
                from_email=from_email,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response(
            {"detail": "If that email exists, a reset link was sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm/
    body: { "uid": "...", "token": "...", "new_password": "...", "new_password2": "..." }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )