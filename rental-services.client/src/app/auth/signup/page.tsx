
"use client";

import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { useEffect } from "react";

export default function SignupPage() {
  const { signup, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  const handleSignup = async (values: any) => {
    // Default role to 'renter' for this example
    const success = await signup(values.name, values.email, values.password, 'renter' as UserRole);
    if (success) {
      toast({ title: "Signup Successful", description: "Welcome to VroomVroom.vn!" });
      router.push("/");
      return true;
    } else {
      toast({
        title: "Signup Failed",
        description: "An account with this email may already exist or an error occurred.",
        variant: "destructive",
      });
      return "An account with this email may already exist.";
    }
  };

  if (loading || (!loading && isAuthenticated)) {
     return (
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
     );
  }

  return (
      <AuthForm mode="signup" onSubmit={handleSignup} />
  );
}
