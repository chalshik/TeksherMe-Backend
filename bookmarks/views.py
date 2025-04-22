from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import QuestionBookmark, TestSetBookmark
from .serializers import QuestionBookmarkSerializer, TestSetBookmarkSerializer

# Create your views here.

class QuestionBookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Question Bookmarks
    """
    serializer_class = QuestionBookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view returns a list of all question bookmarks for the current user,
        or filtered by test set or question if query parameters are provided.
        """
        user = self.request.user
        queryset = QuestionBookmark.objects.filter(user=user)
        
        testset_id = self.request.query_params.get('testset_id', None)
        question_id = self.request.query_params.get('question_id', None)
        
        if testset_id:
            queryset = queryset.filter(testset_id=testset_id)
        if question_id:
            queryset = queryset.filter(question_id=question_id)
            
        return queryset
        
    def perform_create(self, serializer):
        """
        Automatically associate the bookmark with the logged-in user
        """
        serializer.save(user=self.request.user)


class TestSetBookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Set Bookmarks
    """
    serializer_class = TestSetBookmarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view returns a list of all test set bookmarks for the current user,
        or filtered by test set if a testset_id query parameter is provided.
        """
        user = self.request.user
        queryset = TestSetBookmark.objects.filter(user=user)
        
        testset_id = self.request.query_params.get('testset_id', None)
        
        if testset_id:
            queryset = queryset.filter(testset_id=testset_id)
            
        return queryset
        
    def perform_create(self, serializer):
        """
        Automatically associate the bookmark with the logged-in user
        """
        serializer.save(user=self.request.user)
