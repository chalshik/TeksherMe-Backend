from rest_framework import serializers
from .models import TestSet, Question, Option
from categories.models import Category
from categories.serializers import CategorySerializer

class TestSetSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = TestSet
        fields = ['id', 'title', 'description', 'category', 'category_id', 'time_limit_minutes', 'difficulty', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    testset = TestSetSerializer(read_only=True)
    testset_id = serializers.PrimaryKeyRelatedField(
        queryset=TestSet.objects.all(), source='testset', write_only=True
    )

    class Meta:
        model = Question
        fields = ['id', 'testset', 'testset_id', 'content', 'explanation', 'created_at']

class OptionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(), source='question', write_only=True
    )

    class Meta:
        model = Option
        fields = ['id', 'question', 'question_id', 'content', 'is_correct']