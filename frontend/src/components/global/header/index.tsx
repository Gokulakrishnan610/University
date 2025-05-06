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
import { ArrowLeft, Bell, Check } from "lucide-react";
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
import { Tabs as UITabs, TabsContent as UITabsContent, TabsList as UITabsList, TabsTrigger as UITabsTrigger } from "@/components/ui/tabs";

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

  const [viewedNotifications, setViewedNotifications] = useState<boolean>(false);
  const [viewedAllocations, setViewedAllocations] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [lastReadCount, setLastReadCount] = useState<number>(0);
  const [lastReadAllocations, setLastReadAllocations] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("course");

  // Only show for HODs
  const isHOD = currentUser?.teacher?.teacher_role === 'HOD';
  const hasPendingRequests = isHOD && pendingAllocations?.hasPendingRequests;
  const pendingCount = pendingAllocations?.pendingCount || 0;

  // Course notifications
  const notificationCount = courseNotifications?.data?.length || 0;
  const hasNotifications = notificationCount > 0;

  // Combined notifications count
  const totalNotifications = notificationCount + (hasPendingRequests ? pendingCount : 0);
  const hasAnyNotifications = totalNotifications > 0;
  const hasUnreadNotifications = (hasNotifications && !viewedNotifications) || (hasPendingRequests && !viewedAllocations);

  // Initialize viewed state from local storage on mount
  useEffect(() => {
    const storedLastReadCount = localStorage.getItem('lastReadNotificationCount');
    const storedLastReadAllocations = localStorage.getItem('lastReadAllocationCount');

    if (storedLastReadCount) {
      setLastReadCount(parseInt(storedLastReadCount, 10));
    }

    if (storedLastReadAllocations) {
      setLastReadAllocations(parseInt(storedLastReadAllocations, 10));
    }

    // Check if we've read the same number of notifications
    if (notificationCount > 0 && notificationCount === lastReadCount) {
      setViewedNotifications(true);
    }

    if (pendingCount > 0 && pendingCount === lastReadAllocations) {
      setViewedAllocations(true);
    }
  }, [notificationCount, pendingCount]);

  // Reset viewed state when new notifications arrive
  useEffect(() => {
    if (notificationCount > 0 && notificationCount !== lastReadCount && !dialogOpen) {
      setViewedNotifications(false);
    }

    if (pendingCount > 0 && pendingCount !== lastReadAllocations && !dialogOpen) {
      setViewedAllocations(false);
    }
  }, [notificationCount, lastReadCount, pendingCount, lastReadAllocations, dialogOpen]);

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setViewedNotifications(true);
    setViewedAllocations(true);

    // Store the current notification counts in local storage
    if (notificationCount > 0) {
      localStorage.setItem('lastReadNotificationCount', notificationCount.toString());
      setLastReadCount(notificationCount);
    }

    if (pendingCount > 0) {
      localStorage.setItem('lastReadAllocationCount', pendingCount.toString());
      setLastReadAllocations(pendingCount);
    }
  };

  // Handle dialog state change
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    // Mark as read when opening the dialog
    if (open && hasAnyNotifications) {
      markAllAsRead();
    }
  };

  // Navigate to allocations page
  const goToAllocations = () => {
    navigate('/courses/allocations');
    setDialogOpen(false);
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

    if (segment.match(/^\d+$/)) return "Details";

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
        {/* Combined Notifications */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`relative ${hasUnreadNotifications ? 'text-orange-500' : ''}`}
                  >
                    <Bell className="h-4 w-4" />
                    {hasAnyNotifications && hasUnreadNotifications && (
                      <Badge
                        className="absolute -top-2 -right-2 flex items-center justify-center h-5 min-w-5 px-1 text-xs bg-orange-500"
                      >
                        {totalNotifications}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {hasAnyNotifications
                    ? `${totalNotifications} notification${totalNotifications === 1 ? '' : 's'}${!hasUnreadNotifications ? ' (read)' : ''}`
                    : 'No notifications'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
              <DialogDescription>
                Course-related notifications (Notification of courses that are taken by other department)
              </DialogDescription>
            </DialogHeader>

            <UITabs defaultValue={hasNotifications ? "course" : (hasPendingRequests ? "allocations" : "course")}
              onValueChange={setActiveTab}
              className="mt-4">
              <UITabsList className="grid grid-cols-2">
                <UITabsTrigger value="course" disabled={!hasNotifications}>
                  Course Notifications
                  {hasNotifications && !viewedNotifications && (
                    <Badge className="ml-2 bg-orange-500">{notificationCount}</Badge>
                  )}
                </UITabsTrigger>
                <UITabsTrigger value="allocations" disabled={!hasPendingRequests}>
                  Pending Allocations
                  {hasPendingRequests && !viewedAllocations && (
                    <Badge className="ml-2 bg-red-500">{pendingCount}</Badge>
                  )}
                </UITabsTrigger>
              </UITabsList>

              <UITabsContent value="course" className="max-h-[60vh] overflow-y-auto mt-4">
                <CourseNotifications inDialog={true} isRead={viewedNotifications} />
              </UITabsContent>

              <UITabsContent value="allocations" className="max-h-[60vh] overflow-y-auto mt-4">
                {hasPendingRequests ? (
                  <div className="flex flex-col gap-4">
                    <p>You have {pendingCount} pending allocation {pendingCount === 1 ? 'request' : 'requests'} that require your attention.</p>
                    <Button onClick={goToAllocations}>
                      View Allocation Requests
                    </Button>
                  </div>
                ) : (
                  <p>No pending allocation requests</p>
                )}
              </UITabsContent>
            </UITabs>

            {hasAnyNotifications && (
              <DialogFooter className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {!hasUnreadNotifications
                    ? 'All notifications marked as read'
                    : 'You have unread notifications'}
                </p>
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="flex items-center gap-1.5"
                  disabled={!hasUnreadNotifications}
                >
                  <Check className="h-4 w-4" />
                  Mark all as read
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

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
