from django.db import models
from django.core.exceptions import ValidationError

class Teacher(models.Model):
    TEACHER_ROLES = [
        ('Professor', 'Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Assistant Professor', 'Assistant Professor (AP)'),
        ('Assistant Professor', 'Assistant Professor (SG)'),
        ('Assistant Professor', 'Assistant Professor (SS)'),
        ('Asst. Professor', 'Asst. Professor'),
        ('HOD', 'Head of Department'),
        ('DC', 'DC'),
        ('POP', 'Professor of Practice'),
        ('Industry Professional', 'Industry Professional'),
        ('Dean', 'Dean'),
        ('Admin', 'Admin'),
        ('Vice Principal', 'Vice Principal'),
        ('Principal', 'Principal'),
        ('Physical Director', 'Physical Director'),
    ]

    AVAILABILITY_TYPE = [
        ('regular', 'Regular (All Working Days)'),
        ('limited', 'Limited (Specific Days/Times)'),
    ]

    RESIGNATION_STATUS = [
        ('active', 'Active'),
        ('resigning', 'Resigning/Notice Period'),
        ('resigned', 'Resigned'),
    ]

    teacher_id = models.ForeignKey('authentication.User', on_delete=models.CASCADE, related_name='teacher_profile', null=True)
    dept_id = models.ForeignKey('department.Department', on_delete=models.SET_NULL, null=True, related_name='department_teachers')
    staff_code = models.CharField("Staff Code", max_length=50, blank=True)
    teacher_role = models.CharField("Teacher Role", default="Professor", max_length=100, blank=False, choices=TEACHER_ROLES)
    teacher_specialisation = models.CharField('Specialisation', max_length=100, blank=True)
    teacher_working_hours = models.IntegerField('Working Hour', default=21, blank=False)
    
    availability_type = models.CharField("Availability Type", max_length=20, choices=AVAILABILITY_TYPE, default='regular')
    is_industry_professional = models.BooleanField("Industry Professional", default=False)
    
    # Resignation and placeholder status
    resignation_status = models.CharField("Resignation Status", max_length=20, choices=RESIGNATION_STATUS, default='active')
    resignation_date = models.DateField("Resignation Date", null=True, blank=True)
    is_placeholder = models.BooleanField("Is Placeholder", default=False, help_text="Placeholder for future recruitment")
    placeholder_description = models.TextField("Placeholder Description", blank=True, help_text="Requirements for the position")
    
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
        
        # Only allow one Dean, Principal, Vice Principal, and Physical Director per institution
        unique_roles = ['Dean', 'Principal', 'Vice Principal', 'Physical Director']
        if self.teacher_role in unique_roles:
            existing_role = Teacher.objects.filter(
                teacher_role=self.teacher_role
            ).exclude(pk=self.pk if self.pk else None)
            
            if existing_role.exists():
                role_display = dict(Teacher.TEACHER_ROLES).get(self.teacher_role, self.teacher_role)
                raise ValidationError(
                    {'teacher_role': f'There is already a {role_display} in the institution.'}
                )
        
        # Automatically set is_industry_professional and availability flags for POP/industry roles
        if self.teacher_role in ['POP', 'Industry Professional']:
            self.is_industry_professional = True
            self.availability_type = 'limited'
        
        return super().clean()

class TeacherAvailability(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='availability_slots')
    day_of_week = models.IntegerField("Day of Week", choices=DAYS_OF_WEEK)
    start_time = models.TimeField("Start Time")
    end_time = models.TimeField("End Time")
    
    class Meta:
        verbose_name = "Teacher Availability"
        verbose_name_plural = "Teacher Availabilities"
        ordering = ['day_of_week', 'start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['teacher', 'day_of_week', 'start_time', 'end_time'],
                name='unique_teacher_availability_slot'
            )
        ]
    
    def __str__(self):
        day_name = dict(self.DAYS_OF_WEEK)[self.day_of_week]
        return f"{self.teacher} - {day_name}: {self.start_time.strftime('%H:%M')} to {self.end_time.strftime('%H:%M')}"
    
    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(
                {'end_time': 'End time must be after start time.'}
            )
        return super().clean()