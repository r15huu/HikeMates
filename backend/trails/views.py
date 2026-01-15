from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


def _session():
    s = requests.Session()
    retries = Retry(
        total=2,
        backoff_factor=0.6,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retries)
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    return s


class GeocodeView(APIView):
    permission_classes = []  # guests allowed

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "Missing query param: q"}, status=status.HTTP_400_BAD_REQUEST)

        url = getattr(settings, "NOMINATIM_URL", "https://nominatim.openstreetmap.org/search")
        user_agent = getattr(
            settings,
            "OSM_USER_AGENT",
            "HikeMates/1.0 (dev; contact: you@example.com)"
        )
        frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        # IMPORTANT: Nominatim may 403 if UA/contact is weak.
        headers = {
            "User-Agent": user_agent,
            "Referer": frontend,
            "Accept": "application/json",
        }

        params = {
            "q": q,
            "format": "json",
            "limit": 5,
        }

        try:
            s = _session()
            r = s.get(url, params=params, headers=headers, timeout=(5, 25))

            # Handle 403 cleanly (instead of crashing)
            if r.status_code == 403:
                return Response(
                    {
                        "detail": (
                            "Geocoding blocked (403) by Nominatim. "
                            "Set a real OSM_USER_AGENT with contact info in settings.py "
                            "and try again. Example: "
                            "'HikeMates/1.0 (dev; contact: your@email.com)'."
                        )
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            if r.status_code == 429:
                return Response(
                    {"detail": "Geocoding rate-limited. Try again in a few seconds."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            r.raise_for_status()

            data = r.json()
            results = [
                {
                    "display_name": item.get("display_name"),
                    "lat": item.get("lat"),
                    "lon": item.get("lon"),
                }
                for item in data
            ]
            return Response(results)

        except requests.exceptions.Timeout:
            return Response(
                {"detail": "Geocoding timed out. Try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except requests.RequestException:
            return Response(
                {"detail": "Geocoding service unavailable right now."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class TrailSearchView(APIView):
    """
    GET /api/trails/search/?lat=..&lon=..&radius=5000

    Uses Overpass API (free) to fetch trails/paths around a location.
    """
    permission_classes = []  # guests allowed

    def get(self, request):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        radius = int(request.query_params.get("radius", "5000"))  # meters

        if not lat or not lon:
            return Response(
                {"detail": "Missing query params: lat and lon"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        overpass_url = getattr(settings, "OVERPASS_URL", "https://overpass-api.de/api/interpreter")
        user_agent = getattr(
            settings,
            "OSM_USER_AGENT",
            "HikeMates/1.0 (dev; contact: you@example.com)"
        )

        headers = {
            "User-Agent": user_agent,
            "Accept": "application/json",
        }

        # Find hiking trails / paths near point
        # We query: highway=path/footway + route=hiking relations
        query = f"""
        [out:json][timeout:25];
        (
          way(around:{radius},{lat},{lon})["highway"="path"];
          way(around:{radius},{lat},{lon})["highway"="footway"];
          relation(around:{radius},{lat},{lon})["route"="hiking"];
        );
        out center tags;
        """

        try:
            s = _session()
            r = s.post(overpass_url, data=query, headers=headers, timeout=(8, 30))

            if r.status_code == 429:
                return Response(
                    {"detail": "Trail data rate-limited. Try again in a few seconds."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            r.raise_for_status()
            data = r.json()
            return Response(data)

        except requests.exceptions.Timeout:
            return Response(
                {"detail": "Trail search timed out. Try again."},
                status=status.HTTP_504_GATEWAY_TIMEOUT,
            )
        except requests.RequestException:
            return Response(
                {"detail": "Trail search service unavailable right now."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )