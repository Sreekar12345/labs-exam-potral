"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAssessments, saveAssessments, getAssessmentStatus } from "@/lib/storage";
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  Users, 
  AlertTriangle, 
  Activity, 
  Play, 
  Eye, 
  ShieldAlert,
  Calendar
} from "lucide-react";

interface ActiveExam {
  id: string;
  name: string;
  subject: string;
  duration: number;
  totalCandidates: number;
  activeCandidates: number;
  violationsCount: number;
  timeRemaining: string;
  status: "Active" | "Scheduled" | "Completed";
  type: string;
}

export default function ActiveAssessmentsMonitoring() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock list of active/scheduled exams to monitor
  const [activeExams, setActiveExams] = useState<ActiveExam[]>([]);

  // Load active/scheduled exams on client-side mount
  useEffect(() => {
    const loaded = loadAssessments();
    const mapped: ActiveExam[] = loaded.map(asm => {
      let activeCandidates = 0;
      let violationsCount = 0;
      let timeRemaining = "Starts in 16 hours";
      
      const comp = getAssessmentStatus(asm, "", []);
      
      if (comp === "Active") {
        activeCandidates = Math.max(0, asm.assignedCount - 8);
        violationsCount = 3;
        timeRemaining = "01:24:15";
      } else if (comp === "Completed") {
        activeCandidates = 0;
        violationsCount = 8;
        timeRemaining = "Completed";
      }
      
      return {
        id: asm.id,
        name: asm.name,
        subject: asm.subject,
        duration: asm.duration,
        totalCandidates: asm.assignedCount,
        activeCandidates,
        violationsCount,
        timeRemaining,
        status: comp === "Active" ? "Active" : comp === "Completed" ? "Completed" : "Scheduled",
        type: "Lab Examination"
      };
    });
    setActiveExams(mapped);
  }, []);

  const handleForceStart = (id: string) => {
    const assessments = loadAssessments();
    const updatedAsms = assessments.map(a => a.id === id ? { ...a, status: "Active" as const } : a);
    saveAssessments(updatedAsms);

    setActiveExams(prev => prev.map(exam => {
      if (exam.id === id) {
        return {
          ...exam,
          status: "Active",
          activeCandidates: Math.max(0, exam.totalCandidates - 5),
          timeRemaining: "02:00:00"
        };
      }
      return exam;
    }));
    alert("Simulation: Examination manually forced active. Dispatched sandbox configuration keys.");
  };

  const filteredExams = activeExams.filter(exam => {
    return exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/dashboard" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Proctor Monitoring Center</h2>
        </div>

        <div className="flex items-center gap-2 font-mono font-bold text-[10px] text-slate-500 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Surveillance Feed Connected
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
        
        {/* Statistics Widgets */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] block">Active Exam Rooms</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {activeExams.filter(e => e.status === "Active").length} Live
            </span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] block">Monitored Terminals</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {activeExams.reduce((sum, e) => sum + e.activeCandidates, 0)} Active
            </span>
          </div>
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] block">Active Violations Flags</span>
            <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
              {activeExams.filter(e => e.status === "Active").reduce((sum, e) => sum + e.violationsCount, 0)} Alerts
            </span>
          </div>
          <div className="bg-slate-900 text-white p-4 border border-slate-950 rounded-lg shadow-2xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] block">Average Lab Attendance</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">94.8%</span>
          </div>
        </section>

        {/* Search filter */}
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active or scheduled examinations by name or subject code..."
              className="w-full text-slate-900 border border-slate-250 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
            />
          </div>
        </div>

        {/* Exams Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Ongoing & Scheduled Exams</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map(exam => (
              <div 
                key={exam.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all hover:border-navy-200"
              >
                
                {/* Header within card */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold font-mono text-[9px]">
                      {exam.subject} • {exam.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      exam.status === "Active" ? "bg-emerald-50 border border-emerald-250 text-emerald-800 animate-pulse" :
                      exam.status === "Scheduled" ? "bg-blue-50 border border-blue-250 text-blue-800" :
                      "bg-purple-50 border border-purple-250 text-purple-800"
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <h4 className="text-slate-950 font-extrabold text-xs tracking-tight">{exam.name}</h4>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 border border-slate-150 rounded text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">Active Candidates:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {exam.activeCandidates} / {exam.totalCandidates}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">Duration Limit:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {exam.duration} mins
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">Proctor Warnings:</span>
                    <p className={`font-bold flex items-center gap-1 font-mono ${
                      exam.violationsCount > 0 ? "text-rose-700" : "text-slate-700"
                    }`}>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> {exam.violationsCount} Alert flags
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 font-semibold">Timer Remaining:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {exam.timeRemaining}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {exam.status === "Active" ? (
                    <>
                      <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1"><Activity className="w-3.5 h-3.5 animate-spin" /> Live Telemetry Running</span>
                      <button 
                        onClick={() => router.push(`/faculty/monitoring/${exam.id}`)}
                        className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
                      >
                        <Eye className="w-3.5 h-3.5" /> Monitor Control Room
                      </button>
                    </>
                  ) : exam.status === "Scheduled" ? (
                    <>
                      <button 
                        onClick={() => handleForceStart(exam.id)}
                        className="text-navy-700 hover:text-navy-900 hover:bg-slate-100 px-3 py-1.5 rounded font-bold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" /> Force Activate Now
                      </button>
                      <span className="text-slate-400 font-medium italic">Scheduled launch time active</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-400 font-medium font-mono">Assessment Completed</span>
                      <button 
                        onClick={() => router.push(`/faculty/monitoring/${exam.id}`)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded text-[10px]"
                      >
                        View Surveillance Logs
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}
