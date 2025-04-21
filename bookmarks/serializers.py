from rest_framework import serializers
from .models import QuestionBookmark, TestSetBookmark


class QuestionBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBookmark
        fields = '__all__'


class TestSetBookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestSetBookmark
        fields = '__all__'
