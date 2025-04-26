// Teacher interface with user details included
export interface Teacher {
  id: number;
  teacher: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    gender: string;
  };
  dept_id: {
    id: number;
    dept_name: string;
    date_established: string;
    contact_info: string;
  } | null;
  staff_code: string;
  teacher_role: string;
  teacher_specialisation: string;
  teacher_working_hours: number;
} 