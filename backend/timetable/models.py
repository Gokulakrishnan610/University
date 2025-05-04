from django.db import models
from teacherCourse.models import TeacherCourse
from slot.models import Slot
from rooms.models import Room
from teacher.models import Teacher
from authentication.models import User

class Timetable(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    SESSION_TYPE_CHOICES = [
        ('Lecture', 'Lecture'),
        ('Lab', 'Laboratory'),
        ('Tutorial', 'Tutorial'),
    ]
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    course_assignment = models.ForeignKey(TeacherCourse, on_delete=models.CASCADE)
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    is_recurring = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)  # For non-recurring sessions
    session_type = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    
    class Meta:
        db_table = 'timetable'
        unique_together = (('day_of_week', 'slot', 'room'),)  # Room can't be double-booked
    
    def __str__(self):
        return f"{self.get_day_of_week_display()} - {self.slot.slot_name} - {self.course_assignment.course_id.course_id.course_name} - {self.room.room_number}"
    
    def get_teacher(self):
        return self.course_assignment.teacher_id
    
    def get_course(self):
        return self.course_assignment.course_id
    
    @property
    def day_name(self):
        return self.get_day_of_week_display()


class TimetableChange(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    original_timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name='changes')
    new_day_of_week = models.IntegerField(blank=True, null=True, choices=Timetable.DAY_CHOICES)
    new_slot = models.ForeignKey(Slot, on_delete=models.CASCADE, blank=True, null=True)
    new_room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    reason = models.TextField()
    effective_from = models.DateField()
    effective_to = models.DateField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    class Meta:
        db_table = 'timetable_change'
    
    def __str__(self):
        return f"Change for {self.original_timetable} - {self.status}"
