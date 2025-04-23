import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Settings, 
  User, 
  BookOpen, 
  GraduationCap, 
  Building,
  Users,
  X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  toggleSidebar: () => void
}

export function Sidebar({ isOpen, onClose, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  
  const routes = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile",
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
      title: "Departments",
      icon: <Building className="h-5 w-5" />,
      href: "/departments",
    },
    {
      title: "Students",
      icon: <Users className="h-5 w-5" />,
      href: "/students",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/setting",
    },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 md:translate-x-0",
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
        
        <ScrollArea className="h-[calc(100vh-64px)]">
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
        </ScrollArea>
      </div>
    </>
  );
} 