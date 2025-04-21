from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TestAttempt, Answer
from .serializers import TestAttemptSerializer, AnswerSerializer

# Create your views here.

class TestAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Attempts
    """
    serializer_class = TestAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view returns a list of all test attempts for the currently authenticated user,
        or filtered by test set if a testset_id query parameter is provided.
        """
        queryset = TestAttempt.objects.filter(user=self.request.user)
        testset_id = self.request.query_params.get('testset_id')
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
        return queryset


class AnswerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Answers
    """
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view returns a list of all answers for the currently authenticated user,
        or filtered by attempt if an attempt_id query parameter is provided.
        """
        queryset = Answer.objects.filter(attempt__user=self.request.user)
        attempt_id = self.request.query_params.get('attempt_id')
        if attempt_id is not None:
            queryset = queryset.filter(attempt_id=attempt_id)
        return queryset
