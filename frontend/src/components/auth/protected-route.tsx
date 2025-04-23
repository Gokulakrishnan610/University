import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useCurrentUser } from "@/action";
import { Loader2 } from "lucide-react";

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  user_type: string;
  department?: number;
}

interface ProtectedRouteProps {
  children: ReactNode;
  requireHOD?: boolean;
}

export function ProtectedRoute({ 
  children,   
  requireHOD = true
}: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isPending } = useCurrentUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useEffect(() => {
    // Add a small delay to avoid flash of loading state
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Still loading
  if (isPending || isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated at all
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Type assertion to help TypeScript understand user is not null
  const currentUser = user as User;


  // Check if HOD access is required but user is not HOD
  // if (requireHOD && currentUser.user_type !== 'HOD') {
  //   return <Navigate to="/auth/" state={{ message: "Only department heads can access this area" }} replace />;
  // }

  // Authentication and verification checks passed, render the protected component
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useCurrentUser();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Add a small delay to avoid flash of loading state
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Still loading
  if (isPending || isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the public route
  return <>{children}</>;
} 