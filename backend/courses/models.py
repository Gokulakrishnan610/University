from django.db import models
from departments.models import Department, Teacher
from users.models import Student

class Semester(models.TextChoices):
    FALL = 'Fall', 'Fall'
    SPRING = 'Spring', 'Spring'
    SUMMER = 'Summer', 'Summer'

class Category(models.TextChoices):
    LOT = 'LOT', 'LOT'
    T = 'T', 'T'
    L = 'L', 'L'

class Course(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    course_code = models.CharField(max_length=50, unique=True)
    course_name = models.CharField(max_length=100)
    year = models.IntegerField()
    semester = models.CharField(max_length=10, choices=Semester.choices)
    regulation = models.CharField(max_length=50, null=True, blank=True)
    category = models.CharField(max_length=3, choices=Category.choices, null=True, blank=True)
    lecture_hours = models.IntegerField(default=0)
    tutorial_hours = models.IntegerField(default=0)
    practical_hours = models.IntegerField(default=0)
    credits = models.IntegerField()

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

class TeacherCourse(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student_count = models.IntegerField(default=0)
    academic_year = models.IntegerField()
    semester = models.CharField(max_length=10, choices=Semester.choices)

    def __str__(self):
        return f"{self.teacher.user.name} - {self.course.course_code}"

class StudentCourse(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    teacher_course = models.ForeignKey(TeacherCourse, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=2, null=True, blank=True)

    def __str__(self):
        return f"{self.student.enrollment_number} - {self.course.course_code}"
