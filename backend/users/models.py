from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class UserType(models.TextChoices):
    TEACHER = 'Teacher', 'Teacher'
    STUDENT = 'Student', 'Student'

class Role(models.TextChoices):
    PROFESSOR = 'Professor', 'Professor'
    ASST = 'Asst', 'Assistant'
    HOD = 'HOD', 'Head of Department'
    DC = 'DC', 'DC'

class AppUser(AbstractUser):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_joined = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    user_type = models.CharField(max_length=10, choices=UserType.choices)

    # Add related_name to resolve conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='app_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='app_users',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return f"{self.name} ({self.get_user_type_display()})"

class Student(models.Model):
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE)
    enrollment_number = models.CharField(max_length=50, unique=True)
    admission_date = models.DateField(null=True, blank=True)
    program = models.CharField(max_length=100)
    batch_year = models.IntegerField()
    current_semester = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.enrollment_number} - {self.user.name}"
