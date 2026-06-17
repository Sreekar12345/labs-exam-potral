"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadQuestions, saveQuestions, loadFacultyProfile, Question } from "@/lib/storage";
import { 
  ArrowLeft, 
  Eye, 
  Plus, 
  Trash2, 
  Save, 
  PlusCircle, 
  HelpCircle, 
  Check, 
  Cpu, 
  Layout, 
  BookOpen, 
  Activity, 
  AlertCircle 
} from "lucide-react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  weight: number;
  isHidden: boolean;
}

export default function CreateQuestion() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time state values for form inputs
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [language, setLanguage] = useState("C++");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [topic, setTopic] = useState("Data Structures");
  const [marks, setMarks] = useState(15);
  
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [constraints, setConstraints] = useState("");
  const [explanation, setExplanation] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState("");

  // Test cases state array
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: "1", input: "root = [4,2,7,1,3,6,9]", expectedOutput: "[4,7,2,9,6,3,1]", weight: 30, isHidden: false },
    { id: "2", input: "root = [2,1,3]", expectedOutput: "[2,3,1]", weight: 30, isHidden: false },
    { id: "3", input: "[Hidden Test Case]", expectedOutput: "[Output Verification Hash]", weight: 40, isHidden: true }
  ]);

  // Actions: Add tag
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTagText.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagText.trim())) {
        setTags([...tags, newTagText.trim()]);
      }
      setNewTagText("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Actions: Add Test Case
  const handleAddTestCase = (isHidden: boolean) => {
    const newCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      weight: 20,
      isHidden
    };
    setTestCases([...testCases, newCase]);
  };

  // Actions: Remove Test Case
  const handleRemoveTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
  };

  // Actions: Update Test Case values
  const handleUpdateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setTestCases(testCases.map(tc => {
      if (tc.id === id) {
        return { ...tc, [field]: value };
      }
      return tc;
    }));
  };

  // Form submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Question Title is required";
    if (!statement.trim()) newErrors.statement = "Problem Statement is required";
    if (!inputFormat.trim()) newErrors.inputFormat = "Input format description is required";
    if (!outputFormat.trim()) newErrors.outputFormat = "Output format description is required";
    if (!constraints.trim()) newErrors.constraints = "Constraints description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll left panel back to top
      const leftPane = document.getElementById("left-authoring-pane");
      if (leftPane) leftPane.scrollTop = 0;
      return;
    }

    setIsLoading(true);

    const faculty = loadFacultyProfile();
    const newQuestion: Question = {
      id: Date.now().toString(),
      title,
      language,
      difficulty,
      marks,
      topic,
      lastUpdated: new Date().toISOString().split("T")[0],
      status: "Active",
      timesUsed: 0,
      avgScore: "N/A",
      successRate: "N/A",
      avgTime: "N/A",
      createdBy: faculty.fullName || "Faculty HOD",
      createdDate: new Date().toISOString().split("T")[0],
      version: 1,
      tags: tags
    };

    const currentQuestions = loadQuestions();
    const updated = [newQuestion, ...currentQuestions];
    saveQuestions(updated);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/faculty/question-bank");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-xs text-slate-800">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link 
            href="/faculty/question-bank" 
            className="text-slate-500 hover:text-slate-800 transition-colors mr-2 p-1.5 hover:bg-slate-100 rounded-md focus-ring flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit Creator
          </Link>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Question Creator Workspace</h2>
        </div>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all focus-ring"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Syncing Sandbox...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save to Question Bank
            </>
          )}
        </button>
      </header>

      {/* Split screen content layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-53px)]">
        
        {/* LEFT PANEL: The Authoring Form */}
        <section 
          id="left-authoring-pane"
          className="w-full lg:w-1/2 p-6 md:p-8 overflow-y-auto space-y-6 bg-white border-r border-slate-200"
        >
          
          {errors.title || errors.statement || errors.inputFormat ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md flex gap-2 items-center" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold">Missing required authoring fields. Please fill in all starred (*) descriptors below.</span>
            </div>
          ) : null}

          {/* 1. Basic specifications */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              1. Basic Specifications
            </h3>

            {/* Title */}
            <div className="space-y-1">
              <label htmlFor="qTitle" className="block font-bold text-slate-700">Question Title *</label>
              <input 
                type="text"
                id="qTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Invert a Binary Tree"
                className={`w-full text-slate-900 border ${errors.title ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900`}
              />
              {errors.title && <p className="text-rose-600 text-[10px]">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Language */}
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label htmlFor="qLang" className="block font-bold text-slate-700">Sandbox Lang</label>
                <select 
                  id="qLang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                >
                  <option value="C">C</option>
                  <option value="C++">C++</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1">
                <label htmlFor="qDiff" className="block font-bold text-slate-700">Difficulty</label>
                <select 
                  id="qDiff"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Topic */}
              <div className="space-y-1">
                <label htmlFor="qTopic" className="block font-bold text-slate-700">Syllabus Topic</label>
                <select 
                  id="qTopic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                >
                  <option value="Variables">Variables</option>
                  <option value="Loops">Loops</option>
                  <option value="Functions">Functions</option>
                  <option value="Arrays">Arrays</option>
                  <option value="Strings">Strings</option>
                  <option value="Recursion">Recursion</option>
                  <option value="OOP">OOP</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Algorithms">Algorithms</option>
                </select>
              </div>

              {/* Marks */}
              <div className="space-y-1">
                <label htmlFor="qMarks" className="block font-bold text-slate-700">Weight Marks *</label>
                <input 
                  type="number"
                  id="qMarks"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full text-slate-900 border border-slate-200 rounded px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Problem descriptions details */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              2. Problem Description Details
            </h3>

            {/* Problem Statement */}
            <div className="space-y-1">
              <label htmlFor="qStatement" className="block font-bold text-slate-700">Problem Statement *</label>
              <textarea 
                id="qStatement"
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Describe the programming problem clearly..."
                className={`w-full text-slate-900 border ${errors.statement ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Format */}
              <div className="space-y-1">
                <label htmlFor="qInputFormat" className="block font-bold text-slate-700">Input Data Format *</label>
                <textarea 
                  id="qInputFormat"
                  rows={2}
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  placeholder="e.g. First line contains integer N, next line contains N numbers."
                  className={`w-full text-slate-900 border ${errors.inputFormat ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y`}
                />
              </div>

              {/* Output Format */}
              <div className="space-y-1">
                <label htmlFor="qOutputFormat" className="block font-bold text-slate-700">Expected Output Format *</label>
                <textarea 
                  id="qOutputFormat"
                  rows={2}
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  placeholder="e.g. Return the elements reversed, separated by a single space."
                  className={`w-full text-slate-900 border ${errors.outputFormat ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y`}
                />
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-1">
              <label htmlFor="qConstraints" className="block font-bold text-slate-700">Constraints *</label>
              <textarea 
                id="qConstraints"
                rows={2}
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. 0 <= Node.val <= 100, number of nodes <= 100"
                className={`w-full text-slate-900 border ${errors.constraints ? "border-rose-500" : "border-slate-200"} rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y`}
              />
            </div>

            {/* Sample Input / Output / Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="qSampleInput" className="block font-bold text-slate-700">Example Input 1</label>
                <textarea 
                  id="qSampleInput"
                  rows={2}
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder="e.g. [4,2,7]"
                  className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="qSampleOutput" className="block font-bold text-slate-700">Example Output 1</label>
                <textarea 
                  id="qSampleOutput"
                  rows={2}
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  placeholder="e.g. [4,7,2]"
                  className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="qExplanation" className="block font-bold text-slate-700">Example Explanation 1</label>
              <textarea 
                id="qExplanation"
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the correlation of input to output case if necessary..."
                className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900 resize-y"
              />
            </div>
          </div>

          {/* 3. Question Tagging */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              3. Question Tagging
            </h3>
            
            <div className="space-y-2">
              <label htmlFor="tagInput" className="block font-bold text-slate-700">Add Tags (Press Enter after typing)</label>
              <input 
                type="text"
                id="tagInput"
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Arrays, Trees, Sorting"
                className="w-full text-slate-900 border border-slate-200 rounded-md px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-navy-900"
              />
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5">
                      {t}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(idx)}
                        className="text-slate-400 hover:text-slate-600 font-bold font-mono text-[9px]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">No tags added yet. Standard tags help in sorting assessments.</p>
              )}
            </div>
          </div>

          {/* 4. Test cases management */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider">
                4. Test Cases Management
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddTestCase(false)}
                  className="text-[10px] text-navy-800 hover:text-navy-950 font-bold flex items-center gap-1"
                >
                  + Public Case
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTestCase(true)}
                  className="text-[10px] text-rose-800 hover:text-rose-950 font-bold flex items-center gap-1"
                >
                  + Hidden Case
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {testCases.map((tc, idx) => (
                <div 
                  key={tc.id} 
                  className={`p-4 rounded-lg border ${
                    tc.isHidden 
                      ? "bg-rose-50/40 border-rose-200" 
                      : "bg-slate-50/50 border-slate-200"
                  } space-y-3 relative`}
                >
                  {/* Delete case button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(tc.id)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-rose-600 rounded p-1 hover:bg-slate-100 transition-all"
                    aria-label="Delete testcase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      tc.isHidden ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {tc.isHidden ? "HIDDEN GRADING CASE" : "PUBLIC VERIFICATION CASE"}
                    </span>
                    <span className="text-slate-400 font-bold font-mono">Case #{idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Input Data</label>
                      <input 
                        type="text"
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(tc.id, "input", e.target.value)}
                        placeholder="e.g. root = [4,2]"
                        className="w-full text-slate-900 border border-slate-200 bg-white rounded px-2.5 py-1.5 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Expected Output</label>
                      <input 
                        type="text"
                        value={tc.expectedOutput}
                        onChange={(e) => handleUpdateTestCase(tc.id, "expectedOutput", e.target.value)}
                        placeholder="e.g. [4,2]"
                        className="w-full text-slate-900 border border-slate-200 bg-white rounded px-2.5 py-1.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="w-1/3 space-y-1 text-[10px]">
                    <label className="block font-bold text-slate-650">Grading Weight (%)</label>
                    <input 
                      type="number"
                      value={tc.weight}
                      onChange={(e) => handleUpdateTestCase(tc.id, "weight", Number(e.target.value))}
                      className="w-full text-slate-900 border border-slate-200 bg-white rounded px-2.5 py-1 focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT PANEL: The Real-time Student Preview */}
        <section className="w-full lg:w-1/2 p-6 md:p-8 bg-slate-950 text-slate-200 overflow-y-auto flex flex-col justify-between select-none">
          
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Eye className="w-4 h-4 text-blue-400" /> Student Examination Preview
              </span>
              <span className="text-slate-500 font-mono">Roll: 22CSE104</span>
            </div>

            {/* Candidate Problem Card */}
            <div className="space-y-5 font-sans leading-relaxed">
              <div className="flex justify-between items-center">
                <h1 className="text-white font-extrabold text-lg tracking-tight font-mono">
                  {title || "Untitled Programming Question"}
                </h1>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono text-[10px]">
                  {difficulty} • {marks} Marks
                </span>
              </div>

              {/* Tagging */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t, idx) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[9px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Statement */}
              <div className="space-y-2">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] font-mono tracking-wider">Problem Description</h4>
                <p className="text-slate-300 bg-slate-900/40 p-3 rounded border border-slate-900">
                  {statement || "Authoring statement..."}
                </p>
              </div>

              {/* Formats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h4 className="text-slate-400 font-bold uppercase text-[10px] font-mono tracking-wider">Input format</h4>
                  <p className="text-slate-300 bg-slate-900/20 p-2.5 rounded border border-slate-900">
                    {inputFormat || "Format check..."}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-slate-400 font-bold uppercase text-[10px] font-mono tracking-wider">Output format</h4>
                  <p className="text-slate-300 bg-slate-900/20 p-2.5 rounded border border-slate-900">
                    {outputFormat || "Format check..."}
                  </p>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-2">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] font-mono tracking-wider">Constraints</h4>
                <p className="text-slate-300 font-mono bg-slate-900/20 p-2.5 rounded border border-slate-900">
                  {constraints || "Constraints list..."}
                </p>
              </div>

              {/* Sample examples */}
              <div className="space-y-3">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] font-mono tracking-wider">Example Cases</h4>
                <div className="bg-slate-900/60 p-3.5 border border-slate-900 rounded-lg space-y-3 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-500">Input:</span>
                    <p className="text-slate-200 mt-0.5">{sampleInput || "N/A"}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-500">Output:</span>
                    <p className="text-slate-200 mt-0.5">{sampleOutput || "N/A"}</p>
                  </div>
                  {explanation && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500">Explanation:</span>
                      <p className="text-slate-300 mt-0.5 leading-normal">{explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel bottom disclaimer */}
          <div className="pt-6 border-t border-slate-900 flex items-center justify-between text-slate-500 text-[10px] font-mono">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Compiler: {language}</span>
            <span>SECURE SANDBOX COMPILING NODE</span>
          </div>

        </section>

      </div>

    </div>
  );
}
