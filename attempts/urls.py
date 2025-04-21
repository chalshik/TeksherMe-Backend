from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestAttemptViewSet, AnswerViewSet

router = DefaultRouter()
router.register(r'attempts', TestAttemptViewSet, basename='attempts')
router.register(r'answers', AnswerViewSet, basename='answers')

urlpatterns = [
    path('', include(router.urls)),
] 