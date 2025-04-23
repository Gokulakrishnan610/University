import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/global/toggle-mode";
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
import { useLogout, useCurrentUser } from "@/action/user";
import { Menu } from "lucide-react";
import { User } from "@/types/index.types";

interface HeaderProps {
  toggleSidebar: () => void;
}



export function Header({ toggleSidebar}: HeaderProps) {
  const {mutate} = useLogout();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  
  // Type cast user to our defined interface or null
  const typedUser = user as User | null;

  const handleLogout = () => {
    mutate(undefined);
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="px-10 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">AIVA</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {typedUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt="Avatar" />
                    <AvatarFallback>
                      {typedUser?.name ? getInitials(typedUser.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{typedUser?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {typedUser?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
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
            <Button variant="default" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 