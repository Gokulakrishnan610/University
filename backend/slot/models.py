from django.db import models
from teacher.models import Teacher
from django.core.exceptions import ValidationError

# Create your models here.
class Slot(models.Model):
    slot_name = models.CharField("Slot Name", max_length=20)
    slot_start_time = models.TimeField("Slot Start Time")
    slot_end_time = models.TimeField("Slot End Time")

    def __str__(self):
        return f"{self.slot_name} ({self.slot_start_time}-{self.slot_end_time})"

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
        # Check if the teacher already has this slot assigned for 2 days
        existing_assignments = TeacherSlotAssignment.objects.filter(
            teacher=self.teacher,
            slot=self.slot
        ).exclude(pk=self.pk if self.pk else None)
        
        if existing_assignments.count() >= 2:
            raise ValidationError(
                f"This teacher already has this slot assigned for {existing_assignments.count()} days. Maximum is 2 days per slot."
            )
        
        # Check if the teacher has any overlapping time slots on the same day
        same_day_assignments = TeacherSlotAssignment.objects.filter(
            teacher=self.teacher,
            day_of_week=self.day_of_week
        ).exclude(pk=self.pk if self.pk else None)
        
        for assignment in same_day_assignments:
            if (self.slot.slot_start_time < assignment.slot.slot_end_time and 
                self.slot.slot_end_time > assignment.slot.slot_start_time):
                raise ValidationError(
                    f"This assignment overlaps with another slot on the same day: {assignment.slot}"
                )
        
        return super().clean()
    
    @classmethod
    def validate_teacher_assignments(cls, teacher):
        """
        Validates that a teacher's slot assignments follow the 2:2:1 ratio rule.
        """
        assignments = cls.objects.filter(teacher=teacher)
        
        # Group assignments by slot and count days per slot
        slot_counts = assignments.values('slot').annotate(day_count=models.Count('day_of_week'))
        
        # Check if any slot has more than 2 days assigned
        for count in slot_counts:
            if count['day_count'] > 2:
                raise ValidationError(
                    f"Teacher {teacher} has slot {count['slot']} assigned for {count['day_count']} days. Maximum is 2 days per slot."
                )
        
        # Check total assignments don't exceed working hours (optional)
        # You might want to add this based on your requirements
        
        return True