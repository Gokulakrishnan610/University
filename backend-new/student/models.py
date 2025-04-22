from django.db import models

# Create your models here.
class Student(models.Model):
    student = models.ForeignKey('authentication.user', on_delete=models.DO_NOTHING, max_length=200,blank=False)
    batch = models.IntegerField('Batch', default=0, blank=True)
    current_semester = models.IntegerField('Semester', default=0, blank=True) 