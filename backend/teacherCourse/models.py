from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class TeacherCourse(models.Model):
    teacher = models.ForeignKey('teacher.Teacher', on_delete=models.DO_NOTHING, blank=False)
    course = models.ForeignKey('course.Course', on_delete=models.DO_NOTHING, blank=False)
    student_count = models.IntegerField("Student Count", default=0, blank=False)
    academic_year = models.IntegerField("Acd. year", default=0, blank=False)
    semester = models.IntegerField("Semester", default=0, blank=False)

    class Meta:
        unique_together = ('teacher', 'course', 'semester')
        verbose_name = 'Teacher Course Assignment'
        verbose_name_plural = 'Teacher Course Assignments'

    def clean(self):
        if self.teacher.dept != self.course.department:
            raise ValidationError(
                "Teacher and course must belong to the same department"
            )
        return super().clean()

    def __str__(self):
        return f"{self.teacher.teacher.get_full_name()} - {self.course.course_name} (Sem {self.semester})"