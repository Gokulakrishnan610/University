import { useQuery, useMutation } from '@tanstack/react-query';
import api from './api';

export interface TeacherCourseAssignment {
    id: number;
    teacher_detail: {
        id: number;
        teacher: {
            email: string;
            first_name: string;
            last_name: string;
            phone_number: string;
            gender: string;
        };
        dept: {
            id: number;
            dept_name: string;
            date_established: string;
            contact_info: string;
        };
        staff_code: string;
        teacher_role: string;
        teacher_specialisation: string;
        teacher_working_hours: number;
    };
    course_detail: {
        id: number;
        department_detail: {
            id: number;
            dept_name: string;
            date_established: string;
            contact_info: string;
        };
        department_name: string;
        course_code: string;
        course_name: string;
        course_year: number;
        course_semester: number;
        regulation: string;
        course_type: string;
        lecture_hours: number;
        tutorial_hours: number;
        practical_hours: number;
        credits: number;
    };
    semester: number;
    academic_year: number;
    student_count: number;
}

// Get all teacher-course assignments
export const useGetTeacherCourseAssignments = () => {
    return useQuery({
        queryKey: ['teacherCourseAssignments'],
        queryFn: async () => {
            const response = await api.get('/api/teacher-courses/');
            return response.data as TeacherCourseAssignment[];
        }
    });
};

// Get a single teacher-course assignment by ID
export const useGetTeacherCourseAssignment = (id: number) => {
    return useQuery({
        queryKey: ['teacherCourseAssignment', id],
        queryFn: async () => {
            const response = await api.get(`/api/teacher-courses/${id}/`);
            return response.data as TeacherCourseAssignment;
        },
        enabled: !!id, // Only run the query if ID is provided
    });
};

// Create a new teacher-course assignment
export const useCreateTeacherCourseAssignment = (onSuccess?: () => void) => {
    return useMutation({
        mutationFn: async (data: {
            teacher: number;
            course: number;
            semester: number;
            academic_year: number;
            student_count: number;
        }) => {
            const response = await api.post('/api/teacher-courses/', data);
            return response.data;
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
        }
    });
};

// Delete a teacher-course assignment
export const useDeleteTeacherCourseAssignment = (onSuccess?: () => void) => {
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.delete(`/api/teacher-courses/${id}/`);
            return response.data;
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
        }
    });
}; 