"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Download,
  Mail,
  Phone,
  BookOpen
} from "lucide-react";
import { loadStudents, saveStudents } from "@/lib/storage";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface AssessmentHistory {
  id: string;
  name: string;
  score: string;
  date: string;
  status: "Pass" | "Fail" | "Absent";
  timeTaken: string;
}

export default function StudentProfile({ params }: PageProps) {
  // Resolve params promise according to LAB EXAM App Router standards
  const { id } = use(params);

  // Dynamic Student details State
  const [studentData, setStudentData] = useState({
    id: "1",
    roll: id || "Loading...",
    name: "Loading...",
    dept: "...",
    year: "...",
    section: "...",
    email: "...",
    phone: "+91 98765 43210",
    status: "Active" as "Active" | "Inactive" | "Suspended",
    lastLogin: "Never",
    avgScore: "8.8 / 10",
    highestScore: "10.0 / 10",
    lowestScore: "7.0 / 10",
    completionRate: "100%",
    attemptedCount: 8
  });

  useEffect(() => {
    const studentsList = loadStudents();
    const found = studentsList.find(s => s.roll === id || s.id === id);
    if (found) {
      setStudentData({
        id: found.id,
        roll: found.roll,
        name: found.name,
        dept: found.dept || "CSE",
        year: found.year || "3rd Year",
        section: found.section || "A",
        email: found.email,
        phone: "+91 98765 43210",
        status: (found.status === "Active" || found.status === "Inactive" || found.status === "Suspended") ? found.status : "Active",
        lastLogin: found.lastLogin || "Never",
        avgScore: found.status === "Suspended" ? "2.0 / 10" : "8.8 / 10",
        highestScore: found.status === "Suspended" ? "5.0 / 10" : "10.0 / 10",
        lowestScore: "7.0 / 10",
        completionRate: found.status === "Suspended" ? "25%" : "100%",
        attemptedCount: found.status === "Suspended" ? 2 : 8
      });
    }
  }, [id]);

  const examHistory: AssessmentHistory[] = [
    { id: "1", name: "CS201 Data Structures Lab Final Exam", score: "9.0 / 10.0", date: "2026-06-17", status: "Pass", timeTaken: "112 mins" },
    { id: "2", name: "CS304 Design & Analysis of Algorithms", score: "8.5 / 10.0", date: "2026-06-15", status: "Pass", timeTaken: "145 mins" },
    { id: "3", name: "CS203 Database Management Systems Midsem", score: "7.0 / 10.0", date: "2026-06-12", status: "Pass", timeTaken: "84 mins" },
    { id: "4", name: "IT202 Python Foundations Lab Test", score: "10.0 / 10.0", date: "2026-05-28", status: "Pass", timeTaken: "42 mins" },
    { id: "5", name: "CS102 Object Oriented Programming Internal", score: "9.5 / 10.0", date: "2026-04-10", status: "Pass", timeTaken: "65 mins" }
  ];

  const recentActivity = [
    { time: "11:42 AM", event: `Successfully compiled Q3 (Invert Binary Tree) on Node-3 [OK] for ${studentData.name}`, type: "compile" },
    { time: "10:42 AM", event: "Logged in from Computer Lab 1, Terminal IP 192.168.12.104", type: "system" },
    { time: "June 15, 01:22 PM", event: "Submitted CS304 Solutions (All hidden cases verified)", type: "submission" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/students" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Roster
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Student Academic File</h2>
        </div>

        <Link 
          href={`/faculty/reports/student-scorecard/${studentData.roll}/5`}
          className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
        >
          <Download className="w-3.5 h-3.5" /> Export Scorecard Dossier
        </Link>
      </header>

      {/* Main content grid */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
        
        {/* Top Split details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Personal credentials & Account Status controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Student info card */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {studentData.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{studentData.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Roll: {studentData.roll}</p>
                </div>
              </div>

              {/* Grid details */}
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Department:</span>
                  <span className="font-bold text-slate-900">{studentData.dept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Year & Sec:</span>
                  <span className="font-bold text-slate-900">{studentData.year} • Sec {studentData.section}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Official Email:</span>
                  <span className="font-bold text-slate-900 font-mono">{studentData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Contact:</span>
                  <span className="font-bold text-slate-900">{studentData.phone}</span>
                </div>
              </div>

              {/* Status control */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="block font-bold text-slate-500 uppercase text-[9px] tracking-wider">Account Telemetry Controls</span>
                <div className="flex gap-2">
                  <select 
                    value={studentData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as "Active" | "Inactive" | "Suspended";
                      const studentsList = loadStudents();
                      const updated = studentsList.map(s => (s.id === studentData.id || s.roll === studentData.roll) ? { ...s, status: newStatus } : s);
                      saveStudents(updated);
                      setStudentData(prev => ({ ...prev, status: newStatus }));
                    }}
                    className="flex-1 text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-hidden"
                  >
                    <option value="Active">Active status</option>
                    <option value="Inactive">Inactive status</option>
                    <option value="Suspended">Suspended status</option>
                  </select>
                  <button 
                    onClick={async () => {
                      const tempPassword = `PSG@${studentData.id.slice(0, 5)}`;
                      try {
                        const res = await fetch("/api/student/reset-password", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: studentData.id, newPassword: tempPassword }),
                        });
                        const data = await res.json();
                        if (data.status === "success") {
                          alert(`Password for ${studentData.name} has been reset to: ${tempPassword}`);
                        } else {
                          alert(`Failed to reset password: ${data.message}`);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Failed to reset password due to network error.");
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold px-3 py-1 rounded"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Overview widget */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <h4 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <TrendingUp className="w-4 h-4 text-slate-500" /> Performance Overview
              </h4>

              <div className="grid grid-cols-2 gap-3 font-sans text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span className="text-slate-400 font-semibold block text-[9px]">Average Score</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">{studentData.avgScore}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span className="text-slate-400 font-semibold block text-[9px]">Highest Grade</span>
                  <span className="text-emerald-700 font-bold text-sm mt-0.5 block">{studentData.highestScore}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span className="text-slate-400 font-semibold block text-[9px]">Completion Rate</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">{studentData.completionRate}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span className="text-slate-400 font-semibold block text-[9px]">Attempted Exams</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">{studentData.attemptedCount} slots</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Assessment history & recent activity logs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Assessment History table */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-250 bg-white">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Historical Assessment Results</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Assessment Name</th>
                      <th className="py-3 px-4">Submission Date</th>
                      <th className="py-3 px-4">Completion Time</th>
                      <th className="py-3 px-4 text-center">Outcome</th>
                      <th className="py-3 px-4 text-right">Score Earned</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {examHistory.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{ex.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{ex.date}</td>
                        <td className="py-3 px-4 text-slate-650 font-mono">{ex.timeTaken}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ex.status === "Pass" 
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                              : "bg-rose-50 border border-rose-200 text-rose-800"
                          }`}>
                            {ex.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{ex.score}</td>
                        <td className="py-3 px-4 text-right">
                          <Link 
                            href={`/faculty/reports/student-scorecard/${studentData.roll}/${ex.id}`}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                          >
                            Scorecard
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent activity surveillance logs */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Surveillance & Compilation Telemetry Logs</h4>
              
              <div className="space-y-3 font-mono text-[10px]">
                {recentActivity.map((act, index) => (
                  <div key={index} className="flex gap-4 items-start border-l border-slate-200 pl-3 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 absolute left-[-4px] top-1.5"></span>
                    <span className="text-slate-400 font-bold shrink-0">{act.time}</span>
                    <p className="text-slate-600 leading-normal">{act.event}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
