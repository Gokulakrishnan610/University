import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterUser, useResendVerification } from "@/action/user";

// Define the signup schema with Zod
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    getValues
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  // Use the register mutation from user.ts
  const { mutate, isPending } = useRegisterUser(() => {
    // Show success message
    setSuccess(true);
    setRegisteredEmail(getValues("email"));
    
    // Don't redirect automatically, let user verify email first
  });

  // Resend verification email functionality
  const { mutate: resendVerification, isPending: isResending } = useResendVerification(() => {
    // Show a temporary success message for resend
    setError(null);
    setSuccess(true);
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    setSuccess(false);
    
    try {
      // Call the register mutation with form data (excluding confirmPassword)
      const { confirmPassword, ...registerData } = data;
      mutate(registerData);
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    }
  };

  const handleResendVerification = () => {
    if (registeredEmail) {
      resendVerification({ email: registeredEmail });
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-2/3">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 py-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription className="max-w-sm">
                We've sent a verification email to <span className="font-semibold">{registeredEmail}</span>. 
                Please check your inbox and click the verification link to activate your account.
              </CardDescription>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Button 
                variant="outline"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </Button>
              <Button 
                variant="link"
                onClick={() => navigate("/auth/login")}
                className="mx-auto"
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
} 