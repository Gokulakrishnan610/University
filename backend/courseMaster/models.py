from django.db import models

# Create your models here.
class CourseMaster(models.Model):
    course_id = models.CharField("Course ID", max_length=20, blank=False)
    course_name = models.CharField("Course Name", max_length=100, blank=False)
    course_dept = models.ForeignKey("department.department", max_length=100, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f'{self.course_id}-{self.course_name}-{self.course_dept}'