from django.db import models

# Create your models here.
class Slot(models.Model):
    slot_name = models.CharField("Slot Name", max_length=20)
    slot_start_time = models.TimeField("Slot Start Time")
    slot_end_time = models.TimeField("Slot End Time")

    def __str__(self):
        return f"{self.slot_name} ({self.slot_start_time}-{self.slot_end_time})"