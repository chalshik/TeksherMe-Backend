from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
