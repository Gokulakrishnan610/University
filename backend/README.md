# University App Backend

## Data Import Management Command

### Overview
This Django management command allows you to import data from CSV files into the database.

### Prerequisites
- Ensure you have the CSV files in the `data/` directory
- Required CSV files:
  - `departments.csv`
  - `app_users.csv`
  - `teachers.csv`
  - `courses.csv`
  - `rooms.csv`

### Usage
To import data, run the following command from the `backend/` directory:

```bash
python manage.py import_data
```

### CSV File Formats

#### departments.csv
- `dept_name`: Department name
- `date_established`: Date of department establishment
- `contact_info`: Department contact information
- `hod_email`: Email of the Head of Department

#### app_users.csv
- `email`: User email (unique)
- `password`: User password
- `first_name`: First name
- `last_name`: Last name
- `year`: Academic year
- `dept`: Department
- `roll_no`: Student roll number
- `phone_number`: Contact number
- `gender`: Gender (M/F)
- `uuid`: Unique identifier
- `student_type`: Management/Govt
- `degree_type`: UG/PG
- `user_type`: student/teacher

#### teachers.csv
- `email`: Teacher's email
- `dept_name`: Department name
- `staff_code`: Staff identification code
- `specialisation`: Teaching specialization
- `working_hours`: Working hours
- `role`: Teacher's role

#### courses.csv
- `course_code`: Unique course code
- `department`: Department name
- `course_semester`: Semester of the course
- `course_name`: Full course name
- `regulation`: Course regulation
- `course_type`: Type of course
- `lecture_hours`: Lecture hours
- `tutorial_hours`: Tutorial hours
- `practical_hours`: Practical hours
- `credits`: Course credits
- `course_year`: Academic year of the course

#### rooms.csv
- `room_number`: Unique room identifier
- `block`: Building or block
- `description`: Room description
- `is_lab`: Whether the room is a lab (true/false)
- `room_type`: Type of room
- `room_min_cap`: Minimum room capacity
- `room_max_cap`: Maximum room capacity
- `has_projector`: Whether the room has a projector (true/false)
- `has_ac`: Whether the room has air conditioning (true/false)
- `tech_level`: Technological infrastructure level
- `maintained_by`: Department maintaining the room

### Notes
- The command uses `get_or_create` to avoid duplicate entries
- Existing entries will not be overwritten
- The command prints out created or existing entries for tracking 