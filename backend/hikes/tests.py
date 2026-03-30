from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from .models import Hike, HikeMembership, JoinRequest

User = get_user_model()


class HikeTestBase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(username="admin1", password="StrongPass123!")
        self.member_user = User.objects.create_user(username="member1", password="StrongPass123!")
        self.outsider = User.objects.create_user(username="outsider", password="StrongPass123!")
        self.hike_data = {
            "title": "Blue Hills Hike",
            "location_name": "Blue Hills, MA",
            "start_time": timezone.now().isoformat(),
            "intensity": "medium",
            "max_people": 8,
            "visibility": "public",
        }


class HikeCRUDTests(HikeTestBase):
    def test_create_hike(self):
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post("/api/hikes/", self.hike_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["title"], "Blue Hills Hike")
        self.assertEqual(res.data["creator_username"], "admin1")
        self.assertTrue(
            HikeMembership.objects.filter(
                hike_id=res.data["id"], user=self.admin_user, role="admin"
            ).exists()
        )

    def test_create_hike_unauthenticated(self):
        res = self.client.post("/api/hikes/", self.hike_data)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_hikes_unauthenticated(self):
        self.client.force_authenticate(user=self.admin_user)
        self.client.post("/api/hikes/", self.hike_data)
        self.client.force_authenticate(user=None)
        res = self.client.get("/api/hikes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_update_hike_admin_only(self):
        self.client.force_authenticate(user=self.admin_user)
        create_res = self.client.post("/api/hikes/", self.hike_data)
        hike_id = create_res.data["id"]

        self.client.force_authenticate(user=self.outsider)
        res = self.client.patch(f"/api/hikes/{hike_id}/", {"title": "Hacked"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.patch(f"/api/hikes/{hike_id}/", {"title": "Updated"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["title"], "Updated")

    def test_delete_hike_admin_only(self):
        self.client.force_authenticate(user=self.admin_user)
        create_res = self.client.post("/api/hikes/", self.hike_data)
        hike_id = create_res.data["id"]

        self.client.force_authenticate(user=self.outsider)
        res = self.client.delete(f"/api/hikes/{hike_id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.delete(f"/api/hikes/{hike_id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)


class HikePrivacyTests(HikeTestBase):
    def test_private_hike_hidden_from_non_members(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {**self.hike_data, "visibility": "private"}
        self.client.post("/api/hikes/", data)

        self.client.force_authenticate(user=None)
        res = self.client.get("/api/hikes/")
        self.assertEqual(len(res.data), 0)

        self.client.force_authenticate(user=self.outsider)
        res = self.client.get("/api/hikes/")
        self.assertEqual(len(res.data), 0)

    def test_private_hike_visible_to_members(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {**self.hike_data, "visibility": "private"}
        self.client.post("/api/hikes/", data)

        res = self.client.get("/api/hikes/")
        self.assertEqual(len(res.data), 1)

    def test_my_hikes_returns_only_user_hikes(self):
        self.client.force_authenticate(user=self.admin_user)
        self.client.post("/api/hikes/", self.hike_data)

        self.client.force_authenticate(user=self.outsider)
        res = self.client.get("/api/hikes/my/")
        self.assertEqual(len(res.data), 0)


class JoinLeaveTests(HikeTestBase):
    def _create_hike(self, visibility="public"):
        self.client.force_authenticate(user=self.admin_user)
        data = {**self.hike_data, "visibility": visibility}
        res = self.client.post("/api/hikes/", data)
        return res.data["id"]

    def test_join_public_hike(self):
        hike_id = self._create_hike("public")
        self.client.force_authenticate(user=self.member_user)
        res = self.client.post(f"/api/hikes/{hike_id}/join/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(
            HikeMembership.objects.filter(hike_id=hike_id, user=self.member_user).exists()
        )

    def test_join_public_hike_twice(self):
        hike_id = self._create_hike("public")
        self.client.force_authenticate(user=self.member_user)
        self.client.post(f"/api/hikes/{hike_id}/join/")
        res = self.client.post(f"/api/hikes/{hike_id}/join/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_private_hike_not_visible_to_non_member(self):
        hike_id = self._create_hike("private")
        self.client.force_authenticate(user=self.member_user)
        res = self.client.post(f"/api/hikes/{hike_id}/join/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_leave_hike(self):
        hike_id = self._create_hike("public")
        self.client.force_authenticate(user=self.member_user)
        self.client.post(f"/api/hikes/{hike_id}/join/")
        res = self.client.post(f"/api/hikes/{hike_id}/leave/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(
            HikeMembership.objects.filter(hike_id=hike_id, user=self.member_user).exists()
        )

    def test_last_admin_cannot_leave(self):
        hike_id = self._create_hike("public")
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(f"/api/hikes/{hike_id}/leave/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_join_request_private_hike_not_accessible(self):
        hike_id = self._create_hike("private")
        self.client.force_authenticate(user=self.member_user)
        res = self.client.post(f"/api/hikes/{hike_id}/cancel_request/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class JoinRequestManagementTests(HikeTestBase):
    def _setup_private_hike_with_request(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {**self.hike_data, "visibility": "private"}
        res = self.client.post("/api/hikes/", data)
        hike_id = res.data["id"]

        jr = JoinRequest.objects.create(
            hike_id=hike_id, user=self.member_user, status="pending"
        )
        return hike_id, jr.id

    def test_list_join_requests_non_member_404(self):
        hike_id, _ = self._setup_private_hike_with_request()

        self.client.force_authenticate(user=self.outsider)
        res = self.client.get(f"/api/hikes/{hike_id}/join_requests/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_join_requests_admin_success(self):
        hike_id, _ = self._setup_private_hike_with_request()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.get(f"/api/hikes/{hike_id}/join_requests/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_approve_join_request(self):
        hike_id, jr_id = self._setup_private_hike_with_request()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(
            f"/api/hikes/{hike_id}/approve_request/",
            {"request_id": jr_id},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(
            HikeMembership.objects.filter(hike_id=hike_id, user=self.member_user).exists()
        )

    def test_reject_join_request(self):
        hike_id, jr_id = self._setup_private_hike_with_request()

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(
            f"/api/hikes/{hike_id}/reject_request/",
            {"request_id": jr_id},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        jr = JoinRequest.objects.get(id=jr_id)
        self.assertEqual(jr.status, "rejected")

    def test_approve_request_non_member_404(self):
        hike_id, jr_id = self._setup_private_hike_with_request()

        self.client.force_authenticate(user=self.outsider)
        res = self.client.post(
            f"/api/hikes/{hike_id}/approve_request/",
            {"request_id": jr_id},
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_remove_member(self):
        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post("/api/hikes/", self.hike_data)
        hike_id = res.data["id"]

        self.client.force_authenticate(user=self.member_user)
        self.client.post(f"/api/hikes/{hike_id}/join/")

        self.client.force_authenticate(user=self.admin_user)
        res = self.client.post(
            f"/api/hikes/{hike_id}/remove_member/",
            {"user_id": self.member_user.id},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(
            HikeMembership.objects.filter(hike_id=hike_id, user=self.member_user).exists()
        )


class HikeSerializerFieldTests(HikeTestBase):
    def test_serializer_computed_fields(self):
        self.client.force_authenticate(user=self.admin_user)
        create_res = self.client.post("/api/hikes/", self.hike_data)
        hike_id = create_res.data["id"]

        res = self.client.get(f"/api/hikes/{hike_id}/")
        self.assertTrue(res.data["is_admin"])
        self.assertTrue(res.data["is_member"])
        self.assertEqual(res.data["member_count"], 1)

        self.client.force_authenticate(user=self.outsider)
        res = self.client.get(f"/api/hikes/{hike_id}/")
        self.assertFalse(res.data["is_admin"])
        self.assertFalse(res.data["is_member"])
        self.assertIsNone(res.data["join_request_status"])
