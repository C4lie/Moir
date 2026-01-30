from rest_framework import serializers
from django.contrib.auth import get_user_model
from entries.models import Notebook, Entry

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined', 'first_name', 'occupation', 'avatar')
        read_only_fields = ('date_joined',)


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_password(self, value):
        """Ensure password has letters and numbers"""
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Create default "Personal" notebook
        Notebook.objects.create(
            user=user,
            name="Personal",
            description="My personal journal",
            color_theme="blue"
        )
        return user


class NotebookSerializer(serializers.ModelSerializer):
    """Serializer for Notebook model"""
    entry_count = serializers.SerializerMethodField()

    class Meta:
        model = Notebook
        fields = ('id', 'name', 'description', 'color_theme', 'created_at', 'entry_count', 'include_in_weekly_summary')
        read_only_fields = ('created_at',)

    def get_entry_count(self, obj):
        return obj.entries.count()


class EntrySerializer(serializers.ModelSerializer):
    """Serializer for Entry model"""
    notebook_name = serializers.CharField(source='notebook.name', read_only=True)

    class Meta:
        model = Entry
        fields = ('id', 'notebook', 'notebook_name', 'title', 'content', 'entry_date', 'created_at', 'modified_at')
        read_only_fields = ('created_at', 'modified_at')
