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
        assigned_courses = TeacherCourse.objects.filter(
            teacher=self.teacher
        )

        total_hours_assigned = sum(course.course.credits for course in assigned_courses)
        
        if total_hours_assigned + self.course.credits > self.teacher.teacher_working_hours:
            raise ValidationError("Teacher working hour is greater than assigned")
        if self.teacher.dept != self.course.department:
            raise ValidationError(
                "Teacher and course must belong to the same department"
            )
        return super().clean()
    
    def save(self, force_insert = ..., force_update = ..., using = ..., update_fields = ...):
        self.clean()
        return super().save()

    def __str__(self):
        return f"{self.teacher.teacher.get_full_name()} - {self.course.course_name} (Sem {self.semester})"