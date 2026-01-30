from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from entries.models import Notebook, Entry

User = get_user_model()

class PrivacyTests(TestCase):
    def setUp(self):
        # Create two users
        self.user_a = User.objects.create_user(username='test_user_a', email='a@test.com', password='password123')
        self.user_b = User.objects.create_user(username='test_user_b', email='b@test.com', password='password123')

        # Create content for User A
        self.notebook_a = Notebook.objects.create(user=self.user_a, name="User A Notebook")
        self.entry_a = Entry.objects.create(notebook=self.notebook_a, title="User A Entry", content="Secret A", entry_date="2023-01-01")

        # Create content for User B
        self.notebook_b = Notebook.objects.create(user=self.user_b, name="User B Notebook")
        self.entry_b = Entry.objects.create(notebook=self.notebook_b, title="User B Entry", content="Secret B", entry_date="2023-01-01")

        self.client = APIClient()

    def test_notebook_list_privacy(self):
        """User A should see only their notebooks"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/notebooks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        ids = [n['id'] for n in response.data]
        self.assertIn(self.notebook_a.id, ids)
        self.assertNotIn(self.notebook_b.id, ids)

    def test_notebook_detail_privacy(self):
        """User A should not access User B's notebook"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/notebooks/{self.notebook_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_entry_list_privacy(self):
        """User A should see only their entries"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get('/api/entries/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        ids = [e['id'] for e in response.data]
        self.assertIn(self.entry_a.id, ids)
        self.assertNotIn(self.entry_b.id, ids)

    def test_entry_detail_privacy(self):
        """User A should not access User B's entry"""
        self.client.force_authenticate(user=self.user_a)
        response = self.client.get(f'/api/entries/{self.entry_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_entry_in_others_notebook(self):
        """User A cannot create entry in User B's notebook"""
        self.client.force_authenticate(user=self.user_a)
        data = {
            'title': 'Intruder Entry',
            'content': 'I am hacking',
            'notebook': self.notebook_b.id,
            'entry_date': '2023-01-01'
        }
        response = self.client.post('/api/entries/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
