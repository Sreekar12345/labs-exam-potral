"use client";

import React, { useState, useEffect } from "react";
import { Shield, Menu, X, GraduationCap, ChevronDown, Users } from "lucide-react";

interface NavigationProps {
  onRequestDemo: () => void;
}

export default function Navigation({ onRequestDemo }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsLoginDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Monitor scroll for visual sticky treatment
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Institutional Challenges", href: "#challenges" },
    { name: "Workflow", href: "#workflow" },
    { name: "Features", href: "#features" },
    { name: "Student Experience", href: "#experience" },
    { name: "Reports & Analytics", href: "#analytics" }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xs border-b border-slate-200/80 shadow-xs" 
          : "bg-white border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-2 rounded-lg border border-slate-800">
              <Shield className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <span className="font-sans font-black text-slate-900 tracking-tight text-base uppercase leading-none block">
                ExamCoder
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none block mt-0.5">
                Academic Secure Sandbox
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-slate-600 hover:text-slate-900 font-sans text-xs font-bold transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="#faq"
              className="text-slate-500 hover:text-slate-800 font-sans text-xs font-bold"
            >
              FAQ
            </a>
            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* Sign In Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLoginDropdownOpen(!isLoginDropdownOpen);
                }}
                className="text-slate-700 hover:text-slate-900 font-sans text-xs font-bold px-3 py-2 rounded-md hover:bg-slate-50 transition-all flex items-center gap-1.5 focus-ring"
              >
                Sign In <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 font-sans animate-in fade-in duration-100">
                  <a 
                    href="/student/login"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-955 font-bold transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-slate-500" /> Student Portal
                  </a>
                  <a 
                    href="/faculty/login"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-955 font-bold transition-colors"
                  >
                    <Users className="w-4 h-4 text-slate-500" /> Faculty Portal
                  </a>
                  <div className="h-[1px] bg-slate-150/60 my-1.5"></div>
                  <a 
                    href="/admin/login"
                    className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-850 font-semibold transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" /> Admin Console
                  </a>
                </div>
              )}
            </div>


          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-slate-850 p-2 rounded-md focus-ring"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-2 pb-4 space-y-3 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50 font-sans text-xs font-bold"
            >
              {link.name}
            </a>
          ))}
          <div className="h-[1px] bg-slate-100 my-1"></div>
          
          {/* Mobile Login Portal Section */}
          <div className="px-3 py-1 space-y-2.5">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Secure Portal Login</span>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="/student/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-md text-center flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-slate-500" /> Student
              </a>
              <a 
                href="/faculty/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-md text-center flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4 text-slate-500" /> Faculty
              </a>
            </div>
            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
              <div className="flex justify-between items-center gap-2">
                <a 
                  href="/student/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-navy-900 font-bold hover:underline"
                >
                  Create Student Account
                </a>
                <a 
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-500 font-semibold hover:underline"
                >
                  Admin Gate
                </a>
              </div>
              <a 
                href="/faculty/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-navy-900 font-bold hover:underline self-start"
              >
                Create Faculty Account
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 px-3">
            <a 
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-500 hover:text-slate-800 font-sans text-xs font-bold"
            >
              FAQ
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
