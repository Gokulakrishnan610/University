import { useQuery, useMutation } from '@tanstack/react-query';
import api from './api';

export interface TeacherCourseAssignment {
    id: number;
    teacher: {
        id: number;
        teacher: {
            first_name: string;
            last_name: string;
        };
    };
    course: {
        id: number;
        course_name: string;
    };
    semester: number;
    academic_year: number;
}

// Get all teacher-course assignments
export const useGetTeacherCourseAssignments = () => {
    return useQuery({
        queryKey: ['teacherCourseAssignments'],
        queryFn: async () => {
            const response = await api.get('/api/teacher-course/');
            return response.data as TeacherCourseAssignment[];
        }
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
        }) => {
            const response = await api.post('/api/teacher-course/', data);
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
            const response = await api.delete(`/api/teacher-course/${id}/`);
            return response.data;
        },
        onSuccess: () => {
            if (onSuccess) onSuccess();
        }
    });
}; 