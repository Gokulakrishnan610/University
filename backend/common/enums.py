# common/enums.py

from django.db import models


class UserType(models.TextChoices):
    TEACHER = 'Teacher', 'Teacher'
    STUDENT = 'Student', 'Student'


class Role(models.TextChoices):
    PROFESSOR = 'Professor', 'Professor'
    ASSISTANT = 'Asst', 'Assistant'
    HOD = 'HOD', 'Head of Department'
    DC = 'DC', 'Department Coordinator'


class Semester(models.TextChoices):
    FALL = 'Fall', 'Fall'
    SPRING = 'Spring', 'Spring'
    SUMMER = 'Summer', 'Summer'


class Category(models.TextChoices):
    LOT = 'LOT', 'Lecture Only Theory'
    T = 'T', 'Theory'
    L = 'L', 'Lab'


class RoomType(models.TextChoices):
    ROOM = 'Room', 'Standard Room'
    TL = 'TL', 'Technology Lab'
    NTL = 'NTL', 'Non-Tech Lab'


class DayOfWeek(models.TextChoices):
    MONDAY = 'Monday', 'Monday'
    TUESDAY = 'Tuesday', 'Tuesday'
    WEDNESDAY = 'Wednesday', 'Wednesday'
    THURSDAY = 'Thursday', 'Thursday'
    FRIDAY = 'Friday', 'Friday'
    SATURDAY = 'Saturday', 'Saturday'
    SUNDAY = 'Sunday', 'Sunday'


class SessionType(models.TextChoices):
    LECTURE = 'Lecture', 'Lecture'
    TUTORIAL = 'Tutorial', 'Tutorial'
    PRACTICAL = 'Practical', 'Practical'
