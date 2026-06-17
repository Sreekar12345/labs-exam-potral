"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  Database, 
  Activity, 
  FileSpreadsheet, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LayoutDashboard,
  Shield, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Eye, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertOctagon, 
  Download,
  AlertCircle,
  HelpCircle,
  Menu,
  Clock,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { 
  loadAssessments, 
  saveAssessments, 
  loadStudents, 
  saveStudents, 
  loadQuestions, 
  saveQuestions, 
  resetPlatformData, 
  loadFacultyProfile 
} from "@/lib/storage";

import FacultySidebar from "@/components/faculty-sidebar";
import EmptyState from "@/components/empty-state";
import DashboardMockup from "@/components/dashboard-mockup";
import ReportsDashboardView from "@/components/reports-dashboard-view";
import AnalyticsDashboardView from "@/components/analytics-dashboard-view";

// Type definitions
interface Assessment {
  id: string;
  name: string;
  subject: string;
  duration: string;
  assignedCount: number;
  status: "In Progress" | "Scheduled" | "Completed";
  date: string;
}

interface Student {
  id: string;
  roll: string;
  name: string;
  email: string;
  dept: string;
  section: string;
  status: "Active" | "Inactive";
}

interface Question {
  id: string;
  title: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  usageCount: number;
  tags: string[];
}

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toggle Empty State Previews
  const [showEmptyAssessments, setShowEmptyAssessments] = useState(false);
  const [showEmptyStudents, setShowEmptyStudents] = useState(false);
  const [showEmptyQuestions, setShowEmptyQuestions] = useState(false);

  // Modals visibility state
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showUploadStudentsModal, setShowUploadStudentsModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // 1. Dynamic State Data synchronized from local storage
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [faculty, setFaculty] = useState({
    fullName: "Dr. Ramesh Sharma",
    department: "CSE",
    designation: "Professor & HOD"
  });

  // Load from local storage inside mount effect
  useEffect(() => {
    const loadedAsms = loadAssessments().map(a => ({
      id: a.id,
      name: a.name,
      subject: a.subject,
      duration: `${a.duration} mins`,
      assignedCount: a.assignedCount,
      status: a.status === "Active" ? "In Progress" as const : a.status === "Scheduled" ? "Scheduled" as const : "Completed" as const,
      date: a.date
    }));
    setAssessments(loadedAsms);
    
    setStudents(loadStudents().map(s => ({
      id: s.id,
      roll: s.roll,
      name: s.name,
      email: s.email,
      dept: s.dept,
      section: s.section,
      status: s.status === "Active" ? "Active" as const : "Inactive" as const
    })));

    setQuestions(loadQuestions().map(q => ({
      id: q.id,
      title: q.title,
      subject: `${q.language}: ${q.topic}`,
      difficulty: q.difficulty,
      usageCount: q.timesUsed,
      tags: q.tags
    })));

    setFaculty(loadFacultyProfile());
  }, []);

  // New Exam form inputs
  const [newExam, setNewExam] = useState({
    name: "",
    subject: "",
    duration: "180 mins",
    assignedCount: 60,
    status: "Scheduled" as const
  });

  // New Student input
  const [newStudent, setNewStudent] = useState({
    roll: "",
    name: "",
    email: "",
    dept: "CSE",
    section: "A"
  });

  // New Question inputs
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    subject: "CS201: Data Structures",
    difficulty: "Medium" as const,
    tagsString: "",
    description: "",
    coMapping: "CO1",
    bloomsLevel: "Remember",
    assessmentType: "Coding",
    maxMarks: 10,
    estimatedTime: 30,
    allowedLanguages: ["C", "C++", "Java", "Python", "JavaScript"] as string[],
    facultyNotes: "",
    status: "Published"
  });

  // Action: Add New Exam
  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.name || !newExam.subject) return;

    const durationNum = parseInt(newExam.duration) || 180;
    const storageExam = {
      id: Date.now().toString(),
      name: newExam.name,
      subject: newExam.subject,
      duration: durationNum,
      questionsCount: 2,
      assignedCount: newExam.assignedCount,
      status: "Scheduled" as const,
      createdDate: new Date().toISOString().split("T")[0],
      date: "June 20, 2026"
    };

    const allExams = [storageExam, ...loadAssessments()];
    saveAssessments(allExams);

    const created: Assessment = {
      id: storageExam.id,
      name: storageExam.name,
      subject: storageExam.subject,
      duration: newExam.duration,
      assignedCount: storageExam.assignedCount,
      status: "Scheduled",
      date: storageExam.date
    };

    setAssessments([created, ...assessments]);
    setShowCreateExamModal(false);
    setNewExam({ name: "", subject: "", duration: "180 mins", assignedCount: 60, status: "Scheduled" });
  };

  // Action: Upload Mock Student Roster
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.roll || !newStudent.name || !newStudent.email) return;

    const addedStorage = {
      id: Date.now().toString(),
      roll: newStudent.roll.toUpperCase(),
      name: newStudent.name,
      email: newStudent.email,
      dept: newStudent.dept,
      year: "3rd Year",
      section: newStudent.section,
      status: "Active" as const,
      lastLogin: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    const allStudents = [addedStorage, ...loadStudents()];
    saveStudents(allStudents);

    const added: Student = {
      id: addedStorage.id,
      roll: addedStorage.roll,
      name: addedStorage.name,
      email: addedStorage.email,
      dept: addedStorage.dept,
      section: addedStorage.section,
      status: "Active"
    };

    setStudents([added, ...students]);
    setShowUploadStudentsModal(false);
    setNewStudent({ roll: "", name: "", email: "", dept: "CSE", section: "A" });
  };

  // Action: Add new question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title) return;

    const tags = newQuestion.tagsString.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const addedStorage = {
      id: Date.now().toString(),
      title: newQuestion.title,
      language: newQuestion.allowedLanguages.join(", ") || newQuestion.subject.split(":")[0]?.trim() || "C++",
      difficulty: newQuestion.difficulty,
      marks: newQuestion.maxMarks,
      topic: newQuestion.subject.split(":")[1]?.trim() || "Core",
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Active" as const,
      timesUsed: 0,
      avgScore: "N/A",
      successRate: "N/A",
      avgTime: "N/A",
      createdBy: faculty.fullName,
      createdDate: new Date().toISOString().split("T")[0],
      version: 1,
      tags: tags,
      description: newQuestion.description,
      coMapping: newQuestion.coMapping,
      bloomsLevel: newQuestion.bloomsLevel,
      assessmentType: newQuestion.assessmentType,
      estimatedTime: newQuestion.estimatedTime,
      allowedLanguages: newQuestion.allowedLanguages,
      facultyNotes: newQuestion.facultyNotes,
      publishStatus: newQuestion.status
    };

    const allQuestions = [addedStorage, ...loadQuestions()];
    saveQuestions(allQuestions);

    const added: Question = {
      id: addedStorage.id,
      title: addedStorage.title,
      subject: newQuestion.subject,
      difficulty: addedStorage.difficulty,
      usageCount: 0,
      tags: tags
    };

    setQuestions([added, ...questions]);
    setShowAddQuestionModal(false);
    setNewQuestion({ 
      title: "", 
      subject: "CS201: Data Structures", 
      difficulty: "Medium", 
      tagsString: "",
      description: "",
      coMapping: "CO1",
      bloomsLevel: "Remember",
      assessmentType: "Coding",
      maxMarks: 10,
      estimatedTime: 30,
      allowedLanguages: ["C", "C++", "Java", "Python", "JavaScript"],
      facultyNotes: "",
      status: "Published"
    });
  };

  // Action: Delete Assessment
  const handleDeleteAssessment = (id: string) => {
    const updated = loadAssessments().filter(a => a.id !== id);
    saveAssessments(updated);
    setAssessments(assessments.filter(a => a.id !== id));
  };

  // Action: Delete Student
  const handleDeleteStudent = (id: string) => {
    const updated = loadStudents().filter(s => s.id !== id);
    saveStudents(updated);
    setStudents(students.filter(s => s.id !== id));
  };

  // Action: Delete Question
  const handleDeleteQuestion = (id: string) => {
    const updated = loadQuestions().filter(q => q.id !== id);
    saveQuestions(updated);
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleResetAllData = () => {
    if (confirm("Are you sure you want to reset all platform data to the default seeded demo state? Any custom additions will be lost.")) {
      resetPlatformData(false);
      
      // Reload states
      setAssessments(loadAssessments().map(a => ({
        id: a.id,
        name: a.name,
        subject: a.subject,
        duration: `${a.duration} mins`,
        assignedCount: a.assignedCount,
        status: a.status === "Active" ? "In Progress" as const : a.status === "Scheduled" ? "Scheduled" as const : "Completed" as const,
        date: a.date
      })));
      setStudents(loadStudents().map(s => ({
        id: s.id,
        roll: s.roll,
        name: s.name,
        email: s.email,
        dept: s.dept,
        section: s.section,
        status: s.status === "Active" ? "Active" as const : "Inactive" as const
      })));
      setQuestions(loadQuestions().map(q => ({
        id: q.id,
        title: q.title,
        subject: `${q.language}: ${q.topic}`,
        difficulty: q.difficulty,
        usageCount: q.timesUsed,
        tags: q.tags
      })));
      setFaculty(loadFacultyProfile());
      alert("Platform data has been reset to default seeded values.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans select-none text-xs">
      
      {/* Sidebar Navigation */}
      <FacultySidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Panel Content Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-800 focus-ring"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-900 capitalize tracking-tight">
              {activeTab === "questions" ? "Question Bank" : activeTab} Panel
            </h2>
          </div>

          {/* User profile dropdown menu */}
          <div className="flex items-center gap-4">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
              PSG Tech Node
            </span>
            <div className="text-right hidden sm:block border-r border-slate-200 pr-3">
              <p className="font-bold text-slate-800">{faculty.fullName}</p>
              <p className="text-[10px] text-slate-400 font-medium">{faculty.designation} • Department of {faculty.department}</p>
            </div>
            <div className="bg-navy-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
              {faculty.fullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase() || "FC"}
            </div>
          </div>
        </header>

        {/* Content Body viewport */}
        <div className="p-6 md:p-8 flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Statistics row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Students</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">132</p>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Assessments</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">12</p>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Exams</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">1</p>
                  </div>
                </div>

                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex items-center gap-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-md text-slate-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Completed Exams</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">11</p>
                  </div>
                </div>
              </div>

              {/* Main Content Layout splits */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left panel: Recent Assessments & Question summary */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Recent Assessments Card */}
                  <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-250 bg-white flex justify-between items-center">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Recent Examinations Portfolio</h3>
                      <button 
                        onClick={() => setActiveTab("assessments")}
                        className="text-[11px] text-navy-800 hover:text-navy-950 font-bold hover:underline flex items-center gap-1"
                      >
                        Manage All <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                            <th className="py-3 px-4">Assessment Name</th>
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Allocated</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {assessments.slice(0, 3).map((asm) => (
                            <tr key={asm.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 font-bold text-slate-900">{asm.name}</td>
                              <td className="py-3 px-4 font-mono font-medium text-slate-500">{asm.subject}</td>
                              <td className="py-3 px-4 text-slate-650">{asm.duration}</td>
                              <td className="py-3 px-4 text-slate-650 font-mono font-medium">{asm.assignedCount} slots</td>
                              <td className="py-3 px-4">
                                {asm.status === "In Progress" && (
                                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                                    IN PROGRESS
                                  </span>
                                )}
                                {asm.status === "Scheduled" && (
                                  <span className="bg-blue-50 border border-blue-200 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded">
                                    SCHEDULED
                                  </span>
                                )}
                                {asm.status === "Completed" && (
                                  <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                                    COMPLETED
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5 shrink-0">
                                {asm.status === "In Progress" ? (
                                  <Link 
                                    href={`/faculty/monitoring/${asm.id}`}
                                    className="text-[10px] bg-rose-50 text-rose-800 border border-rose-250 font-bold px-2 py-1 rounded hover:bg-rose-100 transition-colors inline-block"
                                  >
                                    Monitor
                                  </Link>
                                ) : (
                                  <button 
                                    onClick={() => alert(`Details for ${asm.name}`)}
                                    className="text-[10px] text-slate-600 hover:text-slate-900 font-bold"
                                  >
                                    View
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Question Bank summary cards */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Question Bank Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                        <p className="text-slate-400 font-semibold uppercase text-[9px]">Total Questions</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-1">124</p>
                      </div>
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                        <p className="text-slate-400 font-semibold uppercase text-[9px]">Coding Core</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-1">92</p>
                      </div>
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                        <p className="text-slate-400 font-semibold uppercase text-[9px]">Added (30d)</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-1">12</p>
                      </div>
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                        <p className="text-slate-400 font-semibold uppercase text-[9px]">Frequently Used</p>
                        <p className="text-xl font-extrabold text-slate-900 mt-1">28</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right panel: Upcoming exams, live monitoring telemetry logs & Quick actions */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Quick actions panel */}
                  <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-950 shadow-md space-y-4">
                    <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
                      Quick Operations
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <button 
                        onClick={() => setShowCreateExamModal(true)}
                        className="bg-slate-800 hover:bg-slate-750 text-white p-2.5 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-400" /> Create Exam
                      </button>
                      <button 
                        onClick={() => setShowAddQuestionModal(true)}
                        className="bg-slate-800 hover:bg-slate-750 text-white p-2.5 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-400" /> Add Question
                      </button>
                      <button 
                        onClick={() => setShowUploadStudentsModal(true)}
                        className="bg-slate-800 hover:bg-slate-750 text-white p-2.5 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload Roster
                      </button>
                      <button 
                        onClick={() => setActiveTab("reports")}
                        className="bg-slate-800 hover:bg-slate-750 text-white p-2.5 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" /> Get Reports
                      </button>
                      <button 
                        onClick={handleResetAllData}
                        className="bg-slate-800 hover:bg-slate-750 text-rose-450 p-2.5 rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-center col-span-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-rose-400" /> Reset Platform Data
                      </button>
                    </div>
                  </div>

                  {/* Upcoming Assessments Widget */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Upcoming assessments</h3>
                    <div className="divide-y divide-slate-100">
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">IT305 Object Oriented Lab</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Assigned: IT Section B • 120m</p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-750 font-mono">
                          <p>June 18</p>
                          <p className="text-slate-400 mt-0.5">02:00 PM</p>
                        </div>
                      </div>
                      <div className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">CS304 Design & Analysis</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Assigned: CSE Section C • 180m</p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-750 font-mono">
                          <p>June 21</p>
                          <p className="text-slate-400 mt-0.5">10:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Activity summary */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Activity Panel</h3>
                    <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-150 font-mono text-[10px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Active Students:</span>
                        <span className="text-slate-900 font-bold">64 candidates</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ongoing Exams:</span>
                        <span className="text-slate-900 font-bold">1 active room</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Submissions:</span>
                        <span className="text-emerald-700 font-bold">42 compiled</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1.5">
                        <span>Proctor Warnings:</span>
                        <span className="text-rose-700 font-bold">6 incidents flagged</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENTS ROSTER */}
          {activeTab === "students" && (
            <div className="space-y-6">
              
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Candidate Student Roster</h3>
                  {/* Empty state toggle */}
                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={showEmptyStudents}
                      onChange={(e) => setShowEmptyStudents(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 focus:ring-navy-900 w-3 h-3"
                    />
                    Mock Empty State
                  </label>
                </div>
                <button 
                  onClick={() => setShowUploadStudentsModal(true)}
                  className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-3 py-2 rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>

              {!showEmptyStudents ? (
                <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-3 px-4">Roll Number</th>
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">Official Email</th>
                          <th className="py-3 px-4">Dept</th>
                          <th className="py-3 px-4">Section</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {students.map((std) => (
                          <tr key={std.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{std.roll}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{std.name}</td>
                            <td className="py-3 px-4 font-mono text-slate-500">{std.email}</td>
                            <td className="py-3 px-4 text-slate-650">{std.dept}</td>
                            <td className="py-3 px-4 text-slate-650 font-bold">{std.section}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                std.status === "Active" 
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                                  : "bg-slate-100 border border-slate-200 text-slate-600"
                              }`}>
                                {std.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button 
                                onClick={() => handleDeleteStudent(std.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                                aria-label={`Delete student ${std.name}`}
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
                  title="No Students Enrolled"
                  description="Your departmental class roster is empty. Upload student credentials to register them on the compiler server nodes."
                  secondaryDescription="Supports import from standard Excel / CSV rosters templates."
                  icon={Users}
                  actionLabel="Upload Student Roster"
                  onAction={() => setShowUploadStudentsModal(true)}
                />
              )}

            </div>
          )}

          {/* TAB 3: QUESTION BANK */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Repository Questions</h3>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={showEmptyQuestions}
                      onChange={(e) => setShowEmptyQuestions(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 focus:ring-navy-900 w-3 h-3"
                    />
                    Mock Empty State
                  </label>
                </div>
                <button 
                  onClick={() => setShowAddQuestionModal(true)}
                  className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-3 py-2 rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {!showEmptyQuestions ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((q) => (
                    <div key={q.id} className="academic-card flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-500">{q.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            q.difficulty === "Easy" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
                            q.difficulty === "Medium" ? "bg-amber-50 border border-amber-200 text-amber-800" :
                            "bg-rose-50 border border-rose-200 text-rose-800"
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-2">{q.title}</h4>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {q.tags.map(t => (
                            <span key={t} className="bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Used in <span className="font-bold text-slate-800">{q.usageCount} assessments</span></span>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                          aria-label={`Delete question ${q.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Questions in Repository"
                  description="Your departmental question repository is empty. Add reusable coding questions with custom hidden validation test scripts."
                  secondaryDescription="Questions can be categorized by subject, unit, and difficulty levels."
                  icon={Database}
                  actionLabel="Add Programming Question"
                  onAction={() => setShowAddQuestionModal(true)}
                />
              )}

            </div>
          )}

          {/* TAB 4: ASSESSMENTS LIST */}
          {activeTab === "assessments" && (
            <div className="space-y-6">
              
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Scheduled Programming Exams</h3>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={showEmptyAssessments}
                      onChange={(e) => setShowEmptyAssessments(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 focus:ring-navy-900 w-3 h-3"
                    />
                    Mock Empty State
                  </label>
                </div>
                <button 
                  onClick={() => setShowCreateExamModal(true)}
                  className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-3 py-2 rounded-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Assessment
                </button>
              </div>

              {!showEmptyAssessments ? (
                <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-3 px-4">Assessment Name</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Duration</th>
                          <th className="py-3 px-4">Allocated Students</th>
                          <th className="py-3 px-4">Scheduled Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {assessments.map((asm) => (
                          <tr key={asm.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-900">{asm.name}</td>
                            <td className="py-3 px-4 font-mono font-medium text-slate-500">{asm.subject}</td>
                            <td className="py-3 px-4 text-slate-650">{asm.duration}</td>
                            <td className="py-3 px-4 text-slate-650 font-mono font-medium">{asm.assignedCount} slots</td>
                            <td className="py-3 px-4 text-slate-500 font-medium">{asm.date}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                asm.status === "In Progress" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
                                asm.status === "Scheduled" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                                "bg-slate-100 border border-slate-200 text-slate-600"
                              }`}>
                                {asm.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1">
                              {asm.status === "In Progress" && (
                                <Link 
                                  href={`/faculty/monitoring/${asm.id}`}
                                  className="text-[10px] bg-rose-50 text-rose-800 border border-rose-250 font-bold px-2 py-1 rounded hover:bg-rose-100 transition-colors inline-block"
                                >
                                  Monitor
                                </Link>
                              )}
                              {asm.status === "Completed" && (
                                <button 
                                  onClick={() => setActiveTab("reports")}
                                  className="text-[10px] text-navy-800 hover:text-navy-950 font-bold"
                                >
                                  Reports
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteAssessment(asm.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50"
                                aria-label={`Delete assessment ${asm.name}`}
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
                  title="No Scheduled Assessments"
                  description="You have not created any programming examinations for the current semester roster slots."
                  secondaryDescription="Create assessments with code constraints, compilers, and active timers."
                  icon={BookOpen}
                  actionLabel="Create Assessment Slot"
                  onAction={() => setShowCreateExamModal(true)}
                />
              )}

            </div>
          )}

          {/* TAB 5: LIVE MONITORING */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Live Proctoring Control Console</h3>
                  <p className="text-slate-500 mt-0.5">Real-time surveillance updates of candidate computer nodes and violation warnings.</p>
                </div>
                <Link 
                  href="/faculty/monitoring"
                  className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs animate-pulse"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Open Surveillance Control Room
                </Link>
              </div>
              <DashboardMockup />
            </div>
          )}

          {/* TAB 6: REPORTS & EXPORTS */}
          {activeTab === "reports" && (
            <ReportsDashboardView />
          )}

          {/* TAB 7: GRADE ANALYTICS */}
          {activeTab === "analytics" && (
            <AnalyticsDashboardView initialRole="HOD" />
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-2xs max-w-2xl">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight border-b border-slate-100 pb-2">
                  Institutional Proctor Configurations
                </h3>
                
                <div className="space-y-4">
                  {/* Warning bounds */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Max Warnings Allowed before lock</label>
                      <select className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900">
                        <option>2 warnings</option>
                        <option>3 warnings (Default)</option>
                        <option>5 warnings</option>
                      </select>
                      <p className="text-[10px] text-slate-400">Exceeding this locks candidate console IDE.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Compiler Timeout limits</label>
                      <select className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900">
                        <option>2 seconds</option>
                        <option>5 seconds (Default)</option>
                        <option>10 seconds</option>
                      </select>
                      <p className="text-[10px] text-slate-400">Halts infinite loop solutions automatically.</p>
                    </div>
                  </div>

                  {/* Subnet whitelist info */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Authorized Subnet whitelist</label>
                    <input 
                      type="text" 
                      defaultValue="192.168.12.*, 10.96.157.*"
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                    <p className="text-[10px] text-slate-400">Filters client IP access to college computer lab hosts.</p>
                  </div>

                  {/* Features checkboxes */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked id="restrictCopy" className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5" />
                      <label htmlFor="restrictCopy" className="font-semibold text-slate-700">Enforce clipboard restrictions (block copy-paste)</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked id="lockFullscreen" className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5" />
                      <label htmlFor="lockFullscreen" className="font-semibold text-slate-700">Block exam navigation if fullscreen wrapper is exited</label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end">
                  <button 
                    onClick={() => alert("Simulation: Configurations saved.")}
                    className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md"
                  >
                    Save configurations
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL SHEET 1: CREATE ASSESSMENT */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCreateExamModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-md w-full relative z-10 overflow-hidden flex flex-col font-sans">
            <form onSubmit={handleCreateExam}>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-navy-800 tracking-wider uppercase">Exam Configuration Wizard</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Schedule New Programming Exam</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Exam Name */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Assessment Title *</label>
                  <input
                    type="text"
                    required
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    placeholder="e.g. Midterm Laboratory Practical"
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Subject code */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Subject Code *</label>
                    <input
                      type="text"
                      required
                      value={newExam.subject}
                      onChange={(e) => setNewExam({ ...newExam, subject: e.target.value.toUpperCase() })}
                      placeholder="e.g. CS201"
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Exam Duration</label>
                    <select
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="60 mins">60 mins</option>
                      <option value="90 mins">90 mins</option>
                      <option value="120 mins">120 mins</option>
                      <option value="180 mins">180 mins</option>
                    </select>
                  </div>
                </div>

                {/* Slots */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Roster slots allocation</label>
                  <input
                    type="number"
                    value={newExam.assignedCount}
                    onChange={(e) => setNewExam({ ...newExam, assignedCount: Number(e.target.value) })}
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-md font-bold"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SHEET 2: UPLOAD STUDENTS */}
      {showUploadStudentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowUploadStudentsModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-md w-full relative z-10 overflow-hidden flex flex-col font-sans">
            <form onSubmit={handleAddStudent}>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-navy-800 tracking-wider uppercase">Student Roster Enrollment</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Register Student Credentials</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Roll number */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Roll Number *</label>
                    <input
                      type="text"
                      required
                      value={newStudent.roll}
                      onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
                      placeholder="e.g. 22CSE104"
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="e.g. Aravind S"
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="e.g. student@college.edu"
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Dept */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Department</label>
                    <select
                      value={newStudent.dept}
                      onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                    </select>
                  </div>

                  {/* Section */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Section</label>
                    <input
                      type="text"
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value.toUpperCase() })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadStudentsModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-md font-bold"
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SHEET 3: ADD QUESTION */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddQuestionModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-md w-full relative z-10 overflow-hidden flex flex-col font-sans">
            <form onSubmit={handleAddQuestion}>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
                <span className="text-[10px] font-bold text-navy-800 tracking-wider uppercase">Question Authoring Panel</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Add Custom Programming Question</h3>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Question Title *</label>
                  <input
                    type="text"
                    required
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    placeholder="e.g. Reverse elements in singly linked list"
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Subject category */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Course Subject</label>
                    <select
                      value={newQuestion.subject}
                      onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="CS201: Data Structures">Data Structures</option>
                      <option value="IT305: OOPs">OOPs Concepts</option>
                      <option value="CS304: Algorithms">Design & Algorithms</option>
                      <option value="CS203: DBMS">Database Systems</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Difficulty Rating</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="Easy">Easy Rating</option>
                      <option value="Medium">Medium Rating</option>
                      <option value="Hard">Hard Rating</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Subject Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newQuestion.tagsString}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tagsString: e.target.value })}
                    placeholder="e.g. List, Recursion, Stack"
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                {/* 1. Question Description */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Question Description *</label>
                  <textarea
                    required
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                    placeholder="Describe the complete question statement (supports paragraphs, bullet points, lists)..."
                    rows={4}
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                {/* 2 & 3. CO Mapping & Bloom's Taxonomy Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Learning Outcome / CO Mapping</label>
                    <select
                      value={newQuestion.coMapping}
                      onChange={(e) => setNewQuestion({ ...newQuestion, coMapping: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="CO1">CO1</option>
                      <option value="CO2">CO2</option>
                      <option value="CO3">CO3</option>
                      <option value="CO4">CO4</option>
                      <option value="CO5">CO5</option>
                      <option value="CO6">CO6</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Bloom's Taxonomy Level</label>
                    <select
                      value={newQuestion.bloomsLevel}
                      onChange={(e) => setNewQuestion({ ...newQuestion, bloomsLevel: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="Remember">Remember</option>
                      <option value="Understand">Understand</option>
                      <option value="Apply">Apply</option>
                      <option value="Analyze">Analyze</option>
                      <option value="Evaluate">Evaluate</option>
                      <option value="Create">Create</option>
                    </select>
                  </div>
                </div>

                {/* 4 & 9. Assessment Type & Question Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Assessment Type</label>
                    <select
                      value={newQuestion.assessmentType}
                      onChange={(e) => setNewQuestion({ ...newQuestion, assessmentType: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="Coding">Coding</option>
                      <option value="Debugging">Debugging</option>
                      <option value="MCQ">MCQ</option>
                      <option value="Short Answer">Short Answer</option>
                      <option value="Case Study">Case Study</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Question Status</label>
                    <select
                      value={newQuestion.status}
                      onChange={(e) => setNewQuestion({ ...newQuestion, status: e.target.value })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>

                {/* 5 & 6. Max Marks & Estimated Completion Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Maximum Marks</label>
                    <input
                      type="number"
                      min={0}
                      value={newQuestion.maxMarks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, maxMarks: parseInt(e.target.value) || 0 })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">Estimated Time (Min)</label>
                    <input
                      type="number"
                      min={1}
                      value={newQuestion.estimatedTime}
                      onChange={(e) => setNewQuestion({ ...newQuestion, estimatedTime: parseInt(e.target.value) || 0 })}
                      className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                    />
                  </div>
                </div>

                {/* 7. Allowed Programming Languages */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Allowed Programming Languages</label>
                  <div className="grid grid-cols-3 gap-2 p-3 border border-slate-200 rounded-md bg-slate-50/50">
                    {["C", "C++", "Java", "Python", "JavaScript"].map((lang) => (
                      <label key={lang} className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-750">
                        <input
                          type="checkbox"
                          checked={newQuestion.allowedLanguages.includes(lang)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const languages = isChecked
                              ? [...newQuestion.allowedLanguages, lang]
                              : newQuestion.allowedLanguages.filter((l) => l !== lang);
                            setNewQuestion({ ...newQuestion, allowedLanguages: languages });
                          }}
                          className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-4 h-4 cursor-pointer"
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 8. Faculty Notes */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Faculty Notes (Optional)</label>
                  <textarea
                    value={newQuestion.facultyNotes}
                    onChange={(e) => setNewQuestion({ ...newQuestion, facultyNotes: e.target.value })}
                    placeholder="Provide notes visible only to faculty members..."
                    rows={3}
                    className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-md font-bold"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
