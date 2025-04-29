import { useQuery, useMutation } from '@tanstack/react-query';
import api from './api';
import { z } from 'zod';

// Define a Zod schema for validation
const TeacherCourseAssignmentSchema = z.object({
    id: z.number(),
    teacher_id: z.number().optional(),
    course_id: z.number().optional(),
    semester: z.number().optional(),
    academic_year: z.number().optional(), 
    student_count: z.number().optional()
});

export type TeacherCourseAssignment = {
    id: number;
    teacher_detail: {
        id: number;
        teacher_id: {
            email: string;
            first_name: string;
            last_name: string;
            phone_number: string;
            gender: string;
        };
        dept_id: {
            id: number;
            dept_name: string;
            date_established: string;
            contact_info: string;
        };
        staff_code: string;
        teacher_role: string;
        teacher_specialisation: string;
        teacher_working_hours: number;
        is_industry_professional?: boolean;
    };
    course_detail: {
        id: number;
        course_id: number;
        course_detail: {
            id: number;
            course_id: string;
            course_name: string;
            course_dept_id: number;
            course_dept_detail: {
                id: number;
                dept_name: string;
                date_established: string;
                contact_info: string;
            }
        };
        course_year: number;
        course_semester: number;
        lecture_hours: number;
        tutorial_hours: number;
        practical_hours: number;
        credits: number;
        for_dept_id: number;
        for_dept_detail: {
            id: number;
            dept_name: string;
            date_established: string;
            contact_info: string;
        };
        teaching_dept_id: number;
        teaching_dept_detail: {
            id: number;
            dept_name: string;
            date_established: string;
            contact_info: string;
        };
        regulation: string;
        course_type: string;
    };
    semester?: number;
    academic_year?: number;
    student_count?: number;
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

export const useCreateTeacherCourseAssignment = (onSuccess?: () => void) => {
    return useMutation({
        mutationFn: async (data: {
            teacher_id: number;
            course_id: number;
            semester?: number;
            academic_year?: number;
            student_count?: number;
        }) => {
            // Use default values if not provided
            const payload = {
                teacher_id: data.teacher_id,
                course_id: data.course_id,
                semester: data.semester || 1,
                academic_year: data.academic_year || new Date().getFullYear(),
                student_count: data.student_count || 0
            };
            
            const response = await api.post('/api/teacher-courses/', payload);
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