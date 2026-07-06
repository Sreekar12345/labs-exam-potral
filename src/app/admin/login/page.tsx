"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertTriangle, ShieldCheck, Database, HardDrive } from "lucide-react";
import AuthLayout from "@/components/auth-layout";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Administrator email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address";
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
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("examcoder_auth_token", data.token);
        localStorage.setItem("examcoder_admin_profile", JSON.stringify(data.profile));
        router.push("/admin/dashboard");
      } else {
        setIsLoading(false);
        setErrors({ general: data.message || "Invalid administrator credentials." });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ general: "Failed to connect to the authentication server. If you are using the deployed link, this could be due to a database cold start. Please wait 10-15 seconds and try again." });
    }
  };

  return (
    <AuthLayout
      role="Administrator"
      title="System Admin Node"
      subtitle="Access core infrastructure parameters, configure database settings, and compile servers cluster."
    >
      <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">

        {/* Global Error Banner */}
        {errors.general && (
          <div className="bg-rose-950 border border-rose-800 text-rose-200 p-3 rounded-md flex gap-2 items-start" role="alert">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">System Override Denied</p>
              <p className="text-[10px] mt-0.5">{errors.general}</p>
            </div>
          </div>
        )}


        {/* Admin Email Input */}
        <div className="space-y-1">
          <label htmlFor="email" className="block font-bold text-slate-700">
            System Admin Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@examcoder.edu"
              className={`w-full text-slate-900 border ${
                errors.email ? "border-rose-500" : "border-slate-200"
              } rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
            />
          </div>
          {errors.email && <p className="text-rose-600 text-[10px] mt-0.5 font-semibold">{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password font-bold" className="block font-bold text-slate-700">
              Password *
            </label>
            <button
              type="button"
              onClick={() => alert("Simulation: Forgot admin password. Please contact the security network team or execute command line recovery tools on the local server hosting instance.")}
              className="text-slate-500 hover:text-slate-800 hover:underline text-[10px] font-bold"
            >
              Recover Key?
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
          className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-55 flex items-center justify-center gap-1.5 focus-ring text-xs mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Synchronizing Credentials...
            </>
          ) : (
            "Establish Admin Session"
          )}
        </button>

        {/* Admin Diagnostics Status Panel */}
        <div className="pt-4 mt-2 border-t border-slate-200 space-y-2 text-[10px] text-slate-500">
          <p className="font-bold text-slate-700 uppercase tracking-wider">Node System Diagnostics:</p>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>DB: </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block"></span> Connected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Storage: </span>
              <span className="text-slate-700 font-bold">14% used</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 text-slate-400 mt-1 border-t border-slate-200/60 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>System Integrity Hash Match [OK]</span>
            </div>
          </div>
        </div>

      </form>
    </AuthLayout>
  );
}
