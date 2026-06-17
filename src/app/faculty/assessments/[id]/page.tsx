"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Users, 
  CheckCircle, 
  Calendar, 
  Code, 
  Terminal, 
  Lock, 
  Settings, 
  Activity, 
  FileText, 
  PlusCircle, 
  Maximize2, 
  ChevronRight, 
  Code2, 
  Laptop, 
  RefreshCw, 
  UserCheck,
  UserX,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MockQuestion {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  marks: number;
  language: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  codeBoilerplate: {
    cpp: string;
    java: string;
    python: string;
  };
}

interface MockStudent {
  roll: string;
  name: string;
  dept: string;
  year: string;
  section: string;
  email: string;
  status: "Not Started" | "In Progress" | "Completed" | "Disqualified";
  lastLogin: string;
  ip: string;
  warningsCount: number;
  progress: string;
}

export default function AssessmentDetails({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"overview" | "questions" | "roster" | "security" | "simulator">("overview");

  // Filter and Search states for Roster
  const [studentSearch, setStudentSearch] = useState("");
  const [studentFilterStatus, setStudentFilterStatus] = useState("all");
  const [studentFilterSection, setStudentFilterSection] = useState("all");

  // State to simulate real-time changes
  const [showRosterActionModal, setShowRosterActionModal] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [warningsLimit, setWarningsLimit] = useState(3);

  // Dynamic simulation statuses
  const [examStatus, setExamStatus] = useState<"Draft" | "Scheduled" | "Active" | "Completed" | "Archived">(() => {
    if (id === "1") return "Active";
    if (id === "2") return "Scheduled";
    if (id === "3" || id === "4") return "Completed";
    return "Draft";
  });

  // Mock Assessment Details Database
  const assessmentDetails = {
    id: id || "1",
    name: id === "1" ? "Data Structures Practical Lab Exam" :
          id === "2" ? "Object Oriented Programming Final" :
          id === "3" ? "Design & Analysis of Algorithms Practical" :
          id === "4" ? "Database Systems Midterm Test" :
          id === "5" ? "Python Programming Laboratory" : "Custom Cloned Exam Session",
    subject: id === "1" ? "CS201" :
             id === "2" ? "IT305" :
             id === "3" ? "CS304" :
             id === "4" ? "CS203" :
             id === "5" ? "IT102" : "CS101",
    duration: id === "1" ? 180 : id === "2" ? 120 : id === "3" ? 180 : id === "4" ? 90 : 120,
    totalMarks: id === "1" ? 50 : id === "2" ? 40 : id === "3" ? 50 : id === "4" ? 30 : 50,
    type: "Lab Examination",
    startTime: "2026-06-18T10:00",
    endTime: "2026-06-18T13:00",
    description: "This practical test covers core stack, queue, tree configurations, and binary heap traversals. Students must pass all functional and edge case sandboxed compile tasks.",
    syllabus: "1. Stacks and Queues implementation using linked structures.\n2. Binary Search Trees and tree inversion traversals.\n3. Heap sort operations and priority queue structures.",
    batches: ["CSE - 3rd Year - A", "CSE - 3rd Year - B"],
    createdDate: "2026-06-15",
    outcomes: "CO2: Ability to program complex recursive non-linear pointer structures under restricted memory frames."
  };

  // Mock Questions Bank for this Exam
  const [questions, setQuestions] = useState<MockQuestion[]>([
    {
      id: "q1",
      title: "Invert a Binary Tree",
      difficulty: "Medium",
      topic: "Data Structures",
      marks: 15,
      language: "C++ / Java / Python",
      description: "Given the root of a binary tree, invert the tree, and return its root. Inverting a binary tree means exchanging left and right subtrees of every node.",
      inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal format (with -1 representing null nodes).",
      outputFormat: "Output the level-order traversal array of the inverted binary tree.",
      constraints: "Number of nodes in the tree is in range [0, 1000].\nNode values range from -100 to 100.",
      sampleInput: "4 2 7 1 3 6 9",
      sampleOutput: "4 7 2 9 6 3 1",
      codeBoilerplate: {
        cpp: `// C++ Template\n#include <iostream>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};\n\nTreeNode* invertTree(TreeNode* root) {\n    // Write your code here\n    if (root == NULL) return NULL;\n    TreeNode* temp = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(temp);\n    return root;\n}`,
        java: `// Java Template\nclass Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your code here\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}`,
        python: `# Python Template\nclass Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        # Write your code here\n        if not root:\n            return None\n        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)\n        return root`
      }
    },
    {
      id: "q2",
      title: "Validate Binary Search Tree",
      difficulty: "Medium",
      topic: "Data Structures",
      marks: 15,
      language: "C++ / Java / Python",
      description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
      inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal.",
      outputFormat: "Output 'true' if the tree is a valid BST, otherwise output 'false'.",
      constraints: "Number of nodes is in range [1, 10000].\nNode values range from -2^31 to 2^31 - 1.",
      sampleInput: "2 1 3",
      sampleOutput: "true",
      codeBoilerplate: {
        cpp: `// C++ Template\n#include <iostream>\nusing namespace std;\n\nbool isValidBST(TreeNode* root) {\n    // Write your code here\n    return true;\n}`,
        java: `// Java Template\nclass Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Write your code here\n        return true;\n    }\n}`,
        python: `# Python Template\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        # Write your code here\n        return True`
      }
    },
    {
      id: "q3",
      title: "Implement Dijkstra Shortest Path",
      difficulty: "Hard",
      topic: "Algorithms",
      marks: 20,
      language: "C++ / Java / Python",
      description: "Given a weighted undirected graph with V vertices and E edges, find the shortest distance of all the vertices from the source vertex S. Return an array of distances.",
      inputFormat: "The first line contains V and E. Next E lines represent edges: u v w (source, destination, weight). The final line contains S (source node).",
      outputFormat: "Return space-separated integers representing the shortest path from S to each node.",
      constraints: "1 <= V <= 1000\n1 <= E <= 10000\n1 <= w <= 1000",
      sampleInput: "2 1\n0 1 9\n0",
      sampleOutput: "0 9",
      codeBoilerplate: {
        cpp: `// C++ Template\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> dijkstra(int V, vector<vector<int>> adj[], int S) {\n    // Write your code here\n    vector<int> dist(V, 1e9);\n    return dist;\n}`,
        java: `// Java Template\nimport java.util.*;\nclass Solution {\n    static int[] dijkstra(int V, ArrayList<ArrayList<ArrayList<Integer>>> adj, int S) {\n        // Write your code here\n        return new int[V];\n    }\n}`,
        python: `# Python Template\ndef dijkstra(V, adj, S):\n    # Write your code here\n    return [0] * V`
      }
    }
  ]);

  // Mock Students Roster list
  const [students, setStudents] = useState<MockStudent[]>([
    { roll: "22CSE102", name: "Aditya Verma", dept: "CSE", year: "3rd Year", section: "A", email: "aditya.22cse@psg.edu", status: "In Progress", lastLogin: "10:42 AM", ip: "192.168.12.104", warningsCount: 1, progress: "Q1 Compiled, Q2 Solved" },
    { roll: "22CSE115", name: "Bhavya Sri", dept: "CSE", year: "3rd Year", section: "A", email: "bhavya.22cse@psg.edu", status: "Completed", lastLogin: "10:15 AM", ip: "192.168.12.110", warningsCount: 0, progress: "All solved (Passed 3/3)" },
    { roll: "22CSE142", name: "Deepak Kumar", dept: "CSE", year: "3rd Year", section: "B", email: "deepak.22cse@psg.edu", status: "In Progress", lastLogin: "10:48 AM", ip: "192.168.12.122", warningsCount: 2, progress: "Q1 Solved, Q2 compilation failed" },
    { roll: "22CSE159", name: "Divya N", dept: "CSE", year: "3rd Year", section: "B", email: "divya.22cse@psg.edu", status: "Disqualified", lastLogin: "10:05 AM", ip: "192.168.12.138", warningsCount: 3, progress: "Disqualified (Auto-submit triggered)" },
    { roll: "22CSE185", name: "Gautham S", dept: "CSE", year: "3rd Year", section: "A", email: "gautham.22cse@psg.edu", status: "Not Started", lastLogin: "Never", ip: "—", warningsCount: 0, progress: "Roster Enrolled" },
    { roll: "22CSE204", name: "Ishaan Mehta", dept: "CSE", year: "3rd Year", section: "B", email: "ishaan.22cse@psg.edu", status: "Completed", lastLogin: "10:10 AM", ip: "192.168.12.109", warningsCount: 0, progress: "All solved (Passed 3/3)" },
    { roll: "22CSE210", name: "Karthik Raja", dept: "CSE", year: "3rd Year", section: "A", email: "karthik.22cse@psg.edu", status: "In Progress", lastLogin: "10:52 AM", ip: "192.168.12.115", warningsCount: 0, progress: "Q1 Compiled, Q2 solved" }
  ]);

  // Simulated live monitoring statistics
  const activeStudentsCount = students.filter(s => s.status === "In Progress").length;
  const completedStudentsCount = students.filter(s => s.status === "Completed").length;
  const disqualifiedStudentsCount = students.filter(s => s.status === "Disqualified").length;
  const totalAssignedStudents = students.length;

  // Proctor Setting Variables
  const [fullscreenRequired, setFullscreenRequired] = useState(true);
  const [disableCopyPaste, setDisableCopyPaste] = useState(true);
  const [disableRightClick, setDisableRightClick] = useState(true);
  const [ipWhiteList, setIpWhiteList] = useState("192.168.12.0/24");
  const [tabSwitchMonitoring, setTabSwitchMonitoring] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(2);
  const [autoSubmitThreshold, setAutoSubmitThreshold] = useState(3);

  // Student IDE Preview Simulator States
  const [simSelectedQuestion, setSimSelectedQuestion] = useState<MockQuestion>(questions[0]);
  const [simLanguage, setSimLanguage] = useState<"cpp" | "java" | "python">("python");
  const [simCode, setSimCode] = useState(questions[0].codeBoilerplate.python);
  const [simConsoleOutput, setSimConsoleOutput] = useState<string>("Editor initialized. Ready to run code.");
  const [simIsRunningCode, setSimIsRunningCode] = useState(false);
  const [simFullscreenSimulated, setSimFullscreenSimulated] = useState(false);
  const [simWarningsSimCount, setSimWarningsSimCount] = useState(0);

  // Sync boilerplate on question/language switch
  const handleSimQuestionChange = (q: MockQuestion) => {
    setSimSelectedQuestion(q);
    const boilerplate = q.codeBoilerplate[simLanguage] || q.codeBoilerplate.python;
    setSimCode(boilerplate);
    setSimConsoleOutput(`Question changed to: "${q.title}". Console ready.`);
  };

  const handleSimLanguageChange = (lang: "cpp" | "java" | "python") => {
    setSimLanguage(lang);
    const boilerplate = simSelectedQuestion.codeBoilerplate[lang];
    setSimCode(boilerplate);
    setSimConsoleOutput(`Language switched to: ${lang === "cpp" ? "C++17 (G++ 11)" : lang === "java" ? "Java 17 (OpenJDK)" : "Python 3.10"}`);
  };

  // Run Code Simulation
  const handleSimRunCode = () => {
    setSimIsRunningCode(true);
    setSimConsoleOutput("Compiling files on sandbox nodes...\nRunning test cases...");
    
    setTimeout(() => {
      setSimIsRunningCode(false);
      if (simCode.includes("invertTree") || simCode.includes("isValidBST") || simCode.includes("dijkstra")) {
        setSimConsoleOutput(
          `Sandboxed Run Successful!\n` +
          `-----------------------------\n` +
          `Test Case 1: PASSED [OK]\n` +
          `  Input:  ${simSelectedQuestion.sampleInput}\n` +
          `  Output: ${simSelectedQuestion.sampleOutput}\n\n` +
          `Test Case 2: PASSED [OK]\n` +
          `  Input:  Edge case boundary values verified\n\n` +
          `STATUS: ALL PASS (Points allocated: ${simSelectedQuestion.marks}/${simSelectedQuestion.marks})`
        );
      } else {
        setSimConsoleOutput(
          `Compilation Warning: Function declaration changed or code empty.\n` +
          `-----------------------------\n` +
          `Test Case 1: FAILED [ERROR]\n` +
          `  Input: ${simSelectedQuestion.sampleInput}\n` +
          `  Expected Output: ${simSelectedQuestion.sampleOutput}\n` +
          `  Student Output:  Compilation Error / No output returned\n`
        );
      }
    }, 1200);
  };

  // Switch Proctored Warnings Simulation inside Simulator
  const handleSimTabSwitch = () => {
    if (!tabSwitchMonitoring) {
      alert("Proctor Warning is disabled in security settings.");
      return;
    }
    const nextCount = simWarningsSimCount + 1;
    if (nextCount >= autoSubmitThreshold) {
      setSimWarningsSimCount(nextCount);
      setSimConsoleOutput(
        `[SECURITY CRITICAL ALARM] Tab switches count: ${nextCount} >= Limit ${autoSubmitThreshold}\n` +
        `STATUS: EXAM AUTO-SUBMITTED AND LOCKED.\n` +
        `Student Node logged out due to integrity violation.`
      );
    } else {
      setSimWarningsSimCount(nextCount);
      setSimConsoleOutput(
        `[PROCTOR WARNING] Tab focus lost! Warning ${nextCount} / ${warningThreshold}\n` +
        `Please remain in fullscreen mode inside the exam client.`
      );
    }
  };

  const handleSimResetSecurity = () => {
    setSimWarningsSimCount(0);
    setSimConsoleOutput("Proctoring session telemetry reset. Editor ready.");
  };

  // Roster Actions
  const handleOpenActionModal = (roll: string) => {
    setShowRosterActionModal(roll);
    setActionNotes("");
  };

  const executeRosterAction = (action: "submit" | "reset" | "time" | "disqualify") => {
    if (!showRosterActionModal) return;
    
    setStudents(prev => prev.map(s => {
      if (s.roll === showRosterActionModal) {
        if (action === "submit") {
          alert(`Simulation: Force-submitted assessment for ${s.name} (${s.roll}).`);
          return { ...s, status: "Completed" as const, progress: "Force submitted by Faculty" };
        } else if (action === "reset") {
          alert(`Simulation: Reset assessment session for ${s.name} (${s.roll}). Clean state created.`);
          return { ...s, status: "Not Started" as const, warningsCount: 0, ip: "—", progress: "Session reset" };
        } else if (action === "time") {
          alert(`Simulation: Extended assessment duration by 15 minutes for ${s.name} (${s.roll}).`);
          return { ...s, progress: `${s.progress} (+15M Extended)` };
        } else if (action === "disqualify") {
          alert(`Simulation: Disqualified ${s.name} (${s.roll}) for security violations.`);
          return { ...s, status: "Disqualified" as const, warningsCount: 3, progress: "Disqualified manually" };
        }
      }
      return s;
    }));

    setShowRosterActionModal(null);
  };

  // Roster filtering
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.roll.toLowerCase().includes(studentSearch.toLowerCase());
    const matchStatus = studentFilterStatus === "all" || s.status === studentFilterStatus;
    const matchSection = studentFilterSection === "all" || s.section === studentFilterSection;
    return matchSearch && matchStatus && matchSection;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-30 gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/assessments" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assessments
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{assessmentDetails.name}</h2>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                examStatus === "Active" ? "bg-emerald-50 border border-emerald-200 text-emerald-800 animate-pulse" :
                examStatus === "Scheduled" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                examStatus === "Completed" ? "bg-purple-50 border border-purple-200 text-purple-800" :
                examStatus === "Draft" ? "bg-slate-100 border border-slate-200 text-slate-600" :
                "bg-slate-200 text-slate-700"
              }`}>
                {examStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Subject Code: <span className="font-mono font-bold">{assessmentDetails.subject}</span> • Syllabus: {assessmentDetails.type}
            </p>
          </div>
        </div>

        {/* Action button corresponding to Exam Status */}
        <div className="flex items-center gap-2">
          {examStatus === "Draft" && (
            <button 
              onClick={() => {
                setExamStatus("Scheduled");
                alert("Simulation: Assessment published successfully! Status updated to Scheduled.");
              }}
              className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
            >
              <Play className="w-3.5 h-3.5" /> Publish Assessment
            </button>
          )}

          {examStatus === "Scheduled" && (
            <button 
              onClick={() => {
                setExamStatus("Active");
                alert("Simulation: Assessment manual window override. Exam is now active.");
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring animate-pulse"
            >
              <Play className="w-3.5 h-3.5" /> Force Activate Now
            </button>
          )}

          {examStatus === "Active" && (
            <>
              <Link 
                href={`/faculty/monitoring/${id}`}
                className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
              >
                <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Proctor Control Room
              </Link>
              <button 
                onClick={() => {
                  setExamStatus("Completed");
                  alert("Simulation: Assessment session terminated. Student files submitted.");
                }}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
              >
                <Lock className="w-3.5 h-3.5" /> Force Complete Exam
              </button>
            </>
          )}

          {examStatus === "Completed" && (
            <button 
              onClick={() => alert("Simulation: Downloading grading dossier containing student code repository submissions.")}
              className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Grading Sheet
            </button>
          )}

          <select 
            value={examStatus}
            onChange={(e) => setExamStatus(e.target.value as any)}
            className="border border-slate-200 bg-white rounded px-2.5 py-1.5 font-bold text-[10px] text-slate-800 focus:outline-hidden"
          >
            <option value="Draft">Simulate: Draft</option>
            <option value="Scheduled">Simulate: Scheduled</option>
            <option value="Active">Simulate: Active</option>
            <option value="Completed">Simulate: Completed</option>
          </select>
        </div>
      </header>

      {/* Statistics Cards Row */}
      <section className="bg-white border-b border-slate-200 px-6 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Roster Size</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalAssignedStudents} Candidates</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Active Exam Status</span>
          <span className={`text-xl font-extrabold mt-1 block ${examStatus === "Active" ? "text-emerald-700" : "text-slate-900"}`}>
            {examStatus === "Active" ? `${activeStudentsCount} Writing` : "No Sessions"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Submissions Collected</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {completedStudentsCount} / {totalAssignedStudents} ({Math.round((completedStudentsCount / totalAssignedStudents) * 100)}%)
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Integrity Violations</span>
          <span className={`text-xl font-extrabold mt-1 block ${disqualifiedStudentsCount > 0 ? "text-rose-700" : "text-slate-900"}`}>
            {disqualifiedStudentsCount} Disqualified
          </span>
        </div>
        <div className="bg-slate-50 p-2 border border-slate-200 rounded">
          <span className="text-slate-400 font-bold uppercase text-[9px] block">Allocated Time</span>
          <span className="text-base font-extrabold text-slate-800 mt-1 block flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> {assessmentDetails.duration} mins ({assessmentDetails.totalMarks} pts)
          </span>
        </div>
      </section>

      {/* Tabs navigation row */}
      <div className="bg-white border-b border-slate-200 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-start gap-4 font-bold text-slate-500 text-[10px] uppercase tracking-wider overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Outcomes", icon: BookOpen },
            { id: "questions", label: `Assigned Questions (${questions.length})`, icon: Code },
            { id: "roster", label: `Assigned Candidates (${students.length})`, icon: Users },
            { id: "security", label: "Proctoring Safeguards", icon: ShieldCheck },
            { id: "simulator", label: "Student IDE Simulator Preview", icon: Laptop }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 border-b-2 flex items-center gap-2 transition-all hover:text-slate-850 shrink-0 ${
                  activeTab === tab.id 
                    ? "border-navy-900 text-navy-950 font-extrabold" 
                    : "border-transparent text-slate-400"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Panels */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 flex-1 flex flex-col">
        
        {/* TAB 1: OVERVIEW & OUTCOMES */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Syllabus and Mappings */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Assessment Overview & Description
                </h3>
                <p className="text-slate-650 leading-relaxed">{assessmentDetails.description}</p>
                
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs">Course Outcome (CO) Mapping</h4>
                  <p className="text-slate-600 font-mono text-[10px] leading-relaxed">{assessmentDetails.outcomes}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Exam Syllabus Scope
                </h3>
                <pre className="text-slate-600 font-sans leading-relaxed whitespace-pre-line">{assessmentDetails.syllabus}</pre>
              </div>

            </div>

            {/* Sidebar Details and Settings */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Session Coordinates
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Start Time:</span>
                    <span className="font-bold text-slate-800 font-mono">{assessmentDetails.startTime.replace("T", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> End Time:</span>
                    <span className="font-bold text-slate-800 font-mono">{assessmentDetails.endTime.replace("T", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Exam Duration:</span>
                    <span className="font-bold text-slate-850">{assessmentDetails.duration} Minutes</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Marks weight:</span>
                    <span className="font-extrabold text-navy-800">{assessmentDetails.totalMarks} Points</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Assigned Student cohorts
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {assessmentDetails.batches.map(batch => (
                    <span key={batch} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-bold">
                      {batch}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  All candidates registered inside these departmental groups will be allocated a unique exam session access token automatically.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: QUESTIONS LIST */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Exam Question Paper Schema</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Consolidated Marks weight: <span className="font-bold text-slate-800">{questions.reduce((sum, q) => sum + q.marks, 0)} pts</span>.
                </p>
              </div>
              <button 
                onClick={() => router.push("/faculty/question-bank")}
                className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-850 px-3 py-1.5 rounded-md font-bold flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add From Question Bank
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-navy-900 text-white font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-950">{q.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
                        {q.topic} • Languages: {q.language}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-800" :
                        q.difficulty === "Medium" ? "bg-amber-50 text-amber-800" :
                        "bg-rose-50 text-rose-800"
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-xs">{q.marks} Marks</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed">
                    
                    {/* Left detailed prompt */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <h5 className="font-bold text-slate-850 uppercase text-[9px] tracking-wider mb-1">Problem Statement</h5>
                        <p className="text-slate-650 whitespace-pre-wrap">{q.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-bold text-slate-850 uppercase text-[9px] tracking-wider mb-1">Input Format</h5>
                          <p className="text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded">{q.inputFormat}</p>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-850 uppercase text-[9px] tracking-wider mb-1">Output Format</h5>
                          <p className="text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded">{q.outputFormat}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right IO cases */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 font-mono text-[10px]">
                      <div>
                        <h5 className="font-bold text-slate-850 uppercase text-[9px] tracking-wider mb-1 font-sans">Constraints</h5>
                        <pre className="text-slate-600 whitespace-pre-wrap">{q.constraints}</pre>
                      </div>

                      <div className="h-[1px] bg-slate-200 my-2"></div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase text-[8px] font-sans">Sample Input</h5>
                          <pre className="bg-white border border-slate-150 p-1.5 rounded text-slate-700 truncate">{q.sampleInput}</pre>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 uppercase text-[8px] font-sans">Sample Output</h5>
                          <pre className="bg-white border border-slate-150 p-1.5 rounded text-slate-700 truncate">{q.sampleOutput}</pre>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: STUDENT ROSTER & MONITORING */}
        {activeTab === "roster" && (
          <div className="space-y-6">
            
            {/* Search and filtering bars */}
            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs flex flex-col lg:flex-row gap-3 items-center justify-between">
              
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student by Name or Roll Number..."
                  className="w-full text-slate-900 border border-slate-200 rounded-md pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                <div>
                  <select 
                    value={studentFilterStatus}
                    onChange={(e) => setStudentFilterStatus(e.target.value)}
                    className="border border-slate-200 text-slate-900 bg-white rounded px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">All Session Statuses</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                </div>

                <div>
                  <select 
                    value={studentFilterSection}
                    onChange={(e) => setStudentFilterSection(e.target.value)}
                    className="border border-slate-200 text-slate-900 bg-white rounded px-3 py-1.5 focus:outline-hidden"
                  >
                    <option value="all">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>

                <button 
                  onClick={() => alert("Simulation: Dispatched email notifications containing passcode tokens to roster.")}
                  className="bg-white border border-slate-250 text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded font-bold"
                >
                  Email Passcodes
                </button>
              </div>

            </div>

            {/* Students roster table */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Section</th>
                      <th className="py-3 px-4">Exam Status</th>
                      <th className="py-3 px-4">Last Telemetry Active</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4 text-center">Warnings</th>
                      <th className="py-3 px-4">Compile Progress / Solution Notes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => (
                        <tr key={stud.roll} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            <Link href={`/faculty/students/${stud.roll}`} className="hover:underline hover:text-navy-900">
                              {stud.roll}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-950">
                            <Link href={`/faculty/students/${stud.roll}`} className="hover:underline">
                              {stud.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-semibold">{stud.dept}-{stud.year}-{stud.section}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              stud.status === "In Progress" ? "bg-amber-50 border border-amber-200 text-amber-800" :
                              stud.status === "Completed" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
                              stud.status === "Disqualified" ? "bg-rose-50 border border-rose-200 text-rose-800" :
                              "bg-slate-100 border border-slate-200 text-slate-500"
                            }`}>
                              {stud.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{stud.lastLogin}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{stud.ip}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-mono font-bold ${
                              stud.warningsCount >= warningThreshold ? "text-rose-600 animate-pulse text-sm" : 
                              stud.warningsCount > 0 ? "text-amber-600" : "text-slate-400"
                            }`}>
                              {stud.warningsCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-650 font-medium truncate max-w-[200px]" title={stud.progress}>
                            {stud.progress}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button 
                              onClick={() => handleOpenActionModal(stud.roll)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded text-[10px]"
                            >
                              Manage Session
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                          No assigned student candidates matched your filter tags.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manage Session Modal Popup Simulation */}
            {showRosterActionModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg text-xs leading-relaxed">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-extrabold text-slate-950 text-xs">
                      Manage Candidate Node Session: {showRosterActionModal}
                    </h4>
                    <button 
                      onClick={() => setShowRosterActionModal(null)} 
                      className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-600">
                    Apply manual overrides to the student session. These updates dispatch immediately to client nodes in the computer lab network.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => executeRosterAction("time")}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-850 font-bold p-3 rounded text-left flex flex-col gap-1 justify-between"
                    >
                      <span className="font-extrabold text-slate-950">Extend Time</span>
                      <span className="text-[9px] text-slate-400">Adds +15 minutes limit</span>
                    </button>
                    
                    <button 
                      onClick={() => executeRosterAction("submit")}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-850 font-bold p-3 rounded text-left flex flex-col gap-1 justify-between"
                    >
                      <span className="font-extrabold text-slate-950">Force Submit</span>
                      <span className="text-[9px] text-slate-400">Lock and compile active logs</span>
                    </button>

                    <button 
                      onClick={() => executeRosterAction("reset")}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-850 font-bold p-3 rounded text-left flex flex-col gap-1 justify-between"
                    >
                      <span className="font-extrabold text-slate-950">Clear Session</span>
                      <span className="text-[9px] text-slate-400">Reset warnings and re-auth</span>
                    </button>

                    <button 
                      onClick={() => executeRosterAction("disqualify")}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold p-3 rounded text-left flex flex-col gap-1 justify-between"
                    >
                      <span className="font-extrabold text-rose-900">Disqualify</span>
                      <span className="text-[9px] text-rose-550">Trigger integrity lockdown</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setShowRosterActionModal(null)}
                      className="bg-white border border-slate-250 text-slate-850 font-bold px-3 py-1.5 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: PROCTORING SAFEGUARDS */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* active constraints */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sandboxed Environment Restrictions</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle rules enforcing secure practical examinations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Fullscreen Locked Sandbox</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Blocks window scaling/exits immediately</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={fullscreenRequired} 
                      onChange={(e) => setFullscreenRequired(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 w-4.5 h-4.5 cursor-pointer shrink-0"
                    />
                  </div>

                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Block Clipboard Sync</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Disables paste scripts and text transfers</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={disableCopyPaste} 
                      onChange={(e) => setDisableCopyPaste(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 w-4.5 h-4.5 cursor-pointer shrink-0"
                    />
                  </div>

                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Block Context Menus</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Disables mouse right-clicks and inspector tools</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={disableRightClick} 
                      onChange={(e) => setDisableRightClick(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 w-4.5 h-4.5 cursor-pointer shrink-0"
                    />
                  </div>

                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">Tab Switch Focus Monitor</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Logs warning notifications on unfocus</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={tabSwitchMonitoring} 
                      onChange={(e) => setTabSwitchMonitoring(e.target.checked)}
                      className="rounded border-slate-350 text-navy-900 w-4.5 h-4.5 cursor-pointer shrink-0"
                    />
                  </div>

                </div>

                {tabSwitchMonitoring && (
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Tab Focus Warning Threshold</label>
                      <input 
                        type="number"
                        value={warningThreshold}
                        onChange={(e) => setWarningThreshold(Number(e.target.value))}
                        className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1 bg-white focus:outline-hidden"
                      />
                      <p className="text-[9px] text-slate-400">Count before visual dashboard alert triggers.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Auto-Submit Violation Limit</label>
                      <input 
                        type="number"
                        value={autoSubmitThreshold}
                        onChange={(e) => setAutoSubmitThreshold(Number(e.target.value))}
                        className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1 bg-white focus:outline-hidden"
                      />
                      <p className="text-[9px] text-slate-400">Total violations before terminal locks up.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* IP Subnet and Network restriction */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Institutional IP Lockdown
                </h3>
                <p className="text-slate-600 leading-normal">
                  Restricts access authorization strictly to whitelisted institutional LAN subnets (e.g. computer lab terminals).
                </p>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Allowed LAN Range (CIDR) *</label>
                  <input 
                    type="text"
                    value={ipWhiteList}
                    onChange={(e) => setIpWhiteList(e.target.value)}
                    placeholder="e.g. 192.168.12.0/24"
                    className="w-full text-slate-950 font-mono font-bold border border-slate-255 rounded px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Leave empty to whitelist all external network queries.</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-5 border border-slate-950 rounded-lg space-y-2">
                <span className="bg-navy-700 px-2 py-0.5 rounded font-mono font-bold text-[8px] tracking-wider uppercase text-blue-300">
                  Secured Lock Status
                </span>
                <p className="font-extrabold text-sm mt-1">Platform Sandbox Active</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Integrity configs are hashed and locked on exam start. Any faculty change requires session reset for candidates.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: STUDENT IDE PREVIEW SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
            
            {/* Left Simulator Navigation & Details */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <span className="bg-amber-100 text-amber-800 font-bold border border-amber-200 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">
                    Faculty Sandbox Simulator
                  </span>
                  <h3 className="text-xs font-extrabold text-slate-900 mt-2">Candidate Examination View</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Use this tab to preview exactly what students see and check test case outcomes.</p>
                </div>

                {/* Question selector inside IDE Simulator */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Select Exam Question:</label>
                  <select 
                    value={simSelectedQuestion.id}
                    onChange={(e) => {
                      const matched = questions.find(q => q.id === e.target.value);
                      if (matched) handleSimQuestionChange(matched);
                    }}
                    className="w-full border border-slate-250 text-slate-950 bg-white rounded px-2.5 py-1.5 font-bold focus:outline-hidden"
                  >
                    {questions.map((q, index) => (
                      <option key={q.id} value={q.id}>Q{index+1}: {q.title} ({q.marks} pts)</option>
                    ))}
                  </select>
                </div>

                {/* Interactive Question Detail Viewer inside IDE Simulator */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4.5 space-y-3 max-h-[350px] overflow-y-auto">
                  <h4 className="font-extrabold text-slate-900 text-xs">{simSelectedQuestion.title}</h4>
                  <p className="text-[10px] text-slate-500 font-bold font-mono uppercase">Difficulty: {simSelectedQuestion.difficulty} • Topic: {simSelectedQuestion.topic}</p>
                  
                  <div className="text-[11px] leading-relaxed text-slate-650 whitespace-pre-wrap">
                    {simSelectedQuestion.description}
                  </div>

                  <div className="h-[1px] bg-slate-200"></div>

                  <div className="space-y-2">
                    <div>
                      <p className="font-bold text-[9px] text-slate-800 uppercase">Input Specs</p>
                      <p className="text-slate-600 text-[10px] bg-white border border-slate-100 p-1.5 rounded font-mono">{simSelectedQuestion.inputFormat}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[9px] text-slate-800 uppercase">Output Specs</p>
                      <p className="text-slate-600 text-[10px] bg-white border border-slate-100 p-1.5 rounded font-mono">{simSelectedQuestion.outputFormat}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* simulated proctoring alert toggles */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2.5 pt-3">
                <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">Simulate Proctor Triggers</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleSimTabSwitch}
                    className="flex-1 bg-white hover:bg-slate-100 border border-slate-250 text-slate-800 font-bold px-2 py-2 rounded flex items-center justify-center gap-1.5 transition-all text-[10px]"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Lose Window Focus
                  </button>
                  
                  <button 
                    onClick={handleSimResetSecurity}
                    className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-850 p-2 rounded"
                    title="Reset Simulator telemetry"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-[10px] border-t border-slate-200/60 pt-2 font-mono">
                  <span className="text-slate-500">Warnings Counted:</span>
                  <span className={`font-extrabold ${simWarningsSimCount >= autoSubmitThreshold ? "text-rose-600" : simWarningsSimCount > 0 ? "text-amber-600" : "text-slate-400"}`}>
                    {simWarningsSimCount} / {autoSubmitThreshold} limit
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Code Editor Panel & Simulator Console */}
            <div className="lg:col-span-8 flex flex-col border border-slate-250 bg-slate-900 rounded-lg overflow-hidden shadow-xs min-h-[500px]">
              
              {/* IDE Header bar */}
              <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-400 font-mono text-[10px] ml-2 font-bold flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> secure-compiler-sandbox.bin</span>
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    value={simLanguage}
                    onChange={(e) => handleSimLanguageChange(e.target.value as any)}
                    className="bg-slate-850 border border-slate-700 text-slate-200 rounded px-2.5 py-1 font-bold text-[10px] font-mono focus:outline-hidden"
                  >
                    <option value="python">Python 3.10</option>
                    <option value="java">Java 17 (OpenJDK)</option>
                    <option value="cpp">C++17 (G++ 11)</option>
                  </select>

                  <button 
                    onClick={handleSimRunCode}
                    disabled={simIsRunningCode || simWarningsSimCount >= autoSubmitThreshold}
                    className={`font-bold px-3 py-1 rounded text-[10px] flex items-center gap-1 transition-all ${
                      simIsRunningCode 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : simWarningsSimCount >= autoSubmitThreshold
                        ? "bg-rose-950 text-rose-400 border border-rose-900 cursor-not-allowed"
                        : "bg-emerald-650 hover:bg-emerald-750 text-white font-extrabold"
                    }`}
                  >
                    {simIsRunningCode ? "Compiling..." : "Run Test Cases"}
                  </button>
                </div>
              </div>

              {/* IDE Editor Textarea workspace */}
              <div className="flex-1 relative font-mono text-[11px] flex flex-col">
                {/* Line Numbers Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-950/40 border-r border-slate-800/40 text-slate-600 select-none text-right pr-2 pt-3 font-semibold">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>

                <textarea 
                  value={simCode}
                  onChange={(e) => setSimCode(e.target.value)}
                  disabled={simWarningsSimCount >= autoSubmitThreshold}
                  className="w-full flex-1 bg-slate-900 text-slate-100 pl-11 pr-4 pt-3 font-mono leading-5 focus:outline-hidden resize-none min-h-[300px]"
                  style={{ tabSize: 4 }}
                />
              </div>

              {/* IDE Interactive Console panel */}
              <div className="bg-slate-950 border-t border-slate-800 p-4 font-mono text-[10px] space-y-2 h-[180px] overflow-y-auto flex flex-col justify-between shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold border-b border-slate-850 pb-1 mb-1.5 uppercase tracking-wider text-[8px]">
                    <Terminal className="w-3.5 h-3.5" /> Compiler Diagnostics Output
                  </div>
                  <pre className="text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                    {simConsoleOutput}
                  </pre>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-500 pt-2 border-t border-slate-900">
                  <span>TERMINAL NODE STATUS: {simWarningsSimCount >= autoSubmitThreshold ? "DISQUALIFIED / LOCKED" : "SANDBOX SECURE [OK]"}</span>
                  <span>CPU: 0.12% • MEM: 14.8MB</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
      
    </div>
  );
}
