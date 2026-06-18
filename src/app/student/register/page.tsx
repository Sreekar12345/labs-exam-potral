"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User, Mail, Phone, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/auth-layout";
import { saveStudentProfile } from "@/lib/storage";

export default function StudentRegister() {
  const router = useRouter();
  
  // Registration form fields
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    email: "",
    mobile: "",
    collegeName: "PSG College of Technology",
    department: "CSE",
    yearOfStudy: "3",
    section: "A",
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
    
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    } else if (formData.rollNumber.length < 5) {
      newErrors.rollNumber = "Roll number must be at least 5 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!formData.mobile.replace(/\D/g, "").match(/^\d{10}$/)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    // Academic Info
    if (!formData.collegeName.trim()) newErrors.collegeName = "College name is required";
    if (!formData.section.trim()) newErrors.section = "Section is required";

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
      newErrors.agreeTerms = "You must accept the terms to continue";
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
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        saveStudentProfile(data.profile);
        localStorage.setItem("examcoder_auth_token", data.token);
        router.push("/student/dashboard");
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
      role="Student"
      title="Create Candidate Account"
      subtitle="Register your academic credentials to allocate a seat in the secure compiler network."
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

            {/* Roll Number */}
            <div className="space-y-1">
              <label htmlFor="rollNumber" className="block font-bold text-slate-700">Roll Number *</label>
              <input
                type="text"
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. 22CSE104"
                className={`w-full text-slate-900 border ${errors.rollNumber ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
              />
              {errors.rollNumber && <p className="text-rose-600 text-[10px]">{errors.rollNumber}</p>}
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
                  placeholder="e.g. roll@college.edu"
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

        {/* 2. ACADEMIC INFORMATION SECTION */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            2. Academic Credentials
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

          <div className="grid grid-cols-3 gap-3">
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

            {/* Year of Study */}
            <div className="space-y-1">
              <label htmlFor="yearOfStudy" className="block font-bold text-slate-700">Year</label>
              <select
                id="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className="w-full text-slate-900 border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1">
              <label htmlFor="section" className="block font-bold text-slate-700">Section *</label>
              <input
                type="text"
                id="section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                placeholder="e.g. A"
                className={`w-full text-slate-900 border ${errors.section ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
              />
              {errors.section && <p className="text-rose-600 text-[10px]">{errors.section}</p>}
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
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-650"
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
              I agree that all code compilations written in this platform are mine alone. I consent to fullscreen proctor guidelines and local clipboard restrictions. *
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
              Allocating Roster Seat...
            </>
          ) : (
            "Create Account & Access Dashboard"
          )}
        </button>

        {/* Back to Login link */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Already registered?</span>
          <Link 
            href="/student/login" 
            className="text-navy-900 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
}
