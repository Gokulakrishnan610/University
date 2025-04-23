import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Our App</h1>
      <p className="text-muted-foreground text-lg mb-8 text-center max-w-md">
        A secure platform with email-based authentication and PostgreSQL database.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/auth/login">Login</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
} 