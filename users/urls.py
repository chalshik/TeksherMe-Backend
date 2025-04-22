from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    RegisterView, ChangePasswordView, 
    PasswordResetRequestView, PasswordResetConfirmView,
    UserProfileViewSet, UserPreferencesViewSet,
    TestProgressViewSet, QuestionHistoryViewSet
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'preferences', UserPreferencesViewSet, basename='preferences')
router.register(r'progress', TestProgressViewSet, basename='progress')
router.register(r'history', QuestionHistoryViewSet, basename='history')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('reset-password/', PasswordResetRequestView.as_view(), name='reset_password_request'),
    path('reset-password/confirm/', PasswordResetConfirmView.as_view(), name='reset_password_confirm'),
    
    # ViewSet routers
    path('', include(router.urls)),
] 