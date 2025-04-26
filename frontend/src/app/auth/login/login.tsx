import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, clearAuthCookies } from "@/action";
import { toast } from "sonner";

// Define the login schema with Zod
const loginSchema = z.object({
  email: z.string()
    .min(1, "Roll number is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const carouselImages = [
  "/images/banner-1.jpg",
  "/images/banner-2.jpg",
  "/images/banner-3.jpg"
];

export default function Login() {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const newIndex = prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1;
        setNextImageIndex(newIndex === carouselImages.length - 1 ? 0 : newIndex + 1);
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const { mutate, isPending } = useLogin((result) => {
    if (result?.status === 200) {
      if (result.user_type === 'HOD') {
        toast.success("Login successful! Welcome back.");
        navigate("/");
      } else {
        clearAuthCookies().then(() => {
          toast.error("Access denied. Only department heads can login to this system.");
        });
      }
    } else {
      const errorMessage = typeof result?.data === 'string' ? result.data : 'Login failed';
      const errorCode = result?.code;

      switch (errorCode) {
        case 'missing_credentials':
          toast.error("Please enter both email and password.");
          break;
        case 'account_inactive':
          toast.error("Your account is not active. Please verify your email first.");
          break;
        case 'invalid_password':
          toast.error("Incorrect password. Please try again.");
          break;
        case 'user_not_found':
          toast.error("No account found with this email. Please sign up first.");
          break;
        case 'server_error':
          toast.error("An unexpected error occurred. Please try again later.");
          break;
        default:
          toast.error(errorMessage);
      }
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const emailData = {
        ...data,
        email: `${data.email}@rajalakshmi.edu.in`
      };
      
      mutate(emailData, {
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.detail || error?.message;
          const errorCode = error?.response?.data?.code;

          if (errorCode === 'network_error') {
            toast.error("Network error. Please check your internet connection.");
          } else {
            toast.error(errorMessage || "An error occurred during login. Please try again.");
          }
        }
      });
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen relative w-full">
      {/* Carousel Section */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-20">
        <Card className="w-full max-w-md shadow-lg bg-background/80 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center space-y-4">
            <img
              src="/images/rec_logo.png"
              alt="REC Hostel Logo"
              className="w-60 h-24 mx-auto object-contain"
            />
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Department Head Login</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access the university management system
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Roll Number</Label>
                <div className="flex items-center">
                  <Input
                    id="email"
                    type="text"
                    placeholder="Roll No"
                    className="h-11 rounded-r-none"
                    {...register("email")}
                  />
                  <div className="h-11 px-3 flex items-center bg-muted border border-l-0 rounded-r-md">
                    @rajalakshmi.edu.in
                  </div>
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">Password</Label>
                  <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-11"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full h-11 text-base" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
} 