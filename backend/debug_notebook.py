
import os
import django
import sys

# Setup Django environment
sys.path.append('d:/Projects/Journal')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from entries.models import Notebook
from django.contrib.auth import get_user_model

User = get_user_model()

try:
    notebook_id = 10
    notebook = Notebook.objects.get(id=notebook_id)
    print(f"Notebook {notebook_id} exists.")
    print(f"Name: {notebook.name}")
    print(f"Owner ID: {notebook.user.id}")
    print(f"Owner Email: {notebook.user.email}")
    print(f"Owner Username: {notebook.user.username}")
except Notebook.DoesNotExist:
    print(f"Notebook {notebook_id} does NOT exist.")

print("-" * 20)
print("All Users:")
for u in User.objects.all():
    print(f"ID: {u.id} | Email: {u.email} | Username: {u.username}")

print("-" * 20)
print("All Notebooks:")
for n in Notebook.objects.all():
    print(f"ID: {n.id} | Name: {n.name} | Owner: {n.user.email}")
