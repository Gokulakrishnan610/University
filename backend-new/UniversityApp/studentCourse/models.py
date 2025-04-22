from django.db import models

# Create your models here.
class StudentCourse(models.Model):
    student = models.ForeignKey("student.student", on_delete=models.CASCADE, blank=False, max_length=200)
    course = models.ForeignKey("course.course", on_delete=models.CASCADE, blank=False, max_length=200)
