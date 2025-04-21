from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TestSet, Question, Option
from .serializers import TestSetSerializer, QuestionSerializer, OptionSerializer

# Create your views here.

class TestSetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Sets
    """
    queryset = TestSet.objects.all()
    serializer_class = TestSetSerializer
    permission_classes = [IsAuthenticated]


class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Questions
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
