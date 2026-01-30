from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True)
