from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionBookmarkViewSet, TestSetBookmarkViewSet

router = DefaultRouter()
router.register(r'question-bookmarks', QuestionBookmarkViewSet, basename='question-bookmarks')
router.register(r'testset-bookmarks', TestSetBookmarkViewSet, basename='testset-bookmarks')

urlpatterns = [
    path('', include(router.urls)),
] 