import csv
from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Import users from CSV into the database'

    def handle(self, *args, **kwargs):
        self.import_users()

    def import_users(self):
        # Get the allowed user_type values from the User model choices
        valid_user_types = {choice[0] for choice in User.USER_TYPE}

        with open('data/app_users.csv', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Trim and split the full name
                name = row['name'].strip()
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''

                # Normalize and validate user_type
                raw_type = row['user_type'].strip().lower()
                user_type = raw_type if raw_type in valid_user_types else 'student'

                # Determine role flags
                is_staff = user_type == 'teacher'
                is_superuser = False

                # Trim email and password fields
                email = row['email'].strip()
                password = row['password'].strip()

                # Create or get user
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'password': password,
                        'is_active': True,
                        'is_staff': is_staff,
                        'is_superuser': is_superuser,
                        'phone_number': '',
                        'gender': 'M',
                        'user_type': user_type
                    }
                )
                self.stdout.write(f"User {'created' if created else 'exists'}: {user.email}")
