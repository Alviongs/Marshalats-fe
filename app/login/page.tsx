"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ReCaptchaWrapper, useReCaptcha, ReCaptchaComponent } from "@/components/recaptcha"

// Create a separate component for the login form content
function LoginFormContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { getToken, resetRecaptcha, isEnabled } = useReCaptcha()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === "student") {
            router.replace("/student-dashboard");
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      let recaptchaToken = null;
      
      // Check reCAPTCHA if enabled
      if (isEnabled) {
        recaptchaToken = getToken();
        if (!recaptchaToken) {
          setError("Please complete the CAPTCHA verification.");
          setLoading(false);
          return;
        }
      }

      const requestBody: any = { 
        email, 
        password,
        role: "student" // Specify role for student login
      };
      if (recaptchaToken) {
        requestBody.recaptchaToken = recaptchaToken;
      }

      console.log("Student login request:", {
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        body: { ...requestBody, password: "***hidden***" }
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      console.log("Student login response:", {
        status: res.status,
        ok: res.ok,
        data: data
      });
      
      if (!res.ok) {
        setError(data.message || `Login failed (${res.status})`);
        // Reset reCAPTCHA on error
        if (isEnabled) {
          resetRecaptcha();
        }
        setLoading(false);
        return;
      }

      // Validate response structure according to backend API specification
      if (!data.access_token || !data.user) {
        setError("Invalid response from server");
        if (isEnabled) {
          resetRecaptcha();
        }
        setLoading(false);
        return;
      }

      // Verify that the user is actually a student
      if (data.user?.role !== "student") {
        setError("Access denied. Student credentials required.");
        if (isEnabled) {
          resetRecaptcha();
        }
        setLoading(false);
        return;
      }

      // Store authentication data using unified token manager
      const { TokenManager } = await import("@/lib/tokenManager");
      const userData = TokenManager.storeAuthData({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        user: data.user
      });

      console.log("Student login successful:", {
        user_id: data.user.id,
        full_name: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        branch_id: data.user.branch_id,
        access_token: data.access_token.substring(0, 20) + "...",
        expires_in: data.expires_in
      });
      
      // Redirect to student dashboard
      console.log("Redirecting to student dashboard");
      router.push("/student-dashboard");
    } catch (err) {
      console.error("Student login error:", err);
      setError("An error occurred during login. Please check your connection and try again.");
      // Reset reCAPTCHA on error
      if (isEnabled) {
        resetRecaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/martial-artist.png')",
          }}
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-black">STUDENT LOGIN</h1>
            <p className="text-gray-500 text-sm">Access your martial arts training dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 py-4 text-base bg-gray-50 border-gray-200 rounded-xl h-14"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 py-4 text-base bg-gray-50 border-gray-200 rounded-xl h-14"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* reCAPTCHA */}
            <ReCaptchaComponent />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="w-5 h-5 border-2 border-gray-300 rounded-md"
                />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-xl text-lg h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login Now"
              )}
            </Button>
          </form>

          {/* Social Login */}
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="text-gray-700 font-semibold">Login</span>
              <span className="text-gray-500"> with Others</span>
            </div>

            <div className="flex space-x-4">
              {/* Google Login */}
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-3 py-4 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white rounded-xl transition-all duration-200 h-12"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </Button>

              {/* Facebook Login */}
              <Button
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-3 py-4 px-4 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white rounded-xl transition-all duration-200 h-12"
              >
                <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-sm font-bold">f</span>
                </div>
                <span className="text-sm font-medium">Facebook</span>
              </Button>
            </div>
          </div>

          {/* Login Type Selection */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-4">Different role? Choose your login type:</p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link 
                href="/coach/login" 
                className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
              >
                Coach Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/superadmin/login" 
                className="text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="font-medium text-gray-700 mb-2 text-sm">Debug Info</h3>
            <div className="space-y-1 text-xs text-gray-600 font-mono">
              <p><strong>API:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}/student/login</p>
              <p><strong>Expected Response:</strong> user + access_token</p>
              <p><strong>Role:</strong> student</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ReCaptchaWrapper>
      <LoginFormContent />
    </ReCaptchaWrapper>
  )
}
