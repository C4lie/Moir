from django.db import models
from django.conf import settings

class Notebook(models.Model):
    """Notebook model for organizing journal entries"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notebooks')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    color_theme = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Entry(models.Model):
    """Entry model for individual journal entries"""
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='entries')
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField()
    entry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-entry_date', '-created_at']
        verbose_name_plural = 'Entries'

    def __str__(self):
        return self.title or f"Entry from {self.entry_date}"
