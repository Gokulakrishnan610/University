from django.db import models

# Create your models here.
class Course(models.Model):
    COURSE_TYPE = [
        ('T', 'Theory'),
        ('L', 'Lab'),
        ('LoT', 'Lab And Theory'),
    ]
    COURSE_YEAR = [
        (1, 1),
        (2, 2),
        (3, 3),
        (4, 4),
        (5, 5),
    ]
    COURSE_SEMESTER = [
        (1, 1),
        (2, 2),
        (3, 3),
        (4, 4),
        (5, 5),
        (6, 6),
        (7, 7),
        (8, 8),
        (9, 9),
        (10, 10),
    ]
    ELECTIVE_TYPE = [
        ('NE', 'Non-Elective'),
        ('PE', 'Professional Elective'),
        ('OE', 'Open Elective'),
    ]
    ROOM_TYPES = [
        ('NULL', 'NULL'),
        ('TL', 'Technical Lab'),
        ('NTL', 'Non-Technical Lab')
    ]
    TECH_LEVEL = [
        ('none', 'None'),
        ('high', 'High'),
        ('low', 'Low'),
        ('medium', 'Medium'),
    ]

    # The dept which will be providing the course will be mentioned here
    course = models.ForeignKey("courseMaster.CourseMaster", on_delete=models.CASCADE, blank=False)
    course_year = models.IntegerField("Course Year", default=1, blank=False, choices=COURSE_YEAR)
    course_semester = models.IntegerField("Course Semester", default=1, blank=False, choices=COURSE_SEMESTER)
    is_zero_credit_course = models.BooleanField("Is Zero Credit Course?", default=False, blank=False)
    lecture_hours = models.IntegerField("Lecture Hours", default=0, blank=True)
    practical_hours = models.IntegerField("Practical Hours", default=0, blank=True)
    tutorial_hours = models.IntegerField("Tutorial Hours", default=0, blank=True)
    credits = models.IntegerField("Course Credit", default=0, blank=False)
    # The dept which will be using this course
    for_dept = models.ForeignKey("department.Department", on_delete=models.SET_NULL, null= True)
    # Will the dept that is using this course itself will handle the subject or the require assistance
    managed_by = models.ForeignKey("department.department", null=True, blank=False, 
                                 on_delete=models.CASCADE, related_name='managed_courses')
    need_assist_teacher = models.BooleanField("Assist teacher?", default=False, blank=False)
    slot_prefference = models.ManyToManyField("slot.Slot", blank=True, null=True)
    regulation = models.CharField("Regulation", blank=False, max_length=200)
    course_type = models.CharField("Course Type", default='T', blank=True, max_length=50, choices=COURSE_TYPE)
    elective_type = models.CharField("Elective Type", default='NE', blank=True, max_length=50, choices=ELECTIVE_TYPE)
    lab_type = models.CharField('Lab Type', blank=True, null=True, choices=ROOM_TYPES, default='NULL')
    lab_pref = models.ManyToManyField("rooms.Room", blank=True, related_name='lab_prefference')
    no_of_students = models.IntegerField("No. of students", blank=False, default=0)
    
    class Meta:
        unique_together = ('course', 'course_semester', 'for_dept', 'managed_by')

    def __str__(self):
        dept_name = self.course.course_dept.dept_name if self.course.course_dept else "No Department"
        return f"{self.course.course_id} - {self.course.course_name} ({dept_name})"