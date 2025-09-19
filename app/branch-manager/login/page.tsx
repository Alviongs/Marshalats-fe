"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Building2, Lock, Mail } from "lucide-react"
import { ReCaptchaWrapper, useReCaptcha, ReCaptchaComponent } from "@/components/recaptcha"

// Create a separate component for the branch manager login form content
function BranchManagerLoginFormContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const { getToken, resetRecaptcha, isEnabled } = useReCaptcha()

  // Redirect to dashboard if already logged in as branch manager
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const branchManagerData = localStorage.getItem("branch_manager");
      const tokenExpiration = localStorage.getItem("token_expiration");

      if (token && branchManagerData && tokenExpiration) {
        const expirationTime = parseInt(tokenExpiration);
        if (Date.now() < expirationTime) {
          router.replace("/branch-manager-dashboard");
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

      // For now, use test credentials
      // Test credentials: email: manager@branch.com, password: manager123
      if (email === "manager@branch.com" && password === "manager123") {
        // Simulate successful login with test data
        const testBranchManagerData = {
          id: "bm_001",
          full_name: "Branch Manager",
          email: "manager@branch.com",
          phone: "+1234567890",
          role: "branch_manager",
          branch_id: "branch_001",
          branch_name: "Main Branch"
        };

        const testToken = "test_branch_manager_token_" + Date.now();
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        // Store authentication data
        localStorage.setItem("access_token", testToken);
        localStorage.setItem("token", testToken); // Backward compatibility
        localStorage.setItem("token_type", "bearer");
        localStorage.setItem("expires_in", "86400");
        localStorage.setItem("token_expiration", expirationTime.toString());
        localStorage.setItem("branch_manager", JSON.stringify(testBranchManagerData));
        localStorage.setItem("user", JSON.stringify(testBranchManagerData)); // For compatibility

        console.log("Branch Manager login successful:", {
          manager_id: testBranchManagerData.id,
          full_name: testBranchManagerData.full_name,
          email: testBranchManagerData.email,
          branch_id: testBranchManagerData.branch_id,
          role: "branch_manager"
        });
        
        // Redirect to branch manager dashboard
        router.push("/branch-manager-dashboard");
      } else {
        setError("Invalid credentials. Use test credentials: manager@branch.com / manager123");
      }
    } catch (err) {
      console.error("Branch Manager login error:", err);
      setError("An error occurred during login. Please try again.");
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center text-white space-y-6 p-8">
         
          <h1 className="text-4xl font-bold">Branch Manager Portal</h1>
          <p className="text-xl text-blue-100">
            Manage your branch operations and oversee local activities
          </p>
          <div className="space-y-2 text-blue-200">
            <p>• Branch-specific management</p>
            <p>• Local staff oversight</p>
            <p>• Operational control</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white mt-[100px]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Branch Manager</h1>
            </div>
            <div>
              
              <p className="text-gray-500 text-sm">Access branch management dashboard</p>
            </div>
          </div>

          {/* Test Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2 text-sm">Test Credentials</h3>
            <div className="space-y-1 text-xs text-blue-700">
              <p><strong>Email:</strong> manager@branch.com</p>
              <p><strong>Password:</strong> manager123</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* reCAPTCHA */}
            <ReCaptchaComponent />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="w-4 h-4"
                />
                <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link 
                href="/branch-manager/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              href="/login" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Student Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/coach/login" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Coach Login
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/superadmin/login" 
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Admin Login
            </Link>
          </div>

          {/* Back to Main Site */}
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to main website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BranchManagerLoginPage() {
  return (
    <ReCaptchaWrapper>
      <BranchManagerLoginFormContent />
    </ReCaptchaWrapper>
  )
}
