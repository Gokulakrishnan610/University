from django.db import models

# Create your models here.
class Department(models.Model):
    dept_name = models.CharField("Department", blank=False, max_length=50)
    date_established = models.DateField("Est.", blank=True, max_length=50)
    contact_info = models.CharField("Contact Details", blank=True, max_length=100)