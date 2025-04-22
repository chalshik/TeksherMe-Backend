from rest_framework import serializers
from .models import QuestionBookmark, TestSetBookmark


class QuestionBookmarkSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = QuestionBookmark
        fields = '__all__'


class TestSetBookmarkSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = TestSetBookmark
        fields = '__all__'
