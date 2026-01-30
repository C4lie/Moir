
import os
import django
import sys

# Setup Django environment
sys.path.append('d:/Projects/Journal')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = 'admin'
email = 'admin@example.com'
password = 'password123'

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser created successfully!")
    print(f"Username: {username}")
    print(f"Password: {password}")
else:
    print(f"Superuser '{username}' already exists.")
    # Reset password just in case
    u = User.objects.get(username=username)
    u.set_password(password)
    u.save()
    print(f"Password reset to: {password}")
