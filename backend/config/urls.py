from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from hikes.views import HikeViewSet

router = DefaultRouter()
router.register(r"hikes", HikeViewSet, basename="hike")

urlpatterns = [
    path("admin/", admin.site.urls),

    # auth
    path("api/auth/", include("users.urls")),
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/trails/", include("trails.urls")),

    # hikes api
    path("api/", include(router.urls)),
]