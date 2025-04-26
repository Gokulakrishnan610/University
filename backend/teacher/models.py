from django.db import models
from django.core.exceptions import ValidationError

class Teacher(models.Model):
    TEACHER_ROLES = [
        ('Professor', 'Professor'),
        ('Asst. Professor', 'Asst. Professor'),
        ('HOD', 'HOD'),
        ('DC', 'DC'),
    ]

    teacher_id = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='teacher_profile', null=True)
    dept_id = models.ForeignKey('department.Department', on_delete=models.SET_NULL, null=True, related_name='department_teachers')
    staff_code = models.CharField("Staff Code", max_length=50, blank=True)
    teacher_role = models.CharField("Teacher Role", default="Professor", max_length=100, blank=False, choices=TEACHER_ROLES)
    teacher_specialisation = models.CharField('Specialisation', max_length=100, blank=True)
    teacher_working_hours = models.IntegerField('Working Hour', default=21, blank=False)

    def __str__(self):
        name = self.teacher_id.get_full_name() if self.teacher_id else "Unknown"
        dept_name = self.dept_id.dept_name if self.dept_id else "No Department"
        return f"{name} - {dept_name}"

    def clean(self):
        if self.teacher_role == 'HOD':
            existing_hod = Teacher.objects.filter(
                dept_id=self.dept_id, 
                teacher_role='HOD'
            ).exclude(pk=self.pk if self.pk else None)
            
            if existing_hod.exists():
                raise ValidationError(
                    {'teacher_role': 'There is already an HOD for this department.'}
                )
        
        return super().clean()