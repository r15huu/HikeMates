from django.contrib import admin
from .models import Hike, HikeMembership, JoinRequest


class MembershipInline(admin.TabularInline):
    model = HikeMembership
    extra = 0
    readonly_fields = ("joined_at",)


class JoinRequestInline(admin.TabularInline):
    model = JoinRequest
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(Hike)
class HikeAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "location_name", "start_time", "intensity", "visibility")
    list_filter = ("visibility", "intensity")
    search_fields = ("title", "location_name")
    inlines = [MembershipInline, JoinRequestInline]


@admin.register(HikeMembership)
class HikeMembershipAdmin(admin.ModelAdmin):
    list_display = ("hike", "user", "role", "joined_at")
    list_filter = ("role",)


@admin.register(JoinRequest)
class JoinRequestAdmin(admin.ModelAdmin):
    list_display = ("hike", "user", "status", "created_at")
    list_filter = ("status",)
