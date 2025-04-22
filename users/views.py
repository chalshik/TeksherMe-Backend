from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.db import transaction

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token

from .models import UserProfile, UserPreferences, TestProgress, QuestionHistory
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserProfileSerializer, UserPreferencesSerializer,
    TestProgressSerializer, QuestionHistorySerializer
)

class RegisterView(APIView):
    """API endpoint for user registration"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "User registered successfully",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """API endpoint for changing password"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """API endpoint for requesting a password reset"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # In a real application, you would send an email with the reset link
                # For development, we're just returning the token
                return Response({
                    "message": "Password reset link has been sent to your email",
                    "uid": uid,
                    "token": token
                })
                
            except User.DoesNotExist:
                # For security reasons, we don't reveal that the user doesn't exist
                pass
                
            return Response({
                "message": "If this email is registered, a password reset link will be sent."
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """API endpoint for confirming a password reset"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(pk=user_id)
                
                # Check if the token is valid
                if default_token_generator.check_token(user, token):
                    user.set_password(new_password)
                    user.save()
                    return Response({"message": "Password has been reset"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
                    
            except User.DoesNotExist:
                return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    """API endpoint for user profile management"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserPreferencesViewSet(viewsets.ModelViewSet):
    """API endpoint for user preferences management"""
    serializer_class = UserPreferencesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserPreferences.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get the current user's preferences"""
        try:
            preferences = UserPreferences.objects.get(user=request.user)
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data)
        except UserPreferences.DoesNotExist:
            # Create default preferences if they don't exist
            preferences = UserPreferences.objects.create(user=request.user)
            serializer = UserPreferencesSerializer(preferences)
            return Response(serializer.data)

class TestProgressViewSet(viewsets.ModelViewSet):
    """API endpoint for test progress management"""
    serializer_class = TestProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TestProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Get test progress filtered by status"""
        status_param = request.query_params.get('status', None)
        if status_param:
            queryset = self.get_queryset().filter(status=status_param)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({"error": "Status parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def reset_all(self, request):
        """Reset all progress for the current user"""
        with transaction.atomic():
            # Delete all test progress
            TestProgress.objects.filter(user=request.user).delete()
            
            # Reset question history
            QuestionHistory.objects.filter(user=request.user).delete()
            
        return Response({"message": "All progress has been reset"}, status=status.HTTP_200_OK)

class QuestionHistoryViewSet(viewsets.ModelViewSet):
    """API endpoint for question history management"""
    serializer_class = QuestionHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return QuestionHistory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
