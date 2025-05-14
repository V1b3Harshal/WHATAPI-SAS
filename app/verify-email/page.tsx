"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";


interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
}

const OTPInput = ({ length = 6, onChange }: OTPInputProps) => {
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(0, 1);
    setOtpValues(newOtpValues);
    onChange(newOtpValues.join(""));

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {otpValues.map((val, index) => (
        <Input
          key={index}
          type="text"
          value={val}
          maxLength={1}
          onChange={(e) => handleChange(e.target.value, index)}
          className="w-12 text-center"
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
};

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(!!token);
  const [resendMessage, setResendMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState("");

  // Redirect immediately if the email parameter is missing
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  // Verify via token if provided in URL
  const verifyToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage("Email verified successfully! You can now login.");
      setVerified(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message || "Verification failed");
      } else {
        setMessage("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Poll the verification status if using link-based verification and not yet verified
  const checkVerificationStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (data.message && data.message.toLowerCase().includes("successfully")) {
        setVerified(true);
        setMessage("Email verified successfully! You can now login.");
      }
    } catch (error: unknown) {
      // It's acceptable for polling to quietly fail until resolved
    }
  }, [token]);

  // Automatically verify if token exists
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token, verifyToken]);

  // Poll every 5 seconds if not yet verified (when token exists)
  useEffect(() => {
    if (verified || !token) return;
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [token, verified, checkVerificationStatus]);

  // Handle verification via OTP
  const handleOTPVerification = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setMessage("Email verified successfully via OTP! You can now login.");
      setVerified(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message || "OTP verification failed");
      } else {
        setMessage("OTP verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle resending the verification email/OTP
  const handleResend = async () => {
    setResendMessage("");
    setResendLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setResendMessage("Verification email resent. Check your inbox!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setResendMessage(error.message || "Failed to resend email");
      } else {
        setResendMessage("Failed to resend email");
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Redirect to login after successful verification
  useEffect(() => {
    if (verified) {
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [verified, router]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border border-border/50 bg-background/80 backdrop-blur-lg">
          {/* Glassmorphism effect elements */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-600/20 blur-xl" />
          
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              <div className="flex items-center justify-center gap-2">
                <NextImage src="/logo2.svg" alt="Connect API Logo" width={40} height={40} />
                <span className="gradient-text">Verify Your Email</span>
              </div>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please verify your email to complete your registration.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying email...
              </div>
            ) : (
              <>
                {message && (
                  <Alert
                    variant={message.toLowerCase().includes("success") ? "default" : "destructive"}
                  >
                    <MailCheck className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                {!message && (
                  <p className="text-center text-muted-foreground">
                    We've sent a verification link and OTP to {email}
                  </p>
                )}
                
                {/* Resend Verification Email Button */}
                <Button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
                
                {/* OTP Verification Section */}
                {!verified && (
                  <div className="mt-4 space-y-2">
                    <p className="text-center text-muted-foreground">Or verify using OTP:</p>
                    <OTPInput length={6} onChange={setOtp} />
                    <Button
                      onClick={handleOTPVerification}
                      className="w-full mt-2"
                    >
                      Verify OTP
                    </Button>
                  </div>
                )}
                
                {resendMessage && (
                  <p className={`text-center ${
                    resendMessage.toLowerCase().includes("failed") 
                      ? "text-destructive" 
                      : "text-green-500"
                  }`}>
                    {resendMessage}
                  </p>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Return to{" "}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ConnectAPI. All rights reserved.
      </div>
    </div>
  );
};

export default VerifyEmail;