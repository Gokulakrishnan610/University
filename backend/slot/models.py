from django.db import models
from teacher.models import Teacher
from django.core.exceptions import ValidationError
from django.db.models import Count

# Create your models here.
class Slot(models.Model):
    SLOT_TYPES = [
        ('A', 'Slot A (8AM - 3PM)'),
        ('B', 'Slot B (10AM - 5PM)'),
        ('C', 'Slot C (12PM - 7PM)'),
    ]
    
    slot_name = models.CharField("Slot Name", max_length=20)
    slot_type = models.CharField("Slot Type", max_length=1, choices=SLOT_TYPES, default='A')
    slot_start_time = models.TimeField("Slot Start Time")
    slot_end_time = models.TimeField("Slot End Time")

    def __str__(self):
        return f"{self.slot_name} ({self.slot_start_time}-{self.slot_end_time})"
    
    def save(self, *args, **kwargs):
        # Auto-set times based on slot type if not manually specified
        if self.slot_type == 'A' and not (self.slot_start_time and self.slot_end_time):
            # Convert string time to TimeField in Django format
            from django.utils.dateparse import parse_time
            self.slot_start_time = parse_time('08:00:00')
            self.slot_end_time = parse_time('15:00:00')
        elif self.slot_type == 'B' and not (self.slot_start_time and self.slot_end_time):
            from django.utils.dateparse import parse_time
            self.slot_start_time = parse_time('10:00:00')
            self.slot_end_time = parse_time('17:00:00')
        elif self.slot_type == 'C' and not (self.slot_start_time and self.slot_end_time):
            from django.utils.dateparse import parse_time
            self.slot_start_time = parse_time('12:00:00')
            self.slot_end_time = parse_time('19:00:00')
        
        super().save(*args, **kwargs)

class TeacherSlotAssignment(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
    ]
    
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='slot_assignments')
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE, related_name='teacher_assignments')
    day_of_week = models.IntegerField("Day of Week", choices=DAYS_OF_WEEK)
    
    class Meta:
        verbose_name = "Teacher Slot Assignment"
        verbose_name_plural = "Teacher Slot Assignments"
        ordering = ['day_of_week', 'slot__slot_start_time']
        constraints = [
            models.UniqueConstraint(
                fields=['teacher', 'slot', 'day_of_week'],
                name='unique_teacher_slot_assignment'
            ),
            models.UniqueConstraint(
                fields=['teacher', 'day_of_week'],
                name='one_slot_per_teacher_per_day'
            )
        ]
    
    def __str__(self):
        day_name = dict(self.DAYS_OF_WEEK)[self.day_of_week]
        return f"{self.teacher} - {day_name} - {self.slot}"
    
    def clean(self):
        # Check if teacher already has 5 days of slots assigned
        if not self.pk:  # Only check for new assignments
            teacher_assignments = TeacherSlotAssignment.objects.filter(teacher=self.teacher)
            unique_days = teacher_assignments.values('day_of_week').distinct().count()
            
            if unique_days >= 5 and self.day_of_week not in teacher_assignments.values_list('day_of_week', flat=True):
                raise ValidationError(
                    f"This teacher already has assignments for 5 days. Maximum is 5 days per week."
                )
        
        # Check if the teacher already has this slot assigned for the same day
        existing_assignments = TeacherSlotAssignment.objects.filter(
            teacher=self.teacher,
            day_of_week=self.day_of_week
        ).exclude(pk=self.pk if self.pk else None)
        
        if existing_assignments.exists():
            raise ValidationError(
                f"This teacher already has a slot assigned for this day."
            )
        
        # Check department slot distribution constraint (33% per slot type)
        if self.teacher.dept_id:
            dept_id = self.teacher.dept_id.id
            total_dept_teachers = Teacher.objects.filter(dept_id=dept_id).count()
            
            if total_dept_teachers > 0:
                # Get count of teachers in this department assigned to this slot type on this day
                slot_type = self.slot.slot_type
                teachers_in_slot = TeacherSlotAssignment.objects.filter(
                    teacher__dept_id=dept_id,
                    day_of_week=self.day_of_week,
                    slot__slot_type=slot_type
                ).exclude(pk=self.pk if self.pk else None).values('teacher').distinct().count()
                
                # Calculate max teachers allowed (33% of department + 1 extra teacher)
                max_teachers_per_slot = int((total_dept_teachers * 0.33) + 0.5) + 1  # Adding 1 to allow one extra teacher
                
                if teachers_in_slot >= max_teachers_per_slot:
                    raise ValidationError(
                        f"Maximum number of teachers (33% + 1) from department {self.teacher.dept_id.dept_name} "
                        f"already assigned to slot type {slot_type} on {dict(self.DAYS_OF_WEEK)[self.day_of_week]}."
                    )
        
        return super().clean()
    
    @classmethod
    def validate_teacher_assignments(cls, teacher):
        """
        Validates that a teacher's slot assignments follow the rules:
        - Maximum 5 days per week
        - Department distribution constraints
        """
        assignments = cls.objects.filter(teacher=teacher)
        
        # Check if teacher has more than 5 days assigned
        unique_days = assignments.values('day_of_week').distinct().count()
        if unique_days > 5:
            raise ValidationError(
                f"Teacher {teacher} has assignments for {unique_days} days. Maximum is 5 days per week."
            )
        
        # Department distribution validation is handled during individual assignment creation
        
        return True