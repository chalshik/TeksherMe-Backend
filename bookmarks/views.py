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
        This view returns a list of all question bookmarks for the currently authenticated user,
        or filtered by test set or question if query parameters are provided.
        """
        queryset = QuestionBookmark.objects.filter(user=self.request.user)
        testset_id = self.request.query_params.get('testset_id')
        question_id = self.request.query_params.get('question_id')
        
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
        if question_id is not None:
            queryset = queryset.filter(question_id=question_id)
            
        return queryset

    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a bookmark
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
        This view returns a list of all test set bookmarks for the currently authenticated user,
        or filtered by test set if a testset_id query parameter is provided.
        """
        queryset = TestSetBookmark.objects.filter(user=self.request.user)
        testset_id = self.request.query_params.get('testset_id')
        
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
            
        return queryset

    def perform_create(self, serializer):
        """
        Set the user to the current authenticated user when creating a bookmark
        """
        serializer.save(user=self.request.user)
