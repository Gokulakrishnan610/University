from django.db import models
from django.core.exceptions import ValidationError

class TeacherCourse(models.Model):
    teacher_id = models.ForeignKey("teacher.Teacher", on_delete=models.CASCADE, null=True)
    course_id = models.ForeignKey("course.Course", on_delete=models.CASCADE, null=True)
    student_count = models.IntegerField("Student Count", default=0)
    academic_year = models.IntegerField("Academic Year", default=0)
    semester = models.IntegerField("Semester", default=0)
    requires_special_scheduling = models.BooleanField("Requires Special Scheduling", default=False)
    is_assistant = models.BooleanField("Is Assistant Teacher", default=False)
    
    preferred_availability_slots = models.ManyToManyField(
        "teacher.TeacherAvailability",
        verbose_name="Preferred Availability Slots",
        related_name="courses_scheduled",
        blank=True
    )

    class Meta:
        # Add a unique constraint for teacher and course
        unique_together = ['teacher_id', 'course_id']

    def __str__(self):
        teacher_str = str(self.teacher_id) if self.teacher_id else "Unknown Teacher"
        course_str = str(self.course_id) if self.course_id else "Unknown Course"
        role_str = " (Assistant)" if self.is_assistant else ""
        return f"{teacher_str} - {course_str}{role_str} (Year: {self.academic_year}, Sem: {self.semester})"

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
        
        # Set requires_special_scheduling if teacher is an industry professional or POP
        if self.teacher_id.is_industry_professional or self.teacher_id.teacher_role == 'POP':
            self.requires_special_scheduling = True
            
        assigned_courses = TeacherCourse.objects.filter(
            teacher_id=self.teacher_id
        )

        # Calculate weekly hours based on course type
        weekly_hours = self.calculate_weekly_hours()
        total_hours_assigned = sum(course.calculate_weekly_hours() for course in assigned_courses if course.course_id)
        
        if total_hours_assigned + weekly_hours > self.teacher_id.teacher_working_hours:
            raise ValidationError("Teacher working hour limit exceeded")
        
        # Check if industry professional has availability slots defined
        if self.teacher_id.is_industry_professional and self.teacher_id.availability_type == 'limited':
            availability_slots = self.teacher_id.availability_slots.all()
            if not availability_slots.exists():
                raise ValidationError("Industry professional/POP teachers must have defined availability slots")
        
        # For POP or industry professionals, check if we're creating a new assignment
        # If so, ensure the department constraint can be relaxed if needed
        if self.teacher_id.dept_id != self.course_id.teaching_dept_id:
            if self.teacher_id.is_industry_professional or self.teacher_id.teacher_role == 'POP':
                # Allow cross-department teaching for industry professionals/POPs
                pass
            else:
                # For regular teachers, maintain department constraint
                raise ValidationError(
                    "Teacher and course must belong to the same department"
                )
        return super().clean()
    
    def calculate_weekly_hours(self):
        """Calculate weekly hours based on course type"""
        if not self.course_id or not self.course_id.course_id:
            return 0
            
        course_master = self.course_id.course_id
        if course_master.course_type == 'T':  # Theory
            return course_master.lecture_hours + course_master.tutorial_hours
        elif course_master.course_type == 'LoT':  # Lab and Theory
            return course_master.lecture_hours + course_master.tutorial_hours + course_master.practical_hours
        elif course_master.course_type == 'L':  # Lab only
            return course_master.practical_hours
        return 0
    
    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)