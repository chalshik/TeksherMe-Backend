from django.db import models

from testsets.models import TestSet, Question, Option



# Create your models here.
class TestAttempt(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    testset = models.ForeignKey(TestSet, on_delete=models.CASCADE)
    score_percent = models.FloatField()
    passed = models.BooleanField()
    duration_minutes = models.IntegerField()

    def __str__(self):
        return f"Attempt by {self.user.username} on {self.testset.title}"

class Answer(models.Model):
    attempt = models.ForeignKey(TestAttempt, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True)
    is_correct = models.BooleanField()

    def __str__(self):
        return f"Answer for {self.question.content[:50]}"