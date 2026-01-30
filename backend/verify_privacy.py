
import os
import sys
import django

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from entries.models import Notebook, Entry

User = get_user_model()

def verify_privacy():
    print("Setting up test users...")
    # Create two users
    user_a, _ = User.objects.get_or_create(username='test_user_a', email='a@test.com')
    user_a.set_password('password123')
    user_a.save()

    user_b, _ = User.objects.get_or_create(username='test_user_b', email='b@test.com')
    user_b.set_password('password123')
    user_b.save()

    # Create content for User A
    notebook_a = Notebook.objects.create(user=user_a, name="User A Notebook")
    entry_a = Entry.objects.create(notebook=notebook_a, title="User A Entry", content="Secret A")

    # Create content for User B
    notebook_b = Notebook.objects.create(user=user_b, name="User B Notebook")
    entry_b = Entry.objects.create(notebook=notebook_b, title="User B Entry", content="Secret B")

    client = APIClient()

    print("\n--- Verifying Notebook Privacy ---")
    
    # Authenticate as User A
    client.force_authenticate(user=user_a)
    
    # 1. User A should see their own notebook
    response = client.get('/api/notebooks/')
    if response.status_code == 200:
        ids = [n['id'] for n in response.data]
        if notebook_a.id in ids and notebook_b.id not in ids:
            print("✅ PASS: User A sees only their notebooks")
        else:
            print(f"❌ FAIL: User A saw notebooks: {ids} (Expected only {notebook_a.id})")
    else:
        print(f"❌ FAIL: API Error {response.status_code}")

    # 2. User A should NOT be able to see User B's notebook details
    response = client.get(f'/api/notebooks/{notebook_b.id}/')
    if response.status_code == 404:
        print("✅ PASS: User A cannot access User B's notebook ID (Got 404)")
    else:
        print(f"❌ FAIL: User A accessed User B's notebook. Status: {response.status_code}")

    print("\n--- Verifying Entry Privacy ---")
    
    # 3. User A should see their own entries
    response = client.get('/api/entries/')
    if response.status_code == 200:
        ids = [e['id'] for e in response.data]
        if entry_a.id in ids and entry_b.id not in ids:
            print("✅ PASS: User A sees only their entries")
        else:
            print(f"❌ FAIL: User A saw entries: {ids} (Expected only {entry_a.id})")

    # 4. User A should NOT be able to see User B's entry details
    response = client.get(f'/api/entries/{entry_b.id}/')
    if response.status_code == 404:
        print("✅ PASS: User A cannot access User B's entry ID (Got 404)")
    else:
        print(f"❌ FAIL: User A accessed User B's entry. Status: {response.status_code}")

    # 5. User A should NOT be able to create an entry in User B's notebook
    response = client.post('/api/entries/', {
        'title': 'Intruder Entry',
        'content': 'I am hacking',
        'notebook': notebook_b.id,
        'entry_date': '2023-01-01'
    })
    if response.status_code == 403:
        print("✅ PASS: User A cannot create entry in User B's notebook (Got 403)")
    else:
        print(f"❌ FAIL: User A created entry in User B's notebook. Status: {response.status_code}")

    print("\n--- Cleanup ---")
    user_a.delete()
    user_b.delete()

if __name__ == '__main__':
    try:
        verify_privacy()
    except Exception as e:
        print(f"An error occurred: {e}")
