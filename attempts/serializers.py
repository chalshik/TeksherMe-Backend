from rest_framework import serializers
from .models import TestAttempt, Answer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'


class TestAttemptSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True, source='answer_set')
    
    class Meta:
        model = TestAttempt
        fields = '__all__'
