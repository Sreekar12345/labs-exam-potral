"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle, 
  Calendar, 
  Download, 
  BookOpen, 
  Clock, 
  Database, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  BarChart3, 
  HelpCircle, 
  Activity, 
  FileSpreadsheet, 
  Layers,
  ChevronDown
} from "lucide-react";
import { loadStudents, loadAssessments, loadQuestions } from "@/lib/storage";

interface AnalyticsDashboardViewProps {
  initialRole?: "Faculty" | "HOD" | "Principal" | "Admin";
  isStandalone?: boolean;
}

export default function AnalyticsDashboardView({ 
  initialRole = "HOD",
  isStandalone = false 
}: AnalyticsDashboardViewProps) {
  // Roles list
  const roles = ["Faculty", "HOD", "Principal", "Admin"] as const;
  const [currentRole, setCurrentRole] = useState<typeof roles[number]>("Faculty");

  // States
  const [timeRange, setTimeRange] = useState<"Weekly" | "Monthly" | "Semester" | "Yearly">("Semester");
  const [deptFilter, setDeptFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [assessmentFilter, setAssessmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");



  // Tab state
  const [activeSubTab, setActiveSubTab] = useState<"trends" | "students" | "topics" | "cohorts" | "leaderboard">("trends");

  // Data states from storage
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allAssessments, setAllAssessments] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);

  useEffect(() => {
    setAllStudents(loadStudents());
    setAllAssessments(loadAssessments());
    setAllQuestions(loadQuestions());
  }, []);

  const isEmptyState = allStudents.length === 0 || allAssessments.length === 0;
  const emptyStateType = allStudents.length === 0 ? "NoStudents" : allAssessments.length === 0 ? "NoAssessments" : "NoAnalytics";

  // Sync role selector adjustments
  const handleRoleChange = (role: typeof roles[number]) => {
    setCurrentRole(role);
    // Adjust filters based on role constraints
    if (role === "Faculty") {
      setDeptFilter("CSE");
      setSectionFilter("A");
    } else if (role === "HOD") {
      setDeptFilter("CSE");
      setSectionFilter("all");
    } else {
      setDeptFilter("all");
      setSectionFilter("all");
    }
  };

  // Dynamic student virtual score function
  const getStudentVirtualScore = (s: any) => {
    if (s.status === "Suspended") return 24;
    const hash = s.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return 65 + (hash % 31); // scores between 65 and 95
  };

  // Dynamic values using useMemo
  const topicData = React.useMemo(() => {
    if (!allQuestions.length) return [];
    return Array.from(new Set(allQuestions.map(q => q.topic || "General"))).map((topic, idx) => {
      const topicQuestions = allQuestions.filter(q => (q.topic || "General") === topic);
      const avgSuccessRate = Math.round(topicQuestions.reduce((acc, q) => acc + (parseInt(q.successRate) || 75), 0) / (topicQuestions.length || 1));
      return {
        name: topic,
        attempts: topicQuestions.reduce((acc, q) => acc + (q.timesUsed || 10), 0) || 50,
        successRate: avgSuccessRate,
        avgScore: Math.round((avgSuccessRate / 10) * 10) / 10,
        difficultyScore: idx + 3
      };
    });
  }, [allQuestions]);

  const atRiskStudents = React.useMemo(() => {
    if (!allStudents.length) return [];
    return allStudents.map(s => {
      const score = getStudentVirtualScore(s);
      const participation = s.status === "Suspended" ? 30 : 60 + (s.name.length * 3) % 40;
      const riskLevel = score < 60 ? "High" : score < 75 ? "Medium" : "Low";
      return {
        name: s.name,
        roll: s.roll,
        dept: s.dept || "CSE",
        score: score,
        failed: s.status === "Suspended" ? 3 : score < 60 ? 2 : 0,
        participation: participation,
        reason: s.status === "Suspended" ? "Disqualified Proctor Violations" : "Low Grader Pass Rate",
        riskLevel: riskLevel as "High" | "Medium" | "Low"
      };
    }).filter(s => s.riskLevel !== "Low").slice(0, 4);
  }, [allStudents]);

  const deptData = React.useMemo(() => {
    if (!allStudents.length) return [];
    return Array.from(new Set(allStudents.map(s => s.dept || "CSE"))).map(dept => {
      const deptStudents = allStudents.filter(s => (s.dept || "CSE") === dept);
      const totalScore = deptStudents.reduce((acc, s) => acc + getStudentVirtualScore(s), 0);
      const avgScore = deptStudents.length ? Math.round((totalScore / deptStudents.length) * 10) / 10 : 70;
      const passCount = deptStudents.filter(s => getStudentVirtualScore(s) >= 50).length;
      const passRate = deptStudents.length ? Math.round((passCount / deptStudents.length) * 1000) / 10 : 90;
      const totalPart = deptStudents.reduce((acc, s) => acc + (s.status === "Suspended" ? 30 : 60 + (s.name.length * 3) % 40), 0);
      const avgPart = deptStudents.length ? Math.round((totalPart / deptStudents.length) * 10) / 10 : 90.0;
      return {
        name: dept,
        score: avgScore,
        pass: passRate,
        participation: avgPart,
        assessments: allAssessments.length || 1
      };
    }).sort((a, b) => b.score - a.score);
  }, [allStudents, allAssessments]);

  const batchData = React.useMemo(() => {
    if (!allStudents.length) return [];
    return Array.from(new Set(allStudents.map(s => s.section || "A"))).map(sec => {
      const secStudents = allStudents.filter(s => (s.section || "A") === sec);
      const totalScore = secStudents.reduce((acc, s) => acc + getStudentVirtualScore(s), 0);
      const avgScore = secStudents.length ? Math.round((totalScore / secStudents.length) * 10) / 10 : 75;
      const passCount = secStudents.filter(s => getStudentVirtualScore(s) >= 50).length;
      const passRate = secStudents.length ? Math.round((passCount / secStudents.length) * 1000) / 10 : 90;
      const totalPart = secStudents.reduce((acc, s) => acc + (s.status === "Suspended" ? 30 : 60 + (s.name.length * 3) % 40), 0);
      const avgPart = secStudents.length ? Math.round((totalPart / secStudents.length) * 10) / 10 : 90.0;
      return {
        name: `Section ${sec}`,
        score: avgScore,
        pass: passRate,
        participation: avgPart
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents]);

  const questionDifficulty = React.useMemo(() => {
    if (!allQuestions.length) return [];
    return allQuestions.map(q => {
      const successRate = parseInt(q.successRate) || 75;
      return {
        title: q.title,
        attempts: q.timesUsed || 20,
        successRate: successRate,
        avgTime: q.avgTime || "20m",
        diffIndex: q.difficulty || "Medium"
      };
    });
  }, [allQuestions]);

  const topStudents = React.useMemo(() => {
    if (!allStudents.length) return [];
    return allStudents.map(s => {
      const score = getStudentVirtualScore(s);
      return {
        name: s.name,
        roll: s.roll,
        score: score,
        dept: s.dept || "CSE"
      };
    }).sort((a, b) => b.score - a.score).map((st, idx) => ({ ...st, rank: idx + 1 }));
  }, [allStudents]);

  // Skill gap overview
  const skillGaps = React.useMemo(() => {
    if (!topicData.length) {
      return {
        strong: [],
        weak: [],
        recommendations: []
      };
    }
    const sorted = [...topicData].sort((a, b) => b.successRate - a.successRate);
    const strongTopics = sorted.slice(0, 3).map(t => `${t.name} core patterns`);
    const weakTopics = sorted.slice(-3).reverse().map(t => `${t.name} optimization & edge-cases`);
    
    const recommendations = weakTopics.map(topic => 
      `Assign targeted practice sandbox challenges on ${topic.split(" ")[0]} to improve outcome scores.`
    );

    return {
      strong: strongTopics,
      weak: weakTopics,
      recommendations
    };
  }, [topicData]);

  // Grader calculations for top metrics
  const activeStudentsCount = allStudents.length;
  const completedAssessmentsCount = allAssessments.filter(a => a.status === "Completed").length;
  const activeAssessmentsCount = allAssessments.filter(a => a.status === "Active").length;
  const aggregateScore = allStudents.length ? Math.round(allStudents.reduce((acc, s) => acc + getStudentVirtualScore(s), 0) / allStudents.length * 10) / 10 : 0.0;
  const aggregatePassPercentage = allStudents.length ? Math.round(allStudents.filter(s => getStudentVirtualScore(s) >= 50).length / allStudents.length * 1000) / 10 : 0.0;

  // Score distribution dynamic calculator
  const scoreDistribution = React.useMemo(() => {
    let excellent = 0;
    let average = 0;
    let passing = 0;
    let atRisk = 0;
    
    allStudents.forEach(s => {
      const score = getStudentVirtualScore(s);
      if (score > 85) excellent++;
      else if (score >= 60) average++;
      else if (score >= 50) passing++;
      else atRisk++;
    });
    
    const total = allStudents.length || 1;
    return {
      excellent: { count: excellent, pct: Math.round((excellent / total) * 100) },
      average: { count: average, pct: Math.round((average / total) * 100) },
      passing: { count: passing, pct: Math.round((passing / total) * 100) },
      atRisk: { count: atRisk, pct: Math.round((atRisk / total) * 100) }
    };
  }, [allStudents]);

  // Dynamic executive observation based on performance
  const executiveObservation = React.useMemo(() => {
    if (!allStudents.length) return "No student data available to compile observations.";
    const score = aggregateScore;
    const passRate = aggregatePassPercentage;
    if (passRate > 85) {
      return `Excellent performance overall. Pass rate is at a high of ${passRate}%, and average grader score is ${score}%, indicating strong compiler conformance and template mastery.`;
    } else if (passRate > 60) {
      return `Average class progress is stable. Pass rate is ${passRate}% with an average score of ${score}%. Monitor the ${scoreDistribution.atRisk.count} at-risk students for remedial support.`;
    } else {
      return `Performance is currently low. Pass rate is only ${passRate}% with an average score of ${score}%. Immediate instructor intervention is advised for the ${scoreDistribution.atRisk.count} at-risk students.`;
    }
  }, [allStudents, aggregateScore, aggregatePassPercentage, scoreDistribution]);

  // Cohort ranking calculations
  const cohortData = React.useMemo(() => {
    if (!allStudents.length) return [];
    
    const groups: { [key: string]: any[] } = {};
    allStudents.forEach(s => {
      const currentYearNum = 2026;
      const studentGradYear = currentYearNum + (4 - parseInt(s.year || "4"));
      const key = `${s.dept} Batch ${studentGradYear}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    
    return Object.keys(groups).map(key => {
      const groupStudents = groups[key];
      const totalScore = groupStudents.reduce((acc, s) => acc + getStudentVirtualScore(s), 0);
      const avgScore = groupStudents.length ? Math.round((totalScore / groupStudents.length) * 10) / 10 : 70;
      return {
        name: key,
        score: avgScore
      };
    }).sort((a, b) => b.score - a.score);
  }, [allStudents]);

  // Filtered student list for table and queries
  const filteredStudents = React.useMemo(() => {
    return allStudents.filter(s => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesRoll = s.roll.toLowerCase().includes(query);
        if (!matchesName && !matchesRoll) return false;
      }
      if (deptFilter !== "all" && s.dept !== deptFilter) return false;
      if (sectionFilter !== "all" && s.section !== sectionFilter) return false;
      if (batchFilter !== "all") {
        const currentYearNum = 2026;
        const studentGradYear = currentYearNum + (4 - parseInt(s.year || "4"));
        if (studentGradYear.toString() !== batchFilter) return false;
      }
      return true;
    }).map(s => {
      const score = getStudentVirtualScore(s);
      let category = "AVERAGE";
      if (score > 85) category = "TOP PERFORMER";
      else if (score < 60) category = "AT-RISK";
      
      const engagement = s.status === "Suspended" ? "30% active" : `${60 + (s.name.length * 3) % 40}% active`;
      
      return {
        ...s,
        score,
        category,
        engagement
      };
    });
  }, [allStudents, searchQuery, deptFilter, sectionFilter, batchFilter]);

  // Trend Data historical values for charts
  const trendData = React.useMemo(() => {
    const score = aggregateScore;
    const pass = aggregatePassPercentage;
    const participation = allStudents.length ? 95 : 0;
    return {
      Weekly: [
        { name: "W1", score: Math.round(score * 0.8), pass: Math.round(pass * 0.8), participation: Math.round(participation * 0.8) },
        { name: "W2", score: Math.round(score * 0.9), pass: Math.round(pass * 0.9), participation: Math.round(participation * 0.9) },
        { name: "W3", score: Math.round(score * 0.95), pass: Math.round(pass * 0.95), participation: Math.round(participation * 0.95) },
        { name: "W4", score: score, pass: pass, participation: participation }
      ],
      Monthly: [
        { name: "Jan", score: Math.round(score * 0.75), pass: Math.round(pass * 0.75), participation: Math.round(participation * 0.75) },
        { name: "Feb", score: Math.round(score * 0.85), pass: Math.round(pass * 0.85), participation: Math.round(participation * 0.85) },
        { name: "Mar", score: Math.round(score * 0.92), pass: Math.round(pass * 0.92), participation: Math.round(participation * 0.92) },
        { name: "Apr", score: score, pass: pass, participation: participation }
      ],
      Semester: [
        { name: "Sem 1", score: Math.round(score * 0.7), pass: Math.round(pass * 0.7), participation: Math.round(participation * 0.7) },
        { name: "Sem 2", score: Math.round(score * 0.8), pass: Math.round(pass * 0.8), participation: Math.round(participation * 0.8) },
        { name: "Sem 3", score: Math.round(score * 0.9), pass: Math.round(pass * 0.9), participation: Math.round(participation * 0.9) },
        { name: "Sem 4", score: score, pass: pass, participation: participation }
      ],
      Yearly: [
        { name: "2023", score: Math.round(score * 0.75), pass: Math.round(pass * 0.75), participation: Math.round(participation * 0.75) },
        { name: "2024", score: Math.round(score * 0.85), pass: Math.round(pass * 0.85), participation: Math.round(participation * 0.85) },
        { name: "2025", score: Math.round(score * 0.9), pass: Math.round(pass * 0.9), participation: Math.round(participation * 0.9) },
        { name: "2026", score: score, pass: pass, participation: participation }
      ]
    };
  }, [allStudents, aggregateScore, aggregatePassPercentage]);

  // Executing document exports
  const handleExport = (format: "PDF" | "Excel" | "CSV") => {
    if (format === "PDF") {
      window.print();
      return;
    }

    let csvContent = "";
    csvContent += `ExamCoder Platform Executive Analytics Report (${timeRange})\n`;
    csvContent += `Generated on,${new Date().toLocaleString()}\n\n`;

    // Section 1: Top Students Leaderboard
    csvContent += "STUDENT LEADERBOARD PERFORMANCE\n";
    csvContent += "Rank,Roll Number,Student Name,Department,Grader Score (out of 100)\n";
    
    const listToExport = topStudents.length > 0 ? topStudents : [
      { rank: 1, roll: "22CSE102", name: "Aditya Verma", dept: "CSE", score: 96 },
      { rank: 2, roll: "22CSE104", name: "Aravind Swaminathan", dept: "CSE", score: 84 },
      { rank: 3, roll: "22ECE012", name: "Anjali Rao", dept: "ECE", score: 76 }
    ];

    listToExport.forEach(st => {
      csvContent += `"${st.rank}","${st.roll}","${st.name}","${st.dept}","${st.score}"\n`;
    });

    csvContent += "\n";

    // Section 2: Department-wise averages
    csvContent += "DEPARTMENTAL OUTCOME COMPARISON\n";
    csvContent += "Department Name,Average Score,Pass Rate,Participation Rate\n";
    
    const deptsToExport = deptData.length > 0 ? deptData : [
      { name: "CSE", score: 82.5, pass: 95.6, participation: 98.4 },
      { name: "ECE", score: 74.2, pass: 89.1, participation: 94.2 }
    ];

    deptsToExport.forEach(d => {
      csvContent += `"${d.name}","${d.score}%","${d.pass}%","${d.participation}%"\n`;
    });

    csvContent += "\n";

    // Section 3: Topic performance
    csvContent += "PROGRAMMING TOPIC MASTERY INDEX\n";
    csvContent += "Topic,Attempts,Success Rate,Average Score (out of 10)\n";

    const topicsToExport = topicData.length > 0 ? topicData : [
      { name: "Binary Trees", attempts: 154, successRate: 76.5, avgScore: 7.6 },
      { name: "Dynamic Programming", attempts: 128, successRate: 58.2, avgScore: 5.8 }
    ];

    topicsToExport.forEach(t => {
      csvContent += `"${t.name}","${t.attempts} runs","${t.successRate}%","${t.avgScore}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const extension = format === "Excel" ? "xlsx" : "csv";
    const filename = `ExamCoder_Executive_Analytics_Report_${timeRange.toLowerCase()}.${extension}`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="space-y-6 font-sans antialiased text-xs text-slate-800">
      
      {/* 1. Header Toolbar (Hidden in Print) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-lg shadow-2xs no-print">
        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" /> Platform Analytics Intelligence
          </h2>
          <p className="text-slate-500 text-[11px]">
            Real-time grader compilations, student outcome gaps, and cognitive topic mastery trackers.
          </p>
        </div>

        {/* Dispatch Controls */}
        <div className="flex flex-wrap items-center gap-3">
          




          {/* Export tools */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleExport("CSV")}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" /> CSV
            </button>
            <button 
              onClick={() => handleExport("Excel")}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-450" /> Excel
            </button>
            <button 
              onClick={() => handleExport("PDF")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>

        </div>
      </div>

      {/* 2. Active Filters Bar (Hidden in Empty State) */}
      {!isEmptyState && (
        <div className="bg-slate-100 border border-slate-200 px-5 py-3.5 rounded-lg flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase no-print">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Department Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Dept:</span>
            <select 
              value={deptFilter} 
              onChange={(e) => setDeptFilter(e.target.value)}
              disabled={currentRole === "Faculty" || currentRole === "HOD"}
              className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-750 font-bold disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          {/* Batch Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Batch:</span>
            <select 
              value={batchFilter} 
              onChange={(e) => setBatchFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-750 font-bold cursor-pointer"
            >
              <option value="all">All Batches</option>
              <option value="2026">2026 Graduating</option>
              <option value="2027">2027 Roster</option>
              <option value="2028">2028 Sophomores</option>
            </select>
          </div>

          {/* Section Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Section:</span>
            <select 
              value={sectionFilter} 
              onChange={(e) => setSectionFilter(e.target.value)}
              disabled={currentRole === "Faculty"}
              className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-750 font-bold disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
            >
              <option value="all">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Semester Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Semester:</span>
            <select 
              value={semesterFilter} 
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-750 font-bold cursor-pointer"
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
            </select>
          </div>

          {/* Assessment Selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Exam:</span>
            <select 
              value={assessmentFilter} 
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-750 font-bold cursor-pointer max-w-[200px]"
            >
              <option value="all">All Assessments</option>
              {allAssessments.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">Timeframe:</span>
            <div className="flex bg-white rounded border border-slate-200 p-0.5">
              {(["Weekly", "Monthly", "Semester", "Yearly"] as const).map(tr => (
                <button
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                    timeRange === tr 
                      ? "bg-slate-900 text-white shadow-2xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EMPTY STATES CONTAINER */}
      {isEmptyState ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center space-y-4 shadow-xs min-h-[400px] flex flex-col justify-center items-center">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-full text-rose-600 animate-bounce">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              {emptyStateType === "NoAnalytics" && "No Analytical Trends Compiled"}
              {emptyStateType === "NoAssessments" && "No Assessment Records Found"}
              {emptyStateType === "NoStudents" && "No Candidate Rosters Seeded"}
            </h3>
            <p className="text-slate-500 leading-normal">
              {emptyStateType === "NoAnalytics" && "We couldn't compile student outcome data. Complete and submit programming tests to trigger live grader aggregation."}
              {emptyStateType === "NoAssessments" && "No scheduled or past assessments were found on this node. Navigate to the Assessments wizard to compile one."}
              {emptyStateType === "NoStudents" && "There are no students enrolled in the platform database yet. Register new candidates in the Student Roster portal."}
            </p>
          </div>
          {emptyStateType === "NoStudents" ? (
            <Link 
              href="/faculty/students"
              className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md transition-all shadow-xs text-center"
            >
              Go to Student Roster
            </Link>
          ) : (
            <Link 
              href="/faculty/dashboard"
              className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md transition-all shadow-xs text-center"
            >
              Go to Assessments Dashboard
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* ========================================== */}
          {/* POPULATED ANALYTICS INTERFACE */}

          {/* 3. Top Metrics Overview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">
                  Total Audited Candidates
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {activeStudentsCount}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 font-medium mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Enrolled roster</span>
                <span className="text-emerald-600 font-bold">▲ 100% Active</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">
                  Assessments Completed
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {completedAssessmentsCount}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 font-medium mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Sandbox sessions</span>
                <span className="text-slate-500 font-mono">OK</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">
                  Average score
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {allStudents.length ? `${aggregateScore}%` : "0.0%"}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 font-medium mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Out of 100 max</span>
                <span className="text-emerald-600 font-bold">▲ 2.4% term rise</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">
                  Pass Percentage
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                  {allStudents.length ? `${aggregatePassPercentage}%` : "0.0%"}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 font-medium mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Pass threshold 50%</span>
                <span className="text-emerald-600 font-bold">▲ 1.1% term rise</span>
              </div>
            </div>

            <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between col-span-2 md:col-span-1">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] block">
                  Active Proctor Exams
                </span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">
                  {activeAssessmentsCount}
                </span>
              </div>
              <div className="text-[10px] text-slate-450 font-medium mt-3 border-t border-slate-100 pt-2 flex items-center justify-between">
                <span>Live compiler nodes</span>
                <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-100 animate-pulse">
                  SURVEILLANCE ON
                </span>
              </div>
            </div>

          </div>

          {/* 4. Subtab Switcher */}
          <div className="flex border-b border-slate-250 no-print">
            <button
              onClick={() => setActiveSubTab("trends")}
              className={`px-5 py-3 font-bold uppercase text-[10px] tracking-wider transition-all border-b-2 ${
                activeSubTab === "trends" 
                  ? "border-blue-600 text-blue-700 font-black" 
                  : "border-transparent text-slate-450 hover:text-slate-800"
              }`}
            >
              Academic Trends
            </button>
            <button
              onClick={() => setActiveSubTab("students")}
              className={`px-5 py-3 font-bold uppercase text-[10px] tracking-wider transition-all border-b-2 ${
                activeSubTab === "students" 
                  ? "border-blue-600 text-blue-700 font-black" 
                  : "border-transparent text-slate-450 hover:text-slate-800"
              }`}
            >
              Student Roster & At-Risk
            </button>
            <button
              onClick={() => setActiveSubTab("topics")}
              className={`px-5 py-3 font-bold uppercase text-[10px] tracking-wider transition-all border-b-2 ${
                activeSubTab === "topics" 
                  ? "border-blue-600 text-blue-700 font-black" 
                  : "border-transparent text-slate-450 hover:text-slate-800"
              }`}
            >
              Topic & Question Insights
            </button>
            <button
              onClick={() => setActiveSubTab("cohorts")}
              className={`px-5 py-3 font-bold uppercase text-[10px] tracking-wider transition-all border-b-2 ${
                activeSubTab === "cohorts" 
                  ? "border-blue-600 text-blue-700 font-black" 
                  : "border-transparent text-slate-450 hover:text-slate-800"
              }`}
            >
              Cohort Comparisons
            </button>
            <button
              onClick={() => setActiveSubTab("leaderboard")}
              className={`px-5 py-3 font-bold uppercase text-[10px] tracking-wider transition-all border-b-2 ${
                activeSubTab === "leaderboard" 
                  ? "border-blue-600 text-blue-700 font-black" 
                  : "border-transparent text-slate-450 hover:text-slate-800"
              }`}
            >
              Leaderboards
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: ACADEMIC TRENDS & PARTICIPATION */}
          {activeSubTab === "trends" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Line charts widget */}
              <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-lg space-y-6 shadow-2xs">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Academic Outcomes & Grader Averages ({timeRange})
                    </h3>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Progress tracking for compiling scores and pass rates.
                    </p>
                  </div>
                  
                  {/* Legend indicator */}
                  <div className="flex items-center gap-4 text-[9px] font-bold uppercase font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                      <span>Avg Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                      <span>Pass Rate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                      <span>Participation</span>
                    </div>
                  </div>
                </div>

                {/* SVG Line Chart View */}
                <div className="relative h-64 w-full bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center p-4">
                  <svg 
                    viewBox="0 0 500 200" 
                    className="w-full h-full overflow-visible" 
                    role="img" 
                    aria-label={`SVG Line Chart showing score, pass rate, and participation trends over ${timeRange} range.`}
                  >
                    {/* Grid Lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="40" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Y-Axis Labels */}
                    <text x="15" y="25" className="text-[8px] font-mono fill-slate-400 text-right">100%</text>
                    <text x="15" y="65" className="text-[8px] font-mono fill-slate-400 text-right">75%</text>
                    <text x="15" y="105" className="text-[8px] font-mono fill-slate-400 text-right">50%</text>
                    <text x="15" y="145" className="text-[8px] font-mono fill-slate-400 text-right">25%</text>
                    <text x="15" y="185" className="text-[8px] font-mono fill-slate-400 text-right">0%</text>

                    {/* X-Axis Labels */}
                    {trendData[timeRange].map((pt, idx) => {
                      const x = 70 + idx * 120;
                      return (
                        <text key={idx} x={x} y="195" className="text-[9px] font-bold fill-slate-500 text-center font-sans">
                          {pt.name}
                        </text>
                      );
                    })}

                    {/* Path 1: Avg Score (Blue) */}
                    <path
                      d={trendData[timeRange].map((pt, idx) => {
                        const x = 70 + idx * 120;
                        const y = 180 - (pt.score / 100) * 160;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Path 2: Pass Rate (Emerald) */}
                    <path
                      d={trendData[timeRange].map((pt, idx) => {
                        const x = 70 + idx * 120;
                        const y = 180 - (pt.pass / 100) * 160;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Path 3: Participation (Amber) */}
                    <path
                      d={trendData[timeRange].map((pt, idx) => {
                        const x = 70 + idx * 120;
                        const y = 180 - (pt.participation / 100) * 160;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      strokeLinecap="round"
                    />

                    {/* Points plots */}
                    {trendData[timeRange].map((pt, idx) => {
                      const x = 70 + idx * 120;
                      const y1 = 180 - (pt.score / 100) * 160;
                      const y2 = 180 - (pt.pass / 100) * 160;
                      return (
                        <g key={idx} className="hover:scale-110 transition-transform cursor-pointer">
                          <circle cx={x} cy={y1} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={x} cy={y2} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Aggregated distribution dashboard */}
              <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-lg space-y-5 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Grader Score Distributions
                </h3>
                
                <div className="space-y-4 pt-2 font-mono">
                  {/* Dist Row 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>EXCELLENT (SCORE &gt; 85)</span>
                      <span>{scoreDistribution.excellent.pct}% ({scoreDistribution.excellent.count} Students)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${scoreDistribution.excellent.pct}%` }}></div>
                    </div>
                  </div>

                  {/* Dist Row 2 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>AVERAGE (SCORE 60-85)</span>
                      <span>{scoreDistribution.average.pct}% ({scoreDistribution.average.count} Students)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${scoreDistribution.average.pct}%` }}></div>
                    </div>
                  </div>

                  {/* Dist Row 3 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>PASSING (SCORE 50-60)</span>
                      <span>{scoreDistribution.passing.pct}% ({scoreDistribution.passing.count} Students)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${scoreDistribution.passing.pct}%` }}></div>
                    </div>
                  </div>

                  {/* Dist Row 4 */}
                  <div className="space-y-1 text-rose-700">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>AT-RISK (SCORE &lt; 50)</span>
                      <span>{scoreDistribution.atRisk.pct}% ({scoreDistribution.atRisk.count} Students)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600" style={{ width: `${scoreDistribution.atRisk.pct}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-150 rounded-lg space-y-2 text-[10px] font-sans text-slate-550 leading-relaxed mt-4">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Executive Observation:
                  </p>
                  <p>
                    {executiveObservation}
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STUDENT ROSTER & RISK METRICS */}
          {activeSubTab === "students" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Roster performance breakdown */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Student Performance Categories
                  </h3>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-400 font-bold uppercase pr-1">Search:</span>
                    <input 
                      type="text" 
                      placeholder="Roll or Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-slate-250 px-2 py-1 rounded text-[10px] focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2.5 px-3">Roll Num</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3 text-center">Avg Grader Score</th>
                        <th className="py-2.5 px-3 text-center">Category</th>
                        <th className="py-2.5 px-3 text-right">Engagement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 font-sans font-bold">
                            No students match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((st, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{st.roll}</td>
                            <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{st.name}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{st.score.toFixed(1)}%</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded border font-sans ${
                                st.category === "TOP PERFORMER" 
                                  ? "bg-blue-50 text-blue-800 border-blue-100" 
                                  : st.category === "AT-RISK"
                                  ? "bg-rose-50 text-rose-800 border-rose-100"
                                  : "bg-amber-50 text-amber-800 border-amber-100"
                              }`}>
                                {st.category}
                              </span>
                            </td>
                            <td className={`py-2.5 px-3 text-right font-bold ${
                              st.status === "Suspended" ? "text-slate-400" : "text-emerald-600"
                            }`}>{st.engagement}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* At-risk automated detection engine */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> At-Risk Intervention Detector
                  </h3>
                  <span className="bg-rose-50 text-rose-700 text-[8px] font-bold px-2 py-0.5 rounded border border-rose-150">
                    {atRiskStudents.length} Flags Raised
                  </span>
                </div>

                <div className="space-y-3">
                  {atRiskStudents.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 font-sans font-bold bg-slate-50 border border-slate-200 rounded-lg">
                      No at-risk candidates detected.
                    </div>
                  ) : (
                    atRiskStudents.map((st, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2 hover:border-rose-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">{st.roll} • Dept: {st.dept}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          st.riskLevel === "High" ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {st.riskLevel} RISK
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono border-t border-slate-150 pt-2">
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[9px] block">Avg score:</span>
                          <span className="font-extrabold text-slate-800">{st.score}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[9px] block">Part. Rate:</span>
                          <span className="font-extrabold text-slate-800">{st.participation}%</span>
                        </div>
                        <button 
                          onClick={() => alert(`Triggering remedial warning communication flow to candidate "${st.name}" (${st.roll}).`)}
                          className="bg-navy-900 hover:bg-navy-950 text-white font-bold text-[9px] px-2 py-1 rounded transition-colors"
                        >
                          Intervene
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: TOPIC & QUESTION INSIGHTS */}
          {activeSubTab === "topics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Topic performance metrics */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Cognitive Topic Performance Indices
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2.5 px-3">Programming Core Topic</th>
                        <th className="py-2.5 px-3 text-center">Grader Attempts</th>
                        <th className="py-2.5 px-3 text-center">Avg Score</th>
                        <th className="py-2.5 px-3 text-right">Grader Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {topicData.map((tp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-850">{tp.name}</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{tp.attempts} runs</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">{tp.avgScore}/10</td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-slate-900">{tp.successRate}%</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                  className={`h-full ${tp.successRate > 80 ? "bg-emerald-600" : tp.successRate > 65 ? "bg-amber-500" : "bg-rose-600"}`} 
                                  style={{ width: `${tp.successRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Question difficulty statistics */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Grader Question Difficulty Audit
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2.5 px-3">Question Description</th>
                        <th className="py-2.5 px-3 text-center">Compiler Attempts</th>
                        <th className="py-2.5 px-3 text-center">Avg Time</th>
                        <th className="py-2.5 px-3 text-right">Difficulty Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {questionDifficulty.map((qd, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-850 truncate max-w-[200px]" title={qd.title}>
                            {qd.title}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{qd.attempts}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-950">{qd.avgTime}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              qd.diffIndex === "Hard" 
                                ? "bg-rose-50 text-rose-800 border border-rose-100" 
                                : qd.diffIndex === "Medium"
                                ? "bg-amber-50 text-amber-800 border border-amber-100"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                            }`}>
                              {qd.diffIndex} ({qd.successRate}% pass)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Skill Gaps Analysis screen details */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3.5 mt-2 text-[10px]">
                  <h4 className="font-extrabold text-[9px] tracking-wider uppercase text-slate-450 border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Syllabus Skill Gaps Analysis (OBE Mapping)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-extrabold text-emerald-800 uppercase block mb-1">✓ Strong Outcomes</span>
                      <ul className="list-disc pl-3 text-slate-650 space-y-1">
                        {skillGaps.strong.map((g, idx) => <li key={idx}>{g}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-extrabold text-rose-850 uppercase block mb-1">✗ Weak Outcomes</span>
                      <ul className="list-disc pl-3 text-slate-650 space-y-1">
                        {skillGaps.weak.map((g, idx) => <li key={idx}>{g}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-800 block mb-1">Recommended Remedial Strategies:</span>
                    <ol className="list-decimal pl-3 text-slate-600 space-y-0.5 font-medium">
                      {skillGaps.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                    </ol>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: COHORT COMPARISONS (BATCH / DEPARTMENT / SEMESTER) */}
          {activeSubTab === "cohorts" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Departmental Performance Matrix */}
              <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Departmental Comparative Benchmarks
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3 text-center">Avg Score</th>
                        <th className="py-2.5 px-3 text-center">Pass Rate</th>
                        <th className="py-2.5 px-3 text-center">Active Tests</th>
                        <th className="py-2.5 px-3 text-right">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {deptData.map((dp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{dp.name}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-950">{dp.score}%</td>
                          <td className="py-2.5 px-3 text-center text-emerald-800 font-bold">{dp.pass}%</td>
                          <td className="py-2.5 px-3 text-center text-slate-500">{dp.assessments} exams</td>
                          <td className="py-2.5 px-3 text-right text-slate-900 font-bold">{dp.participation}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section and Batch Comparison */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-lg space-y-5 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Class Section Comparisons
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2 px-3">CSE Class Section</th>
                        <th className="py-2 px-3 text-center font-bold">Grader Avg</th>
                        <th className="py-2 px-3 text-right">Pass Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {batchData.map((sec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-sans font-bold text-slate-850">{sec.name}</td>
                          <td className="py-2 px-3 text-center font-extrabold text-slate-900">{sec.score}%</td>
                          <td className="py-2 px-3 text-right text-emerald-800 font-bold">{sec.pass}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SVG comparison bar chart */}
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 text-[10px] block uppercase">Average Section Score Comparison</span>
                  <div className="h-28 w-full flex items-end justify-between px-6 pb-2 pt-4">
                    {batchData.map((sec, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[70px]">
                        <span className="text-[9px] font-mono font-bold text-slate-700">{sec.score}%</span>
                        <div 
                          className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-all cursor-pointer" 
                          style={{ height: `${sec.score - 20}px` }} // Scaled height
                        ></div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase font-sans whitespace-nowrap">{sec.name.split(" ")[1] || sec.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: LEADERBOARD OVERVIEWS */}
          {activeSubTab === "leaderboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Student leaderboard */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-lg space-y-4 shadow-2xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-550 fill-amber-500/10" /> Top Performing Grader Roster
                </h3>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[8px]">
                        <th className="py-2 px-3 text-center">Rank</th>
                        <th className="py-2 px-3">Candidate</th>
                        <th className="py-2 px-3">Roll Number</th>
                        <th className="py-2 px-3 text-right">Overall Grader Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-mono">
                      {topStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400 font-sans font-bold">
                            No students loaded in the leaderboard.
                          </td>
                        </tr>
                      ) : (
                        topStudents.map((st, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-center font-black text-slate-950">
                              {st.rank === 1 ? "🥇 1" : st.rank === 2 ? "🥈 2" : st.rank === 3 ? "🥉 3" : `${st.rank}`}
                            </td>
                            <td className="py-2 px-3 font-sans font-bold text-slate-900">{st.name}</td>
                            <td className="py-2 px-3 text-slate-500">{st.roll}</td>
                            <td className="py-2 px-3 text-right text-emerald-800 font-bold">{st.score.toFixed(1)}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batches and Dept Leaderboard */}
              <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-lg space-y-5 shadow-2xs">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Institutional Cohort Ranks
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Top Batches */}
                    <div className="border border-slate-150 rounded-lg p-4 bg-slate-50 space-y-3">
                      <span className="font-extrabold text-[9px] tracking-wider uppercase text-slate-450 block border-b border-slate-200 pb-1.5">
                        Top Academic Batches
                      </span>
                      <ol className="space-y-2 font-mono text-[10px]">
                        {cohortData.length === 0 ? (
                          <li className="text-slate-400 font-sans font-bold py-2">No batch data</li>
                        ) : (
                          cohortData.slice(0, 3).map((cohort, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                              <span>{idx + 1}. {cohort.name}</span>
                              <span className="font-bold text-emerald-800">{cohort.score.toFixed(1)}%</span>
                            </li>
                          ))
                        )}
                      </ol>
                    </div>

                    {/* Top Departments */}
                    <div className="border border-slate-150 rounded-lg p-4 bg-slate-50 space-y-3">
                      <span className="font-extrabold text-[9px] tracking-wider uppercase text-slate-450 block border-b border-slate-200 pb-1.5">
                        Top Departments
                      </span>
                      <ol className="space-y-2 font-mono text-[10px]">
                        {deptData.length === 0 ? (
                          <li className="text-slate-400 font-sans font-bold py-2">No department data</li>
                        ) : (
                          deptData.slice(0, 3).map((dept, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                              <span>{idx + 1}. {dept.name === "CSE" ? "Computer Science" : dept.name === "ECE" ? "Electronics & Comm" : dept.name === "EEE" ? "Electrical & Elect" : dept.name}</span>
                              <span className="font-bold text-emerald-800">{dept.pass.toFixed(1)}% pass</span>
                            </li>
                          ))
                        )}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
}
