"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  loadStudents,
  saveStudents
} from "@/lib/storage";
import { 
  Users, 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Lock, 
  UserX, 
  Trash2, 
  Download, 
  ArrowLeft,
  X,
  FileSpreadsheet,
  CheckCircle,
  AlertOctagon,
  Clock,
  ArrowRight,
  BookOpen,
  Briefcase,
  AlertCircle
} from "lucide-react";
import EmptyState from "@/components/empty-state";

interface Student {
  id: string;
  roll: string;
  name: string;
  dept: string;
  year: string;
  section: string;
  email: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
}

interface Batch {
  id: string;
  dept: string;
  year: string;
  section: string;
}

export default function StudentManagement() {
  const router = useRouter();
  
  // UX State toggles
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Roster state
  const [students, setStudents] = useState<Student[]>([]);

  // Load roster on mount
  useEffect(() => {
    setStudents(loadStudents());
  }, []);

  // Batch management state
  const [batches, setBaches] = useState<Batch[]>([
    { id: "1", dept: "CSE", year: "3rd Year", section: "A" },
    { id: "2", dept: "CSE", year: "3rd Year", section: "B" },
    { id: "3", dept: "ECE", year: "2nd Year", section: "A" },
    { id: "4", dept: "EEE", year: "4th Year", section: "C" }
  ]);

  const [newBatch, setNewBatch] = useState({ dept: "CSE", year: "3rd Year", section: "" });

  // Add Batch
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.section) return;
    
    const added: Batch = {
      id: Date.now().toString(),
      dept: newBatch.dept,
      year: newBatch.year,
      section: newBatch.section.toUpperCase()
    };
    
    setBaches([...batches, added]);
    setNewBatch({ ...newBatch, section: "" });
  };

  // Actions
  const handleResetPassword = async (id: string, name: string) => {
    const tempPassword = `PSG@${id.slice(0, 5)}`;
    try {
      const res = await fetch("/api/student/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newPassword: tempPassword }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(`Password for ${name} has been reset to: ${tempPassword}`);
      } else {
        alert(`Failed to reset password: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reset password due to network error.");
    }
  };

  const handleToggleStatus = (id: string, current: string) => {
    const nextStatus = current === "Active" ? "Inactive" as const : "Active" as const;
    const updated = students.map(s => s.id === id ? { ...s, status: nextStatus } : s);
    setStudents(updated);
    saveStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveStudents(updated);
    setSelectedStudents(selectedStudents.filter(item => item !== id));
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(item => item !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // Bulk actions handlers
  const handleBulkReset = () => {
    alert(`Simulation: Reset password for ${selectedStudents.length} selected candidate accounts to default templates.`);
    setSelectedStudents([]);
  };

  const handleBulkDisable = () => {
    const updated = students.map(s => selectedStudents.includes(s.id) ? { ...s, status: "Inactive" as const } : s);
    setStudents(updated);
    saveStudents(updated);
    alert(`Simulation: Deactivated ${selectedStudents.length} selected candidate accounts.`);
    setSelectedStudents([]);
  };

  const handleBulkExport = () => {
    alert(`Simulation: Downloading spreadsheet records (.csv) for ${selectedStudents.length} selected students.`);
    setSelectedStudents([]);
  };

  // Filter application
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDept = filterDept === "all" || s.dept.toLowerCase() === filterDept.toLowerCase();
    const matchYear = filterYear === "all" || s.year.toLowerCase().includes(filterYear.toLowerCase());
    const matchSec = filterSection === "all" || s.section.toLowerCase() === filterSection.toLowerCase();
    const matchStatus = filterStatus === "all" || s.status.toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchDept && matchYear && matchSec && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Top Header navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/dashboard" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Student Roster Management</h2>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" /> Bulk Import
          </button>
          <Link 
            href="/faculty/students/create"
            className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring animate-pulse"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </Link>
        </div>
      </header>

      {/* Main Page Layout Wrapper */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6 flex-1">
        
        {students.length === 0 ? (
          <EmptyState
            title="No Candidates Registered"
            description="Your class rosters are empty. Register engineering students to allocate security sandbox access keys."
            secondaryDescription="Supports import from Excel spreadsheets or custom enrollment sheets."
            icon={Users}
            actionLabel="Add Student Profile"
            onAction={() => router.push("/faculty/students/create")}
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No Results Matched"
            description="No student profiles match the filter tags or search text parameters."
            secondaryDescription="Double check the search query and try again."
            icon={Search}
            actionLabel="Reset Filtration Settings"
            onAction={() => {
              setSearchQuery("");
              setFilterDept("all");
              setFilterYear("all");
              setFilterSection("all");
              setFilterStatus("all");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Main panel: Student search filters and roster table list */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Statistics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Total Students</p>
                  <p className="text-xl font-extrabold text-slate-950 mt-1">{students.length}</p>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Active Candidates</p>
                  <p className="text-xl font-extrabold text-emerald-800 mt-1">
                    {students.filter(s => s.status === "Active").length}
                  </p>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Exams Assigned</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">3 assessments</p>
                </div>
                <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs">
                  <p className="text-slate-400 font-bold uppercase text-[9px]">Assessments Completed</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">24 graded</p>
                </div>
              </div>

              {/* Roster Search Filters Box */}
              <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by name or roll number..."
                    className="w-full text-slate-900 border border-slate-200 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Dept filter */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase text-[9px]">Department</label>
                    <select 
                      value={filterDept} 
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="w-full text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-hidden"
                    >
                      <option value="all">All Depts</option>
                      <option value="cse">CSE</option>
                      <option value="ece">ECE</option>
                      <option value="eee">EEE</option>
                    </select>
                  </div>

                  {/* Year filter */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase text-[9px]">Academic Year</label>
                    <select 
                      value={filterYear} 
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-hidden"
                    >
                      <option value="all">All Years</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                  </div>

                  {/* Section filter */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase text-[9px]">Section</label>
                    <select 
                      value={filterSection} 
                      onChange={(e) => setFilterSection(e.target.value)}
                      className="w-full text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-hidden"
                    >
                      <option value="all">All Sections</option>
                      <option value="a">Sec A</option>
                      <option value="b">Sec B</option>
                      <option value="c">Sec C</option>
                    </select>
                  </div>

                  {/* Status filter */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-500 uppercase text-[9px]">Telemetry Status</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full text-slate-900 border border-slate-200 rounded px-2 py-1 bg-white focus:outline-hidden"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Roster list table */}
              {filteredStudents.length > 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden relative">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                          <th className="py-3 px-4 w-10">
                            <input 
                              type="checkbox"
                              checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5"
                            />
                          </th>
                          <th className="py-3 px-4">Roll Number</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Dept</th>
                          <th className="py-3 px-4 text-center">Year</th>
                          <th className="py-3 px-4 text-center">Sec</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Last Login</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredStudents.map((std) => (
                          <tr key={std.id} className={`hover:bg-slate-50/50 ${selectedStudents.includes(std.id) ? "bg-slate-50/80" : ""}`}>
                            <td className="py-3 px-4">
                              <input 
                                type="checkbox"
                                checked={selectedStudents.includes(std.id)}
                                onChange={() => toggleSelectStudent(std.id)}
                                className="rounded border-slate-300 text-navy-900 focus:ring-navy-900 w-3.5 h-3.5"
                              />
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{std.roll}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{std.name}</td>
                            <td className="py-3 px-4 text-slate-500 font-medium">{std.dept}</td>
                            <td className="py-3 px-4 text-center text-slate-650">{std.year}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-900">{std.section}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                std.status === "Active" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
                                std.status === "Inactive" ? "bg-slate-100 border border-slate-200 text-slate-600" :
                                "bg-rose-50 border border-rose-200 text-rose-800"
                              }`}>
                                {std.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{std.lastLogin}</td>
                            <td className="py-3 px-4 text-right space-x-1">
                              <Link 
                                href={`/faculty/students/${std.id}`}
                                className="text-slate-400 hover:text-slate-800 p-1 hover:bg-slate-55 rounded inline-block"
                                title="View profile stats"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button 
                                onClick={() => handleResetPassword(std.id, std.name)}
                                className="text-slate-400 hover:text-slate-850 p-1 hover:bg-slate-55 rounded"
                                title="Reset credentials"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(std.id, std.status)}
                                className="text-slate-400 hover:text-slate-850 p-1 hover:bg-slate-55 rounded"
                                title={std.status === "Active" ? "Deactivate" : "Activate"}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteStudent(std.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"
                                title="Delete roster slot"
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
                  title="No Search Results matches"
                  description="No registered student roll numbers match your active search terms or class selection dropdowns."
                  secondaryDescription="Clear the search query or filters to reload the full roster."
                  icon={Search}
                  actionLabel="Clear filtration settings"
                  onAction={() => {
                    setSearchQuery("");
                    setFilterDept("all");
                    setFilterYear("all");
                    setFilterSection("all");
                    setFilterStatus("all");
                  }}
                />
              )}

            </div>

            {/* Right panel: Batch management & bulk statistics */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Batch Management Widget */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Batch Management</h3>
                  <p className="text-slate-400 mt-0.5">Register custom department, year, and section cohorts.</p>
                </div>

                {/* List of active batches */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {batches.map(b => (
                    <div key={b.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded flex items-center justify-between text-slate-700">
                      <span className="font-bold text-slate-900">{b.dept} • {b.year}</span>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold">
                        SEC: {b.section}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Batch Inline Form */}
                <form onSubmit={handleAddBatch} className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase">Department</label>
                      <select 
                        value={newBatch.dept}
                        onChange={(e) => setNewBatch({ ...newBatch, dept: e.target.value })}
                        className="w-full border border-slate-250 rounded px-2 py-1 bg-white focus:outline-hidden"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase">Section</label>
                      <input 
                        type="text"
                        required
                        value={newBatch.section}
                        onChange={(e) => setNewBatch({ ...newBatch, section: e.target.value })}
                        placeholder="e.g. A"
                        className="w-full border border-slate-250 rounded px-2 py-1 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold py-1.5 rounded transition-all flex items-center justify-center gap-1 focus-ring"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Batch Cohort
                  </button>
                </form>
              </div>

              {/* Secure Subnet diagnostics summary */}
              <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-950 shadow-md space-y-3">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /> Host Security Audit
                </h4>
                <p className="text-[11px] text-slate-450 leading-relaxed">
                  All logged student credentials must run compilations within authorized LAN IP whitelist ranges.
                </p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[9px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>IP Range:</span>
                    <span className="text-slate-350">192.168.12.0/24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Whitelists:</span>
                    <span className="text-emerald-500 font-bold">Enabled</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}


      </main>

      {/* ========================================================================= */}
      {/* FLOATING BULK ACTIONS TOOLBAR */}
      {selectedStudents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-lg w-full px-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4 font-sans border-l-4 border-l-blue-500">
            <div className="shrink-0">
              <span className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] font-bold font-mono">
                {selectedStudents.length} Selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <button 
                onClick={() => setShowAssignModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded transition-all focus-ring"
              >
                Assign Exam
              </button>
              <button 
                onClick={handleBulkReset}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 transition-all focus-ring"
              >
                Reset Passwords
              </button>
              <button 
                onClick={handleBulkDisable}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 transition-all focus-ring"
              >
                Disable Accounts
              </button>
              <button 
                onClick={handleBulkExport}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 transition-all focus-ring flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SHEET 1: BULK IMPORT CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowImportModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-md w-full relative z-[101] overflow-hidden flex flex-col font-sans">
            
            <button 
              onClick={() => setShowImportModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 rounded"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-bold text-navy-800 tracking-wider uppercase">CSV Roster Importer</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Import Class Roster Spreadsheet</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Quickly register student accounts by uploading a CSV spreadsheet containing names and roll numbers.
              </p>

              {/* Dropzone mockup */}
              <div 
                onClick={() => alert("Simulation: Parsing roster file. Previews matched: 5 students, 0 duplicates, 0 validation errors.")}
                className="border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
              >
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mb-2" />
                <p className="font-bold text-slate-700 text-xs">Drag and drop your roster file (.csv / .xlsx) here</p>
                <p className="text-[10px] text-slate-400 mt-1">or click to browse local folders</p>
              </div>

              {/* Template details */}
              <div className="bg-slate-50 p-3 rounded border border-slate-150 space-y-1.5 text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider">Required CSV Columns:</p>
                <p className="font-mono text-slate-500">
                  Roll Number, Student Name, Email, Department, Year, Section
                </p>
                <button 
                  onClick={() => alert("Simulation: Downloading CSV Template.")}
                  className="text-navy-900 font-bold hover:underline block pt-1"
                >
                  Download CSV Template Schema (.csv)
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Simulation: Imported class roster. 5 students registered.");
                  setShowImportModal(false);
                }}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-md font-bold"
              >
                Process & Load Roster
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SHEET 2: ASSIGN ASSESSMENT */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"></div>
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-w-sm w-full relative z-[101] overflow-hidden flex flex-col font-sans">
            
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
              <span className="text-[10px] font-bold text-navy-800 tracking-wider uppercase">Exam Scheduler</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Assign Assessment to Selection</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-[11px] text-blue-900">
                You are assigning an assessment to <span className="font-bold">{selectedStudents.length} candidates</span>.
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 font-sans text-xs">Select Programming Exam</label>
                <select className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900 text-xs">
                  <option>CS201: Data Structures Practical Exam</option>
                  <option>IT305: Object Oriented Programming Final</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Simulation: Scheduled CS201 for ${selectedStudents.length} students.`);
                  setShowAssignModal(false);
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-md font-bold"
              >
                Assign & Sync Nodes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
