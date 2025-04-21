from django.db import models

from categories.models import Category


# Create your models here.
class TestSet(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    time_limit_minutes = models.IntegerField()
    difficulty = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
class Question(models.Model):
    testset = models.ForeignKey(TestSet, on_delete=models.CASCADE)
    content = models.TextField()
    explanation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.content[:50]
class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    content = models.TextField()
    is_correct = models.BooleanField()

    def __str__(self):
        return self.content[:50]