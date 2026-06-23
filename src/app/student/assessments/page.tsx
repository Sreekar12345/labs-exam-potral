"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAssessments, loadStudentProfile, loadExamSessions, getAssessmentStatus } from "@/lib/storage";
import { 
  ArrowLeft, 
  ArrowRight,
  Search, 
  Clock, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  ShieldCheck, 
  Laptop,
  AlertCircle
} from "lucide-react";
import EmptyState from "@/components/empty-state";

interface MockExam {
  id: string;
  name: string;
  subject: string;
  duration: number;
  questionsCount: number;
  assignedDate: string;
  status: "Active" | "Upcoming" | "Completed" | "Expired";
  scheduledTime?: string;
  score?: string;
  completionDate?: string;
  marks: number;
}

function isSameDate(scheduledDateStr: string): boolean {
  if (!scheduledDateStr) return false;
  
  const now = new Date();
  const cleanStr = scheduledDateStr.trim().toLowerCase();
  
  // Check if ISO format YYYY-MM-DDTHH:mm
  if (cleanStr.includes("t")) {
    const parsedDate = new Date(scheduledDateStr);
    if (!isNaN(parsedDate.getTime())) {
      return now.getTime() >= parsedDate.getTime();
    }
  }

  // Handle DD/MM/YYYY format which may include time like "22/06/2026 10:A.M"
  if (cleanStr.includes("/")) {
    const parts = cleanStr.split(/\s+/);
    const dateParts = parts[0].split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      
      let hours = 0;
      let minutes = 0;
      
      if (parts[1]) {
        const timeStr = parts.slice(1).join(" ");
        const isPM = timeStr.includes("p.m") || timeStr.includes("pm") || timeStr.includes("p");
        const isAM = timeStr.includes("a.m") || timeStr.includes("am") || timeStr.includes("a");
        const timeMatch = timeStr.match(/(\d+)(?::(\d+))?/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          if (timeMatch[2]) {
            minutes = parseInt(timeMatch[2], 10);
          }
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
        }
      }
      
      const parsedDate = new Date(year, month, day, hours, minutes, 0, 0);
      if (!isNaN(parsedDate.getTime())) {
        return now.getTime() >= parsedDate.getTime();
      }
    }
  }

  // Fallback to standard JS Date parsing
  const cleanStandard = scheduledDateStr
    .replace(/a\.m\./gi, "AM")
    .replace(/p\.m\./gi, "PM")
    .replace(/a\.m/gi, "AM")
    .replace(/p\.m/gi, "PM");
  const parsedDate = new Date(cleanStandard);
  if (!isNaN(parsedDate.getTime())) {
    return now.getTime() >= parsedDate.getTime();
  }

  return false;
}

export default function StudentAssessmentsList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "upcoming" | "completed">("all");
  const [exams, setExams] = useState<MockExam[]>([]);

  useEffect(() => {
    const studentProfile = loadStudentProfile();
    const studentRoll = studentProfile.roll || "DEMO_STUDENT";
    const sessions = loadExamSessions();
    const storageAssessments = loadAssessments();
    const mapped: MockExam[] = storageAssessments.map(a => {
      const status = getAssessmentStatus(a, studentRoll, sessions);
      const hasSessionSubmitted = sessions.some(
        s => s.studentRoll === studentRoll && s.assessmentId === a.id && s.submittedAt !== null
      );
      
      let finalStatus: "Active" | "Upcoming" | "Completed" | "Expired" = status;
      if (status === "Completed" && !hasSessionSubmitted) {
        finalStatus = "Expired";
      }
      
      return {
        id: a.id,
        name: a.name,
        subject: a.subject,
        duration: a.duration,
        questionsCount: a.questionsCount,
        assignedDate: a.createdDate,
        status: finalStatus,
        scheduledTime: finalStatus === "Upcoming" ? a.date : undefined,
        completionDate: finalStatus === "Completed" ? (() => {
          const sub = sessions.find(s => s.studentRoll === studentRoll && s.assessmentId === a.id)?.submittedAt;
          if (sub) {
            const dateObj = new Date(sub);
            if (!isNaN(dateObj.getTime())) {
              const day = dateObj.getDate();
              const month = dateObj.getMonth() + 1;
              const year = dateObj.getFullYear();
              let hours = dateObj.getHours();
              const minutes = String(dateObj.getMinutes()).padStart(2, "0");
              const seconds = String(dateObj.getSeconds()).padStart(2, "0");
              const ampm = hours >= 12 ? "pm" : "am";
              hours = hours % 12;
              hours = hours ? hours : 12;
              return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
            }
          }
          return a.date;
        })() : undefined,
        marks: a.questionsCount * 15
      };
    });
    setExams(mapped);
  }, []);

  // Filtering assessments
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && exam.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/student/dashboard" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Your Assessments Repository</h2>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-500 font-bold uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Secure Network Sandbox Enabled
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
        

        {/* Tab Filters and Search Bar row */}
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assessments by name or subject code (e.g. CS201)..."
                className="w-full text-slate-900 border border-slate-250 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 self-start shrink-0">
              {[
                { id: "all", label: "All Items" },
                { id: "active", label: "Active" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${
                    activeTab === tab.id 
                      ? "bg-white text-slate-950 shadow-2xs" 
                      : "text-slate-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Card Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map(exam => (
              <div 
                key={exam.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all hover:border-navy-200"
              >
                {/* Top header within card */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold font-mono text-[9px] uppercase">
                      {exam.subject} • {exam.marks} Marks
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      exam.status === "Active" ? "bg-emerald-50 border border-emerald-250 text-emerald-800" :
                      exam.status === "Upcoming" ? "bg-blue-50 border border-blue-250 text-blue-800" :
                      exam.status === "Completed" ? "bg-purple-50 border border-purple-250 text-purple-800" :
                      "bg-rose-50 border border-rose-250 text-rose-800"
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-xs tracking-tight">{exam.name}</h3>
                </div>

                {/* Mid details stats */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-150 font-sans text-[10px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-semibold">Questions Count:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {exam.questionsCount} items
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-semibold">Assessment Duration:</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {exam.duration} mins
                    </p>
                  </div>
                  <div className="col-span-2 space-y-0.5 pt-1.5 border-t border-slate-200/50">
                    <span className="text-slate-400 font-semibold">
                      {exam.status === "Completed" ? "Completed Date:" : exam.status === "Upcoming" ? "Scheduled Time:" : "Assigned Date:"}
                    </span>
                    <p className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> 
                      {exam.status === "Completed" ? exam.completionDate : exam.status === "Upcoming" ? exam.scheduledTime : exam.assignedDate}
                    </p>
                  </div>
                </div>

                {/* Dynamic Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-between">
                  {exam.status === "Completed" ? (
                    <>
                      <span className="text-emerald-700 font-bold font-mono">Graded: {exam.score}</span>
                      <button 
                        onClick={() => alert(`Simulation: Fetching submission scorecard dashboard for ${exam.name}.`)}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded"
                      >
                        View Submission Feedback
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => router.push(`/student/assessments/${exam.id}`)}
                        className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded font-bold"
                      >
                        View Details
                      </button>
                      
                      {exam.status === "Active" ? (
                        <button 
                          onClick={() => router.push(`/student/assessments/${exam.id}`)}
                          className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-1.5 rounded-md flex items-center gap-1.5 transition-all focus-ring"
                        >
                          Start Assessment <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400 font-semibold italic text-[10px]">Portal launches on scheduled time</span>
                      )}
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <EmptyState
              title="No Assessments Matched"
              description="We couldn't find any examinations matching your search keyword or active tab category."
              secondaryDescription="Clear search characters or switch tabs."
              icon={AlertCircle}
              actionLabel="Reset Search Filters"
              onAction={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
            />
          </div>
        )}

      </main>

    </div>
  );
}
