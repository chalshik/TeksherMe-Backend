from django.shortcuts import render
from rest_framework import viewsets
from .models import TestAttempt, Answer
from .serializers import TestAttemptSerializer, AnswerSerializer

# Create your views here.

class TestAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Test Attempts
    """
    serializer_class = TestAttemptSerializer

    def get_queryset(self):
        """
        This view returns a list of all test attempts,
        or filtered by test set if a testset_id query parameter is provided.
        """
        # Filter attempts to show only those belonging to the current user
        queryset = TestAttempt.objects.filter(user=self.request.user)
        testset_id = self.request.query_params.get('testset_id')
        if testset_id is not None:
            queryset = queryset.filter(testset_id=testset_id)
        return queryset
        
    def perform_create(self, serializer):
        """
        Automatically associate the attempt with the logged-in user
        """
        serializer.save(user=self.request.user)


class AnswerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Answers
    """
    serializer_class = AnswerSerializer

    def get_queryset(self):
        """
        This view returns a list of all answers,
        or filtered by attempt if an attempt_id query parameter is provided.
        """
        # Filter answers to show only those related to the current user's attempts
        user_attempts = TestAttempt.objects.filter(user=self.request.user).values_list('id', flat=True)
        queryset = Answer.objects.filter(attempt_id__in=user_attempts)
        
        attempt_id = self.request.query_params.get('attempt_id')
        if attempt_id is not None:
            queryset = queryset.filter(attempt_id=attempt_id)
        return queryset
