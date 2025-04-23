# models.py
from django.db import models
from django.core.exceptions import ValidationError

class Student(models.Model):
    STUDENT_TYPE = [
        ('Mgmt', 'Management'),
        ('Govt', 'Government'),
    ]
    DEGREE_TYPE = [
        ('UG', 'Undergraduate'),
        ('PG', 'Postgraduate')
    ]
    
    student = models.ForeignKey('authentication.User', on_delete=models.DO_NOTHING, blank=False)
    batch = models.IntegerField('Batch', default=0)
    current_semester = models.IntegerField('Semester', default=1)
    year = models.IntegerField('Year', default=0)
    dept = models.CharField('Department', max_length=50)
    roll_no = models.CharField('Roll No', max_length=50)
    student_type = models.CharField(default='Mgmt', max_length=10, choices=STUDENT_TYPE)
    degree_type = models.CharField(default='UG', max_length=10, choices=DEGREE_TYPE)

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        unique_together = ('student', 'batch')

    def clean(self):
        if not hasattr(self.student, 'user_type') or self.student.user_type != 'student':
            raise ValidationError("Associated user must be of type 'student'")
        if not (1 <= self.current_semester <= 10):
            raise ValidationError("Semester must be between 1 and 10")
        return super().clean()

    def __str__(self):
        name = getattr(self.student, 'get_full_name', lambda: str(self.student))()
        return f"{name} (Batch: {self.batch})"
