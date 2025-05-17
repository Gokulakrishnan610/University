import os
import csv
import logging
import pandas as pd
import numpy as np
from datetime import datetime
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from course.models import Course
from teacher.models import Teacher
from teacherCourse.models import TeacherCourse
from slot.models import Slot
from rooms.models import Room
from .models import Timetable, TimetableGenerationConfig

logger = logging.getLogger(__name__)

class TimetableGenerationService:
    """Service for generating timetables (currently disabled)"""
    
    def __init__(self, config_id=None):
        """Initialize the timetable generation service"""
        self.config = None
        if config_id:
            try:
                self.config = TimetableGenerationConfig.objects.get(id=config_id)
            except TimetableGenerationConfig.DoesNotExist:
                logger.error(f"Timetable generation config {config_id} not found")
        
        # Constants
        self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        self.day_indices = {day: i for i, day in enumerate(self.days)}
        
        # Data structures
        self.teachers = []
        self.courses = []
        self.rooms = []
        self.slots = []
        
        # Mapping dictionaries
        self.teacher_courses = {}  # Teacher -> courses
        self.course_teachers = {}  # Course -> teachers
        self.room_capacities = {}  # Room -> capacity
        self.lab_rooms = set()     # Set of lab rooms
        
        # Course types
        self.lab_courses = set()    # Set of lab courses
        self.theory_courses = set() # Set of theory courses
        
        # Load data from database
        self._load_data_from_db()
        
    def _load_data_from_db(self):
        """Load data from the database"""
        logger.info("Loading data from database...")
        
        # Load teachers
        self.teachers = list(Teacher.objects.all().values_list('id', flat=True))
        
        # Load courses
        self.courses = list(Course.objects.all().values_list('id', flat=True))
        
        # Identify lab courses
        lab_courses = Course.objects.filter(practical_hours__gt=0)
        self.lab_courses = set(lab_courses.values_list('id', flat=True))
        
        # Identify theory courses
        self.theory_courses = set(self.courses) - self.lab_courses
        
        # Load rooms
        self.rooms = list(Room.objects.all().values_list('id', flat=True))
        
        # Identify lab rooms
        lab_rooms = Room.objects.filter(is_lab=True)
        self.lab_rooms = set(lab_rooms.values_list('id', flat=True))
        
        # Load room capacities
        for room in Room.objects.all():
            self.room_capacities[room.id] = room.room_max_cap
        
        # Load slots
        self.slots = list(Slot.objects.all().values_list('id', flat=True))
        
        # Load teacher-course assignments
        for tc in TeacherCourse.objects.all():
            teacher_id = tc.teacher_id_id
            course_id = tc.course_id_id
            
            if teacher_id not in self.teacher_courses:
                self.teacher_courses[teacher_id] = []
            self.teacher_courses[teacher_id].append(course_id)
            
            if course_id not in self.course_teachers:
                self.course_teachers[course_id] = []
            self.course_teachers[course_id].append(teacher_id)
        
        logger.info(f"Loaded: {len(self.teachers)} teachers, {len(self.courses)} courses, "
                   f"{len(self.rooms)} rooms, {len(self.slots)} slots")
    
    def generate_timetable(self, config=None):
        """Generate timetable (currently disabled)"""
        logger.error("Timetable generation is currently disabled.")
        if config:
            self.config = config
        if not self.config:
            logger.error("No configuration provided for timetable generation")
            return False
        self.config.is_generated = False
        self.config.generation_started_at = timezone.now()
        self.config.generation_log = "Timetable generation is currently disabled.\n"
        self.config.generation_completed_at = timezone.now()
        self.config.save()
        return False 
