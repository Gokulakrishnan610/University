from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class Student(models.Model):
    student = models.ForeignKey('authentication.User', on_delete=models.DO_NOTHING, max_length=200, blank=False)
    batch = models.IntegerField('Batch', default=0, blank=False)
    current_semester = models.IntegerField('Semester', default=1, blank=False)

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        unique_together = ('student', 'batch')

    def clean(self):
        if not hasattr(self.student, 'user_type') or self.student.user_type != 'student':
            raise ValidationError("Associated user must be of type 'student'")
        if self.current_semester < 1 or self.current_semester > 10:
            raise ValidationError("Semester must be between 1 and 10")
        return super().clean()

    def __str__(self):
        return f"{self.student.get_full_name()} (Batch: {self.batch})"