from django.shortcuts import render
from rest_framework import viewsets
from .models import TestSet, Question, Option
from .serializers import TestSetSerializer, QuestionSerializer, OptionSerializer
from django.db.models import Q

# Create your views here.

class TestSetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Sets
    """
    queryset = TestSet.objects.all()
    serializer_class = TestSetSerializer

    def get_queryset(self):
        """
        Optionally filters test sets by category and difficulty
        using query parameters in the URL.
        """
        queryset = TestSet.objects.all()
        
        # Filter by category_id
        category_id = self.request.query_params.get('category_id')
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by difficulty - make case insensitive
        difficulty = self.request.query_params.get('difficulty')
        if difficulty is not None:
            # Use case-insensitive filter for difficulty
            queryset = queryset.filter(difficulty__iexact=difficulty)
            
        # Filter by search term (in title or description)
        search = self.request.query_params.get('search')
        if search is not None:
            # Use Q objects for OR condition
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
            
        return queryset


class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Questions
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned questions to a given test set,
        by filtering against a `testset_id` query parameter in the URL.
        """
        queryset = Question.objects.all()
        testset_id = self.request.query_params.get('testset_id')
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
        return queryset


class OptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Options
    """
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

    def get_queryset(self):
        """
        Optionally restricts the returned options to a given question,
        by filtering against a `question_id` query parameter in the URL.
        """
        queryset = Option.objects.all()
        question_id = self.request.query_params.get('question_id')
        if question_id is not None:
            queryset = queryset.filter(question_id=question_id)
        return queryset
