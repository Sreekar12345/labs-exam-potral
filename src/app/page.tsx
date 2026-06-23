"use client";

import React, { useState } from "react";
import { 
  Shield, 
  Cpu, 
  Database, 
  Activity, 
  BarChart3, 
  ArrowRight, 
  Users, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  FolderOpen,
  Laptop,
  BookOpen,
  Award,
  Lock,
  FileText,
  UserCheck,
  TrendingUp,
  Mail,
  ChevronRight,
  ClipboardList
} from "lucide-react";

import Navigation from "@/components/navigation";
import StudentExperienceMockup from "@/components/student-experience-mockup";
import FAQAccordion from "@/components/faq-accordion";
import DemoModal from "@/components/demo-modal";

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans flex flex-col">
      {/* Navbar */}
      <Navigation onRequestDemo={openDemoModal} />

      {/* Main Page Layout */}
      <main className="flex-1 pt-16">
        
        {/* SECTION 1: HERO */}
        <section className="bg-slate-50/50 border-b border-slate-200/60 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 border border-navy-100 text-navy-800 text-[10px] font-bold tracking-wider uppercase mx-auto">
              <Shield className="w-3.5 h-3.5" /> Secure Academic Assessment Node
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
              Conduct Secure Programming Assessments with Confidence
            </h1>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Create, manage, monitor, and evaluate coding examinations from a single platform. Built specifically for practical lab tests, course evaluations, and secure academic assessments.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto">
              <a 
                href="/student/login"
                className="w-full sm:w-auto bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs px-6 py-3 rounded-md transition-all shadow-xs focus-ring text-center flex items-center justify-center gap-1.5"
              >
                Student Access <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a 
                href="/faculty/login"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs px-6 py-3 rounded-md transition-all focus-ring text-center flex items-center justify-center gap-1.5"
              >
                Faculty Portal
              </a>
            </div>
            <div className="pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
              <div>
                <p className="text-2xl font-bold text-slate-950">100%</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Exam Lockdown</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950">1.4s</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Evaluation Latency</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-950">AI-Proctored</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase">Security Monitored</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: KEY CHALLENGES */}
        <section id="challenges" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Academic Pain Points</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Key Challenges Faced by Institutions
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Traditional programming assessments and manual paper-to-compiler evaluation workflows create operational bottlenecks for departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Challenge 1 */}
              <div className="academic-card flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                    <Clock className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Manual Lab Evaluations</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Faculty spend hours running individual submissions, checking test cases, and copy-pasting code to verify student work, delaying results.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] font-bold text-rose-700">
                  Wastes 12-16 hrs per faculty / week
                </div>
              </div>

              {/* Challenge 2 */}
              <div className="academic-card flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                    <AlertOctagon className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Academic Malpractice</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Students easily bypass supervision by toggling tabs, searching online, accessing local files, or copy-pasting answers from neighbors.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] font-bold text-rose-700">
                  Compromises examination integrity
                </div>
              </div>

              {/* Challenge 3 */}
              <div className="academic-card flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                    <FolderOpen className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Fragmented Process</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Lab syllabi, question papers, code files, and grade sheets are scattered across local folders, emails, and LMS platforms.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] font-bold text-rose-700">
                  Inconsistent audit readiness
                </div>
              </div>

              {/* Challenge 4 */}
              <div className="academic-card flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                    <BarChart3 className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Lack of Performance Insights</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Institutions struggle to aggregate data to identify logic gaps, student skill weaknesses, and map course outcomes for compliance.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 text-[10px] font-bold text-rose-700">
                  Impairs curriculum improvement
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW THE PLATFORM WORKS */}
        <section id="workflow" className="py-20 bg-slate-50/60 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Chronological Workflow</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                How the Platform Works
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                A streamlined workflow designed to replicate traditional academic lab examination cycles from setup to reporting.
              </p>
            </div>

            {/* Timeline for Desktop */}
            <div className="hidden lg:grid grid-cols-5 gap-6 relative">
              {/* Horizontal Connecting Line */}
              <div className="absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-slate-200 -z-10"></div>

              {/* Step 1 */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xs font-mono font-bold text-sm text-slate-900 relative">
                  01
                  <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-1 border border-white">
                    <FileText className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Create Assessment</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Configure question sheets, set visible/hidden test cases, select compiler runtimes, and lock exam duration parameters.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xs font-mono font-bold text-sm text-slate-900 relative">
                  02
                  <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-1 border border-white">
                    <Users className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Assign Students</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Import student rosters by batch, department, or IP subnets. Send secure, single-use exam access keys automatically.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xs font-mono font-bold text-sm text-slate-900 relative">
                  03
                  <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-1 border border-white">
                    <Laptop className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Students Take Exam</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Candidates log in to a restricted sandbox IDE. Screen is locked in fullscreen, disabling external tabs and navigation.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xs font-mono font-bold text-sm text-slate-900 relative">
                  04
                  <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-1 border border-white">
                    <Cpu className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Automatic Evaluation</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Our compiler tests submissions instantly against visible and hidden scripts, grading according to partial rubric weights.
                </p>
              </div>

              {/* Step 5 */}
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto shadow-xs font-mono font-bold text-sm text-slate-900 relative">
                  05
                  <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-1 border border-white">
                    <BarChart3 className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Generate Reports</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Faculty download student scorecard portfolios, proctor violation audits, and NAAC mapping reports instantly.
                </p>
              </div>
            </div>

            {/* Vertical timeline for Mobile/Tablet */}
            <div className="lg:hidden space-y-8 max-w-md mx-auto">
              {[
                { step: "01", title: "Create Assessment", desc: "Configure question sheets, set visible/hidden test cases, select compiler runtimes, and lock exam duration parameters.", icon: <FileText className="w-4 h-4" /> },
                { step: "02", title: "Assign Students", desc: "Import student rosters by batch, department, or IP subnets. Send secure, single-use exam access keys automatically.", icon: <Users className="w-4 h-4" /> },
                { step: "03", title: "Students Take Exam", desc: "Candidates log in to a restricted sandbox IDE. Screen is locked in fullscreen, disabling external tabs and navigation.", icon: <Laptop className="w-4 h-4" /> },
                { step: "04", title: "Automatic Evaluation", desc: "Our compiler tests submissions instantly against visible and hidden scripts, grading according to partial rubric weights.", icon: <Cpu className="w-4 h-4" /> },
                { step: "05", title: "Generate Reports", desc: "Faculty download student scorecard portfolios, proctor violation audits, and NAAC mapping reports instantly.", icon: <BarChart3 className="w-4 h-4" /> }
              ].map((item, index) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shrink-0 shadow-xs font-mono font-bold text-xs text-slate-900 relative">
                    {item.step}
                    <span className="absolute -bottom-1 -right-1 bg-navy-900 text-white rounded-full p-0.5 border border-white">
                      {item.icon}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* SECTION 4: CORE FEATURES */}
        <section id="features" className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">System Specifications</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Designed to Replicate Academic Examinations
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Robust, secure, and compliance-aligned capabilities built specifically for engineering and science colleges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="academic-card space-y-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                  <Lock className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Secure Assessment Environment</h3>
                <ul className="space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Fullscreen enforcement blocks exit attempts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Single session active session limit
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Copy-paste actions disabled completely
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Logs tab navigation warning occurrences
                  </li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="academic-card space-y-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                  <Cpu className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Programming Assessment Engine</h3>
                <ul className="space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Multi-language support (C, C++, Java, Py)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Code Editor sandbox workspace
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Automatic compile & test execution
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Hidden grading test cases verification
                  </li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="academic-card space-y-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                  <Database className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Reusable Question Bank</h3>
                <ul className="space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Central departmental question repository
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Categorization by Subject and Unit
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Tag by difficulty (Easy, Med, Hard)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Reusable templates for practical sheets
                  </li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="academic-card space-y-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                  <Activity className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Faculty Live Monitoring</h3>
                <ul className="space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Real-time active student status panel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Running logs of telemetry warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Warning and termination control panel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Interactive filter by batch and roll
                  </li>
                </ul>
              </div>

              {/* Feature 5 */}
              <div className="academic-card space-y-4">
                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800">
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Analytics & OBE Reports</h3>
                <ul className="space-y-2 text-xs text-slate-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Student performance sheets export
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Question failure frequency charts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> NBA/NAAC Course Outcome (CO) mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-navy-800"></span> Secure PDF / CSV exports
                  </li>
                </ul>
              </div>

              {/* Feature 6: Special Academic Highlight */}
              <div className="bg-navy-950 text-white rounded-lg p-6 flex flex-col justify-between border border-slate-900 shadow-md">
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-navy-200 uppercase tracking-widest">IT Infrastructure</span>
                  <h3 className="font-bold text-sm text-white">Subnet & LAN Friendly Deployment</h3>
                  <p className="text-[11px] text-navy-200/80 leading-relaxed">
                    Designed to function within college intranet environments. Integrate with local lab DNS systems to limit access solely to physical terminals in the college computers lab.
                  </p>
                </div>
                <button 
                  onClick={openDemoModal}
                  className="mt-6 text-xs font-bold text-white flex items-center gap-1.5 group hover:text-navy-100"
                >
                  Request Architecture Document <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </section>



        {/* SECTION 6: STUDENT EXPERIENCE */}
        <section id="experience" className="py-20 bg-slate-950 text-white border-b border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-200 tracking-widest uppercase">Candidate Workspace</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Integrity-First Student Assessment Experience
              </h2>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                A highly restricted, lightweight browser IDE that isolates candidate execution while preventing cheating.
              </p>
            </div>

            <div className="space-y-8">
              {/* Highlight Details */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Restricted Sandbox</p>
                  <p className="text-xs text-slate-200 font-bold mt-1">Copy-paste locked, right-click and keyboard combinations disabled.</p>
                </div>
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Question Navigator</p>
                  <p className="text-xs text-slate-200 font-bold mt-1">Easy navigation with timers, limits, and submission rules.</p>
                </div>
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Offline Resilience</p>
                  <p className="text-xs text-slate-200 font-bold mt-1">Auto-saves code draft in local cache to protect against power failure.</p>
                </div>
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Output Console</p>
                  <p className="text-xs text-slate-200 font-bold mt-1">Compile log messages showing visible case pass/fail feedback.</p>
                </div>
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-lg col-span-2 md:col-span-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Automatic Submission</p>
                  <p className="text-xs text-slate-200 font-bold mt-1">Submits active code automatically when the timer reaches 00:00.</p>
                </div>
              </div>

              {/* Student Experience Editor Mockup */}
              <StudentExperienceMockup />
            </div>

          </div>
        </section>

        {/* SECTION 7: INSTITUTION BENEFITS */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Accreditations & Value</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Stakeholder Benefits
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Helping colleges elevate practical education quality while satisfying regulatory reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* For Faculty */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-5">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 shadow-xs">
                  <UserCheck className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">For Faculty Members</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Eliminate manual compilations. Spend less time checking standard code syntax and more time on high-level logic review and project guidance.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 font-semibold border-t border-slate-200/60 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Saves 80% evaluation time
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Centralized lab records database
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Precise proctor logs verify integrity
                  </li>
                </ul>
              </div>

              {/* For Students */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-5">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 shadow-xs">
                  <GraduationCap className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">For Engineering Students</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Take assessments in a standard, sandbox editor. Get instant feedback on compiler syntax and visual test cases for better learning outcomes.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 font-semibold border-t border-slate-200/60 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Fair, secure exam environments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Real compiler feedback in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Auto-save eliminates data loss risk
                  </li>
                </ul>
              </div>

              {/* For Institutions */}
              <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-5">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-900 shadow-xs">
                  <Award className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">For Institutions & HODs</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Standardize testing rubrics across lab cycles. Access quantitative reports and skill analysis maps required for NAAC/NBA criteria documentation.
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 font-semibold border-t border-slate-200/60 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Standardized departmental testing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Outcome Mapping data readiness
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Centralized lab compliance logs
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 8: REPORTS & ANALYTICS SHOWCASE */}
        <section id="analytics" className="py-20 bg-slate-50/50 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Reports Copy */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Audit & Compliance</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                  Detailed Reporting & Outcome Assessment
                </h2>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Download structured, PDF exports for each student and exam. Map scores to curriculum criteria, track proctor violations, and perform skill gap analysis effortlessly.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                    <p className="font-bold text-slate-950 text-xs">Student Scorecard</p>
                    <p className="text-[10px] text-slate-500 mt-1">Detailed case splits, compiler outputs, and warning logs.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                    <p className="font-bold text-slate-950 text-xs">Syllabus Mapping</p>
                    <p className="text-[10px] text-slate-500 mt-1">Aggregated scoring data mapped against lab outcomes.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                    <p className="font-bold text-slate-950 text-xs">Malpractice Summary</p>
                    <p className="text-[10px] text-slate-500 mt-1">A timestamped list of proctor incidents per candidate.</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                    <p className="font-bold text-slate-950 text-xs">Departmental Trends</p>
                    <p className="text-[10px] text-slate-500 mt-1">Section-wise and batch-wise performance metrics.</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={openDemoModal}
                    className="text-xs font-bold text-navy-900 flex items-center gap-1.5 group hover:text-navy-950"
                  >
                    View Sample Report PDF <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Reports Mockup Box */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden font-sans text-xs">
                  {/* Mock Report Header */}
                  <div className="bg-slate-900 px-6 py-4 text-white border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Assessment Score Report</h4>
                      <h3 className="font-extrabold text-xs mt-0.5">CS201: DATA STRUCTURES PRACTICAL EXAM</h3>
                    </div>
                    <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono">
                      CODE: 2026_DS_A
                    </span>
                  </div>

                  {/* Student Metadata */}
                  <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 font-medium">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Candidate Name</p>
                      <p className="text-slate-900 font-bold mt-0.5">Aditya Verma</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Roll Number</p>
                      <p className="text-slate-900 font-mono font-bold mt-0.5">22CSE102</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assigned Batch</p>
                      <p className="text-slate-900 font-bold mt-0.5">CSE - Section A</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Evaluation Grade</p>
                      <p className="text-emerald-700 font-bold mt-0.5">9.0 / 10.0 (A+)</p>
                    </div>
                  </div>

                  {/* Report Details Body */}
                  <div className="p-6 space-y-4">
                    {/* Rubric splits table */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase py-2 px-3 border-b border-slate-200">
                        <div className="col-span-6">Evaluation Criteria</div>
                        <div className="col-span-3 text-center">Cases Passed</div>
                        <div className="col-span-3 text-right">Score Earned</div>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        <div className="grid grid-cols-12 py-2.5 px-3 text-[11px]">
                          <div className="col-span-6 font-semibold text-slate-800">Q1: Reverse Elements in Singly Linked List</div>
                          <div className="col-span-3 text-center font-mono">5 / 5 passed</div>
                          <div className="col-span-3 text-right font-mono font-bold text-slate-900">3.0 / 3.0</div>
                        </div>
                        <div className="grid grid-cols-12 py-2.5 px-3 text-[11px]">
                          <div className="col-span-6 font-semibold text-slate-800">Q2: Merge Two Sorted Lists (In-place)</div>
                          <div className="col-span-3 text-center font-mono">5 / 5 passed</div>
                          <div className="col-span-3 text-right font-mono font-bold text-slate-900">4.0 / 4.0</div>
                        </div>
                        <div className="grid grid-cols-12 py-2.5 px-3 text-[11px]">
                          <div className="col-span-6 font-semibold text-slate-800">Q3: Invert a Binary Tree (Iterative Solution)</div>
                          <div className="col-span-3 text-center font-mono text-amber-600 font-bold">4 / 5 passed</div>
                          <div className="col-span-3 text-right font-mono font-bold text-slate-900">2.0 / 3.0</div>
                        </div>
                      </div>
                    </div>

                    {/* Skill radar feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="border border-slate-200 p-3 rounded-lg">
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wide">Syllabus Skill Gaps mapping</p>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                              <span>Linked Lists Logic</span>
                              <span>100%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full" style={{ width: "100%" }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                              <span>Binary Trees Traversal</span>
                              <span>66%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: "66%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 p-3 rounded-lg space-y-2">
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wide">Proctor Telemetry Integrity</p>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-600">Tab Focus Warnings:</span>
                          <span className="font-bold text-slate-900 font-mono">0 warnings</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">Clipboard Blocks:</span>
                          <span className="font-bold text-slate-900 font-mono">0 actions blocked</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">Proctor Score:</span>
                          <span className="font-bold text-emerald-700">100% Compliance</span>
                        </div>
                      </div>
                    </div>

                    {/* PDF signatory */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>VERIFIED HASH: SHA-256_A78E99B20F</span>
                      <span>PSG_CSE_EXAMNODE_SIGNATURE</span>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 9: TESTIMONIALS */}
        <section className="py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Trusted by Educators</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Feedback from Academic Leaders
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                See how computer science departments are improving lab operations and student evaluations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Testimonial 1 */}
              <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-5 flex flex-col justify-between">
                <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed">
                  "Evaluating 180 student code submissions manually for our Data Structures lab used to take our faculty nearly two days. With this platform, the code is run against test suites instantly during the lab itself. It has saved us hundreds of manual hours every semester."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-slate-100 text-navy-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">
                    DK
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Dr. K. Krishnan</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Head of Department, CSE • SRM Institute</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-5 flex flex-col justify-between">
                <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed">
                  "Academic integrity during lab exams was our biggest worry. The fullscreen enforcement lock and copy-paste block have solved this completely. The proctor warning system is so robust that tab-switching attempts have dropped to zero."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-slate-100 text-navy-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">
                    SR
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Prof. S. Ranganathan</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Dean Academics • RV College of Engineering</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-5 flex flex-col justify-between">
                <p className="text-xs md:text-sm text-slate-600 italic leading-relaxed">
                  "NAAC and NBA accreditation audits require detailed reports mapping programming skills to course outcomes. This platform’s Outcome-Based Education reports aggregate student scores and skill graphs automatically, making audit preparation effortless."
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="bg-slate-100 text-navy-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">
                    MN
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Dr. Meera Nair</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Lab Director, IT • Amrita Vishwa Vidyapeetham</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 10: FAQ */}
        <section id="faq" className="py-20 bg-slate-50/60 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold text-navy-800 tracking-widest uppercase">Support & Setup</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Everything you need to know about setting up and deploying the secure programming sandbox at your college.
              </p>
            </div>

            <FAQAccordion />
          </div>
        </section>

        {/* SECTION 11: FINAL CTA */}
        <section className="py-20 bg-navy-950 text-white relative overflow-hidden">
          {/* Subtle grid background pattern placeholder */}
          <div className="absolute inset-0 bg-slate-900/10 opacity-30 -z-10"></div>
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-[10px] font-bold text-navy-200 tracking-widest uppercase font-mono">Get Started</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-3xl mx-auto">
              Transform the Way Your Institution Conducts Programming Assessments
            </h2>
            <p className="text-xs sm:text-sm text-slate-350 leading-relaxed max-w-xl mx-auto">
              Streamline assessments, improve evaluation accuracy, and gain actionable performance insights. Set up a secure, department-wide trial sandbox node today.
            </p>
            
            <div className="flex justify-center pt-4 max-w-xs mx-auto w-full">
              <button 
                onClick={openDemoModal}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-6 py-3 rounded-md transition-all shadow-xs focus-ring text-center"
              >
                Contact Sales
              </button>
            </div>
            
            <div className="pt-8 text-slate-500 text-[10px] flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                No setup fee
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                On-premise subnet support
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* SECTION 12: FOOTER */}
      <footer className="bg-white border-t border-slate-200 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase leading-none block">ExamCoder</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none block mt-0.5">Secure Sandbox</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
                A world-class secure coding assessment environment built specifically for universities and engineering colleges to evaluate practical examinations.
              </p>
            </div>

            {/* Column 2: Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Platform</h4>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li><a href="#features" className="hover:text-slate-800 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">Pricing Plans</a></li>
                <li><a href="#experience" className="hover:text-slate-800 transition-colors">Student Experience</a></li>
                <li><a href="#analytics" className="hover:text-slate-800 transition-colors">Outcome Analytics</a></li>
              </ul>
            </div>

            {/* Column 3: Institutions */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Institutions</h4>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">SRM Institute</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">RV College of Engineering</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">PSG Tech</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">Amrita Vishwa Vidyapeetham</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Contact & Legal</h4>
              <ul className="space-y-2 text-[11px] text-slate-500">
                <li><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> solutions@examcoder.edu</span></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-800 transition-colors cursor-not-allowed">SLA Agreement</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[10px]">
            <p>© {new Date().getFullYear()} ExamCoder. All rights reserved. Built for NAAC/NBA accredited institutions.</p>
            <p className="flex items-center gap-1.5 mt-2 sm:mt-0 font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-300" /> ISO 27001 Certified • TLS 1.3 Secure
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={closeDemoModal} />
    </div>
  );
}
