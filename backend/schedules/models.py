from django.db import models
from courses.models import TeacherCourse
from rooms.models import Room

class Day(models.TextChoices):
    MONDAY = 'Monday', 'Monday'
    TUESDAY = 'Tuesday', 'Tuesday'
    WEDNESDAY = 'Wednesday', 'Wednesday'
    THURSDAY = 'Thursday', 'Thursday'
    FRIDAY = 'Friday', 'Friday'
    SATURDAY = 'Saturday', 'Saturday'
    SUNDAY = 'Sunday', 'Sunday'

class SessionType(models.TextChoices):
    LECTURE = 'Lecture', 'Lecture'
    TUTORIAL = 'Tutorial', 'Tutorial'
    PRACTICAL = 'Practical', 'Practical'

class Schedule(models.Model):
    teacher_course = models.ForeignKey(TeacherCourse, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    day_of_week = models.CharField(max_length=10, choices=Day.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    session_type = models.CharField(max_length=10, choices=SessionType.choices)

    def __str__(self):
        return f"{self.teacher_course} - {self.day_of_week} {self.start_time}-{self.end_time}"

    class Meta:
        ordering = ['day_of_week', 'start_time']
