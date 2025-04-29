from django.db import models
from django.core.exceptions import ValidationError

class TeacherCourse(models.Model):
    teacher_id = models.ForeignKey("teacher.Teacher", on_delete=models.CASCADE, null=True)
    course_id = models.ForeignKey("course.Course", on_delete=models.CASCADE, null=True)
    student_count = models.IntegerField("Student Count", default=0)
    academic_year = models.IntegerField("Academic Year", default=0)
    semester = models.IntegerField("Semester", default=0)

    class Meta:
        # Add a unique constraint for teacher and course
        unique_together = ['teacher_id', 'course_id']

    def __str__(self):
        teacher_str = str(self.teacher_id) if self.teacher_id else "Unknown Teacher"
        course_str = str(self.course_id) if self.course_id else "Unknown Course"
        return f"{teacher_str} - {course_str} (Year: {self.academic_year}, Sem: {self.semester})"

    def clean(self):
        if not self.teacher_id or not self.course_id:
            return super().clean()
            
        # Check if this teacher is already assigned to this course
        existing_assignment = TeacherCourse.objects.filter(
            teacher_id=self.teacher_id,
            course_id=self.course_id
        )
        
        # Exclude self when updating
        if self.pk:
            existing_assignment = existing_assignment.exclude(pk=self.pk)
            
        if existing_assignment.exists():
            raise ValidationError("This teacher is already assigned to this course. A teacher cannot be assigned to the same course multiple times.")
            
        assigned_courses = TeacherCourse.objects.filter(
            teacher_id=self.teacher_id
        )

        # Calculate weekly hours based on course type
        weekly_hours = self.calculate_weekly_hours()
        total_hours_assigned = sum(course.calculate_weekly_hours() for course in assigned_courses if course.course_id)
        
        if total_hours_assigned + weekly_hours > self.teacher_id.teacher_working_hours:
            raise ValidationError("Teacher working hour limit exceeded")
        
        if self.teacher_id.dept_id != self.course_id.teaching_dept_id:
            raise ValidationError(
                "Teacher and course must belong to the same department"
            )
        return super().clean()
    
    def calculate_weekly_hours(self):
        """Calculate weekly hours based on course type"""
        if not self.course_id:
            return 0
            
        course = self.course_id
        if course.course_type == 'T':  # Theory
            return course.lecture_hours + course.tutorial_hours
        elif course.course_type == 'LoT':  # Lab and Theory
            return course.lecture_hours + course.tutorial_hours + course.practical_hours
        elif course.course_type == 'L':  # Lab only
            return course.practical_hours
        return 0
    
    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)