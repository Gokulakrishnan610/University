import React from "react";
import { useLocation, useNavigate } from "react-router";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  );
}
