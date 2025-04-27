import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, BookOpen, CheckCircle2, Clock, MapPin, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { useGetDashboardStats } from '@/action/dashboard'

const Page = () => {
  // Fetch dashboard stats with custom hook
  const { data: stats, isPending: isLoading } = useGetDashboardStats()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="default">
            <Link to="/teacher-course-assignment">
              Assign Teachers
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/courses">
              Course Room Preferences
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total_courses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses registered in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total_teachers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Faculty members available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teacher Assignments</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.courses_with_teachers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses with assigned teachers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room Assignments</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.courses_with_rooms || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses with room preferences
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.pending_assignments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Courses requiring attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">
              Students enrolled in courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Steps to complete your course setup</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Assign Teachers to Courses</h3>
              <p className="text-sm text-muted-foreground">Allocate faculty members to each course based on specialization and availability</p>
            </div>
            <Button asChild size="sm">
              <Link to="/teacher-course-assignment">Assign Now</Link>
            </Button>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Add Room Preferences</h3>
              <p className="text-sm text-muted-foreground">Set classroom preferences for each course based on capacity and equipment needs</p>
            </div>
            <Button asChild size="sm">
              <Link to="/courses">Set Preferences</Link>
            </Button>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Review Schedule</h3>
              <p className="text-sm text-muted-foreground">Review the generated schedule and make necessary adjustments</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/schedule">View Schedule</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page