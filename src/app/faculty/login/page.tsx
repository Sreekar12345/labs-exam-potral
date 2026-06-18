"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle, FilePlus, Eye as ViewIcon, FileSpreadsheet } from "lucide-react";
import AuthLayout from "@/components/auth-layout";
import { loadFacultyProfile, saveFacultyProfile } from "@/lib/storage";

export default function FacultyLogin() {
  const router = useRouter();
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ emailOrId?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!emailOrId.trim()) {
      newErrors.emailOrId = "Faculty ID or official email is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/faculty/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrId, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        saveFacultyProfile(data.profile);
        localStorage.setItem("examcoder_auth_token", data.token);
        router.push("/faculty/dashboard");
      } else {
        setIsLoading(false);
        setErrors({ general: data.message || "Invalid academic credentials." });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ general: "Failed to connect to the authentication server." });
    }
  };

  return (
    <AuthLayout
      role="Faculty"
      title="Faculty Evaluation Portal"
      subtitle="Authorized evaluators and coordinators can authenticate to configure and monitor academic labs."
    >
      <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">

        {/* General Error Banner */}
        {errors.general && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md flex gap-2 items-start" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Access Denied</p>
              <p className="text-[11px] mt-0.5">{errors.general}</p>
            </div>
          </div>
        )}


        {/* Faculty ID / Email Input */}
        <div className="space-y-1">
          <label htmlFor="emailOrId" className="block font-bold text-slate-700">
            Faculty ID or Official Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="emailOrId"
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              placeholder="e.g. prof.sharma@college.edu or FAC_102"
              className={`w-full text-slate-900 border ${
                errors.emailOrId ? "border-rose-500" : "border-slate-200"
              } rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
            />
          </div>
          {errors.emailOrId && <p className="text-rose-600 text-[10px] mt-0.5 font-semibold">{errors.emailOrId}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password font-bold" className="block font-bold text-slate-700">
              Password *
            </label>
            <button
              type="button"
              onClick={() => alert("Simulation: Forgot password. Please contact the Head of the Department (HOD) or the system administrator to retrieve your credentials.")}
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
                errors.password ? "border-rose-500" : "border-slate-200"
              } rounded-md pl-9 pr-10 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-rose-600 text-[10px] mt-0.5 font-semibold">{errors.password}</p>}
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-55 flex items-center justify-center gap-1.5 focus-ring text-xs mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Authenticating Credentials...
            </>
          ) : (
            "Authenticate & Open Control Room"
          )}
        </button>

        {/* Back to Landing page / Register link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Need a Faculty account?</span>
          <Link 
            href="/faculty/register" 
            className="text-navy-900 font-bold hover:underline"
          >
            Create Account
          </Link>
        </div>

        {/* Faculty Scopes Description Box */}
        <div className="pt-4 mt-2 border-t border-slate-100 space-y-2.5">
          <p className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Authorized Faculty Capabilities:</p>
          <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-600">
            <div className="flex items-start gap-2">
              <FilePlus className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Create programming lab examinations and write invisible test grading cases.</span>
            </div>
            <div className="flex items-start gap-2">
              <ViewIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Monitor live student proctor logs, warning alerts, and compile behaviors.</span>
            </div>
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Export outcome-based reports mapped against NAAC criteria guidelines.</span>
            </div>
          </div>
        </div>

      </form>
    </AuthLayout>
  );
}
