from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.db.models import Q, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import timedelta
from .serializers import UserSerializer, RegisterSerializer, NotebookSerializer, EntrySerializer
from entries.models import Notebook, Entry

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Authenticate using username
        user = authenticate(username=user.username, password=password)
        
        if user:
            # Prevent admin/staff from logging in via frontend
            if user.is_staff or user.is_superuser:
                return Response(
                    {'error': 'Admin accounts cannot log in to the frontend app. Please use the Django Admin panel.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            login(request, user)
            return Response(UserSerializer(user).data)
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get and update current authenticated user"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Admin accounts cannot access the frontend app.")
        return user


class NotebookViewSet(viewsets.ModelViewSet):
    """ViewSet for Notebook CRUD operations"""
    serializer_class = NotebookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notebook.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EntryViewSet(viewsets.ModelViewSet):
    """ViewSet for Entry CRUD operations"""
    serializer_class = EntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Entry.objects.filter(notebook__user=self.request.user)
        
        # Filter by notebook if provided
        notebook_id = self.request.query_params.get('notebook')
        if notebook_id:
            queryset = queryset.filter(notebook_id=notebook_id)
        
        # Filter by date if provided
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(entry_date=date)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        return queryset.order_by('-entry_date', '-created_at')

    def perform_create(self, serializer):
        # Verify notebook belongs to user
        notebook = serializer.validated_data['notebook']
        if notebook.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Cannot add entries to this notebook")
        serializer.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def stats_view(request):
    """Get user statistics"""
    user = request.user
    
    # Get total entries
    total_entries = Entry.objects.filter(notebook__user=user).count()
    
    # Get total notebooks
    total_notebooks = Notebook.objects.filter(user=user).count()
    
    # Calculate writing streak
    streak = 0
    current_date = timezone.now().date()
    # Check if entry exists today
    if not Entry.objects.filter(notebook__user=user, entry_date=current_date).exists():
        # If not today, check yesterday to continue streak
        current_date -= timedelta(days=1)
        
    while True:
        has_entry = Entry.objects.filter(
            notebook__user=user,
            entry_date=current_date
        ).exists()
        if has_entry:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Get recent entries
    recent_entries = Entry.objects.filter(notebook__user=user).order_by('-entry_date', '-created_at')[:5]
    recent_entries_data = EntrySerializer(recent_entries, many=True).data
    
    return Response({
        'total_entries': total_entries,
        'writing_streak': streak,
        'total_notebooks': total_notebooks,
        'recent_entries': recent_entries_data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calendar_view(request, year, month):
    """Get entries grouped by date for calendar view"""
    entries = Entry.objects.filter(
        notebook__user=request.user,
        entry_date__year=year,
        entry_date__month=month
    ).values('entry_date').annotate(count=Count('id'))
    
    result = {str(e['entry_date']): e['count'] for e in entries}
    return Response(result)


from entries.analysis import generate_weekly_insight

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def weekly_insight_view(request):
    """Get weekly thought summary and insights"""
    try:
        data = generate_weekly_insight(request.user)
        return Response(data)
    except Exception as e:
        return Response(
             {'error': str(e)},
             status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
