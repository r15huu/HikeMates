from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # from your spec: profile can be private/public
    is_public = models.BooleanField(default=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
