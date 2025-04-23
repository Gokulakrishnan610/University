from django.db import models
from django.core.exceptions import ValidationError

class Teacher(models.Model):
    TEACHER_ROLES = [
        ('Professor', 'Professor'),
        ('Asst. Professor', 'Asst. Professor'),
        ('HOD', 'HOD'),
        ('DC', 'DC'),
    ]

    teacher = models.ForeignKey('authentication.User', on_delete=models.DO_NOTHING, max_length=200, blank=False)
    dept = models.ForeignKey('department.Department', on_delete=models.SET_NULL,null=True, blank=False, max_length=200)
    staff_code = models.CharField("Staff Code", blank=True, max_length=200)
    teacher_role = models.CharField("Teacher Role", default="Professor", blank=False, max_length=200, choices=TEACHER_ROLES)
    teacher_specialisation = models.CharField('Specialisation', default='', blank=True, max_length=100)
    teacher_working_hours = models.IntegerField('Working Hour', default=21, blank=False)

    class Meta:
        unique_together = ('teacher', 'dept', 'staff_code')
        verbose_name = 'Teacher'
        verbose_name_plural = 'Teachers'

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.dept.dept_name}"

    def clean(self):
        if self.teacher_role == 'HOD':
            existing_hod = Teacher.objects.filter(
                dept=self.dept, 
                teacher_role='HOD'
            ).exclude(pk=self.pk if self.pk else None)
            
            if existing_hod.exists():
                raise ValidationError(
                    {'teacher_role': 'There is already an HOD for this department.'}
                )
        
        return super().clean()