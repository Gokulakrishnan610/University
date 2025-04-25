from django.db import models

# Create your models here.
class Slot(models.Model):
    slot_name = models.CharField("Slot Name", max_length=30, blank=False, unique=True)
    slot_start_time = models.TimeField("Slot Start Time", blank=False)
    slot_end_time = models.TimeField("Slot End Time", blank=False)

    def __str__(self):
        return f"{self.slot_name}-{self.slot_start_time}-{self.slot_end_time}"