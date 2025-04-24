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

    department = models.ForeignKey('department.department', on_delete=models.SET_NULL, null=True, blank=False, max_length=200)
    course_code = models.CharField('Course Code', max_length=200, blank=False)
    course_name = models.CharField("Course Name", max_length=200, blank=False)
    course_year = models.IntegerField("Course Year", default=1, blank=True, choices=COURSE_YEAR)
    course_semester = models.IntegerField("Course Semester", default=1, blank=False, choices=COURSE_SEMESTER)
    regulation = models.CharField("Regulation", blank=False, max_length=200)
    course_type = models.CharField("Course Type", default='T', blank=True, max_length=50, choices=COURSE_TYPE)
    elective_type = models.CharField("Elective Type", default='NE', blank=True, max_length=50, choices=ELECTIVE_TYPE)
    lecture_hours = models.IntegerField("Lecture Hours", default=0, blank=True)
    tutorial_hours = models.IntegerField("Tutorial Hours", default=0, blank=True)
    practical_hours = models.IntegerField("Practical Hours", default=0, blank=True)
    credits = models.IntegerField("Course Credit", default=0, blank=False)
    offered_to = models.ManyToManyField('department.department', related_name="available_courses", blank=True)

    class Meta:
        unique_together = ('department', 'course_code', 'course_semester')

    def __str__(self):
        dept_name = self.department.dept_name if self.department else "No Department"
        return f"{self.course_code} - {self.course_name} ({dept_name})"