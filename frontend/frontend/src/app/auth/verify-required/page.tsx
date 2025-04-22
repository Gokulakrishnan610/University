import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail } from "lucide-react";
import { useResendVerification } from "@/action/user";
import { useLogout } from "@/action/user";

export default function VerifyRequired() {
  const {mutate} = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [sentSuccess, setSentSuccess] = useState(false);

  const { mutate: resendVerification, isPending } = useResendVerification(() => {
    setSentSuccess(true);
    // Hide success message after 5 seconds
    setTimeout(() => setSentSuccess(false), 5000);
  });

  const handleResend = () => {
    if (email) {
      resendVerification({ email });
    }
  };

  const handleLogout = () => {
    mutate(undefined);
  };

  return (
    <div className="flex justify-center items-center h-full pt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification Required</CardTitle>
          <CardDescription className="text-center">
            Please verify your email to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <p className="text-muted-foreground">
              We've sent a verification email to <span className="font-semibold">{email}</span>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
          </div>

          {sentSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Verification email sent successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-3">
            <Button
              variant="default"
              onClick={handleResend}
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Resend Verification Email"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/auth/login")}
            >
              Back to Login
            </Button>
            
            <Button
              variant="link"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 