from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class TeacherCourse(models.Model):
    teacher_id = models.ForeignKey("teacher.Teacher", on_delete=models.CASCADE, null=True)
    course_id = models.ForeignKey("course.Course", on_delete=models.CASCADE, null=True)
    student_count = models.IntegerField("Student Count", default=0)
    academic_year = models.IntegerField("Academic Year", default=0)
    semester = models.IntegerField("Semester", default=0)

    def __str__(self):
        teacher_str = str(self.teacher_id) if self.teacher_id else "Unknown Teacher"
        course_str = str(self.course_id) if self.course_id else "Unknown Course"
        return f"{teacher_str} - {course_str} (Year: {self.academic_year}, Sem: {self.semester})"

    def clean(self):
        if not self.teacher_id or not self.course_id:
            return super().clean()
            
        assigned_courses = TeacherCourse.objects.filter(
            teacher_id=self.teacher_id
        )

        total_hours_assigned = sum(course.course_id.credits for course in assigned_courses if course.course_id)
        
        if total_hours_assigned + self.course_id.credits > self.teacher_id.teacher_working_hours:
            raise ValidationError("Teacher working hour limit exceeded")
        
        if self.teacher_id.dept_id != self.course_id.teaching_dept_id:
            raise ValidationError(
                "Teacher and course must belong to the same department"
            )
        return super().clean()
    
    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)