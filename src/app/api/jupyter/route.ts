import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to get configuration from environment variables
const JUPYTER_URL = process.env.JUPYTER_URL || "http://localhost:8888";
const JUPYTER_TOKEN = process.env.JUPYTER_TOKEN || "";
const JUPYTER_IS_HUB = process.env.JUPYTER_IS_HUB === "true";
const JUPYTER_HUB_ADMIN_TOKEN = process.env.JUPYTER_HUB_ADMIN_TOKEN || JUPYTER_TOKEN;
const JUPYTER_USE_LAB = process.env.JUPYTER_USE_LAB === "true";

// Helper to build URLs and headers for Jupyter API
function getJupyterDetails(studentRoll: string, filename: string) {
  const rollLower = studentRoll.toLowerCase().trim();
  const userServerUrl = JUPYTER_IS_HUB
    ? `${JUPYTER_URL}/user/${rollLower}`
    : JUPYTER_URL;

  // Jupyter API Contents Endpoint
  const apiContentsUrl = `${userServerUrl}/api/contents/${filename}`;

  // Iframe Web Access URL
  const webAppUrl = JUPYTER_USE_LAB
    ? `${userServerUrl}/lab/tree/${filename}`
    : `${userServerUrl}/notebooks/${filename}`;

  // Headers for REST API communication
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (JUPYTER_TOKEN) {
    headers["Authorization"] = `token ${JUPYTER_TOKEN}`;
  }

  return {
    userServerUrl,
    apiContentsUrl,
    webAppUrl,
    headers,
    token: JUPYTER_TOKEN
  };
}

// Spawns user's server if JupyterHub is used
async function ensureJupyterHubServer(studentRoll: string): Promise<boolean> {
  if (!JUPYTER_IS_HUB) return true;
  
  const rollLower = studentRoll.toLowerCase().trim();
  const spawnUrl = `${JUPYTER_URL}/hub/api/users/${rollLower}/server`;
  
  try {
    console.log(`[JupyterHub] Spawning server for ${rollLower}...`);
    const res = await fetch(spawnUrl, {
      method: "POST",
      headers: {
        "Authorization": `token ${JUPYTER_HUB_ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    if (res.status === 201 || res.status === 202 || res.status === 409) {
      // 201: Created, 202: Spawning, 409: Already running
      console.log(`[JupyterHub] Spawn command status for ${rollLower}: ${res.status}`);
      
      // Wait for server to become active (simple poll)
      let attempts = 0;
      while (attempts < 10) {
        const checkRes = await fetch(`${JUPYTER_URL}/hub/api/users/${rollLower}`, {
          headers: {
            "Authorization": `token ${JUPYTER_HUB_ADMIN_TOKEN}`
          }
        });
        if (checkRes.ok) {
          const userData = await checkRes.json();
          if (userData.servers && userData.servers[""]?.ready) {
            console.log(`[JupyterHub] Server ready for ${rollLower}`);
            return true;
          }
        }
        await new Promise(r => setTimeout(r, 1500));
        attempts++;
      }
    }
    return false;
  } catch (error) {
    console.error("[JupyterHub] Spawn error:", error);
    return false;
  }
}

// Action handlers
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, studentRoll, assessmentId, questions, studentName, assessmentName, subject } = body;

    if (!studentRoll || !assessmentId) {
      return NextResponse.json(
        { status: "error", message: "Missing studentRoll or assessmentId" },
        { status: 400 }
      );
    }

    const filename = `assessment_${assessmentId}_student_${studentRoll}.ipynb`;
    const details = getJupyterDetails(studentRoll, filename);

    // Make sure user's JupyterHub server is running if using Hub
    if (JUPYTER_IS_HUB) {
      const spawned = await ensureJupyterHubServer(studentRoll);
      if (!spawned) {
        return NextResponse.json(
          { status: "error", message: "Failed to spin up your Jupyter Notebook container. Please alert your supervisor." },
          { status: 500 }
        );
      }
    }

    if (action === "init") {
      // 1. Check if notebook already exists on the Jupyter server (to protect student progress upon reconnect)
      try {
        const checkRes = await fetch(`${details.apiContentsUrl}?content=0`, {
          method: "GET",
          headers: details.headers
        });

        if (checkRes.ok) {
          console.log(`Notebook ${filename} already exists. Returning access URL.`);
          return NextResponse.json({
            status: "success",
            iframeUrl: `${details.webAppUrl}?token=${details.token}`,
            message: "Connected to existing notebook session."
          });
        }
      } catch (err) {
        console.warn("Could not check notebook existence directly, attempting creation anyway.", err);
      }

      // 2. Generate new notebook JSON
      const cells: any[] = [];

      // Header cell
      cells.push({
        cell_type: "markdown",
        metadata: {},
        source: [
          `# ${assessmentName || "PSG Practical Examination"}\n`,
          `**Subject:** ${subject || "Coding Lab"}\n`,
          `**Student Name:** ${studentName || "Verified Student"}\n`,
          `**Roll Number:** ${studentRoll}\n`,
          `**Date:** ${new Date().toLocaleDateString()}\n\n`,
          `--- \n`,
          `*Instructions: Write your code in the designated empty code cell under each question. Do not modify the question description cells.*`
        ]
      });

      // Question cells
      if (questions && Array.isArray(questions)) {
        questions.forEach((q: any, idx: number) => {
          cells.push({
            cell_type: "markdown",
            metadata: {},
            source: [
              `### QUESTION ${idx + 1}: ${q.title} (${q.marks || 15} Marks)\n`,
              `**Difficulty:** ${q.difficulty || "Medium"} | **Topic:** ${q.topic || "General"}\n\n`,
              `#### Problem Description:\n`,
              `${q.description || ""}\n\n`,
              `**Input Format:**\n`,
              `${q.inputFormat || "Standard Input"}\n\n`,
              `**Output Format:**\n`,
              `${q.outputFormat || "Standard Output"}\n\n`,
              `**Constraints:**\n`,
              `\`\`\`\n`,
              `${q.constraints || "None"}\n`,
              `\`\`\`\n\n`,
              `**Sample Input:**\n`,
              `\`\`\`\n`,
              `${q.sampleInput || ""}\n`,
              `\`\`\`\n\n`,
              `**Sample Output:**\n`,
              `\`\`\`\n`,
              `${q.sampleOutput || ""}\n`,
              `\`\`\`\n\n`,
              `**Explanation:**\n`,
              `${q.explanation || ""}\n\n`,
              `---`
            ]
          });

          // Empty code cell with tracking tag
          cells.push({
            cell_type: "code",
            execution_count: null,
            metadata: {},
            outputs: [],
            source: [
              `# QUESTION_ID: ${q.id}\n`,
              `# Write your Python solution for Question ${idx + 1} here:\n\n`
            ]
          });
        });
      }

      const notebookJson = {
        cells,
        metadata: {
          kernelspec: {
            display_name: "Python 3 (ipykernel)",
            language: "python",
            name: "python3"
          },
          language_info: {
            name: "python"
          }
        },
        nbformat: 4,
        nbformat_minor: 4
      };

      // 3. Save the notebook to Jupyter Server Contents API
      const createRes = await fetch(details.apiContentsUrl, {
        method: "PUT",
        headers: details.headers,
        body: JSON.stringify({
          type: "notebook",
          format: "json",
          content: notebookJson
        })
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error(`Jupyter contents API error (${createRes.status}):`, errorText);
        return NextResponse.json(
          { status: "error", message: `Jupyter Server rejected notebook creation: ${createRes.statusText}` },
          { status: 500 }
        );
      }

      console.log(`Notebook ${filename} created successfully.`);
      return NextResponse.json({
        status: "success",
        iframeUrl: `${details.webAppUrl}?token=${details.token}`,
        message: "New notebook session initialized."
      });
    }

    if (action === "sync" || action === "submit") {
      // 1. Fetch the notebook from Jupyter Contents API
      const fetchRes = await fetch(`${details.apiContentsUrl}?content=1`, {
        method: "GET",
        headers: details.headers
      });

      if (!fetchRes.ok) {
        return NextResponse.json(
          { status: "error", message: `Could not fetch notebook from Jupyter Server: ${fetchRes.statusText}` },
          { status: 500 }
        );
      }

      const fileData = await fetchRes.json();
      const notebook = fileData.content;

      // 2. Fetch the exam session to retrieve the question order
      const examSession = await db.examSession.findUnique({
        where: {
          studentRoll_assessmentId: {
            studentRoll,
            assessmentId
          }
        }
      });

      if (!examSession) {
        return NextResponse.json(
          { status: "error", message: "Exam session not found in database" },
          { status: 404 }
        );
      }

      const questionOrder: string[] = JSON.parse(examSession.questionOrder || "[]");
      
      // 3. Extract solutions from code cells
      const submissions: Record<string, string> = {};
      const untaggedCodeCells: string[] = [];

      const notebookCells = notebook?.cells || [];
      notebookCells.forEach((cell: any) => {
        if (cell.cell_type === "code") {
          const sourceLines: string[] = Array.isArray(cell.source) ? cell.source : [cell.source || ""];
          const code = sourceLines.join("");
          
          // Match by QUESTION_ID comment
          const match = code.match(/QUESTION_ID:\s*([a-zA-Z0-9_-]+)/i);
          if (match && match[1]) {
            const qId = match[1].trim();
            if (questionOrder.includes(qId)) {
              submissions[qId] = code;
              return;
            }
          }
          untaggedCodeCells.push(code);
        }
      });

      // Fallback sequentially for untagged cells
      let untaggedIdx = 0;
      questionOrder.forEach((qId) => {
        if (!submissions[qId]) {
          if (untaggedIdx < untaggedCodeCells.length) {
            submissions[qId] = untaggedCodeCells[untaggedIdx];
            untaggedIdx++;
          } else {
            submissions[qId] = "";
          }
        }
      });

      // 4. Update the ExamSession in the database
      let currentSessionData = {
        submissions: {} as Record<string, string>,
        warningsCount: 0,
        warningsLogs: [] as string[],
        lastActivity: "",
        status: "Active"
      };

      if (examSession.codeSubmissions) {
        try {
          const parsed = JSON.parse(examSession.codeSubmissions);
          if (parsed && typeof parsed === "object") {
            if ("submissions" in parsed) {
              currentSessionData = {
                ...currentSessionData,
                ...parsed,
                submissions: { ...parsed.submissions }
              };
            } else {
              currentSessionData.submissions = parsed;
            }
          }
        } catch (e) {}
      }

      // Merge new submissions
      Object.keys(submissions).forEach((qId) => {
        currentSessionData.submissions[qId] = submissions[qId];
      });

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentSessionData.lastActivity = `${timeStr} - Notebook Auto-Saved`;
      
      if (action === "submit") {
        currentSessionData.status = "Submitted";
        currentSessionData.lastActivity = `${timeStr} - Notebook Final Submitted`;
      }

      const updatedSession = await db.examSession.update({
        where: {
          studentRoll_assessmentId: {
            studentRoll,
            assessmentId
          }
        },
        data: {
          submittedAt: action === "submit" ? new Date().toISOString() : examSession.submittedAt,
          codeSubmissions: JSON.stringify(currentSessionData)
        }
      });

      return NextResponse.json({
        status: "success",
        submissions: currentSessionData.submissions,
        warningsCount: currentSessionData.warningsCount,
        message: action === "submit" ? "Assessment submitted successfully." : "Auto-saved notebook to portal database."
      });
    }

    return NextResponse.json(
      { status: "error", message: `Unsupported action: ${action}` },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Jupyter integration endpoint error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to process Jupyter integration request" },
      { status: 500 }
    );
  }
}
