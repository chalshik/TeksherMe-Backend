from django.db import models
from django.contrib.auth.models import User
from testsets.models import TestSet, Question

class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Profile for {self.user.username}"

class UserPreferences(models.Model):
    """User preferences for app settings"""
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('ru', 'Russian'),
        # Add more languages as needed
    ]
    
    THEME_CHOICES = [
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
        ('system', 'System Default'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='system')
    notifications_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"

class TestProgress(models.Model):
    """Track user progress on test sets"""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='test_progress')
    testset = models.ForeignKey(TestSet, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    last_question_index = models.IntegerField(default=0)  # To track where user left off
    time_spent = models.IntegerField(default=0)  # Time spent in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'testset']
        
    def __str__(self):
        return f"{self.user.username}'s progress on {self.testset.title} - {self.status}"

class QuestionHistory(models.Model):
    """Track user's history with specific questions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='question_history')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_history')
    times_attempted = models.IntegerField(default=0)
    times_correct = models.IntegerField(default=0)
    last_attempted = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'question']
        
    def __str__(self):
        return f"{self.user.username}'s history with question {self.question.id}"
        
    @property
    def accuracy(self):
        if self.times_attempted == 0:
            return 0
        return (self.times_correct / self.times_attempted) * 100
