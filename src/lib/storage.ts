// Client-side LocalStorage Persistence Utility for ExamCoder with PostgreSQL background sync

export interface Student {
  id: string;
  roll: string;
  name: string;
  email: string;
  mobile?: string;
  collegeName?: string;
  dept: string;
  year: string;
  section: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
}

export interface Assessment {
  id: string;
  name: string;
  subject: string;
  duration: number; // in minutes
  questionsCount: number;
  assignedCount: number;
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Archived";
  createdDate: string; // YYYY-MM-DD
  date: string; // June 17, 2026
}

export interface ExamSession {
  id: string;
  studentRoll: string;
  assessmentId: string;
  questionOrder: string; // JSON array string of question IDs
  startedAt: string;
  submittedAt: string | null;
  codeSubmissions?: string | null;
}

export interface Question {
  id: string;
  title: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  topic: string;
  lastUpdated: string;
  status: "Active" | "Archived";
  timesUsed: number;
  avgScore: string;
  successRate: string;
  avgTime: string;
  createdBy: string;
  createdDate: string;
  version: number;
  tags: string[];
  description?: string;
  estimatedTime?: number;
  allowedLanguages?: string[];
  codeTemplates?: {
    c: string;
    cpp: string;
    java: string;
    python: string;
  };
  sampleInput?: string;
  sampleOutput?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  explanation?: string;
}

export interface FacultyProfile {
  fullName: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  collegeName: string;
}

export interface StudentProfile {
  roll: string;
  name: string;
  email: string;
  dept: string;
  year: string;
  section: string;
  ip: string;
  collegeName: string;
}

export interface ReportLog {
  id: string;
  name: string;
  category: "Assessment" | "Student" | "Question" | "Batch" | "Department" | "Semester" | "TopPerformers" | "AtRisk";
  generatedDate: string;
  generatedBy: string;
  exportType: "PDF" | "CSV" | "Excel";
  downloadCount: number;
  assessmentId?: string;
  studentRoll?: string;
}

// Default Seed Data (used as static fallback before db sync completes)
export const DEFAULT_STUDENTS: Student[] = [];
export const DEFAULT_ASSESSMENTS: Assessment[] = [];
export const DEFAULT_QUESTIONS: Question[] = [];
export const DEFAULT_FACULTY: FacultyProfile = {
  fullName: "",
  employeeId: "",
  email: "",
  department: "",
  designation: "",
  collegeName: ""
};
export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  roll: "",
  name: "",
  email: "",
  dept: "",
  year: "",
  section: "",
  ip: "",
  collegeName: ""
};
export const DEFAULT_REPORTS: ReportLog[] = [];

// Storage Keys
const KEYS = {
  STUDENTS: "examcoder_students",
  ASSESSMENTS: "examcoder_assessments",
  QUESTIONS: "examcoder_questions",
  FACULTY_PROFILE: "examcoder_faculty_profile",
  STUDENT_PROFILE: "examcoder_student_profile"
};

const isClient = () => typeof window !== "undefined";

let hasSynced = false;

// Background Database Synchronization trigger
export function triggerDbSync() {
  if (!isClient() || hasSynced) return;
  hasSynced = true;

  const areListsEqual = (listAStr: string | null, listB: any[] | undefined): boolean => {
    if (!listB) return true;
    if (!listAStr) return false;
    try {
      const listA = JSON.parse(listAStr);
      if (!Array.isArray(listA) || listA.length !== listB.length) return false;
      
      const normalize = (list: any[]) => {
        return list.map(item => {
          const normalizedObj: any = {};
          Object.keys(item).sort().forEach(k => {
            if (item[k] !== undefined && item[k] !== null) {
              if (typeof item[k] === 'object') {
                normalizedObj[k] = JSON.stringify(item[k]);
              } else {
                normalizedObj[k] = item[k];
              }
            }
          });
          return normalizedObj;
        }).sort((a, b) => {
          const idA = String(a.id || a.roll || '');
          const idB = String(b.id || b.roll || '');
          return idA.localeCompare(idB);
        });
      };

      return JSON.stringify(normalize(listA)) === JSON.stringify(normalize(listB));
    } catch (e) {
      return false;
    }
  };

  fetch("/api/sync")
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        let hasChanges = false;
        
        const prevStudents = localStorage.getItem(KEYS.STUDENTS);
        if (data.students && !areListsEqual(prevStudents, data.students)) {
          localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data.students));
          hasChanges = true;
        }
        const prevAssessments = localStorage.getItem(KEYS.ASSESSMENTS);
        if (data.assessments && !areListsEqual(prevAssessments, data.assessments)) {
          localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(data.assessments));
          hasChanges = true;
        }
        const prevQuestions = localStorage.getItem(KEYS.QUESTIONS);
        if (data.questions && !areListsEqual(prevQuestions, data.questions)) {
          localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(data.questions));
          hasChanges = true;
        }
        const prevReports = localStorage.getItem("examcoder_reports");
        if (data.reports && !areListsEqual(prevReports, data.reports)) {
          localStorage.setItem("examcoder_reports", JSON.stringify(data.reports));
          hasChanges = true;
        }
        const prevSessions = localStorage.getItem("examcoder_exam_sessions");
        if (data.examSessions && !areListsEqual(prevSessions, data.examSessions)) {
          localStorage.setItem("examcoder_exam_sessions", JSON.stringify(data.examSessions));
          hasChanges = true;
        }

        // If there were actual changes between local storage and database, reload the page to update the UI
        if (hasChanges) {
          window.location.reload();
        } else {
          window.dispatchEvent(new Event("examcoder_db_synced"));
        }
      }
    })
    .catch((err) => console.error("Database fetch sync error:", err));
}

// Background database mutation sync
function syncSaveToDb(type: string, data: any) {
  if (!isClient()) return;
  fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, [type]: data }),
  }).catch((err) => console.error(`Database mutation sync error for ${type}:`, err));
}

export function loadStudents(): Student[] {
  triggerDbSync();
  if (!isClient()) return DEFAULT_STUDENTS;
  const data = localStorage.getItem(KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    syncSaveToDb("students", DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(data);
}

export function saveStudents(students: Student[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  syncSaveToDb("students", students);
}

export function loadAssessments(): Assessment[] {
  triggerDbSync();
  if (!isClient()) return DEFAULT_ASSESSMENTS;
  const data = localStorage.getItem(KEYS.ASSESSMENTS);
  if (!data) {
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(DEFAULT_ASSESSMENTS));
    syncSaveToDb("assessments", DEFAULT_ASSESSMENTS);
    return DEFAULT_ASSESSMENTS;
  }
  return JSON.parse(data);
}

export function saveAssessments(assessments: Assessment[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(assessments));
  syncSaveToDb("assessments", assessments);
}

export function loadQuestions(): Question[] {
  triggerDbSync();
  if (!isClient()) return DEFAULT_QUESTIONS;
  const data = localStorage.getItem(KEYS.QUESTIONS);
  if (!data) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
    syncSaveToDb("questions", DEFAULT_QUESTIONS);
    return DEFAULT_QUESTIONS;
  }
  return JSON.parse(data);
}

export function saveQuestions(questions: Question[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  syncSaveToDb("questions", questions);
}

export function loadFacultyProfile(): FacultyProfile {
  if (!isClient()) return DEFAULT_FACULTY;
  const data = localStorage.getItem(KEYS.FACULTY_PROFILE);
  if (!data) {
    localStorage.setItem(KEYS.FACULTY_PROFILE, JSON.stringify(DEFAULT_FACULTY));
    return DEFAULT_FACULTY;
  }
  try {
    const profile = JSON.parse(data);
    if (!profile.collegeName || profile.collegeName === "GITAMW Tech Node" || profile.collegeName === "PSG College of Technology" || profile.collegeName.toLowerCase().includes("gowthami") || profile.collegeName.toLowerCase().includes("gouthami")) {
      profile.collegeName = "Gouthami Institute of Technology and Management for Women";
      localStorage.setItem(KEYS.FACULTY_PROFILE, JSON.stringify(profile));
    }
    return profile;
  } catch (e) {
    return DEFAULT_FACULTY;
  }
}

export function saveFacultyProfile(profile: FacultyProfile): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.FACULTY_PROFILE, JSON.stringify(profile));
}

export function loadStudentProfile(): StudentProfile {
  if (!isClient()) return DEFAULT_STUDENT_PROFILE;
  const data = localStorage.getItem(KEYS.STUDENT_PROFILE);
  if (!data) {
    localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
    return DEFAULT_STUDENT_PROFILE;
  }
  try {
    const profile = JSON.parse(data);
    if (!profile.collegeName || profile.collegeName === "GITAMW Tech Node" || profile.collegeName === "PSG College of Technology" || profile.collegeName.toLowerCase().includes("gowthami") || profile.collegeName.toLowerCase().includes("gouthami")) {
      profile.collegeName = "Gouthami Institute of Technology and Management for Women";
      localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
    }
    return profile;
  } catch (e) {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
}

export function loadReports(): ReportLog[] {
  triggerDbSync();
  if (!isClient()) return DEFAULT_REPORTS;
  const data = localStorage.getItem("examcoder_reports");
  if (!data) {
    localStorage.setItem("examcoder_reports", JSON.stringify(DEFAULT_REPORTS));
    syncSaveToDb("reports", DEFAULT_REPORTS);
    return DEFAULT_REPORTS;
  }
  return JSON.parse(data);
}

export function saveReports(reports: ReportLog[]): void {
  if (!isClient()) return;
  localStorage.setItem("examcoder_reports", JSON.stringify(reports));
  syncSaveToDb("reports", reports);
}

export function loadExamSessions(): ExamSession[] {
  triggerDbSync();
  if (!isClient()) return [];
  const data = localStorage.getItem("examcoder_exam_sessions");
  if (!data) {
    localStorage.setItem("examcoder_exam_sessions", JSON.stringify([]));
    syncSaveToDb("examSessions", []);
    return [];
  }
  return JSON.parse(data);
}

export function saveExamSessions(sessions: ExamSession[]): void {
  if (!isClient()) return;
  localStorage.setItem("examcoder_exam_sessions", JSON.stringify(sessions));
  syncSaveToDb("examSessions", sessions);
}

export function resetPlatformData(toEmpty: boolean = false): void {
  if (!isClient()) return;
  if (toEmpty) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify([]));
    localStorage.setItem("examcoder_reports", JSON.stringify([]));
    localStorage.setItem("examcoder_exam_sessions", JSON.stringify([]));
    // Background reset could clear database
  } else {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    localStorage.setItem(KEYS.ASSESSMENTS, JSON.stringify(DEFAULT_ASSESSMENTS));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
    localStorage.setItem(KEYS.FACULTY_PROFILE, JSON.stringify(DEFAULT_FACULTY));
    localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(DEFAULT_STUDENT_PROFILE));
    localStorage.setItem("examcoder_reports", JSON.stringify(DEFAULT_REPORTS));
    localStorage.setItem("examcoder_exam_sessions", JSON.stringify([]));
  }
}

export function getAssessmentStatus(
  a: { date: string; duration: number; status: string; id: string },
  studentRoll: string,
  sessions: { studentRoll: string; assessmentId: string; submittedAt: string | null }[]
): "Active" | "Upcoming" | "Completed" {
  // First, check if student has already submitted a session for this exam
  const safeSessions = sessions || [];
  const hasSubmitted = safeSessions.some(
    s => s.studentRoll === studentRoll && s.assessmentId === a.id && s.submittedAt !== null
  );
  if (hasSubmitted) {
    return "Completed";
  }

  // Parse the scheduled date
  const scheduledDateStr = a.date;
  if (!scheduledDateStr) {
    // Fallback if no date is provided
    if (a.status === "Active") return "Active";
    if (a.status === "Completed") return "Completed";
    return "Upcoming";
  }

  const now = new Date();
  const cleanStr = scheduledDateStr.trim().toLowerCase();

  let hasTime = false;
  if (cleanStr.includes("t") || cleanStr.includes(":") || cleanStr.includes("am") || cleanStr.includes("pm") || cleanStr.includes("a.m") || cleanStr.includes("p.m")) {
    hasTime = true;
  }

  let scheduledStart: Date | null = null;

  // Try parsing ISO format YYYY-MM-DDTHH:mm
  if (cleanStr.includes("t")) {
    const parsedDate = new Date(scheduledDateStr);
    if (!isNaN(parsedDate.getTime())) {
      scheduledStart = parsedDate;
    }
  }

  // Handle DD/MM/YYYY format which may include time like "22/06/2026 10:A.M"
  if (!scheduledStart && cleanStr.includes("/")) {
    const parts = cleanStr.split(/\s+/);
    const dateParts = parts[0].split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      
      let hours = 0;
      let minutes = 0;
      
      if (parts[1]) {
        const timeStr = parts.slice(1).join(" ");
        const isPM = timeStr.includes("p.m") || timeStr.includes("pm") || timeStr.includes("p");
        const isAM = timeStr.includes("a.m") || timeStr.includes("am") || timeStr.includes("a");
        const timeMatch = timeStr.match(/(\d+)(?::(\d+))?/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1], 10);
          if (timeMatch[2]) {
            minutes = parseInt(timeMatch[2], 10);
          }
          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
        }
      }
      
      const parsedDate = new Date(year, month, day, hours, minutes, 0, 0);
      if (!isNaN(parsedDate.getTime())) {
        scheduledStart = parsedDate;
      }
    }
  }

  // Handle Month DD, YYYY format which may include time (e.g. "June 21, 2026, 10:30 PM" or "June 21, 2026")
  if (!scheduledStart) {
    const monthRegex = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d+),?\s+(\d{4})(?:,?\s+(\d+)(?::(\d+))?\s*(am|pm|a\.m\.|p\.m\.))?/i;
    const match = cleanStr.match(monthRegex);
    if (match) {
      const monthStr = match[1].substring(0, 3);
      const day = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthIndex = months.indexOf(monthStr);
      
      if (monthIndex !== -1) {
        let hours = 0;
        let minutes = 0;
        if (match[4]) {
          hours = parseInt(match[4], 10);
          if (match[5]) {
            minutes = parseInt(match[5], 10);
          }
          const amampm = match[6].replace(/\./g, "").toLowerCase();
          if (amampm === "pm" && hours < 12) hours += 12;
          if (amampm === "am" && hours === 12) hours = 0;
        }
        const parsedDate = new Date(year, monthIndex, day, hours, minutes, 0, 0);
        if (!isNaN(parsedDate.getTime())) {
          scheduledStart = parsedDate;
        }
      }
    }
  }

  // Fallback to standard JS Date parsing
  if (!scheduledStart) {
    const cleanStandard = scheduledDateStr
      .replace(/a\.m\./gi, "AM")
      .replace(/p\.m\./gi, "PM")
      .replace(/a\.m/gi, "AM")
      .replace(/p\.m/gi, "PM");
    const parsedDate = new Date(cleanStandard);
    if (!isNaN(parsedDate.getTime())) {
      scheduledStart = parsedDate;
    }
  }

  if (!scheduledStart) {
    // If not parseable, fallback
    if (a.status === "Active") return "Active";
    if (a.status === "Completed") return "Completed";
    return "Upcoming";
  }

  const nowMs = now.getTime();
  const startMs = scheduledStart.getTime();

  if (hasTime) {
    // If there is a time component, the window is [startMs, startMs + duration_ms]
    const endMs = startMs + (a.duration * 60 * 1000);
    if (nowMs < startMs) {
      return "Upcoming";
    } else if (nowMs >= startMs && nowMs <= endMs) {
      return "Active";
    } else {
      return "Completed";
    }
  } else {
    // If there is NO time component, the window is the entire calendar day (local time)
    // Start of day: 00:00:00
    const startOfDay = new Date(scheduledStart);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of day: 23:59:59.999
    const endOfDay = new Date(scheduledStart);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfDayMs = startOfDay.getTime();
    const endOfDayMs = endOfDay.getTime();

    if (nowMs < startOfDayMs) {
      return "Upcoming";
    } else if (nowMs >= startOfDayMs && nowMs <= endOfDayMs) {
      return "Active";
    } else {
      return "Completed";
    }
  }
}

