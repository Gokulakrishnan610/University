from django.db import models
from django.core.exceptions import ValidationError

class TeacherCourse(models.Model):
    teacher_id = models.ForeignKey("teacher.Teacher", on_delete=models.CASCADE, null=True)
    course_id = models.ForeignKey("course.Course", on_delete=models.CASCADE, null=True)
    student_count = models.IntegerField("Student Count", default=0)
    academic_year = models.IntegerField("Academic Year", default=0)
    semester = models.IntegerField("Semester", default=0)
    # Indicates if special scheduling is needed for this assignment (for industry professionals)
    requires_special_scheduling = models.BooleanField("Requires Special Scheduling", default=False)

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
        
        # Automatically set requires_special_scheduling flag if teacher is an industry professional
        if self.teacher_id.is_industry_professional:
            self.requires_special_scheduling = True
            
        assigned_courses = TeacherCourse.objects.filter(
            teacher_id=self.teacher_id
        )

        # Calculate weekly hours based on course type
        weekly_hours = self.calculate_weekly_hours()
        total_hours_assigned = sum(course.calculate_weekly_hours() for course in assigned_courses if course.course_id)
        
        if total_hours_assigned + weekly_hours > self.teacher_id.teacher_working_hours:
            raise ValidationError("Teacher working hour limit exceeded")
        
        # For regular faculty, ensure department match
        if not self.teacher_id.is_industry_professional and self.teacher_id.dept_id != self.course_id.teaching_dept_id:
            raise ValidationError(
                "Teacher and course must belong to the same department"
            )
            
        # For industry professionals, we don't strictly enforce department matching
        # as they might teach specialized courses across departments
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


class IndustryProfessionalSchedule(models.Model):
    """
    Model to track specific schedules for industry professionals (POPs) 
    who have limited availability and can only teach on specific days/times.
    """
    SCHEDULE_STATUS = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
    ]
    
    teacher_course = models.ForeignKey(TeacherCourse, on_delete=models.CASCADE, related_name='special_schedules')
    day_of_week = models.IntegerField("Day of Week", choices=[
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ])
    slot = models.ForeignKey("slot.Slot", on_delete=models.CASCADE)
    status = models.CharField("Status", max_length=20, choices=SCHEDULE_STATUS, default='pending')
    notes = models.TextField("Notes", blank=True, null=True)
    
    class Meta:
        unique_together = ['teacher_course', 'day_of_week', 'slot']
        verbose_name = "Industry Professional Schedule"
        verbose_name_plural = "Industry Professional Schedules"
    
    def __str__(self):
        day_name = dict([(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), 
                          (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')])[self.day_of_week]
        return f"{self.teacher_course} - {day_name}: {self.slot} ({self.get_status_display()})"
    
    def clean(self):
        # Ensure the teacher is actually an industry professional
        if not self.teacher_course.teacher_id.is_industry_professional:
            raise ValidationError("Special schedules can only be created for industry professionals")
        
        # Check if the selected time slot falls within the teacher's available hours
        teacher_availabilities = self.teacher_course.teacher_id.availability_slots.filter(
            day_of_week=self.day_of_week
        )
        
        # If no availability is set for this day, raise an error
        if not teacher_availabilities.exists():
            raise ValidationError(f"The teacher is not available on {dict([(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')])[self.day_of_week]}")
        
        # Check if the slot falls within any of the teacher's availability periods
        slot_start = self.slot.slot_start_time
        slot_end = self.slot.slot_end_time
        
        is_within_availability = False
        for availability in teacher_availabilities:
            if availability.start_time <= slot_start and availability.end_time >= slot_end:
                is_within_availability = True
                break
        
        if not is_within_availability:
            raise ValidationError("The selected time slot does not fall within the teacher's available hours")
        
        return super().clean()
    
    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)