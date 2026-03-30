from unittest.mock import patch, MagicMock
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


class GeocodeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/trails/geocode/"

    def test_missing_query_param(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("trails.views._session")
    def test_successful_geocode(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"display_name": "Blue Hills, MA", "lat": "42.21", "lon": "-71.11"}
        ]
        mock_response.raise_for_status = MagicMock()
        mock_session.return_value.get.return_value = mock_response

        res = self.client.get(self.url, {"q": "Blue Hills"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["display_name"], "Blue Hills, MA")

    @patch("trails.views._session")
    def test_geocode_403(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_session.return_value.get.return_value = mock_response

        res = self.client.get(self.url, {"q": "test"})
        self.assertEqual(res.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch("trails.views._session")
    def test_geocode_429(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_session.return_value.get.return_value = mock_response

        res = self.client.get(self.url, {"q": "test"})
        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch("trails.views._session")
    def test_geocode_timeout(self, mock_session):
        import requests
        mock_session.return_value.get.side_effect = requests.exceptions.Timeout()

        res = self.client.get(self.url, {"q": "test"})
        self.assertEqual(res.status_code, status.HTTP_504_GATEWAY_TIMEOUT)


class TrailSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/trails/search/"

    def test_missing_params(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_missing_lon(self):
        res = self.client.get(self.url, {"lat": "42.21"})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("trails.views._session")
    def test_successful_search(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "elements": [
                {"type": "way", "id": 1, "tags": {"name": "Skyline Trail"}}
            ]
        }
        mock_response.raise_for_status = MagicMock()
        mock_session.return_value.post.return_value = mock_response

        res = self.client.get(self.url, {"lat": "42.21", "lon": "-71.11"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("elements", res.data)

    @patch("trails.views._session")
    def test_search_timeout(self, mock_session):
        import requests
        mock_session.return_value.post.side_effect = requests.exceptions.Timeout()

        res = self.client.get(self.url, {"lat": "42.21", "lon": "-71.11"})
        self.assertEqual(res.status_code, status.HTTP_504_GATEWAY_TIMEOUT)
