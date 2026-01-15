from django.urls import path
from .views import GeocodeView, TrailSearchView

urlpatterns = [
    path("geocode/", GeocodeView.as_view(), name="trails-geocode"),
    path("search/", TrailSearchView.as_view(), name = "trail-search"),
]