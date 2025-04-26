// Course interface with additional properties for the frontend
export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  course_year: number;
  course_semester: number;
  credits: number;
  department_name: string;
  department_id: number;
  regulation: string;
  course_type: string;
  lecture_hours: number;
  tutorial_hours: number;
  practical_hours: number;
} 