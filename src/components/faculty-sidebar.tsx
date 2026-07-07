"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  BookOpen, 
  Activity, 
  FileSpreadsheet, 
  TrendingUp, 
  Settings,
  Shield,
  X
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function FacultySidebar({
  activeTab,
  setActiveTab,
  isMobileOpen,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "questions", label: "Question Bank", icon: Database },
    { id: "assessments", label: "Assessments", icon: BookOpen },
    { id: "monitoring", label: "Live Monitoring", icon: Activity },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`no-print fixed top-0 bottom-0 left-0 z-45 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg border border-blue-500">
                <Shield className="w-4 h-4 text-slate-100" />
              </div>
              <div>
                <span className="font-sans font-black text-white tracking-tight text-xs uppercase leading-none block">
                  ExamCoder
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none block mt-0.5">
                  Faculty Control Room
                </span>
              </div>
            </div>
            {/* Close mobile button */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white focus-ring"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 font-sans text-xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full px-3 py-2.5 rounded-md font-bold transition-all flex items-center gap-3 ${
                    isActive 
                      ? "bg-slate-800 text-white shadow-2xs border-l-2 border-l-blue-500 rounded-l-none" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>



      </aside>
    </>
  );
}
