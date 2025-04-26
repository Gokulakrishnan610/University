from django.db import models

# Create your models here.
class CourseMaster(models.Model):
    course_id = models.CharField("Course ID", max_length=50, blank=False)
    course_name = models.CharField("Course Name", max_length=255, blank=False)
    course_dept_id = models.ForeignKey("department.Department", on_delete=models.SET_NULL, null=True, related_name='course_master')

    def __str__(self):
        dept_name = self.course_dept_id.dept_name if self.course_dept_id else "No Department"
        return f'{self.course_id}-{self.course_name}-{dept_name}'