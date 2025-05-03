import { Course, useGetCourseNotifications } from "@/action/course";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CourseNotificationsProps {
  inDialog?: boolean;
  isRead?: boolean;
}

export function CourseNotifications({ inDialog = false, isRead = false }: CourseNotificationsProps) {
  const { data, isPending, isFetched } = useGetCourseNotifications();
  const [expanded, setExpanded] = useState(false);
  
  const notifications = data?.data || [];
  const hasNotifications = notifications.length > 0;
  

  const displayedNotifications = expanded || inDialog ? notifications : notifications.slice(0, 3);

  if (isPending) {
    return inDialog ? (
      <div className="p-2">
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription><Skeleton className="h-4 w-72" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isFetched) {
    return inDialog ? (
      <div className="p-2 text-center">
        <p>An error occurred while loading notifications.</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Course Notifications
          </CardTitle>
          <CardDescription>An error occurred while loading notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasNotifications) {
    return inDialog ? (
      <div className="py-8 text-center flex flex-col items-center justify-center">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-2 opacity-20" />
        <p className="text-sm text-muted-foreground">No notifications at this time.</p>
        <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
      </div>
    ) : (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Course Notifications
          </CardTitle>
          <CardDescription>Courses from your department used by others</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No notifications at this time.</p>
        </CardContent>
      </Card>
    );
  }

  const NotificationContent = (
    <div className="space-y-3">
      {displayedNotifications.map((course: Course) => (
        <div 
          key={course.id} 
          className={cn(
            "p-3 rounded-md border transition-colors",
            inDialog && isRead 
              ? "bg-muted/10 border-muted" 
              : "bg-muted/20 hover:bg-muted/30"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {course.course_detail?.course_name || "Unnamed Course"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Code: {course.course_detail?.course_id || "Unknown"} 
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  course.for_dept_detail ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-gray-500/10"
                )}
              >
                For: {course.for_dept_detail?.dept_name || "Unknown Department"}
              </Badge>
              {course.teaching_dept_detail && (
                <Badge 
                  variant="outline" 
                  className="bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                >
                  Taught by: {course.teaching_dept_detail.dept_name}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-2 text-right">
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
              <Link to={`/main/courses/${course.id}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      ))}
      
      {!inDialog && notifications.length > 3 && (
        <Button 
          variant="ghost" 
          className="w-full text-sm mt-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show fewer" : `Show ${notifications.length - 3} more`}
        </Button>
      )}
    </div>
  );

  // For dialog with read notifications, show a different UI
  if (inDialog && isRead && hasNotifications) {
    return (
      <div className="p-2">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            You've read all {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        {NotificationContent}
      </div>
    );
  }

  return inDialog ? (
    <div className="p-2">
      {NotificationContent}
    </div>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          Course Notifications
          {hasNotifications && (
            <Badge className="bg-orange-500 text-white ml-2">
              {notifications.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Courses from your department that are being used by other departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {NotificationContent}
      </CardContent>
    </Card>
  );
} 