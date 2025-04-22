from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class StudentCourse(models.Model):
    student = models.ForeignKey("student.Student", on_delete=models.CASCADE, blank=False)
    course = models.ForeignKey("course.Course", on_delete=models.CASCADE, blank=False)

    class Meta:
        unique_together = ('student', 'course')
        verbose_name = 'Student Course Enrollment'
        verbose_name_plural = 'Student Course Enrollments'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.course.course_name}"