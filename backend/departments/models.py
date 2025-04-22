from django.db import models
from users.models import AppUser, Role

# Create your models here.

class Department(models.Model):
    dept_name = models.CharField(max_length=100)
    hod = models.ForeignKey('Teacher', on_delete=models.SET_NULL, null=True, blank=True, related_name='hod_department')
    established_date = models.DateField(null=True, blank=True)
    contact_info = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.dept_name

class Teacher(models.Model):
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    staff_code = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    specialization = models.CharField(max_length=100, null=True, blank=True)
    working_hours = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.staff_code} - {self.user.name}"
