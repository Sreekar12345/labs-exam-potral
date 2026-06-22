"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAssessments, saveAssessments, getAssessmentStatus } from "@/lib/storage";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft,
  X,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play
} from "lucide-react";
import EmptyState from "@/components/empty-state";

interface Assessment {
  id: string;
  name: string;
  subject: string;
  duration: number; // in minutes
  questionsCount: number;
  assignedCount: number;
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Archived";
  createdDate: string;
  date: string;
}

export default function AssessmentsDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [emptyStateMode, setEmptyStateMode] = useState<"none" | "no-exams" | "no-questions" | "no-students">("none");

  // Roster state
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    setAssessments(loadAssessments());
  }, []);

  // Actions
  const handleDuplicate = (asm: Assessment) => {
    const cloned: Assessment = {
      ...asm,
      id: Date.now().toString(),
      name: `${asm.name} (Copy)`,
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0]
    };
    const updated = [cloned, ...assessments];
    setAssessments(updated);
    saveAssessments(updated);
    alert(`Simulation: Duplicated assessment "${asm.name}" into a Draft copy.`);
  };

  const handlePublish = (id: string) => {
    const updated = assessments.map(a => a.id === id ? { ...a, status: "Scheduled" as const } : a);
    setAssessments(updated);
    saveAssessments(updated);
    alert("Simulation: Assessment status updated to Scheduled.");
  };

  const handleDelete = (id: string) => {
    const updated = assessments.filter(a => a.id !== id);
    setAssessments(updated);
    saveAssessments(updated);
  };

  // Filter application
  const filteredAssessments = assessments.map(a => {
    const comp = getAssessmentStatus(a, "", []);
    let displayStatus = a.status;
    if (a.status !== "Draft" && a.status !== "Archived") {
      if (comp === "Active") {
        displayStatus = "Active";
      } else if (comp === "Completed") {
        displayStatus = "Completed";
      } else {
        displayStatus = "Scheduled";
      }
    }
    return {
      ...a,
      status: displayStatus
    };
  }).filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Navbar Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/dashboard" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Assessments Management</h2>
        </div>

        <Link 
          href="/faculty/assessments/create"
          className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring animate-pulse"
        >
          <Plus className="w-3.5 h-3.5" /> Create Assessment
        </Link>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
        
        {/* Toggle Empty States Previews */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-wrap gap-2 items-center justify-between">
          <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Empty State Preview Toggles:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button 
              onClick={() => setEmptyStateMode("none")}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                emptyStateMode === "none" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500"
              }`}
            >
              Default Populate
            </button>
            <button 
              onClick={() => setEmptyStateMode("no-exams")}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                emptyStateMode === "no-exams" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500"
              }`}
            >
              Empty: No Exams
            </button>
            <button 
              onClick={() => setEmptyStateMode("no-questions")}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                emptyStateMode === "no-questions" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500"
              }`}
            >
              Empty: No Questions
            </button>
            <button 
              onClick={() => setEmptyStateMode("no-students")}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                emptyStateMode === "no-students" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500"
              }`}
            >
              Empty: No Students
            </button>
          </div>
        </div>

        {emptyStateMode === "none" && (
          <>
            {/* Stats Dashboard row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Total Assessments</p>
                <p className="text-2xl font-extrabold text-slate-950 mt-1">{assessments.length}</p>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Draft Exams</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {assessments.filter(a => a.status === "Draft").length}
                </p>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Scheduled Exams</p>
                <p className="text-2xl font-extrabold text-blue-800 mt-1">
                  {assessments.filter(a => a.status === "Scheduled").length}
                </p>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Active Exams</p>
                <p className="text-2xl font-extrabold text-emerald-800 mt-1">
                  {assessments.filter(a => a.status === "Active").length}
                </p>
              </div>
              <div className="bg-slate-900 text-white p-4 border border-slate-950 rounded-lg shadow-xs">
                <p className="text-slate-400 font-bold uppercase text-[9px]">Completed Exams</p>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {assessments.filter(a => a.status === "Completed").length}
                </p>
              </div>
            </div>

            {/* Search and Filters row */}
            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assessments by name or subject code..."
                  className="w-full text-slate-900 border border-slate-200 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="w-full sm:w-48">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Drafts</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active Now</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Assessments list table */}
            {filteredAssessments.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                        <th className="py-3 px-4">Assessment Name</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4 text-center">Questions</th>
                        <th className="py-3 px-4 text-center">Assigned Students</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {filteredAssessments.map((asm) => (
                        <tr key={asm.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <Link href={`/faculty/assessments/${asm.id}`} className="hover:underline hover:text-navy-950">
                              {asm.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-500">{asm.subject}</td>
                          <td className="py-3 px-4 text-slate-650">{asm.duration} mins</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">{asm.questionsCount} items</td>
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">{asm.assignedCount} slots</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              asm.status === "Active" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
                              asm.status === "Scheduled" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                              asm.status === "Draft" ? "bg-slate-100 border border-slate-200 text-slate-600" :
                              asm.status === "Completed" ? "bg-purple-50 border border-purple-200 text-purple-800" :
                              "bg-slate-200 text-slate-700"
                            }`}>
                              {asm.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{asm.createdDate}</td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Link 
                              href={`/faculty/assessments/${asm.id}`}
                              className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-55 rounded inline-block"
                              title="View details & preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button 
                              onClick={() => handleDuplicate(asm)}
                              className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-55 rounded"
                              title="Duplicate exam"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {asm.status === "Draft" && (
                              <button 
                                onClick={() => handlePublish(asm.id)}
                                className="text-slate-400 hover:text-emerald-700 p-1 hover:bg-slate-55 rounded"
                                title="Publish exam"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(asm.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Assessments Matched"
                description="We couldn't find any programming examinations matching your search queries or select filters."
                secondaryDescription="Clear search tags or status configurations."
                icon={Search}
                actionLabel="Clear filters"
                onAction={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
              />
            )}
          </>
        )}

        {/* TAB EMPTY 1: NO ASSESSMENTS CREATED */}
        {emptyStateMode === "no-exams" && (
          <EmptyState
            title="No Assessments Created"
            description="Your college department has not scheduled any programming examinations or practical labs."
            secondaryDescription="Create assessments with active compiler constraints and proctor lockdown rules."
            icon={BookOpen}
            actionLabel="Create First Assessment"
            onAction={() => router.push("/faculty/assessments/create")}
          />
        )}

        {/* TAB EMPTY 2: NO QUESTIONS SELECTED */}
        {emptyStateMode === "no-questions" && (
          <EmptyState
            title="No Questions Selected"
            description="You are currently editing a draft assessment with no coding items selected from the question bank."
            secondaryDescription="Add visible and hidden test case questions to compile student grades."
            icon={Plus}
            actionLabel="Author Questions Bank"
            onAction={() => router.push("/faculty/question-bank")}
          />
        )}

        {/* TAB EMPTY 3: NO STUDENTS ASSIGNED */}
        {emptyStateMode === "no-students" && (
          <EmptyState
            title="No Students Assigned"
            description="This assessment slot contains compiled questions but has no student batches or roll lists assigned."
            secondaryDescription="Select sections or individual roster slots to grant access keys."
            icon={Plus}
            actionLabel="Enroll Class Rosters"
            onAction={() => router.push("/faculty/students")}
          />
        )}

      </main>

    </div>
  );
}
