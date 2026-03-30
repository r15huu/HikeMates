from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/auth/register/"

    def test_register_success(self):
        res = self.client.post(self.url, {
            "username": "hiker1",
            "email": "hiker1@test.com",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["username"], "hiker1")
        self.assertTrue(User.objects.filter(username="hiker1").exists())

    def test_register_password_mismatch(self):
        res = self.client.post(self.url, {
            "username": "hiker2",
            "password": "StrongPass123!",
            "password2": "DifferentPass123!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username(self):
        User.objects.create_user(username="taken", password="StrongPass123!")
        res = self.client.post(self.url, {
            "username": "taken",
            "password": "StrongPass123!",
            "password2": "StrongPass123!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password(self):
        res = self.client.post(self.url, {
            "username": "hiker3",
            "password": "123",
            "password2": "123",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class MeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="hiker", email="hiker@test.com", password="StrongPass123!"
        )

    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get("/api/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "hiker")
        self.assertEqual(res.data["email"], "hiker@test.com")

    def test_me_unauthenticated(self):
        res = self.client.get("/api/auth/me/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="resetter", email="reset@test.com", password="StrongPass123!"
        )

    def test_reset_request_existing_email(self):
        res = self.client.post("/api/auth/password-reset/", {"email": "reset@test.com"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_request_nonexistent_email(self):
        res = self.client.post("/api/auth/password-reset/", {"email": "nobody@test.com"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_reset_confirm_invalid_token(self):
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        res = self.client.post("/api/auth/password-reset/confirm/", {
            "uid": uid,
            "token": "bad-token",
            "new_password": "NewStrong123!",
            "new_password2": "NewStrong123!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_confirm_valid_token(self):
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        res = self.client.post("/api/auth/password-reset/confirm/", {
            "uid": uid,
            "token": token,
            "new_password": "NewStrong123!",
            "new_password2": "NewStrong123!",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewStrong123!"))


class JWTTokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="jwtuser", password="StrongPass123!"
        )

    def test_obtain_token(self):
        res = self.client.post("/api/auth/token/", {
            "username": "jwtuser",
            "password": "StrongPass123!",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_refresh_token(self):
        token_res = self.client.post("/api/auth/token/", {
            "username": "jwtuser",
            "password": "StrongPass123!",
        })
        refresh = token_res.data["refresh"]
        res = self.client.post("/api/auth/refresh/", {"refresh": refresh})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_invalid_credentials(self):
        res = self.client.post("/api/auth/token/", {
            "username": "jwtuser",
            "password": "WrongPassword!",
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
