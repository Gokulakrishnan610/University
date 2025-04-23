from django.db import models
from django.core.exceptions import ValidationError

class Department(models.Model):
    dept_name = models.CharField("Department", blank=False, max_length=50)
    date_established = models.DateField("Est.", blank=True, max_length=50)
    contact_info = models.CharField("Contact Details", blank=True, max_length=100)
    hod = models.ForeignKey('authentication.user', blank=True, on_delete=models.DO_NOTHING, max_length=100)

    class Meta:
        unique_together = ('dept_name',)

    def clean(self):
        self.dept_name = self.dept_name.upper()
        if self.hod and self.hod.user_type != 'teacher':
            raise ValidationError("Only teachers can be assigned as HOD")
        return super().clean()
    
    def __str__(self):
        return self.dept_name