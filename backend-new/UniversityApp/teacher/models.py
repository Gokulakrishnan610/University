from django.db import models

# Create your models here.
class Teacher(models.Model):
    TEACHER_ROLES = [
        ('Professor', 'Professor'),
        ('Asst. Professor', 'Asst. Professor'),
        ('HOD', 'HOD'),
        ('DC', 'DC'),
    ]

    teacher = models.ForeignKey('authentication.user', on_delete=models.DO_NOTHING, max_length=200,blank=False)
    dept = models.ForeignKey('department.department', on_delete=models.DO_NOTHING,blank=False, max_length=200)
    staff_code = models.CharField("Staff Code", blank=True, max_length=200)
    teacher_specialisation = models.CharField('Specialisation', default='', blank=True, max_length=100)
    teacher_working_hours = models.IntegerField('Working Hour', default=21, blank=False)
