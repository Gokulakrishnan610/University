import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Settings, 
  User, 
  BookOpen, 
  GraduationCap, 
  Users,
  X,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser, useLogout } from "@/action";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useCurrentUser();
  const { mutate: logout } = useLogout();
  
  const routes = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Courses",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/courses",
    },
    {
      title: "Teachers",
      icon: <GraduationCap className="h-5 w-5" />,
      href: "/teachers",
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/setting",
    },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        navigate("/auth/login");
      },
      onError: (error: Error) => {
        toast.error("Logout failed", {
          description: error.message
        });
      }
    });
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 h-full border-r bg-background transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">University App</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
          <div className="flex flex-col h-[calc(100vh-70px)] justify-between">
            <div className="px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <Button
                      variant={location.pathname === route.href || location.pathname.startsWith(route.href + '/') ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {route.icon}
                      <span className="ml-2">{route.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            {profile && profile.user && (
              <div className="p-4 border-t mt-auto">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="User Avatar" />
                    <AvatarFallback>
                      {getInitials(profile.user.first_name, profile.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {`${profile.user.first_name} ${profile.user.last_name}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.user.email}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground capitalize mb-3">
                  <p>{profile.user.user_type}</p>
                  {profile.student && profile.student.department && (
                    <p>{profile.student.department.dept_name || "No Department"}</p>
                  )}
                  {profile.teacher && profile.teacher.department && (
                    <p>{profile.teacher.department.dept_name || "No Department"}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
      </div>
    </>
  );
} 