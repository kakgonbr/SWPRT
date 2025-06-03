
"use client";

import { AuthForm } from "@/components/auth/auth-form";
// import MainLayout from "@/components/layout/main-layout"; // Removed
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      // Check for redirect query parameter
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, loading, router]);


  const handleLogin = async (values: any) => {
    const success = await login(values.email, values.password);
    if (success) {
      toast({ title: "Login Successful", description: "Welcome back!" });
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      return true;
    } else {
      // AuthForm will display this error
      return "Invalid email or password. Please try again.";
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast({ title: "Login Successful", description: "Welcome via Google!" });
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      return true;
    } else {
      // AuthForm will display this error
      return "Google login failed. Please try again.";
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
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        onGoogleLogin={handleGoogleLogin}
      />
  );
}
