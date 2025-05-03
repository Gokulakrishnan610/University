import os
import django
import random
from faker import Faker
from django.utils import timezone
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'UniversityApp.settings')
django.setup()

from student.models import Student
from authentication.models import User
from department.models import Department

def generate_students(count=500):
    """
    Generate random student data and save to database
    """
    fake = Faker()
    
    # Get the CSE department (assuming it exists with id=1)
    try:
        cse_department = Department.objects.get(id=1)
    except Department.DoesNotExist:
        print("Error: CSE Department with id=1 does not exist. Please create it first.")
        return
    
    batch_years = list(range(timezone.now().year - 4, timezone.now().year + 1))
    
    # Create student users
    for i in range(1, count + 1):
        # Generate basic user info
        gender = random.choice(['M', 'F'])
        first_name = fake.first_name_male() if gender == 'M' else fake.first_name_female()
        last_name = fake.last_name()
        email = f"student{i}@university.edu"
        phone = fake.numerify(text="##########")
        
        # Create user
        try:
            user = User.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                phone_number=phone,
                gender=gender,
                user_type='student',
                password='password123'  # Default password, should be changed in production
            )
            
            # Random student data
            batch = random.choice(batch_years)
            year = (timezone.now().year - batch) + 1
            if year < 1:
                year = 1
            semester = random.randint(1, min(year * 2, 8))  # Max 8 semesters
            
            # Create student profile
            student_type = random.choice(['Mgmt', 'Govt'])
            degree_type = random.choice(['UG', 'PG'])
            roll_no = f"CSE{batch%100}{i:03d}"
            
            Student.objects.create(
                student_id=user,
                batch=batch,
                current_semester=semester,
                year=year,
                dept_id=cse_department,
                roll_no=roll_no,
                student_type=student_type,
                degree_type=degree_type
            )
            
            if i % 50 == 0:
                print(f"Created {i} students so far...")
                
        except Exception as e:
            print(f"Error creating student {i}: {str(e)}")
    
    print(f"Successfully created {count} students in the CSE department")

if __name__ == "__main__":
    print("Starting to seed students...")
    generate_students(500)
    print("Finished seeding students!") 