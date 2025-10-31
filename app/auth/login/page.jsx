"use client"

import LoginForm from "@/components/auth/login-form"
import { Login } from "@/app/actions/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const [loginError, setLoginError] = useState(null);
  const router = useRouter();

  const handleLogin = async (data) => {
    try {
      setLoginError(null);
      const result = await Login({ userName: data.username, password: data.password });
      
      if (result.success) {
        console.log("Login successful:", result);
        // Redirect to dashboard after successful login
        router.push('/dashboard');
        router.refresh();
        return result;
      } else {
        // Set the error message from the server
        setLoginError(result.error);
        console.log("Login failed:", result.error);
        return result;
      }
    } catch (error) {
      // Set a generic error message for unexpected errors
      const errorMessage = "Invalid username or password";
      setLoginError(errorMessage);
      console.error("Login error:", error);
      
      // Return an error result
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleLogin} />
        {loginError && (
          <div className="mt-4 p-3 text-center text-sm text-red-500 bg-red-50 rounded-md">
            {loginError}
          </div>
        )}
      </div>
    </div>
  )
}