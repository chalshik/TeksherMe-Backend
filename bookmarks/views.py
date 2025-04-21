from django.shortcuts import render
from rest_framework import viewsets
from .models import QuestionBookmark, TestSetBookmark
from .serializers import QuestionBookmarkSerializer, TestSetBookmarkSerializer

# Create your views here.

class QuestionBookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Question Bookmarks
    """
    serializer_class = QuestionBookmarkSerializer

    def get_queryset(self):
        """
        This view returns a list of all question bookmarks,
        or filtered by test set or question if query parameters are provided.
        """
        queryset = QuestionBookmark.objects.all()
        testset_id = self.request.query_params.get('testset_id')
        question_id = self.request.query_params.get('question_id')
        
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
        if question_id is not None:
            queryset = queryset.filter(question_id=question_id)
            
        return queryset


class TestSetBookmarkViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Set Bookmarks
    """
    serializer_class = TestSetBookmarkSerializer

    def get_queryset(self):
        """
        This view returns a list of all test set bookmarks,
        or filtered by test set if a testset_id query parameter is provided.
        """
        queryset = TestSetBookmark.objects.all()
        testset_id = self.request.query_params.get('testset_id')
        
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
            
        return queryset
