from django.db import models

# Create your models here.
class Course(models.Model):
    COURSE_TYPE = [
        ('T', 'Theory'),
        ('L', 'Lab'),
        ('LoT', 'Lab And Theory'),
    ]
    department = models.ForeignKey('department.department', on_delete=models.DO_NOTHING, blank=False, max_length=200)
    course_code = models.CharField('Course Code', max_length=200, blank=False)
    course_name = models.CharField("Course Name", max_length=200, blank=False)
    course_year = models.IntegerField("Course Year", default=0, blank=True)
    course_semester = models.IntegerField("Course Semeseter", default=0, blank=False)
    regulation = models.CharField("Regulation", blank=False, max_length=200)
    course_type = models.CharField("Course Type", default='T', blank=True, max_length=50, choices=COURSE_TYPE)
    lecture_hours = models.IntegerField("Lecture Hours", default=0, blank=True)
    tutorial_hours = models.IntegerField("Tutorial Hours", default=0, blank=True)
    practical_hours = models.IntegerField("Practical Hours", default=0, blank=True)
    credits = models.IntegerField("Course Credit", default=0, blank=False)
