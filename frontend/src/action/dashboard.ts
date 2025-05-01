import api from './api'
import { useQueryData } from '@/hooks/useQueryData'

export interface DashboardStats {
  total_courses: number
  total_teachers: number
  total_students: number
  courses_with_teachers: number
  courses_with_rooms: number
  pending_assignments: number

  industry_professionals: number
  senior_staff: number
  resigning_teachers: number
  teachers_with_courses: number
  teacher_utilization: number

  total_enrollments: number
  avg_students_per_course: number

  teacher_assignment_percentage: number
  room_assignment_percentage: number
  overall_completion_percentage: number

  avg_working_hours: number
  fully_loaded_teachers: number
  underutilized_teachers: number
  workload_balance: number

  is_department_filtered: boolean
  department_name: string | null

  // Slot allocation summary
  slot_allocation: {
    total_slot_assignments: number
    teachers_with_slots: number
    slot_coverage_percentage: number
    slot_type_distribution: {
      [key: string]: {
        name: string
        teacher_count: number
        percentage: number
      }
    }
    day_distribution: {
      [key: string]: {
        teacher_count: number
        percentage: number
      }
    }
    days_assigned_distribution: {
      [key: string]: number
    }
  }
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/api/dashboard/stats/')
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      total_courses: 0,
      total_teachers: 0,
      total_students: 0,
      courses_with_teachers: 0,
      courses_with_rooms: 0,
      pending_assignments: 0,

      industry_professionals: 0,
      senior_staff: 0,
      resigning_teachers: 0,
      teachers_with_courses: 0,
      teacher_utilization: 0,

      total_enrollments: 0,
      avg_students_per_course: 0,

      teacher_assignment_percentage: 0,
      room_assignment_percentage: 0,
      overall_completion_percentage: 0,

      // Workload metrics
      avg_working_hours: 0,
      fully_loaded_teachers: 0,
      underutilized_teachers: 0,
      workload_balance: 0,

      // Department info
      is_department_filtered: false,
      department_name: null,

      // Slot allocation summary
      slot_allocation: {
        total_slot_assignments: 0,
        teachers_with_slots: 0,
        slot_coverage_percentage: 0,
        slot_type_distribution: {},
        day_distribution: {},
        days_assigned_distribution: {}
      }
    }
  }
}

// Custom hook to get dashboard stats
export const useGetDashboardStats = () => {
  return useQueryData<DashboardStats>(
    ['dashboardStats'],
    fetchDashboardStats
  )
} 