"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStudents, loadExamSessions, saveExamSessions, loadQuestions, Student, ExamSession } from "@/lib/storage";
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
  Calendar,
  Grid,
  List,
  Filter,
  Volume2,
  Lock,
  Unlock,
  AlertOctagon,
  RefreshCw,
  MoreVertical,
  Timer,
  LayoutGrid,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

interface StudentSession {
  roll: string;
  name: string;
  dept: string;
  year: string;
  section: string;
  currentQuestion: string;
  attemptedCount: number;
  submittedCount: number;
  lastActivity: string;
  status: "Active" | "Idle" | "Submitted" | "Disconnected";
  warningsCount: number;
  ip: string;
  recentLogs: string[];
}

interface ActivityEvent {
  id: string;
  time: string;
  roll: string;
  name: string;
  event: string;
  severity: "info" | "warning" | "critical";
}

export default function ProctorControlRoom({ params }: PageProps) {
  const { assessmentId } = use(params);
  const router = useRouter();

  // Layout states
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [violationFilter, setViolationFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);

  // Live simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // Time remaining count
  const [timeLeft, setTimeLeft] = useState("01:24:15");

  // Dynamic list of proctor session nodes loaded from localStorage
  const [students, setStudents] = useState<StudentSession[]>([]);

  // Hydrate monitoring sessions from storage student roster
  // Hydrate monitoring sessions from database or local storage fallback
  useEffect(() => {
    if (isSimulating) return;

    const allQuestions = loadQuestions();

    const parseSubmissions = (jsonStr: string | null | undefined) => {
      const defaultVal = {
        submissions: {} as Record<string, string>,
        warningsCount: 0,
        warningsLogs: [] as string[],
        lastActivity: "Not started",
        status: "Disconnected" as const
      };
      if (!jsonStr) return defaultVal;
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          if ('submissions' in parsed) {
            return {
              submissions: parsed.submissions || {},
              warningsCount: typeof parsed.warningsCount === 'number' ? parsed.warningsCount : 0,
              warningsLogs: Array.isArray(parsed.warningsLogs) ? parsed.warningsLogs : [],
              lastActivity: parsed.lastActivity || "Not started",
              status: parsed.status || "Disconnected"
            };
          } else {
            return {
              ...defaultVal,
              submissions: parsed,
              status: "Active" as const
            };
          }
        }
      } catch (e) {}
      return defaultVal;
    };

    const fetchProgress = () => {
      fetch("/api/sync")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            const roster: Student[] = data.students || [];
            const examSessions: ExamSession[] = data.examSessions || [];

            const sessions: StudentSession[] = roster.map(s => {
              const session = examSessions.find(es => es.studentRoll === s.roll && es.assessmentId === assessmentId);
              
              let currentQuestion = "None";
              let attemptedCount = 0;
              let submittedCount = 0;
              let lastActivity = "Not started";
              let status: "Active" | "Idle" | "Submitted" | "Disconnected" = "Disconnected";
              let warningsCount = 0;
              let ip = "—";
              let recentLogs: string[] = [];

              if (session) {
                const parsed = parseSubmissions(session.codeSubmissions);
                submittedCount = Object.keys(parsed.submissions).length;
                attemptedCount = submittedCount;
                warningsCount = parsed.warningsCount;
                recentLogs = parsed.warningsLogs;
                lastActivity = parsed.lastActivity;
                status = parsed.status;
                ip = "192.168.12." + Math.floor(100 + (s.roll.charCodeAt(s.roll.length - 1) || 0) * 1.5);

                if (session.submittedAt) {
                  status = "Submitted";
                }

                // Determine current question based on code submissions key
                const orderIds = session.questionOrder ? JSON.parse(session.questionOrder) : [];
                if (orderIds.length > 0) {
                  const unanswered = orderIds.find((id: string) => !parsed.submissions[id]);
                  if (unanswered) {
                    const q = allQuestions.find(que => que.id === unanswered);
                    currentQuestion = q ? q.title : "In Progress";
                  } else {
                    currentQuestion = "All Completed";
                  }
                }
              }

              return {
                roll: s.roll,
                name: s.name,
                dept: s.dept,
                year: s.year,
                section: s.section,
                currentQuestion,
                attemptedCount,
                submittedCount,
                lastActivity,
                status,
                warningsCount,
                ip,
                recentLogs
              };
            });

            setStudents(sessions);

            // Hydrate surveillance events feed from actual session logs
            const allEvents: ActivityEvent[] = [];
            roster.forEach(student => {
              const session = examSessions.find(es => es.studentRoll === student.roll && es.assessmentId === assessmentId);
              if (session && session.codeSubmissions) {
                const parsed = parseSubmissions(session.codeSubmissions);
                parsed.warningsLogs.forEach((log: string, logIdx: number) => {
                  const parts = log.split(" - ");
                  const time = parts[0] || "";
                  const eventText = parts[1] || log;
                  
                  let severity: "info" | "warning" | "critical" = "info";
                  if (eventText.toLowerCase().includes("warning") || eventText.toLowerCase().includes("tab")) {
                    severity = "warning";
                  }
                  if (eventText.toLowerCase().includes("disqualified") || eventText.toLowerCase().includes("suspended")) {
                    severity = "critical";
                  }
                  
                  allEvents.push({
                    id: `${student.roll}_${logIdx}`,
                    time,
                    roll: student.roll,
                    name: student.name,
                    event: eventText,
                    severity
                  });
                });
              }
            });

            // Sort events by time descending
            allEvents.sort((a, b) => b.time.localeCompare(a.time));
            setEvents(allEvents.slice(0, 15));
          }
        })
        .catch(err => console.error("Proctor dashboard poll error:", err));
    };

    // Load static local data first as fallback
    const localRoster = loadStudents();
    const localSessions = loadExamSessions();
    const fallbackSessions = localRoster.map(s => {
      const session = localSessions.find(es => es.studentRoll === s.roll && es.assessmentId === assessmentId);
      let currentQuestion = "None";
      let attemptedCount = 0;
      let submittedCount = 0;
      let lastActivity = "Not started";
      let status: "Active" | "Idle" | "Submitted" | "Disconnected" = "Disconnected";
      let warningsCount = 0;
      let ip = "—";
      let recentLogs: string[] = [];

      if (session) {
        const parsed = parseSubmissions(session.codeSubmissions);
        submittedCount = Object.keys(parsed.submissions).length;
        attemptedCount = submittedCount;
        warningsCount = parsed.warningsCount;
        recentLogs = parsed.warningsLogs;
        lastActivity = parsed.lastActivity;
        status = parsed.status;
        ip = "192.168.12." + Math.floor(100 + (s.roll.charCodeAt(s.roll.length - 1) || 0) * 1.5);
        if (session.submittedAt) status = "Submitted";
        const orderIds = session.questionOrder ? JSON.parse(session.questionOrder) : [];
        if (orderIds.length > 0) {
          const unanswered = orderIds.find((id: string) => !parsed.submissions[id]);
          if (unanswered) {
            const q = allQuestions.find(que => que.id === unanswered);
            currentQuestion = q ? q.title : "In Progress";
          } else {
            currentQuestion = "All Completed";
          }
        }
      }
      return {
        roll: s.roll,
        name: s.name,
        dept: s.dept,
        year: s.year,
        section: s.section,
        currentQuestion,
        attemptedCount,
        submittedCount,
        lastActivity,
        status,
        warningsCount,
        ip,
        recentLogs
      };
    });
    setStudents(fallbackSessions);

    // Initial load and poll
    fetchProgress();
    const timer = setInterval(fetchProgress, 10000);
    return () => clearInterval(timer);
  }, [assessmentId, isSimulating]);

  // Initial Activity feed events log
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Simulated WebSocket real-time updates ticker
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Choose random student to trigger simulated action
      const randomIndex = Math.floor(Math.random() * students.length);
      const targetStudent = students[randomIndex];
      const timeNow = new Date().toTimeString().split(" ")[0];

      // Define possible simulation events
      const simulatedActions = [
        {
          eventDesc: "Switched browser focus tab",
          severity: "warning" as const,
          action: (s: StudentSession) => {
            const nextWarnings = Math.min(s.warningsCount + 1, 3);
            const status = nextWarnings >= 3 ? "Disconnected" as const : s.status;
            const currentQ = nextWarnings >= 3 ? "Suspended" : s.currentQuestion;
            if (nextWarnings >= 3) {
              setActiveAlert(`Roll ${s.roll} (${s.name}) was automatically disqualified. Tab switches exceeded.`);
            }
            return { 
              ...s, 
              warningsCount: nextWarnings, 
              status, 
              currentQuestion: currentQ, 
              lastActivity: "Just now",
              recentLogs: [`${timeNow} - Tab switch warning ${nextWarnings}`, ...s.recentLogs]
            };
          }
        },
        {
          eventDesc: "Submitted Question 2 (Validate BST)",
          severity: "info" as const,
          action: (s: StudentSession) => {
            if (s.status === "Disconnected" || s.status === "Submitted") return s;
            return { 
              ...s, 
              submittedCount: Math.min(s.submittedCount + 1, 3), 
              lastActivity: "Just now",
              recentLogs: [`${timeNow} - Submitted Q2`, ...s.recentLogs]
            };
          },
        },
        {
          eventDesc: "Lost socket connectivity node",
          severity: "critical" as const,
          action: (s: StudentSession) => {
            if (s.status === "Disconnected") return s;
            setActiveAlert(`Node connection lost: Roll ${s.roll} (${s.name}).`);
            return { 
              ...s, 
              status: "Disconnected" as const, 
              lastActivity: "Offline",
              recentLogs: [`${timeNow} - Network disconnected`, ...s.recentLogs]
            };
          }
        },
        {
          eventDesc: "Compiled Question 3 code logs",
          severity: "info" as const,
          action: (s: StudentSession) => {
            if (s.status === "Disconnected" || s.status === "Submitted") return s;
            return { 
              ...s, 
              status: "Active" as const, 
              attemptedCount: Math.min(s.attemptedCount + 1, 3), 
              lastActivity: "Just now",
              recentLogs: [`${timeNow} - Compiled Q3 code`, ...s.recentLogs]
            };
          }
        }
      ];

      // Pick action
      const actionPick = simulatedActions[Math.floor(Math.random() * simulatedActions.length)];
      const updatedStudent = actionPick.action(targetStudent);

      // Apply update if changed
      if (JSON.stringify(updatedStudent) !== JSON.stringify(targetStudent)) {
        setStudents(prev => prev.map(s => s.roll === targetStudent.roll ? updatedStudent : s));
        
        // Append to activity feed
        const newEventObj: ActivityEvent = {
          id: Date.now().toString(),
          time: timeNow,
          roll: targetStudent.roll,
          name: targetStudent.name,
          event: actionPick.eventDesc,
          severity: actionPick.severity
        };
        setEvents(prev => [newEventObj, ...prev.slice(0, 15)]);

        // Sync detail drawer if open
        if (selectedStudent && selectedStudent.roll === targetStudent.roll) {
          setSelectedStudent(updatedStudent);
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, students, selectedStudent]);

  // Countdown timer simulation
  useEffect(() => {
    const clock = setInterval(() => {
      setTimeLeft(prev => {
        const parts = prev.split(":").map(Number);
        let sec = parts[2];
        let min = parts[1];
        let hr = parts[0];

        sec--;
        if (sec < 0) {
          sec = 59;
          min--;
          if (min < 0) {
            min = 59;
            hr--;
          }
        }
        if (hr < 0) {
          clearInterval(clock);
          return "00:00:00";
        }

        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(hr)}:${pad(min)}:${pad(sec)}`;
      });
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  // Faculty Override Handlers
  const handleFacultyAction = (action: "warn" | "lock" | "unlock" | "force-submit" | "extend") => {
    if (!selectedStudent) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const sessions = loadExamSessions();
    let updatedSessionObj: any = null;

    const updatedSessions = sessions.map(s => {
      if (s.studentRoll === selectedStudent.roll && s.assessmentId === assessmentId) {
        let data = {
          submissions: {} as Record<string, string>,
          warningsCount: 0,
          warningsLogs: [] as string[],
          lastActivity: "Just now",
          status: "Active" as "Active" | "Idle" | "Submitted" | "Disconnected"
        };
        if (s.codeSubmissions) {
          try {
            const parsed = JSON.parse(s.codeSubmissions);
            if (parsed && typeof parsed === 'object') {
              if ('submissions' in parsed) {
                data.submissions = parsed.submissions || {};
                data.warningsCount = parsed.warningsCount || 0;
                data.warningsLogs = parsed.warningsLogs || [];
                data.lastActivity = parsed.lastActivity || "Just now";
                data.status = parsed.status || "Active";
              } else {
                data.submissions = parsed;
              }
            }
          } catch (e) {}
        }

        if (action === "warn") {
          const nextWarn = Math.min(data.warningsCount + 1, 3);
          data.warningsCount = nextWarn;
          data.warningsLogs = [`${timeNow} - Faculty manual warning issued`, ...data.warningsLogs];
          data.lastActivity = `${timeNow} - Warning issued by Faculty`;
          if (nextWarn >= 3) {
            data.status = "Disconnected" as const;
          }
        } else if (action === "lock") {
          data.status = "Idle" as const;
          data.warningsLogs = [`${timeNow} - Terminal session locked by Faculty`, ...data.warningsLogs];
          data.lastActivity = `${timeNow} - Locked by Faculty`;
        } else if (action === "unlock") {
          data.status = "Active" as const;
          data.warningsLogs = [`${timeNow} - Terminal session unlocked by Faculty`, ...data.warningsLogs];
          data.lastActivity = `${timeNow} - Unlocked by Faculty`;
        } else if (action === "force-submit") {
          data.status = "Submitted" as const;
          data.warningsLogs = [`${timeNow} - Exam force-submitted by Faculty`, ...data.warningsLogs];
          data.lastActivity = `${timeNow} - Force-submitted by Faculty`;
          s.submittedAt = new Date().toISOString();
        } else if (action === "extend") {
          data.warningsLogs = [`${timeNow} - Ext Time (+15 mins) granted`, ...data.warningsLogs];
          data.lastActivity = `${timeNow} - Time extended (+15 mins)`;
        }

        s.codeSubmissions = JSON.stringify(data);
        updatedSessionObj = s;
      }
      return s;
    });

    if (updatedSessionObj) {
      saveExamSessions(updatedSessions);
    }

    setStudents(prev => prev.map(s => {
      if (s.roll === selectedStudent.roll) {
        const parsed = updatedSessionObj ? JSON.parse(updatedSessionObj.codeSubmissions) : {};
        const updated = {
          ...s,
          warningsCount: parsed.warningsCount ?? s.warningsCount,
          status: updatedSessionObj?.submittedAt ? "Submitted" : (parsed.status ?? s.status),
          lastActivity: parsed.lastActivity ?? s.lastActivity,
          recentLogs: parsed.warningsLogs ?? s.recentLogs
        };
        setSelectedStudent(updated);
        return updated;
      }
      return s;
    }));

    if (action === "warn") alert(`Warning dispatched to ${selectedStudent.name}'s workspace.`);
    else if (action === "lock") alert(`Editor locked for ${selectedStudent.name}.`);
    else if (action === "unlock") alert(`Workspace unlocked for ${selectedStudent.name}.`);
    else if (action === "force-submit") alert(`Exam force-submitted for ${selectedStudent.name}.`);
    else if (action === "extend") alert(`Time extended (+15 mins) for ${selectedStudent.name}.`);
  };

  // Filter computations
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.roll.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchSection = sectionFilter === "all" || s.section === sectionFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    
    let matchViolation = true;
    if (violationFilter === "clean") matchViolation = s.warningsCount === 0;
    else if (violationFilter === "warning") matchViolation = s.warningsCount > 0 && s.warningsCount < 3;
    else if (violationFilter === "critical") matchViolation = s.warningsCount >= 3;

    return matchSearch && matchSection && matchStatus && matchViolation;
  });

  // Health stats
  const activeCount = students.filter(s => s.status === "Active").length;
  const submittedCount = students.filter(s => s.status === "Submitted").length;
  const disconnectedCount = students.filter(s => s.status === "Disconnected").length;
  const alertCount = students.filter(s => s.warningsCount > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Dynamic Alerts Banner */}
      {activeAlert && (
        <div className="bg-rose-900 text-white px-6 py-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider sticky top-0 z-40 transition-all">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4.5 h-4.5 text-rose-300 animate-bounce" />
            <span>{activeAlert}</span>
          </div>
          <button 
            onClick={() => setActiveAlert(null)}
            className="text-rose-300 hover:text-white hover:bg-rose-950 px-2 py-0.5 rounded"
          >
            Acknowledge Alert
          </button>
        </div>
      )}

      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-[var(--alert-height,0px)] z-30 gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/monitoring" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Monitor Center
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Active Room Control: Lab Exam CS201</h2>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Assigned Class: CSE 3rd Year • Evaluate: Prof. Sen</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Timer */}
          <div className="flex items-center gap-2 font-bold font-sans">
            <Timer className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500 uppercase text-[9px]">Time Remaining:</span>
            <span className="font-mono text-emerald-700 font-extrabold bg-slate-100 border border-slate-200 px-2 py-1 rounded">
              {timeLeft}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-200"></div>

          {/* Simulator Toggle */}
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-md font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 border ${
              isSimulating 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 animate-pulse" 
                : "bg-white border-slate-250 text-slate-500"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin" : ""}`} />
            {isSimulating ? "Live Feed: ON" : "Live Feed: OFF"}
          </button>
        </div>
      </header>

      {/* Statistics Gauges */}
      <section className="bg-white border-b border-slate-200 px-6 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Total Registered</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{students.length} Candidates</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Active Terminals</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> {activeCount} Online
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Code Submissions</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{submittedCount} Submitted</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Alerted Violations</span>
          <span className={`text-xl font-extrabold mt-1 block ${alertCount > 0 ? "text-rose-700 font-extrabold" : "text-slate-900"}`}>
            {alertCount} Warning flags
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Offline Nodes</span>
          <span className={`text-xl font-extrabold mt-1 block ${disconnectedCount > 0 ? "text-amber-700" : "text-slate-900"}`}>
            {disconnectedCount} Disconnected
          </span>
        </div>
      </section>

      {/* Main split dashboard layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-140px)] items-stretch">
        
        {/* LEFT COMPONENT: Live Map Grid/Table & Filters (col-span-8) */}
        <section className="col-span-12 lg:col-span-9 p-6 overflow-y-auto space-y-6 flex flex-col justify-between h-full border-r border-slate-200">
          
          {/* Filters & Toggles bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidates by Roll number or Name..."
                  className="w-full text-slate-900 border border-slate-250 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                />
              </div>

              {/* Layout view buttons */}
              <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 self-start shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-all flex items-center gap-1 ${
                    viewMode === "grid" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-400"
                  }`}
                  title="Grid Map layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded transition-all flex items-center gap-1 ${
                    viewMode === "table" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-400"
                  }`}
                  title="Table list layout"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Filter tags */}
            <div className="flex flex-wrap gap-3 pt-1 border-t border-slate-100/60">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[8px]">Section:</span>
                <select 
                  value={sectionFilter} 
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="border border-slate-200 bg-white rounded px-2 py-1 text-[10px] text-slate-800 outline-hidden"
                >
                  <option value="all">All Class Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[8px]">Status:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 bg-white rounded px-2 py-1 text-[10px] text-slate-800 outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active status</option>
                  <option value="Idle">Idle status</option>
                  <option value="Submitted">Submitted status</option>
                  <option value="Disconnected">Disconnected status</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase text-[8px]">Violations:</span>
                <select 
                  value={violationFilter} 
                  onChange={(e) => setViolationFilter(e.target.value)}
                  className="border border-slate-200 bg-white rounded px-2 py-1 text-[10px] text-slate-800 outline-hidden"
                >
                  <option value="all">All Levels</option>
                  <option value="clean">0 Warnings (Clean)</option>
                  <option value="warning">1-2 Warnings</option>
                  <option value="critical">3 Warnings (Suspended)</option>
                </select>
              </div>
            </div>

          </div>

          {/* VIEW: LIVE EXAM MAP (GRID) */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredStudents.map(student => {
                const isCritical = student.warningsCount >= 3;
                const isWarning = student.warningsCount > 0 && student.warningsCount < 3;
                const isOffline = student.status === "Disconnected";
                const isSub = student.status === "Submitted";

                let cardClass = "border-slate-200 hover:border-slate-350";
                if (isCritical) cardClass = "border-rose-300 bg-rose-50/10 shadow-rose-100/10";
                else if (isOffline) cardClass = "border-slate-200 opacity-60";
                else if (isWarning) cardClass = "border-amber-300 bg-amber-50/10";
                else if (isSub) cardClass = "border-emerald-300 bg-emerald-50/10";

                return (
                  <div 
                    key={student.roll}
                    onClick={() => setSelectedStudent(student)}
                    className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-xs relative ${cardClass}`}
                  >
                    {/* Top status indicator dots */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-slate-400 font-bold text-[9px] uppercase">
                        {student.roll} • Sec {student.section}
                      </span>
                      
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        isCritical ? "bg-rose-600 animate-pulse" :
                        isOffline ? "bg-slate-400" :
                        isWarning ? "bg-amber-500 animate-pulse" :
                        isSub ? "bg-emerald-600" :
                        "bg-emerald-500 animate-pulse"
                      }`}></span>
                    </div>

                    <h4 className="text-slate-900 font-bold text-xs">{student.name}</h4>
                    
                    <div className="space-y-1.5 mt-3 text-[10px] text-slate-600">
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>Current Task:</span>
                        <span className="font-semibold text-slate-900 font-sans">{student.currentQuestion}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>Warnings Count:</span>
                        <span className={`font-mono font-bold ${
                          isCritical ? "text-rose-700" : isWarning ? "text-amber-600" : "text-slate-400"
                        }`}>{student.warningsCount} / 3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress Solve:</span>
                        <span className="font-semibold text-slate-800">{student.submittedCount} of 3 problems</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: LIVE STUDENT TABLE */}
          {viewMode === "table" && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-200">
                      <th className="py-2.5 px-4">Roll</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Sec</th>
                      <th className="py-2.5 px-4">Current Question</th>
                      <th className="py-2.5 px-4 text-center">Attempted</th>
                      <th className="py-2.5 px-4 text-center">Submitted</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-center">Warnings</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredStudents.map(student => (
                      <tr key={student.roll} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{student.roll}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-950">{student.name}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-bold">{student.section}</td>
                        <td className="py-2.5 px-4 text-slate-700 font-sans">{student.currentQuestion}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold">{student.attemptedCount}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold">{student.submittedCount}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            student.status === "Active" ? "bg-emerald-50 text-emerald-800" :
                            student.status === "Idle" ? "bg-amber-50 text-amber-800" :
                            student.status === "Submitted" ? "bg-blue-50 text-blue-800" :
                            "bg-slate-100 text-slate-650"
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`font-mono font-bold ${
                            student.warningsCount >= 3 ? "text-rose-700" : student.warningsCount > 0 ? "text-amber-600" : "text-slate-400"
                          }`}>{student.warningsCount}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="text-slate-500 hover:text-slate-800 font-bold"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assessment Health Analytics Progress Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            
            {/* Question Progress bar graph chart mock */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <h4 className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider">Question Progress Distribution</h4>
              
              <div className="space-y-3 font-mono text-[9px] text-slate-650">
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>Q1: Invert Binary Tree</span>
                    <span>90% Solved</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>Q2: Validate BST</span>
                    <span>75% Solved</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>Q3: Dijkstra Shortest Path</span>
                    <span>40% Solved</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment health panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-2xs font-sans text-xs">
              <h4 className="font-extrabold text-slate-900 text-[10px] uppercase tracking-wider">Assessment Health Index</h4>
              
              <div className="space-y-2 pt-1">
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-500 font-semibold">Live System Network Ping:</span>
                  <span className="font-bold text-emerald-700 font-mono">12ms (Strong connection)</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-500 font-semibold">Average Submission Speed:</span>
                  <span className="font-bold text-slate-800 font-mono">72 mins / candidate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Database Queue Latency:</span>
                  <span className="font-bold text-slate-800 font-mono">0.05 seconds</span>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* RIGHT PANEL: REAL-TIME ACTIVITY LOGS FEED (col-span-4) */}
        <section className="col-span-12 lg:col-span-3 bg-white p-5 overflow-y-auto space-y-4 flex flex-col justify-between h-full">
          
          <div className="space-y-4 flex-1">
            <h3 className="font-extrabold text-slate-900 text-[10px] uppercase tracking-widest border-b border-slate-200 pb-2">
              Real-Time Proctor Surveillance logs
            </h3>

            {/* Event list */}
            <div className="space-y-3 font-mono text-[9px] leading-relaxed max-h-[450px] overflow-y-auto pr-1">
              {events.map(event => {
                let badgeClass = "text-slate-400";
                if (event.severity === "warning") badgeClass = "text-amber-600 font-bold";
                else if (event.severity === "critical") badgeClass = "text-rose-700 font-extrabold";

                return (
                  <div key={event.id} className="border-b border-slate-50 pb-2 flex gap-2 items-start relative pl-3">
                    <span className={`w-1.5 h-1.5 rounded-full absolute left-0 top-1.5 ${
                      event.severity === "warning" ? "bg-amber-500 animate-pulse" :
                      event.severity === "critical" ? "bg-rose-600 animate-pulse" :
                      "bg-slate-400"
                    }`}></span>
                    <div>
                      <p className="text-slate-400 font-bold mb-0.5">{event.time} • Roll {event.roll}</p>
                      <p className="text-slate-800 font-medium">{event.name}: <span className={badgeClass}>{event.event}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 border border-slate-950 rounded-lg text-[10px] space-y-1">
            <span className="font-extrabold text-slate-400 block uppercase text-[8px] tracking-wider">Surveillance Node status</span>
            <p className="font-bold">Socket Ticker Engine Enabled</p>
            <p className="text-slate-500 font-medium">Monitoring active LAN computer nodes on subnet range 192.168.12.0/24</p>
          </div>

        </section>

      </div>

      {/* STUDENT DETAIL DRAWER SIDE-PANEL */}
      {selectedStudent && (
        <div className="fixed inset-y-0 right-0 z-50 bg-slate-900/40 backdrop-blur-xs w-full sm:max-w-md bg-white border-l border-slate-200 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 text-xs">
          
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-slate-950 font-extrabold text-xs">{selectedStudent.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Gouthami Terminal Node • Roll: {selectedStudent.roll}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Student metadata */}
            <div className="space-y-3 font-sans">
              <h4 className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100 pb-1">Session Info</h4>
              <div className="space-y-2 leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Official Email:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStudent.roll.toLowerCase()}@gouthamitmw.edu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Terminal IP Node:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStudent.ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Section class:</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedStudent.dept} • {selectedStudent.year} (Sec {selectedStudent.section})</span>
                </div>
              </div>
            </div>

            {/* Live Progress */}
            <div className="space-y-3 font-sans pt-3 border-t border-slate-100">
              <h4 className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100 pb-1">Exam Progress</h4>
              <div className="space-y-2 leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Active Code Question:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.currentQuestion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Problems Solved weight:</span>
                  <span className="font-bold text-slate-900">{selectedStudent.submittedCount} of 3 problems</span>
                </div>
              </div>
            </div>

            {/* Warnings history log */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100 pb-1">Warning Logs ({selectedStudent.warningsCount})</h4>
              <div className="space-y-2 font-mono text-[9px] text-slate-650 max-h-[120px] overflow-y-auto">
                {selectedStudent.recentLogs.map((log, i) => (
                  <p key={i} className="border-b border-slate-50 pb-1 last:border-0">• {log}</p>
                ))}
              </div>
            </div>

            {/* Overrides actions */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider border-b border-slate-100 pb-1.5">Faculty Overrides Actions</h4>
              
              <div className="grid grid-cols-2 gap-2 font-sans font-bold">
                <button 
                  onClick={() => handleFacultyAction("warn")}
                  disabled={selectedStudent.warningsCount >= 3}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 p-2.5 rounded-lg text-left flex flex-col justify-between disabled:opacity-50"
                >
                  <span>Issue Warn Modal</span>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase">Sends dialog alert</span>
                </button>

                <button 
                  onClick={() => handleFacultyAction("lock")}
                  disabled={selectedStudent.warningsCount >= 3 || selectedStudent.currentQuestion === "Locked by Admin"}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 p-2.5 rounded-lg text-left flex flex-col justify-between disabled:opacity-50"
                >
                  <span>Lock Sandbox Session</span>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase">Blocks editor write</span>
                </button>

                <button 
                  onClick={() => handleFacultyAction("unlock")}
                  disabled={selectedStudent.currentQuestion !== "Locked by Admin"}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 p-2.5 rounded-lg text-left flex flex-col justify-between disabled:opacity-50"
                >
                  <span>Unlock Sandbox</span>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase">Restores writing</span>
                </button>

                <button 
                  onClick={() => handleFacultyAction("extend")}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 p-2.5 rounded-lg text-left flex flex-col justify-between"
                >
                  <span>Add +15 Mins Time</span>
                  <span className="text-[8px] text-slate-400 mt-1 uppercase">Extends timer limit</span>
                </button>

                <button 
                  onClick={() => handleFacultyAction("force-submit")}
                  disabled={selectedStudent.status === "Submitted"}
                  className="col-span-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-left flex flex-col justify-between disabled:opacity-50"
                >
                  <span>Force Submit Assessment solution</span>
                  <span className="text-[8px] text-rose-500 mt-0.5 uppercase font-medium">Evaluates current files & locks exam</span>
                </button>
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-slate-250 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-4 py-2 rounded-md"
            >
              Close inspector Panel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
