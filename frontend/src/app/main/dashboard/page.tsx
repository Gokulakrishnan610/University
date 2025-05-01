import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  AlertCircle, BookOpen, CheckCircle2, Clock, MapPin, Users, Building, 
  ChevronUp, ChevronDown, Briefcase, GraduationCap, PieChart, BarChart, 
  Award, User, UserCheck, UserX, LucideIcon, Bell 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router'
import { useGetDashboardStats } from '@/action/dashboard'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CourseNotifications } from '../courses/course-notifications'
import { useGetCourseNotifications } from '@/action/course'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Define interface for StatCard props
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  progress?: number | null;
  trend?: number | null;
  className?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

// Component for stat cards with progress indicator
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  progress = null, 
  trend = null, 
  className = "",
  iconClassName = "",
  isLoading = false 
}) => {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 text-muted-foreground ${iconClassName}`}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : value}
          {trend && (
            <span 
              className={`ml-2 text-xs font-normal ${
                trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              {trend > 0 ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {progress !== null && (
          <div className="mt-3 mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span>{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

const Page = () => {
  const { data: stats, isPending: isLoading } = useGetDashboardStats()
  const { data: courseNotifications } = useGetCourseNotifications()
  
  const notificationCount = courseNotifications?.data?.length || 0

  return (
    <div className="flex flex-col gap-6 px-6 pb-8">
      {/* Department Info */}
      {stats?.is_department_filtered && stats?.department_name && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">
                {stats.department_name} Department Dashboard
              </h2>
              <Badge variant="outline" className="ml-2">Department View</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Showing statistics and data specific to your department
            </p>
          </CardContent>
        </Card>
      )}

      {/* Overall Completion Card */}
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardContent className="pt-6 pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Course Setup Progress
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.is_department_filtered 
                  ? `Overall setup progress for ${stats.department_name} courses` 
                  : 'Overall course setup progress'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold">{isLoading ? '...' : stats?.overall_completion_percentage || 0}%</span>
                <span className="text-xs text-muted-foreground">Completion Rate</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Teacher Assignments</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                    {isLoading ? '...' : stats?.teacher_assignment_percentage || 0}%
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isLoading ? '...' : stats?.courses_with_teachers || 0}/{isLoading ? '...' : stats?.total_courses || 0} Courses
                </span>
              </div>
              <Progress className="h-2" value={stats?.teacher_assignment_percentage || 0} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Room Assignments</span>
                  <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100">
                    {isLoading ? '...' : stats?.room_assignment_percentage || 0}%
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {isLoading ? '...' : stats?.courses_with_rooms || 0}/{isLoading ? '...' : stats?.total_courses || 0} Courses
                </span>
              </div>
              <Progress className="h-2" value={stats?.room_assignment_percentage || 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Courses"
              value={stats?.total_courses || 0}
              icon={BookOpen}
              description={stats?.is_department_filtered 
                ? `Courses in ${stats.department_name} department` 
                : 'Courses registered in the system'}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Total Teachers"
              value={stats?.total_teachers || 0}
              icon={Users}
              description={stats?.is_department_filtered 
                ? `Faculty members in ${stats.department_name}` 
                : 'Faculty members available'}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Total Students"
              value={stats?.total_students || 0}
              icon={GraduationCap}
              description={stats?.is_department_filtered 
                ? `Students enrolled in ${stats.department_name} courses` 
                : 'Students enrolled in courses'}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Teacher Assignments"
              value={stats?.courses_with_teachers || 0}
              icon={CheckCircle2}
              progress={stats?.teacher_assignment_percentage || 0}
              description={stats?.is_department_filtered 
                ? `${stats.department_name} courses with assigned teachers` 
                : 'Courses with assigned teachers'}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Room Assignments"
              value={stats?.courses_with_rooms || 0}
              icon={MapPin}
              progress={stats?.room_assignment_percentage || 0}
              description={stats?.is_department_filtered 
                ? `${stats.department_name} courses with room preferences` 
                : 'Courses with room preferences'}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Pending Assignments"
              value={stats?.pending_assignments || 0}
              icon={AlertCircle}
              iconClassName="text-amber-500"
              description={stats?.is_department_filtered 
                ? `${stats.department_name} courses requiring attention` 
                : 'Courses requiring attention'}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        {/* Faculty Tab */}
        <TabsContent value="faculty" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Industry Professionals"
              value={stats?.industry_professionals || 0}
              icon={Briefcase}
              description="POPs and industry experts teaching courses"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Senior Faculty"
              value={stats?.senior_staff || 0}
              icon={Award}
              description="HODs and Professors in the department"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Teacher Utilization"
              value={`${stats?.teacher_utilization || 0}%`}
              icon={BarChart}
              description={`${stats?.teachers_with_courses || 0} out of ${stats?.total_teachers || 0} teachers assigned courses`}
              isLoading={isLoading}
            />
            
            <StatCard
              title="Avg. Working Hours"
              value={stats?.avg_working_hours || 0}
              icon={Clock}
              description="Average teaching hours per faculty member"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Fully Loaded Teachers"
              value={stats?.fully_loaded_teachers || 0}
              icon={UserCheck}
              description="Teachers with maximum teaching load"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Resigning Teachers"
              value={stats?.resigning_teachers || 0}
              icon={UserX}
              iconClassName="text-orange-500"
              description="Teachers who will be resigning soon"
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="pt-4">
          <div className="mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Course Utilization
                  </CardTitle>
                  <CardDescription>
                    Summary of how your department's courses are being used
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {notificationCount > 0 
                        ? `${notificationCount} of your department's courses are being used by other departments` 
                        : "None of your department's courses are currently being used by other departments"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check the notification bell in the header for details
                    </p>
                  </div>
                  {notificationCount > 0 && (
                    <Badge className="bg-orange-500">
                      {notificationCount} Courses
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Active Courses"
              value={stats?.total_courses || 0}
              icon={BookOpen}
              description="Courses currently active in the system"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Course Notifications"
              value={notificationCount}
              icon={Bell}
              iconClassName={notificationCount > 0 ? "text-orange-500" : ""}
              description="Courses from your department used by others"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Total Enrollments"
              value={stats?.total_enrollments || 0}
              icon={User}
              description="Total student enrollments across all courses"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Avg. Students Per Course"
              value={stats?.avg_students_per_course || 0}
              icon={Users}
              description="Average class size across all courses"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Workload Balance"
              value={`${stats?.workload_balance || 0}%`}
              icon={BarChart}
              description="Distribution of teaching load across faculty"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Pending Assignments"
              value={stats?.pending_assignments || 0}
              icon={AlertCircle}
              iconClassName="text-amber-500"
              description="Courses that need to be assigned teachers"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Teaching Capacity"
              value={
                isLoading 
                  ? '...' 
                  : ((stats?.teachers_with_courses || 0) * (stats?.avg_working_hours || 0))
              }
              icon={Clock}
              description="Total available teaching hours from faculty"
              isLoading={isLoading}
            />
            
            <StatCard
              title="Underutilized Teachers"
              value={stats?.underutilized_teachers || 0}
              icon={User}
              description="Teachers with remaining teaching capacity"
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            {stats?.is_department_filtered 
              ? `Steps to complete your ${stats.department_name} department course setup` 
              : 'Steps to complete your course setup'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Assign Teachers to Courses</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.is_department_filtered 
                  ? `Allocate ${stats.department_name} faculty members to courses` 
                  : 'Allocate faculty members to each course based on specialization and availability'}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                  {isLoading ? '...' : stats?.teacher_assignment_percentage || 0}% Complete
                </Badge>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/teacher-course-assignment">Assign Now</Link>
            </Button>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Add Room Preferences</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.is_department_filtered 
                  ? `Set classroom preferences for ${stats.department_name} courses` 
                  : 'Set classroom preferences for each course based on capacity and equipment needs'}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {isLoading ? '...' : stats?.room_assignment_percentage || 0}% Complete
                </Badge>
              </div>
            </div>
            <Button asChild size="sm">
              <Link to="/courses">Set Preferences</Link>
            </Button>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg hover:bg-muted/40 transition-colors">
            <div className="mr-4 bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Review Schedule</h3>
              <p className="text-sm text-muted-foreground">
                {stats?.is_department_filtered 
                  ? `Review the generated schedule for ${stats.department_name} courses` 
                  : 'Review the generated schedule and make necessary adjustments'}
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="bg-primary/20 text-primary">
                  {isLoading ? '...' : stats?.overall_completion_percentage || 0}% Ready
                </Badge>
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/schedule">View Schedule</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {isLoading ? 'Loading...' : `${stats?.pending_assignments || 0} Courses need attention`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Courses that still need teacher assignments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Page