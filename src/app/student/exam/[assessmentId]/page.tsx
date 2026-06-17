"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadAssessments, loadQuestions } from "@/lib/storage";
import { 
  Play, 
  Send, 
  Clock, 
  AlertOctagon, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  Terminal,
  Maximize2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Settings,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Volume2
} from "lucide-react";
import Editor from "@monaco-editor/react";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

interface TestCase {
  id: number;
  input: string;
  expected: string;
  actual?: string;
  status: "passed" | "failed" | "unrun";
  isHidden: boolean;
}

interface MockQuestion {
  id: string;
  num: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  marks: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  codeTemplates: {
    c: string;
    cpp: string;
    java: string;
    python: string;
  };
}

const STATIC_QUESTIONS: MockQuestion[] = [
  {
    id: "q1",
    num: 1,
    title: "Invert a Binary Tree",
    difficulty: "Medium",
    topic: "Data Structures",
    marks: 15,
    description: "Given the root of a binary tree, invert the tree, and return its root. Inverting a binary tree means exchanging left and right subtrees of every node.",
    inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal format.",
    outputFormat: "Output the level-order traversal array of the inverted binary tree.",
    constraints: "The number of nodes in the tree is in the range [0, 1000].\nNode values range from -100 to 100.",
    sampleInput: "4 2 7 1 3 6 9",
    sampleOutput: "4 7 2 9 6 3 1",
    explanation: "Each node's left and right pointers are recursively swapped. For 4's children, 2 and 7 become 7 and 2. Their children are swapped similarly.",
    codeTemplates: {
      c: `// Language: C\n#include <stdio.h>\n#include <stdlib.h>\n\nstruct TreeNode {\n    int val;\n    struct TreeNode* left;\n    struct TreeNode* right;\n};\n\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    // Write your code here\n    if (root == NULL) return NULL;\n    struct TreeNode* temp = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(temp);\n    return root;\n}`,
      cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};\n\nTreeNode* invertTree(TreeNode* root) {\n    // Write your C++ code here\n    if (root == NULL) return NULL;\n    TreeNode* temp = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(temp);\n    return root;\n}`,
      java: `// Language: Java (OpenJDK 17)\nimport java.util.*;\n\nclass Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your Java code here\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}`,
      python: `# Language: Python 3.10\ndef solve():\n    # Write your Python code here\n    pass\n\nsolve()`
    }
  },
  {
    id: "q2",
    num: 2,
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    topic: "Data Structures",
    marks: 15,
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST satisfies: left child is less than root, right child is greater than root, and all subtrees are also valid BSTs.",
    inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal.",
    outputFormat: "Output 'true' if the tree is a valid BST, otherwise output 'false'.",
    constraints: "Number of nodes is in range [1, 10000].\nNode values range from -2^31 to 2^31 - 1.",
    sampleInput: "2 1 3",
    sampleOutput: "true",
    explanation: "2 is the root. Left child is 1 (< 2). Right child is 3 (> 2). Tree meets all BST criteria.",
    codeTemplates: {
      c: `// Language: C\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isValidBST(struct TreeNode* root) {\n    // Write your code here\n    return true;\n}`,
      cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nbool isValidBST(TreeNode* root) {\n    // Write your code here\n    return true;\n}`,
      java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public boolean isValidBST(TreeNode root) {\n        // Write your code here\n        return true;\n    }\n}`,
      python: `# Language: Python 3.10\ndef solve():\n    # Validate BST here\n    return True\n\nprint(solve())`
    }
  },
  {
    id: "q3",
    num: 3,
    title: "Implement Dijkstra Shortest Path",
    difficulty: "Hard",
    topic: "Algorithms",
    marks: 20,
    description: "Given a weighted undirected graph with V vertices and E edges, find the shortest distance of all the vertices from the source vertex S. Return an array of distances.",
    inputFormat: "The first line contains V and E. Next E lines represent edges: u v w (source, destination, weight). The final line contains S (source node).",
    outputFormat: "Return space-separated integers representing the shortest path from S to each node.",
    constraints: "1 <= V <= 1000\n1 <= E <= 10000\n1 <= w <= 1000",
    sampleInput: "2 1\n0 1 9\n0",
    sampleOutput: "0 9",
    explanation: "Source is 0. Distance from 0 to 0 is 0. Distance from 0 to 1 is weight 9. Array output: 0 9.",
    codeTemplates: {
      c: `// Language: C\n#include <stdio.h>\n\nvoid dijkstra(int V, int S) {\n    // Write your code here\n}`,
      cpp: `// Language: C++17\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> dijkstra(int V, int S) {\n    // Write your code here\n    return {};\n}`,
      java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public int[] dijkstra(int V, int S) {\n        // Write your code here\n        return new int[V];\n    }\n}`,
      python: `# Language: Python 3.10\ndef dijkstra(V, S):\n    # Write your code here\n    return [0] * V\n\nprint(dijkstra(2, 0))`
    }
  },
  {
    id: "q4",
    num: 4,
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    topic: "Algorithms",
    marks: 20,
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    inputFormat: "First line contains K, the number of lists. Next K lines detail lists, starting with node count N, then N sorted integers.",
    outputFormat: "Output space-separated integers representing the single merged sorted list.",
    constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4",
    sampleInput: "3\n3 1 4 5\n3 1 3 4\n2 2 6",
    sampleOutput: "1 1 2 3 4 4 5 6",
    explanation: "The lists are [1->4->5], [1->3->4], and [2->6]. Merging them in order gives [1->1->2->3->4->4->5->6].",
    codeTemplates: {
      c: `// Language: C\n#include <stdio.h>\n\nstruct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {\n    // Write your code here\n    return NULL;\n}`,
      cpp: `// Language: C++17\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    // Write your code here\n    return NULL;\n}`,
      java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your code here\n        return null;\n    }\n}`,
      python: `# Language: Python 3.10\ndef mergeKLists(lists):\n    # Write your code here\n    return []\n\nprint(mergeKLists([]))`
    }
  },
  {
    id: "q5",
    num: 5,
    title: "Maximum Subarray Sum",
    difficulty: "Easy",
    topic: "Algorithms",
    marks: 10,
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    inputFormat: "First line contains N, the size of the array. Next line contains N space-separated integers.",
    outputFormat: "Output a single integer representing the maximum contiguous subarray sum.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
    sampleOutput: "6",
    explanation: "The contiguous subarray [4,-1,2,1] has the largest sum = 6.",
    codeTemplates: {
      c: `// Language: C\n#include <stdio.h>\n\nint maxSubArray(int* nums, int numsSize) {\n    // Write your code here\n    return 0;\n}`,
      cpp: `// Language: C++17\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}`,
      java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`,
      python: `# Language: Python 3.10\ndef maxSubArray(nums):\n    # Write your code here\n    return 0\n\nprint(maxSubArray([-2, 1, -3, 4]))`
    }
  }
];

export default function StudentExamWorkspace({ params }: PageProps) {
  const { assessmentId } = use(params);
  const router = useRouter();

  // Dynamic Exam details state loaded from localStorage
  const [examData, setExamData] = useState({
    id: assessmentId || "1",
    name: "Loading Examination Details...",
    subject: "...",
    duration: 180,
    totalMarks: 50
  });

  // Screen layout size variables
  const [highContrast, setHighContrast] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  // Network connection failure simulation
  const [networkError, setNetworkError] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Auto save variables
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Last Saved">("Saved");
  const [lastSavedTime, setLastSavedTime] = useState("");

  // Proctoring Warnings
  const [warningsCount, setWarningsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Finish assessment variables
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Active exam questions (initialized to static fallback, populated dynamically from localStorage)
  const [questions, setQuestions] = useState<MockQuestion[]>(STATIC_QUESTIONS);
  const [currentQuestion, setCurrentQuestion] = useState<MockQuestion>(STATIC_QUESTIONS[0]);
  const [questionStates, setQuestionStates] = useState<Record<string, "not-visited" | "visited" | "attempted" | "submitted">>({
    q1: "visited",
    q2: "not-visited",
    q3: "not-visited",
    q4: "not-visited",
    q5: "not-visited"
  });

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<"c" | "cpp" | "java" | "python">("python");
  const [codeContent, setCodeContent] = useState<Record<string, string>>({
    q1: STATIC_QUESTIONS[0].codeTemplates.python,
    q2: STATIC_QUESTIONS[1].codeTemplates.python,
    q3: STATIC_QUESTIONS[2].codeTemplates.python,
    q4: STATIC_QUESTIONS[3].codeTemplates.python,
    q5: STATIC_QUESTIONS[4].codeTemplates.python
  });

  // Console panel states
  const [consoleTab, setConsoleTab] = useState<"output">("output");
  const [customInput, setCustomInput] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string>("Workspace initialized. Ready to execute code compilers.");
  const [testCasesResults, setTestCasesResults] = useState<TestCase[]>([
    { id: 1, input: "4 2 7 1 3 6 9", expected: "4 7 2 9 6 3 1", status: "unrun", isHidden: false },
    { id: 2, input: "2 1 3", expected: "true", status: "unrun", isHidden: false },
    { id: 3, input: "Hidden test cases run on compile", expected: "Match", status: "unrun", isHidden: true }
  ]);

  // Exam timer states
  const [timeLeft, setTimeLeft] = useState("01:24:15");

  // Dynamic status of the current question
  const isQuestionSubmitted = questionStates[currentQuestion.id] === "submitted";

  // Fullscreen checking state
  const [isFullscreenActive, setIsFullscreenActive] = useState(true);

  // Hydrate exam metadata and questions from localStorage
  useEffect(() => {
    const assessments = loadAssessments();
    const foundAssessment = assessments.find(a => a.id === assessmentId);
    const allQuestions = loadQuestions();

    if (foundAssessment) {
      setExamData({
        id: foundAssessment.id,
        name: foundAssessment.name,
        subject: foundAssessment.subject,
        duration: foundAssessment.duration,
        totalMarks: foundAssessment.questionsCount * 15
      });

      // Timer format
      const hr = Math.floor(foundAssessment.duration / 60);
      const min = foundAssessment.duration % 60;
      const pad = (n: number) => String(n).padStart(2, "0");
      setTimeLeft(`${pad(hr)}:${pad(min)}:00`);

      const limit = foundAssessment.questionsCount;
      const selectedQuestions = allQuestions.slice(0, limit);

      if (selectedQuestions.length > 0) {
        const mapped = selectedQuestions.map((q, idx) => {
          const matchedStatic = STATIC_QUESTIONS.find(sq => sq.title.toLowerCase() === q.title.toLowerCase());
          if (matchedStatic) {
            return {
              ...matchedStatic,
              id: q.id,
              num: idx + 1,
              marks: q.marks,
              difficulty: q.difficulty,
              topic: q.topic
            };
          }
          return {
            id: q.id,
            num: idx + 1,
            title: q.title,
            difficulty: q.difficulty,
            topic: q.topic,
            marks: q.marks,
            description: `Problem statement for "${q.title}". Write a program in the selected language to solve the challenge.`,
            inputFormat: "Standard keyboard console input.",
            outputFormat: "Standard output matching problem requirements.",
            constraints: "Time: 2000ms\nMemory: 256MB",
            sampleInput: "No sample input defined.",
            sampleOutput: "No sample output defined.",
            explanation: "Process values dynamically.",
            codeTemplates: {
              c: `// Language: C\n#include <stdio.h>\n\nint main() {\n    // solve\n    return 0;\n}`,
              cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // solve\n    return 0;\n}`,
              java: `// Language: Java 17\nclass Solution {\n    public static void main(String[] args) {\n        // solve\n    }\n}`,
              python: `# Language: Python 3.10\ndef solve():\n    pass\n\nsolve()`
            }
          };
        });

        setQuestions(mapped);
        setCurrentQuestion(mapped[0]);

        const initialCodes: Record<string, string> = {};
        mapped.forEach(mq => {
          initialCodes[mq.id] = mq.codeTemplates.python;
        });
        setCodeContent(initialCodes);

        const initialStates: Record<string, "not-visited" | "visited" | "attempted" | "submitted"> = {};
        mapped.forEach((mq, idx) => {
          initialStates[mq.id] = idx === 0 ? "visited" : "not-visited";
        });
        setQuestionStates(initialStates);
      }
    }
  }, [assessmentId]);

  // Monitor window resize, tab focus and fullscreen locks
  useEffect(() => {
    // Check fullscreen initially
    setIsFullscreenActive(!!document.fullscreenElement);

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreenActive(active);
      if (!active && !showSuspendModal) {
        triggerProctorViolation("Fullscreen exited. Please restore immediately.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !showSuspendModal) {
        triggerProctorViolation("Tab switch focus lost.");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent copy, paste, select all, cuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")) {
        e.preventDefault();
        triggerProctorViolation("Keyboard copying/pasting shortcuts are restricted.");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerProctorViolation("Right-click context menu is restricted.");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [warningsCount, showSuspendModal]);

  // Network Error Reconnection simulation
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    if (networkError) {
      reconnectTimer = setInterval(() => {
        setReconnectAttempts(prev => {
          if (prev >= 4) {
            // Simulated recovery
            setNetworkError(false);
            setConsoleOutput(current => current + "\n[NETWORK RECOVERY] Reconnected to PSG Sandbox compilers. Restoring auto-save cache...");
            setSaveStatus("Saved");
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(reconnectTimer);
  }, [networkError]);

  // Timer countdown simulation
  useEffect(() => {
    const clockTimer = setInterval(() => {
      // Don't countdown if network error is active (pauses screen context)
      if (networkError) return;

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
          clearInterval(clockTimer);
          triggerAutoSubmit("Timer expired.");
          return "00:00:00";
        }

        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(hr)}:${pad(min)}:${pad(sec)}`;
      });
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [networkError]);

  // Auto save simulation
  useEffect(() => {
    const saveTimer = setInterval(() => {
      if (networkError || showSuspendModal) return;

      setSaveStatus("Saving...");
      setTimeout(() => {
        setSaveStatus("Saved");
        const now = new Date();
        setLastSavedTime(now.toTimeString().split(" ")[0]);
      }, 800);
    }, 5000);

    return () => clearInterval(saveTimer);
  }, [networkError, showSuspendModal]);

  const triggerProctorViolation = (reason: string) => {
    if (showSuspendModal) return;
    const nextWarnings = warningsCount + 1;
    setWarningsCount(nextWarnings);

    if (nextWarnings >= 3) {
      setShowSuspendModal(true);
      setShowWarningModal(false);
      triggerAutoSubmit(`Proctor violation threshold reached (${nextWarnings}/3 warnings).`);
    } else {
      setShowWarningModal(true);
    }
  };

  const handleFullscreenRestore = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setShowWarningModal(false);
    } catch (err) {
      alert("Error: Fullscreen access blocked. Ensure browser permission is allowed.");
    }
  };

  // Switch questions
  const navigateToQuestion = (q: MockQuestion) => {
    // Update question visited state
    setQuestionStates(prev => {
      const next = { ...prev };
      if (next[currentQuestion.id] === "not-visited") {
        next[currentQuestion.id] = "visited";
      }
      if (next[q.id] === "not-visited") {
        next[q.id] = "visited";
      }
      return next;
    });
    setCurrentQuestion(q);
    setConsoleOutput(`Switched to Question ${q.num}: "${q.title}". Console ready.`);
    setConsoleTab("output");
  };

  // Compile code template mapping
  const handleEditorCodeChange = (val: string | undefined) => {
    if (isQuestionSubmitted || networkError) return;
    if (val === undefined) return;
    setCodeContent(prev => ({
      ...prev,
      [currentQuestion.id]: val
    }));
  };

  // Language update
  const handleLanguageUpdate = (lang: "c" | "cpp" | "java" | "python") => {
    setSelectedLanguage(lang);
    setCodeContent(prev => ({
      ...prev,
      [currentQuestion.id]: currentQuestion.codeTemplates[lang]
    }));
    setConsoleOutput(`Language environment configured to: ${lang.toUpperCase()}`);
  };

  // Run Code logic
  const executeRunCode = () => {
    if (isQuestionSubmitted || networkError) return;
    setIsRunning(true);
    setConsoleTab("output");
    setConsoleOutput("Initializing compiler container...\nCompiling code units...\nExecuting test cases...");

    setTimeout(() => {
      setIsRunning(false);
      setConsoleOutput(
        `Execution Successful!\n` +
        `-----------------------------\n` +
        `Test Case 1: PASSED [OK]\n` +
        `  Input:  ${currentQuestion.sampleInput}\n` +
        `  Expected: ${currentQuestion.sampleOutput}\n` +
        `  Actual:   ${currentQuestion.sampleOutput}\n\n` +
        `Test Case 2: PASSED [OK]\n` +
        `  Input:  Boundary edge cases validated.\n\n` +
        `STATUS: RUN SUCCESS (All compile test cases verified)`
      );
      setTestCasesResults(prev => prev.map(tc => ({ ...tc, status: "passed" })));

      // Mark question state as attempted
      setQuestionStates(prev => {
        if (prev[currentQuestion.id] === "visited" || prev[currentQuestion.id] === "not-visited") {
          return { ...prev, [currentQuestion.id]: "attempted" };
        }
        return prev;
      });
    }, 1200);
  };

  // Submit Question Solution logic
  const executeSubmitCode = () => {
    if (isQuestionSubmitted || networkError) return;
    const confirmSubmit = window.confirm("Are you sure you want to submit code for Q" + currentQuestion.num + "? This will lock your editor updates.");
    if (!confirmSubmit) return;

    setConsoleTab("output");
    setConsoleOutput("Running code through secure institutional test harness...\nEvaluating inputs...");

    setTimeout(() => {
      setQuestionStates(prev => ({
        ...prev,
        [currentQuestion.id]: "submitted"
      }));
      setConsoleOutput(current => current + "\nSubmission stored. Solution locked [OK]");
    }, 1000);
  };

  const triggerAutoSubmit = (reason: string) => {
    setConsoleOutput(current => current + `\n[CRITICAL LOCKDOWN] Exam Auto-submission triggered. Reason: ${reason}`);
    // Simulated submit code
    setQuestionStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        next[key] = "submitted";
      });
      return next;
    });
  };

  const handleFinishAssessment = () => {
    setShowFinishModal(true);
  };

  const executeFinalSubmit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    alert("Exam submission finalized. Redirecting to student dashboard.");
    router.push("/student/dashboard");
  };

  return (
    <div className={`min-h-screen bg-slate-950 flex flex-col font-sans select-none overflow-hidden ${
      highContrast ? "high-contrast" : ""
    }`}>
      
      {/* Mobile Block Layout (Mobile Access Restricted) */}
      <div className="flex md:hidden fixed inset-0 z-50 bg-slate-900 text-white flex-col justify-center items-center p-6 text-center">
        <XCircle className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Mobile Access Restricted</h2>
        <p className="text-slate-400 mt-2 text-xs leading-relaxed max-w-xs">
          This secure examination can only be taken on a desktop, laptop, or authorized workstation screen scale.
        </p>
        <Link 
          href="/student/dashboard" 
          className="mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded text-xs"
        >
          Return to Portal
        </Link>
      </div>

      {/* Network Failure Overlay */}
      {networkError && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 max-w-sm w-full rounded-lg shadow-2xl p-6 space-y-4 border border-rose-300 text-center">
            <RefreshCw className="w-10 h-10 text-rose-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-rose-900 uppercase">Connection Interrupted</h3>
              <p className="text-slate-600 text-xs">PSG network connection lost. Attempting Reconnect...</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[10px] text-slate-500 text-left space-y-1">
              <p>• Status: Socket connection retry</p>
              <p>• Reconnect Attempt: {reconnectAttempts} / 5</p>
              <p>• Local Cache: Saved (Auto-save recovery ok)</p>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Please remain in your workstation. The exam timer is paused.
            </p>
          </div>
        </div>
      )}

      {/* TOP EXAM BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold">
            Secure IDE
          </span>
          <div className="h-4 w-[1px] bg-slate-700"></div>
          <div>
            <h1 className="text-white font-bold text-xs tracking-tight">{examData.name}</h1>
            <p className="text-[9px] text-slate-500 font-mono">
              Course: <span className="font-bold">{examData.subject}</span> • Target: PSG Lab Final
            </p>
          </div>
        </div>

        {/* Dynamic center status info */}
        <div className="flex items-center gap-8 font-sans font-bold">
          
          {/* Active Timer */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-slate-400 uppercase text-[9px]">Time Remaining:</span>
            <span className="font-mono text-emerald-500 font-extrabold bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-xs">
              {timeLeft}
            </span>
          </div>

          <div className="text-slate-400 border-l border-slate-800 pl-6 hidden md:block">
            Question State: <span className="text-white font-mono">{currentQuestion.num} of {questions.length}</span>
          </div>

          <div className="text-slate-400 border-l border-slate-800 pl-6 hidden md:block">
            Proctor warnings: <span className={`font-mono ${warningsCount > 0 ? "text-rose-400" : "text-slate-500"}`}>{warningsCount}/3</span>
          </div>
        </div>

        {/* Right operations */}
        <div className="flex items-center gap-2">
          
          {/* Simulation Helper triggers */}
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 mr-2 text-[8px] font-bold">
            <button 
              onClick={() => setNetworkError(true)}
              className="px-2 py-1 text-slate-500 hover:text-slate-300 transition-colors uppercase"
            >
              [Simulate Disconnect]
            </button>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`px-2 py-1 transition-all rounded uppercase ${
                highContrast ? "bg-slate-800 text-white" : "text-slate-500"
              }`}
            >
              Contrast
            </button>
          </div>

          <button 
            onClick={handleFinishAssessment}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2 rounded text-[10px] uppercase tracking-wider transition-all shadow-xs"
          >
            Finish Exam
          </button>
        </div>
      </header>

      {/* CORE SPLIT THREE PANEL WORKSPACE */}
      <main className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-100px)] items-stretch">
        
        {/* PANEL 1: LEFT QUESTION NAVIGATOR (col-span-1) */}
        <section className="col-span-1 bg-slate-950 border-r border-slate-900 p-3 flex flex-col justify-between items-center py-5 shrink-0">
          <div className="space-y-4 w-full text-center">
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1.5">NAV</p>
            
            <div className="flex flex-col gap-3 items-center">
              {questions.map(q => {
                const state = questionStates[q.id];
                const isCurrent = currentQuestion.id === q.id;
                return (
                  <button 
                    key={q.id}
                    onClick={() => navigateToQuestion(q)}
                    className={`w-9 h-9 rounded-full font-mono font-bold text-xs flex items-center justify-center border transition-all ${
                      isCurrent 
                        ? "border-white bg-slate-800 text-white ring-2 ring-blue-500 shadow-xs" 
                        : state === "submitted"
                        ? "bg-emerald-950/80 border-emerald-700 text-emerald-400"
                        : state === "attempted"
                        ? "bg-blue-950/80 border-blue-700 text-blue-400"
                        : state === "visited"
                        ? "bg-amber-950/60 border-amber-800 text-amber-500"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}
                    title={`Question ${q.num}: ${state.replace("-", " ")}`}
                  >
                    Q{q.num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Code indicators legend */}
          <div className="space-y-2.5 w-full text-[9px] border-t border-slate-900 pt-4 font-sans font-bold leading-none text-left pl-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-slate-900 border border-slate-800 shrink-0"></span>
              <span className="text-slate-500">Unseen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-amber-950/60 border border-amber-800 shrink-0"></span>
              <span className="text-amber-500">Seen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-blue-950/80 border border-blue-700 shrink-0"></span>
              <span className="text-blue-500">Tested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-emerald-950/80 border border-emerald-700 shrink-0"></span>
              <span className="text-emerald-400">Locked</span>
            </div>
          </div>
        </section>

        {/* PANEL 2: CENTER QUESTION DETAIL CONTENT (col-span-5) */}
        <section className="col-span-5 bg-slate-950 border-r border-slate-900 overflow-y-auto flex flex-col justify-between h-full">
          
          <div className="p-6 space-y-6 font-sans text-slate-300 leading-relaxed text-[11px]">
            
            {/* Header info */}
            <div className="space-y-2 border-b border-slate-900 pb-3">
              <div className="flex justify-between items-center">
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[9px] text-slate-400">
                  Problem {currentQuestion.num} of {questions.length}
                </span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                  currentQuestion.difficulty === "Easy" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" :
                  currentQuestion.difficulty === "Medium" ? "bg-amber-950/60 text-amber-400 border border-amber-800" :
                  "bg-rose-950/60 text-rose-400 border border-rose-800"
                }`}>
                  {currentQuestion.difficulty} • {currentQuestion.marks} Marks
                </span>
              </div>
              
              <h2 className="text-white font-extrabold text-sm tracking-tight">{currentQuestion.title}</h2>
              <p className="text-[9px] text-slate-500 font-mono">TOPIC CLASSIFICATION: {currentQuestion.topic}</p>
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <h3 className="text-white font-bold text-xs uppercase tracking-wide font-mono">Problem Statement</h3>
              <p className="text-slate-300">{currentQuestion.description}</p>
            </div>

            {/* Formats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-white font-bold font-mono uppercase text-[9px]">Input Format</h4>
                <p className="bg-slate-900/60 border border-slate-900 p-2.5 rounded text-slate-400 leading-normal">{currentQuestion.inputFormat}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold font-mono uppercase text-[9px]">Output Format</h4>
                <p className="bg-slate-900/60 border border-slate-900 p-2.5 rounded text-slate-400 leading-normal">{currentQuestion.outputFormat}</p>
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-1.5 font-mono text-[10px]">
              <h4 className="text-white font-bold font-sans uppercase">Constraints</h4>
              <pre className="bg-slate-900/40 p-2.5 border border-slate-900 rounded text-slate-450 whitespace-pre-wrap">{currentQuestion.constraints}</pre>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wide font-mono">Example Evaluation</h4>
              
              <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-4 space-y-3 font-mono text-[10px]">
                <div>
                  <span className="text-slate-400 font-bold">Sample Input:</span>
                  <pre className="bg-slate-950 border border-slate-900 p-2 rounded text-slate-300 mt-1">{currentQuestion.sampleInput}</pre>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">Sample Output:</span>
                  <pre className="bg-slate-950 border border-slate-900 p-2 rounded text-slate-300 mt-1">{currentQuestion.sampleOutput}</pre>
                </div>
                <div className="pt-1.5 border-t border-slate-900/50">
                  <span className="text-slate-400 font-bold font-sans">Explanation:</span>
                  <p className="text-slate-400 font-sans mt-0.5 leading-normal">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Locked status details */}
          {isQuestionSubmitted && (
            <div className="bg-emerald-950/40 border-t border-emerald-900/80 p-4 flex gap-2 items-center text-[10px] text-emerald-400 font-sans font-bold uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-500" /> Solution submitted and locked for this question
            </div>
          )}
        </section>

        {/* PANEL 3: RIGHT Monaco Editor (col-span-6) */}
        <section className="col-span-6 bg-slate-900 flex flex-col h-full justify-between overflow-hidden">
          
          {/* Code Editor Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 font-sans">
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-bold">Language:</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => handleLanguageUpdate(e.target.value as any)}
                disabled={isQuestionSubmitted}
                className="bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-hidden font-bold disabled:opacity-50"
              >
                <option value="python">Python 3.10</option>
                <option value="java">Java (OpenJDK 17)</option>
                <option value="cpp">C++17 (G++ 9.2)</option>
                <option value="c">C (GCC 9.2)</option>
              </select>
            </div>

            {/* Save Status Indicators */}
            <div className="flex items-center gap-4 text-[10px]">
              
              <div className="flex items-center gap-2 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === "Saving..." ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                }`}></span>
                <span className="text-slate-400">
                  {saveStatus === "Saving..." ? "Saving..." : `Auto-saved (${lastSavedTime || "Active"})`}
                </span>
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setEditorTheme(prev => prev === "vs-dark" ? "light" : "vs-dark")}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider"
              >
                {editorTheme === "vs-dark" ? "Light theme" : "Dark theme"}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 bg-slate-950 relative min-h-[300px] overflow-hidden">
            <Editor
              height="100%"
              theme={editorTheme}
              language={selectedLanguage === "python" ? "python" : selectedLanguage === "java" ? "java" : "cpp"}
              value={codeContent[currentQuestion.id]}
              onChange={handleEditorCodeChange}
              options={{
                readOnly: isQuestionSubmitted || networkError,
                fontSize: 12,
                minimap: { enabled: false },
                lineNumbers: "on",
                automaticLayout: true,
                tabSize: 4,
                cursorBlinking: "smooth"
              }}
              loading={
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-950 font-mono">
                  Loading Secure Monaco Compiler Editor...
                </div>
              }
            />

            {isQuestionSubmitted && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <Lock className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="font-extrabold text-white text-xs uppercase tracking-wider font-sans">Solution Locked</p>
                <p className="text-slate-400 mt-1 font-medium font-sans">You have submitted your final solution for this question.</p>
              </div>
            )}
          </div>

          {/* BOTTOM PANEL: CONSOLE TABS (Input, Output, Test Results) */}
          <div className="bg-slate-950 border-t border-slate-800 h-[190px] flex flex-col justify-between shrink-0 font-mono text-[10px]">
            
            {/* Console Tabs */}
            <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shrink-0 font-sans font-bold">
              <div className="flex gap-2">
                {[
                  { id: "output", label: "Console Log" }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setConsoleTab(tab.id as any)}
                    className={`px-3 py-2 border-b-2 text-[10px] uppercase tracking-wider transition-all hover:text-white ${
                      consoleTab === tab.id 
                        ? "border-blue-500 text-white font-extrabold" 
                        : "border-transparent text-slate-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-slate-500 text-[8px] uppercase tracking-widest font-mono">
                CPU: 0.05% • MEM: 10.4MB
              </div>
            </div>

            {/* Tab content workspace */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/60">
              
              {/* Tab 2: Console Log */}
              {consoleTab === "output" && (
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase text-[8px] font-bold block mb-1.5 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> Compiler Diagnostics Output</span>
                  <pre className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap font-medium">
                    {consoleOutput}
                  </pre>
                </div>
              )}

            </div>

            {/* Action buttons inside Console footer */}
            <div className="bg-slate-950 border-t border-slate-900 px-4 py-2 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={executeRunCode}
                disabled={isRunning || isQuestionSubmitted || networkError}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-1.5 rounded font-sans font-bold flex items-center gap-1.5 transition-all text-[10px] disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Code
              </button>

              <button 
                onClick={executeSubmitCode}
                disabled={isQuestionSubmitted || networkError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded font-sans font-bold flex items-center gap-1.5 transition-all text-[10px] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Solution
              </button>
            </div>

          </div>

        </section>

      </main>

      {/* Proctor violation warning dialog popup */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-950 max-w-sm w-full rounded-lg shadow-2xl overflow-hidden border border-rose-200 text-xs leading-relaxed">
            <div className="bg-rose-600 px-4 py-3 text-white flex items-center gap-2 font-sans font-bold">
              <AlertOctagon className="w-5 h-5 animate-bounce" />
              <h5 className="font-extrabold text-sm uppercase">SECURITY WARNING INCIDENT</h5>
            </div>
            
            <div className="p-5 space-y-4 font-sans text-slate-750">
              <p className="font-bold text-slate-800">
                A secure browser window violation was registered!
              </p>
              
              <p className="text-slate-600">
                You unfocused the browser window or toggled browser tabs. Your node session is tracked. 
              </p>
              
              <div className="bg-rose-50 border border-rose-200 p-3 rounded font-mono font-bold flex justify-between items-center text-[10px] text-rose-800">
                <span>WARNINGS ACCUMULATED:</span>
                <span>{warningsCount} / 3</span>
              </div>
              
              <p className="text-[10px] text-slate-400 italic">
                * Reaching 3 violations will auto-submit all solution sheets and disqualify this session.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleFullscreenRestore}
                  className="flex-1 bg-white hover:bg-slate-100 border border-slate-250 text-slate-800 py-2 rounded-md font-bold text-xs transition-all flex items-center justify-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" /> Enter Fullscreen
                </button>
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-bold text-xs transition-all uppercase"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disqualified Suspension Dialog Popup */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-950 max-w-md w-full rounded-lg shadow-2xl overflow-hidden border border-rose-300">
            <div className="bg-rose-700 px-5 py-4 text-white flex items-center gap-2 font-sans">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h5 className="font-extrabold text-base tracking-tight">EXAMINATION TERMINATED</h5>
            </div>
            
            <div className="p-6 space-y-4 font-sans text-xs leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">
                Terminal Lock Activated
              </p>
              
              <p className="text-slate-650">
                Your practical exam node session has been auto-submitted and locked because the tab switch threshold ({warningsCount} violations) was reached. 
              </p>
              
              <div className="bg-rose-50 border border-rose-250 p-4 rounded font-mono text-[10px] text-rose-800 leading-normal space-y-1">
                <p className="font-bold uppercase border-b border-rose-200/50 pb-1 mb-1">Violation Logs:</p>
                <p>• Client IP: 192.168.12.104</p>
                <p>• Total tab-switch violations: {warningsCount} detected</p>
                <p>• Action: Sandbox locked, active code files submitted.</p>
              </div>
              
              <p className="text-slate-500 font-medium">
                To unlock your node session, contact your exam supervisor at the computer laboratory main desk.
              </p>

              <button
                onClick={executeFinalSubmit}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-md font-bold text-xs transition-all uppercase tracking-wide"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish assessment confirmation dialog popup */}
      {showFinishModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-950 max-w-sm w-full rounded-lg shadow-2xl overflow-hidden border border-slate-200 text-xs leading-relaxed">
            <div className="bg-slate-900 px-4 py-3 text-white flex items-center gap-2 font-sans font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h5 className="font-extrabold text-sm uppercase">SUBMIT ENTIRE ASSESSMENT</h5>
            </div>
            
            <div className="p-5 space-y-4 font-sans text-slate-750">
              <p className="font-bold text-slate-800">
                Are you ready to submit your exam paper?
              </p>
              
              <p className="text-slate-600">
                You are about to submit your entire assessment. This will submit all code solutions and close your active compiler session. You will not be able to re-enter.
              </p>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-[9px] text-slate-500 space-y-1">
                <p>• Assigned Tasks: {questions.length} problems</p>
                <p>• Locked Submissions: {Object.values(questionStates).filter(s => s === "submitted").length} items</p>
                <p>• Time Remaining: {timeLeft}</p>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-850 px-3 py-2 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={executeFinalSubmit}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded font-bold"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
