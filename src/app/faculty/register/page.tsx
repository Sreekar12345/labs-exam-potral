"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Phone, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/auth-layout";
import { saveFacultyProfile } from "@/lib/storage";

export default function FacultyRegister() {
  const router = useRouter();
  
  // Registration form fields
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    mobile: "",
    collegeName: "PSG College of Technology",
    department: "CSE",
    designation: "Assistant Professor",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UX states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Personal Info
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Faculty Employee ID is required";
    } else if (formData.employeeId.length < 4) {
      newErrors.employeeId = "Employee ID must be at least 4 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Official email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!formData.mobile.replace(/\D/g, "").match(/^\d{10}$/)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    // Academic Info
    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";

    // Account Info
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the institutional rules to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/faculty/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        saveFacultyProfile(data.profile);
        localStorage.setItem("examcoder_auth_token", data.token);
        router.push("/faculty/dashboard");
      } else {
        setIsLoading(false);
        setErrors({ general: data.message || "Registration failed." });
      }
    } catch (err) {
      setIsLoading(false);
      setErrors({ general: "Failed to connect to the authentication server." });
    }
  };

  return (
    <AuthLayout
      role="Faculty"
      title="Create Evaluator Account"
      subtitle="Register as an authorized faculty evaluator to configure sandboxes and proctor active examinations."
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        
        {/* Global Error Banner */}
        {errors.general && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-md flex gap-2 items-center" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{errors.general}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && !errors.agreeTerms && !errors.general && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-md flex gap-2 items-center" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Please correct the highlighted fields in the sections below.</span>
          </div>
        )}

        {/* 1. PERSONAL INFORMATION SECTION */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            1. Personal Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className={`w-full text-slate-900 border ${errors.fullName ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
              />
              {errors.fullName && <p className="text-rose-600 text-[10px]">{errors.fullName}</p>}
            </div>

            {/* Employee ID */}
            <div className="space-y-1">
              <label htmlFor="employeeId" className="block font-bold text-slate-700">Faculty Employee ID *</label>
              <input
                type="text"
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                placeholder="e.g. EMP1024"
                className={`w-full text-slate-900 border ${errors.employeeId ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
              />
              {errors.employeeId && <p className="text-rose-600 text-[10px]">{errors.employeeId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block font-bold text-slate-700">Official Email *</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. professor@college.edu"
                  className={`w-full text-slate-900 border ${errors.email ? "border-rose-500" : "border-slate-200"} rounded-md pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
                />
              </div>
              {errors.email && <p className="text-rose-600 text-[10px]">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label htmlFor="mobile" className="block font-bold text-slate-700">Contact Number *</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="tel"
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className={`w-full text-slate-900 border ${errors.mobile ? "border-rose-500" : "border-slate-200"} rounded-md pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
                />
              </div>
              {errors.mobile && <p className="text-rose-600 text-[10px]">{errors.mobile}</p>}
            </div>
          </div>
        </div>

        {/* 2. ACADEMIC CREDENTIALS SECTION */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. Institutional Credentials
          </h4>

          {/* College Name */}
          <div className="space-y-1">
            <label htmlFor="collegeName" className="block font-bold text-slate-700">Educational Institution *</label>
            <input
              type="text"
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              className={`w-full text-slate-900 border ${errors.collegeName ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
            />
            {errors.collegeName && <p className="text-rose-600 text-[10px]">{errors.collegeName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Department */}
            <div className="space-y-1">
              <label htmlFor="department" className="block font-bold text-slate-700">Department</label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-slate-900 border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            {/* Designation */}
            <div className="space-y-1">
              <label htmlFor="designation" className="block font-bold text-slate-700">Designation</label>
              <select
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full text-slate-900 border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
              >
                <option value="Dean">Dean Academics</option>
                <option value="HOD">Head of Department (HOD)</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lab Assistant">Lab Assistant</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. ACCOUNT SECURITY INFORMATION */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            3. Account Security
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password font-bold" className="block font-bold text-slate-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 chars"
                  className={`w-full text-slate-900 border ${errors.password ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 pr-8 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-600 text-[10px]">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block font-bold text-slate-700">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className={`w-full text-slate-900 border ${errors.confirmPassword ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 pr-8 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-655"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-rose-600 text-[10px]">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5"
            />
            <label htmlFor="agreeTerms" className="text-[10px] text-slate-500 leading-snug">
              I certify that I am an authorized faculty employee. I agree to comply with the institutional security policies and NAAC/NBA outcome recording guidelines. *
            </label>
          </div>
          {errors.agreeTerms && <p className="text-rose-600 text-[10px] font-semibold">{errors.agreeTerms}</p>}
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold py-2 px-4 rounded-md transition-all disabled:opacity-55 flex items-center justify-center gap-1.5 focus-ring text-xs mt-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Provisioning Evaluator Seat...
            </>
          ) : (
            "Create Account & Open Faculty Dashboard"
          )}
        </button>

        {/* Back to Login link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Already registered?</span>
          <Link 
            href="/faculty/login" 
            className="text-navy-900 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
}
