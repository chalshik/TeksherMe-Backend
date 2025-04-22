from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Category
from .serializers import CategorySerializer

# Create your views here.

@method_decorator(csrf_exempt, name='dispatch')
class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for CRUD operations on Categories
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def list(self, request, *args, **kwargs):
        """List all categories"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a new category"""
        print("Received data:", request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
    def retrieve(self, request, *args, **kwargs):
        """Get a specific category"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
        
    def update(self, request, *args, **kwargs):
        """Update a category"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
        
    def destroy(self, request, *args, **kwargs):
        """Delete a category"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
