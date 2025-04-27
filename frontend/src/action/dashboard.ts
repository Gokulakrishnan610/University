import api from './api'
import { useQueryData } from '@/hooks/useQueryData'

// Dashboard stats interface
export interface DashboardStats {
  total_courses: number
  total_teachers: number
  total_students: number
  courses_with_teachers: number
  courses_with_rooms: number
  pending_assignments: number
}

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/api/dashboard/stats/')
    return response.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return default values on error
    return {
      total_courses: 0,
      total_teachers: 0,
      total_students: 0,
      courses_with_teachers: 0,
      courses_with_rooms: 0,
      pending_assignments: 0
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