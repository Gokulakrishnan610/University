import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowLeftRight, Bell, Check } from "lucide-react";
import { useCheckPendingAllocations, useGetCourseNotifications } from "@/action/course";
import { useCurrentUser } from "@/action/authentication";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger, 
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { CourseNotifications } from "@/app/main/courses/course-notifications";

interface HeaderProps {
  backButtonHref?: string;
  showBackButton?: boolean;
  customBackAction?: () => void;
}

export default function Header({ 
  backButtonHref, 
  showBackButton = true,
  customBackAction
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: pendingAllocations } = useCheckPendingAllocations();
  const { data: currentUser } = useCurrentUser();
  const { data: courseNotifications } = useGetCourseNotifications();
  
  // State to track whether notifications have been viewed
  const [viewedNotifications, setViewedNotifications] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [lastReadCount, setLastReadCount] = useState<number>(0);
  
  // Only show for HODs
  const isHOD = currentUser?.teacher?.teacher_role === 'HOD';
  const hasPendingRequests = isHOD && pendingAllocations?.hasPendingRequests;
  
  // Course notifications
  const notificationCount = courseNotifications?.data?.length || 0;
  const hasNotifications = notificationCount > 0;
  
  // Initialize viewed state from local storage on mount
  useEffect(() => {
    const storedLastReadCount = localStorage.getItem('lastReadNotificationCount');
    if (storedLastReadCount) {
      setLastReadCount(parseInt(storedLastReadCount, 10));
    }
    
    // Only mark as read if we've previously read the same number of notifications
    if (notificationCount > 0 && notificationCount === lastReadCount) {
      setViewedNotifications(true);
    }
  }, [notificationCount]);
  
  // Reset viewed state when new notifications arrive
  useEffect(() => {
    if (notificationCount > 0 && notificationCount !== lastReadCount && !dialogOpen) {
      setViewedNotifications(false);
    }
  }, [notificationCount, lastReadCount, dialogOpen]);
  
  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setViewedNotifications(true);
    
    // Store the current notification count in local storage
    if (notificationCount > 0) {
      localStorage.setItem('lastReadNotificationCount', notificationCount.toString());
      setLastReadCount(notificationCount);
    }
  };
  
  // Handle dialog state change
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    // Mark as read when opening the dialog
    if (open && hasNotifications) {
      markAllAsRead();
    }
  };
  
  // Split the pathname into segments
  const segments = location.pathname
    .split("/")
    .filter(segment => segment !== "");
  
  // Create mapping for display names (you can extend this)
  const displayNames: Record<string, string> = {
    "dashboard": "Dashboard",
    "teacher-course-assignment": "Assignments",
    "teachers": "Teachers",
    "courses": "Courses",
    "profile": "Profile",
    "setting": "Settings",
    "main": "Main",
    "auth": "Authentication",
    "login": "Login"
  };
  
  // Function to get display name or prettify a path segment
  const getDisplayName = (segment: string) => {
    if (displayNames[segment]) return displayNames[segment];
    
    // For dynamic segments like [id], get the pretty version
    if (segment.match(/^\d+$/)) return "Details";
    
    // Capitalize and replace hyphens with spaces
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (customBackAction) {
      customBackAction();
    } else if (backButtonHref) {
      navigate(backButtonHref);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-4 mt-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          
          {segments.map((segment, index) => {
            // Skip 'main' segment as it's just a folder structure
            if (segment === "main") return null;
            
            // Build the href for this segment by joining all segments up to this point
            const href = `/${segments.slice(0, index + 1).join("/")}`;
            const isLast = index === segments.length - 1;
            const isNumber = segment.match(/^\d+$/);
            
            return (
              <React.Fragment key={segment}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {!isLast && !isNumber ? (
                    <BreadcrumbLink href={href}>
                      {getDisplayName(segment)}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbLink>{getDisplayName(segment)}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="flex items-center gap-3">
        {/* Course Notifications */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`relative ${hasNotifications && !viewedNotifications ? 'text-orange-500' : ''}`}
                  >
                    <Bell className="h-4 w-4" />
                    {hasNotifications && !viewedNotifications && (
                      <Badge 
                        className="absolute -top-2 -right-2 flex items-center justify-center h-5 min-w-5 px-1 text-xs bg-orange-500"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hasNotifications 
                    ? `${notificationCount} course notification${notificationCount === 1 ? '' : 's'}${viewedNotifications ? ' (read)' : ''}`
                    : 'No course notifications'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Course Notifications</DialogTitle>
              <DialogDescription>
                Courses from your department that are being used by other departments
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <CourseNotifications inDialog={true} isRead={viewedNotifications} />
            </div>
            {hasNotifications && (
              <DialogFooter className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {viewedNotifications 
                    ? 'Notifications marked as read' 
                    : 'You have unread notifications'}
                </p>
                <Button 
                  onClick={markAllAsRead}
                  variant="outline"
                  className="flex items-center gap-1.5"
                  disabled={viewedNotifications}
                >
                  <Check className="h-4 w-4" />
                  Mark all as read
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
        
        {isHOD && hasPendingRequests && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => navigate('/courses/allocations')}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 flex items-center justify-center h-5 min-w-5 px-1 text-xs"
                  >
                    {pendingAllocations?.pendingCount || 0}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You have {pendingAllocations?.pendingCount} pending allocation {pendingAllocations?.pendingCount === 1 ? 'request' : 'requests'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {showBackButton && (
          <Button
            variant="outline"
            onClick={handleBackClick}
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
