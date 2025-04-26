from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class StudentCourse(models.Model):
    student_id = models.ForeignKey("student.Student", on_delete=models.CASCADE, null=True)
    course_id = models.ForeignKey("course.Course", on_delete=models.CASCADE, null=True)

    def __str__(self):
        student_str = str(self.student_id) if self.student_id else "Unknown Student"
        course_str = str(self.course_id) if self.course_id else "Unknown Course"
        return f"{student_str} - {course_str}"