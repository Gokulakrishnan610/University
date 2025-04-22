from django.db import models

# Create your models here.
class TeacherCourse(models.Model):
    teacher = models.ForeignKey('teacher.teacher', on_delete=models.DO_NOTHING, blank=False, max_length=200)
    course = models.ForeignKey('department.department', on_delete=models.DO_NOTHING, blank=False, max_length=200)
    student_count = models.IntegerField("Student Count", default=0, blank=False)
    academic_year = models.IntegerField("Acd. year", default=0, blank=False)
    semester = models.IntegerField("Semester", default=0, blank=False)