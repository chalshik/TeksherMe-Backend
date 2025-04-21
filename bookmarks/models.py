from django.db import models

from testsets.models import TestSet, Question


# Create your models here.
class QuestionBookmark(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    testset = models.ForeignKey(TestSet, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bookmark by {self.user.username} for {self.question.content[:50]}"

class TestSetBookmark(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    testset = models.ForeignKey(TestSet, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
