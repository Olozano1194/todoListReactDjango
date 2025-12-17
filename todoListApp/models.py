from django.db import models

# Create your models here.
class Task(models.Model):
    description = models.CharField(max_length=200)    
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        db_table = 'task'
        ordering = ['-created_at']

    def __str__(self):
        return self.description
