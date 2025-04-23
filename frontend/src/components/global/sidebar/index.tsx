import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Settings, 
  User, 
  FileText, 
  BarChart, 
  Mail, 
  X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
      title: "Documents",
      icon: <FileText className="h-5 w-5" />,
      href: "/documents",
    },
    {
      title: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      href: "/analytics",
    },
    {
      title: "Messages",
      icon: <Mail className="h-5 w-5" />,
      href: "/messages",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

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
          "fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">App Name</span>
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
                    variant={location.pathname === route.href ? "secondary" : "ghost"}
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