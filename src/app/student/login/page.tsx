"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, AlertCircle, ShieldAlert } from "lucide-react";
import AuthLayout from "@/components/auth-layout";
import { loadStudents, saveStudentProfile } from "@/lib/storage";

export default function StudentLogin() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ rollNumber?: string; password?: string; general?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    } else if (rollNumber.length < 5) {
      newErrors.rollNumber = "Please enter a valid roll number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        saveStudentProfile(data.profile);
        localStorage.setItem("examcoder_auth_token", data.token);
        router.push("/student/dashboard");
      } else {
        setIsLoading(false);
        setErrors({ general: data.message || "Invalid academic credentials." });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ general: "Failed to connect to the authentication server. If you are using the deployed link, this could be due to a database cold start. Please wait 10-15 seconds and try again." });
    }
  };

  return (
    <AuthLayout
      role="Student"
      title="Access Exam Workspace"
      subtitle="Enter your departmental roll number and password to log in to the active examination slot."
    >
      <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
        
        {/* General Error Alert */}
        {errors.general && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md flex gap-2 items-start" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Login Failed</p>
              <p className="text-[11px] mt-0.5">{errors.general}</p>
            </div>
          </div>
        )}


        {/* Roll Number Input */}
        <div className="space-y-1">
          <label htmlFor="rollNumber" className="block font-bold text-slate-700">
            Roll Number *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 22CSE104"
              className={`w-full text-slate-900 border ${
                errors.rollNumber ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-navy-900 focus:ring-navy-900"
              } rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1`}
              aria-invalid={!!errors.rollNumber}
              aria-describedby={errors.rollNumber ? "rollNumber-error" : undefined}
            />
          </div>
          {errors.rollNumber && (
            <p id="rollNumber-error" className="text-rose-600 text-[10px] mt-0.5 font-semibold">
              {errors.rollNumber}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block font-bold text-slate-700">
              Password *
            </label>
            <button
              type="button"
              onClick={() => alert("Simulation: Forgot password link. Please consult your departmental lab administrator to reset your exam password.")}
              className="text-slate-500 hover:text-slate-800 hover:underline text-[10px] font-bold"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full text-slate-900 border ${
                errors.password ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:border-navy-900 focus:ring-navy-900"
              } rounded-md pl-9 pr-10 py-2 focus:outline-hidden focus:ring-1`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-rose-600 text-[10px] mt-0.5 font-semibold">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me & Session warnings */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5"
            />
            <label htmlFor="rememberMe" className="text-[10px] text-slate-600 font-medium select-none">
              Remember active terminal
            </label>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Session: 3 hrs limit
          </span>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-55 flex items-center justify-center gap-1.5 focus-ring text-xs mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Verifying Roster Ranks...
            </>
          ) : (
            "Acknowledge & Start Session"
          )}
        </button>

        {/* Create Account section */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">New Student to ExamCoder?</span>
          <Link 
            href="/student/register" 
            className="border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold px-3 py-1.5 rounded-md transition-all"
          >
            Create Account
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
}
