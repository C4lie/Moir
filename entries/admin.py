from django.contrib import admin
from .models import Notebook, Entry

@admin.register(Notebook)
class NotebookAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'entry_count', 'created_at')
    search_fields = ('name', 'user__username', 'user__email')
    list_filter = ('created_at',)

    def entry_count(self, obj):
        return obj.entries.count()
    entry_count.short_description = 'Entries'

@admin.register(Entry)
class EntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'notebook', 'user_email', 'entry_date', 'created_at')
    search_fields = ('title', 'content', 'notebook__name', 'notebook__user__username')
    list_filter = ('entry_date', 'created_at', 'notebook')

    def user_email(self, obj):
        return obj.notebook.user.email
    user_email.short_description = 'User'
