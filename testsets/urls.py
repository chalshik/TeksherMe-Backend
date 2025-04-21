from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestSetViewSet, QuestionViewSet, OptionViewSet

router = DefaultRouter()
router.register(r'testsets', TestSetViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'options', OptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 