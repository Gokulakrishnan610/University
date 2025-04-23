from django.db import models

# Create your models here.
class Room(models.Model):
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

    room_number = models.CharField("Room Number", blank=False, max_length=200)
    block = models.CharField("Room Block", blank=False, max_length=200)
    description = models.CharField("Room description", blank=False, max_length=200)
    maintained_by = models.ForeignKey("department.department", on_delete=models.DO_NOTHING, blank=False)
    is_lab = models.BooleanField("Is lab?", default=False)
    room_type = models.CharField("Room Type", default='NULL', blank=False, max_length=200, choices=ROOM_TYPES)
    room_min_cap = models.IntegerField("Min. Cap", default=0, blank=False)
    room_max_cap = models.IntegerField("Max. Cap", default=0, blank=False)
    has_projector = models.BooleanField("Has Projector?", default=False)
    has_ac = models.BooleanField("Has AC?", default=False)
    tech_level = models.CharField("Tech Level", default='none', blank=True, choices=TECH_LEVEL, max_length=200)