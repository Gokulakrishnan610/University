import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRequestPasswordReset, useVerifyOtp } from "@/action/authentication";
import { toast } from "sonner";

// Define the forgot password schemas with Zod
const requestResetSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const otpVerificationSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    otp: z.string().min(4, "Verification code must be at least 4 characters")
});

type RequestResetFormValues = z.infer<typeof requestResetSchema>;
type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;

const carouselImages = [
    "/images/banner-1.jpg",
    "/images/banner-2.jpg",
    "/images/banner-3.jpg"
];

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    
    // Carousel image rotation
    useState(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);
        return () => clearInterval(timer);
    });

    // Setup request password reset mutation
    const { mutate: requestReset, isPending: isRequestingReset } = useRequestPasswordReset(() => {
        toast.success("Verification code sent to your email");
        setIsOtpMode(true);
    });

    // Setup verify OTP mutation
    const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp(() => {
        toast.success("Password reset successful!");
        // Redirect to login after successful reset
        setTimeout(() => navigate('/auth/login'), 1500);
    });

    // Form for requesting password reset
    const requestForm = useForm<RequestResetFormValues>({
        resolver: zodResolver(requestResetSchema)
    });

    // Form for OTP verification
    const otpForm = useForm<OtpVerificationFormValues>({
        resolver: zodResolver(otpVerificationSchema),
        defaultValues: {
            email: userEmail,
            otp: ""
        }
    });

    // Handle request password reset
    const onRequestReset = (data: RequestResetFormValues) => {
        setUserEmail(data.email);
        
        requestReset({
            email: data.email,
            password: data.password
        });
    };

    // Handle OTP verification
    const onVerifyOtp = (data: OtpVerificationFormValues) => {
        verifyOtp({
            email: data.email,
            token: data.otp
        });
    };

    // Go back to request form
    const goBack = () => {
        setIsOtpMode(false);
        requestForm.reset();
    };

    return (
        <div className="flex h-screen relative w-full">
            {/* Carousel Background */}
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

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-20">
                <Card className="w-full max-w-md shadow-lg bg-background/80 backdrop-blur-sm border-border/50">
                    <CardHeader className="text-center space-y-4">
                        <img
                            src="/images/rec_logo.png"
                            alt="REC Logo"
                            className="w-60 h-24 mx-auto object-contain"
                        />
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
                            <CardDescription className="text-base">
                                {isOtpMode
                                    ? "Enter the verification code sent to your email"
                                    : "Enter your email and new password to reset your account"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    {!isOtpMode ? (
                        <form onSubmit={requestForm.handleSubmit(onRequestReset)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@rajalakshmi.edu.in"
                                        {...requestForm.register("email")}
                                    />
                                    {requestForm.formState.errors.email && (
                                        <p className="text-sm text-destructive mt-1">
                                            {requestForm.formState.errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="Enter your new password"
                                        {...requestForm.register("password")}
                                    />
                                    {requestForm.formState.errors.password && (
                                        <p className="text-sm text-destructive mt-1">
                                            {requestForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 py-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isRequestingReset}
                                >
                                    {isRequestingReset ? "Sending Request..." : "Reset Password"}
                                </Button>
                                <div className="text-center text-sm">
                                    <Link to="/auth/login" className="text-primary hover:underline">
                                        Back to Login
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <form onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        readOnly
                                        value={userEmail}
                                        className="bg-muted"
                                        {...otpForm.register("email")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Verification Code</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter the code from your email"
                                        autoFocus
                                        {...otpForm.register("otp")}
                                    />
                                    {otpForm.formState.errors.otp && (
                                        <p className="text-sm text-destructive mt-1">
                                            {otpForm.formState.errors.otp.message}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Check your email for the verification code sent to {userEmail}
                                </p>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 py-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isVerifyingOtp}
                                >
                                    {isVerifyingOtp ? "Verifying..." : "Verify & Reset Password"}
                                </Button>
                                <div className="flex justify-between w-full text-sm">
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto"
                                        onClick={goBack}
                                    >
                                        Try another email
                                    </Button>
                                    <Link to="/auth/login" className="text-primary hover:underline">
                                        Back to Login
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
} 