import csv
from django.core.management.base import BaseCommand
from authentication.models import User
from department.models import Department
from teacher.models import Teacher
from django.db import transaction


class Command(BaseCommand):
    help = 'Import teachers from a CSV file.'

    def handle(self, *args, **options):
        csv_path = '/csv/updated_data/updated_teachers.csv'

        try:
            with open(csv_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)

                for row in reader:
                    email = row.get('email', '').strip()
                    if not email:
                        self.stdout.write(self.style.WARNING("Missing email in row. Skipping."))
                        continue

                    try:
                        user = User.objects.get(email=email)
                    except User.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"User with email {email} not found. Skipping."))
                        continue

                    dept_name = row.get('department_name', '').strip()
                    if not dept_name:
                        self.stdout.write(self.style.WARNING(f"Missing department name for {email}. Skipping."))
                        continue

                    try:
                        department = Department.objects.get(dept_name=dept_name)
                    except Department.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Department '{dept_name}' not found for {email}. Skipping."))
                        continue

                    if Teacher.objects.filter(teacher_id=user).exists():
                        self.stdout.write(self.style.WARNING(f"Teacher with email {email} already exists. Skipping."))
                        continue

                    try:
                        with transaction.atomic():
                            Teacher.objects.create(
                                teacher_id=user,
                                dept_id=department,
                                staff_code=row.get('staff_code', '').strip(),
                                teacher_specialisation=row.get('specialization', '').strip(),
                                teacher_working_hours=int(row.get('teacher_working_hours') or 0),
                                teacher_role=row.get('teacher_role', '').strip(),
                                availability_type=row.get('availability_type', '').strip(),
                                is_industry_professional=row.get('is_industry_professional', '').strip().lower() == 'true'
                            )
                            self.stdout.write(self.style.SUCCESS(f"Teacher {user.first_name} {user.last_name} added successfully."))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error adding teacher for {email}: {e}"))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"CSV file not found at: {csv_path}"))
