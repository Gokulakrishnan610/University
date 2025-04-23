import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router";
import { useLogout, useCurrentUser, ProfileResponse } from "@/action";
import { Menu } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar}: HeaderProps) {
  const { mutate } = useLogout();
  const navigate = useNavigate();
  const { data: profile } = useCurrentUser();

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        navigate('/auth/login');
      }
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="px-10 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          {/* <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">University App</span>
          </Link> */}
        </div>

        <div className="flex items-center gap-4">          
          {profile && profile.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Avatar" />
                    <AvatarFallback>
                      {getInitials(profile.user.first_name, profile.user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {`${profile.user.first_name} ${profile.user.last_name}`}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                      {profile.user.user_type ==='student' ? 'Student': profile.teacher?.teacher_role}
                    </p>
                    {profile.student && (
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {profile.student.department?.dept_name || "Department: Not assigned"}
                      </p>
                    )}
                    {profile.teacher && (
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {profile.teacher.department?.dept_name || "Department: Not assigned"}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/setting")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" onClick={() => navigate("/auth/login")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 