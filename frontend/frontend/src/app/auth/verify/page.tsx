import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "@/action/user";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const verifyEmail = useVerifyEmail();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("error");
        setErrorMessage("No verification token provided.");
        return;
      }

      try {
        const { data } = verifyEmail(token);
        // Wait for the verification to complete
        setTimeout(() => {
          setStatus("success");
        }, 1000);
      } catch (error) {
        setStatus("error");
        setErrorMessage("Invalid or expired verification token.");
      }
    }

    verifyToken();
  }, [token]);

  const handleResendVerification = () => {
    if (email) {
      resendVerification({ email });
    }
  };

  return (
    <div className="flex justify-center items-center h-full pt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Verifying your email address...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Email Verified Successfully!</h3>
                <p className="text-muted-foreground">
                  Your email has been verified. You can now log in to your account.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage || "Verification failed"}</AlertDescription>
              </Alert>
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <p className="text-center text-muted-foreground">
                  {email ? 
                    `We couldn't verify the email address ${email}.` : 
                    "We couldn't verify your email address."
                  }
                </p>
                {email && (
                  <Button 
                    variant="outline" 
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="mt-2"
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate("/auth/login")}
            disabled={status === "loading"}
            className={status === "loading" ? "opacity-0" : ""}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 