import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import crypto from "crypto";
import "dotenv/config";

const isLocal = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const defaultPasswordHash = hashPassword("password"); // Default password: "password"

  // 1. Seed Admin
  await prisma.admin.upsert({
    where: { email: "admin@examcoder.edu" },
    update: {},
    create: {
      email: "admin@examcoder.edu",
      password: defaultPasswordHash,
    },
  });
  console.log("Admin seeded.");

  // 2. Seed Faculty
  await prisma.faculty.upsert({
    where: { employeeId: "FAC_102" },
    update: {},
    create: {
      employeeId: "FAC_102",
      fullName: "Dr. Ramesh Sharma",
      email: "ramesh.sharma@gouthamitmw.edu",
      mobile: "9876543210",
      collegeName: "Gouthami Institute of Technology and Management for Women",
      department: "CSE",
      designation: "Professor & HOD",
      password: defaultPasswordHash,
    },
  });
  console.log("Faculty seeded.");

  // 3. Seed Students
  const students = [
    { roll: "22CSE102", name: "Aditya Verma", email: "aditya.22cse@gouthamitmw.edu", dept: "CSE", year: "3rd Year", section: "A" },
    { roll: "22CSE104", name: "Aravind Swaminathan", email: "aravind.22cse@gouthamitmw.edu", dept: "CSE", year: "3rd Year", section: "A" },
    { roll: "22CSE156", name: "Pooja Hegde", email: "pooja.22cse@gouthamitmw.edu", dept: "CSE", year: "3rd Year", section: "B" },
    { roll: "22ECE012", name: "Anjali Rao", email: "anjali.22ece@gouthamitmw.edu", dept: "ECE", year: "2nd Year", section: "A" },
    { roll: "22EEE045", name: "Vijay Krishnan", email: "vijay.22eee@gouthamitmw.edu", dept: "EEE", year: "4th Year", section: "C" },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { roll: student.roll },
      update: {},
      create: {
        roll: student.roll,
        name: student.name,
        email: student.email,
        mobile: "9876543210",
        collegeName: "Gouthami Institute of Technology and Management for Women",
        dept: student.dept,
        year: student.year,
        section: student.section,
        password: defaultPasswordHash,
      },
    });
  }
  console.log("Students seeded.");

  // 4. Seed Assessments
  const assessments = [
    { id: "1", name: "Data Structures Practical Lab Exam", subject: "CS201", duration: 180, questionsCount: 3, assignedCount: 132, status: "Active", createdDate: "2026-06-15", date: "June 17, 2026" },
    { id: "2", name: "Object Oriented Programming Final", subject: "IT305", duration: 120, questionsCount: 2, assignedCount: 65, status: "Scheduled", createdDate: "2026-06-16", date: "June 18, 2026" },
    { id: "3", name: "Design & Analysis of Algorithms Practical", subject: "CS304", duration: 180, questionsCount: 3, assignedCount: 120, status: "Completed", createdDate: "2026-06-10", date: "June 15, 2026" },
    { id: "4", name: "Database Systems Midterm Test", subject: "CS203", duration: 90, questionsCount: 2, assignedCount: 62, status: "Completed", createdDate: "2026-06-08", date: "June 12, 2026" },
    { id: "5", name: "Python Programming Laboratory", subject: "IT102", duration: 120, questionsCount: 4, assignedCount: 0, status: "Draft", createdDate: "2026-06-17", date: "June 20, 2026" }
  ];

  for (const asm of assessments) {
    await prisma.assessment.upsert({
      where: { id: asm.id },
      update: {},
      create: asm
    });
  }
  console.log("Assessments seeded.");

  // 5. Seed Questions
  const questions = [
    {
      id: "1",
      title: "Invert a Binary Tree",
      language: "C++ / Java / Python",
      difficulty: "Medium",
      marks: 15,
      topic: "Data Structures",
      lastUpdated: "2026-06-16",
      status: "Active",
      timesUsed: 24,
      avgScore: "8.2/10",
      successRate: "76%",
      avgTime: "24m",
      createdBy: "Dr. R. Ramanujan",
      createdDate: "2026-01-15",
      version: 2,
      tags: JSON.stringify(["Trees", "Recursion"]),
      description: "Given the root of a binary tree, invert the tree, and return its root. Inverting a binary tree means exchanging left and right subtrees of every node.",
      estimatedTime: 24,
      allowedLanguages: JSON.stringify(["c", "cpp", "java", "python"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\n#include <stdlib.h>\n\nstruct TreeNode {\n    int val;\n    struct TreeNode* left;\n    struct TreeNode* right;\n};\n\nstruct TreeNode* invertTree(struct TreeNode* root) {\n    if (root == NULL) return NULL;\n    struct TreeNode* temp = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(temp);\n    return root;\n}`,
        cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n};\n\nTreeNode* invertTree(TreeNode* root) {\n    if (root == NULL) return NULL;\n    TreeNode* temp = root->left;\n    root->left = invertTree(root->right);\n    root->right = invertTree(temp);\n    return root;\n}`,
        java: `// Language: Java (OpenJDK 17)\nimport java.util.*;\n\nclass Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode temp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(temp);\n        return root;\n    }\n}`,
        python: `# Language: Python 3.10\ndef solve():\n    # Write your Python code here\n    pass\n\nsolve()`
      }),
      sampleInput: "4 2 7 1 3 6 9",
      sampleOutput: "4 7 2 9 6 3 1",
      inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal format.",
      outputFormat: "Output the level-order traversal array of the inverted binary tree.",
      constraints: "The number of nodes in the tree is in the range [0, 1000].\nNode values range from -100 to 100.",
      explanation: "Each node's left and right pointers are recursively swapped. For 4's children, 2 and 7 become 7 and 2. Their children are swapped similarly."
    },
    {
      id: "2",
      title: "Validate Binary Search Tree",
      language: "C++ / Java / Python",
      difficulty: "Medium",
      marks: 15,
      topic: "Data Structures",
      lastUpdated: "2026-06-12",
      status: "Active",
      timesUsed: 18,
      avgScore: "7.8/10",
      successRate: "68%",
      avgTime: "28m",
      createdBy: "Dr. R. Ramanujan",
      createdDate: "2026-01-16",
      version: 1,
      tags: JSON.stringify(["Trees", "BST"]),
      description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST satisfies: left child is less than root, right child is greater than root, and all subtrees are also valid BSTs.",
      estimatedTime: 28,
      allowedLanguages: JSON.stringify(["c", "cpp", "java", "python"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\n#include <stdbool.h>\n\nbool isValidBST(struct TreeNode* root) {\n    return true;\n}`,
        cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nbool isValidBST(TreeNode* root) {\n    return true;\n}`,
        java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public boolean isValidBST(TreeNode root) {\n        return true;\n    }\n}`,
        python: `# Language: Python 3.10\ndef solve():\n    # Validate BST here\n    return True\n\nprint(solve())`
      }),
      sampleInput: "2 1 3",
      sampleOutput: "true",
      inputFormat: "First line contains N, the number of nodes. Next line contains node values in level-order traversal.",
      outputFormat: "Output 'true' if the tree is a valid BST, otherwise output 'false'.",
      constraints: "Number of nodes is in range [1, 10000].\nNode values range from -2^31 to 2^31 - 1.",
      explanation: "2 is the root. Left child is 1 (< 2). Right child is 3 (> 2). Tree meets all BST criteria."
    },
    {
      id: "3",
      title: "Method Overloading Simulation",
      language: "Java",
      difficulty: "Easy",
      marks: 10,
      topic: "OOP",
      lastUpdated: "2026-06-10",
      status: "Active",
      timesUsed: 32,
      avgScore: "9.1/10",
      successRate: "92%",
      avgTime: "12m",
      createdBy: "Prof. A. Sen",
      createdDate: "2026-02-10",
      version: 3,
      tags: JSON.stringify(["Polymorphism", "Java"]),
      description: "Design a Java class to simulate overloading compile bindings. Write functions simulating add(int, int) and add(double, double).",
      estimatedTime: 12,
      allowedLanguages: JSON.stringify(["java", "python"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\n\nint main() {\n    return 0;\n}`,
        cpp: `// Language: C++17\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
        java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public int add(int a, int b) { return a + b; }\n    public double add(double a, double b) { return a + b; }\n}`,
        python: `# Language: Python 3.10\nclass Solution:\n    def add(self, a, b):\n        return a + b`
      }),
      sampleInput: "1 2\n1.5 2.5",
      sampleOutput: "3\n4.0",
      inputFormat: "First line has two integers. Second line has two doubles.",
      outputFormat: "Output integer sum followed by double sum.",
      constraints: "Int values in signed range, doubles with 2-point decimals.",
      explanation: "Java binds calls based on parameter lists."
    },
    {
      id: "4",
      title: "Implement Dijkstra shortest path",
      language: "C++ / Java / Python",
      difficulty: "Hard",
      marks: 20,
      topic: "Algorithms",
      lastUpdated: "2026-06-08",
      status: "Active",
      timesUsed: 8,
      avgScore: "6.4/10",
      successRate: "42%",
      avgTime: "45m",
      createdBy: "Dr. S. Bose",
      createdDate: "2026-03-01",
      version: 2,
      tags: JSON.stringify(["Graphs", "Shortest Path"]),
      description: "Given a weighted undirected graph with V vertices and E edges, find the shortest distance of all the vertices from the source vertex S. Return an array of distances.",
      estimatedTime: 45,
      allowedLanguages: JSON.stringify(["cpp", "java", "python"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\n\nvoid dijkstra(int V, int S) {}`,
        cpp: `// Language: C++17\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> dijkstra(int V, int S) {\n    return {};\n}`,
        java: `// Language: Java (OpenJDK 17)\nclass Solution {\n    public int[] dijkstra(int V, int S) {\n        return new int[V];\n    }\n}`,
        python: `# Language: Python 3.10\ndef dijkstra(V, S):\n    return [0] * V`
      }),
      sampleInput: "2 1\n0 1 9\n0",
      sampleOutput: "0 9",
      inputFormat: "The first line contains V and E. Next E lines represent edges: u v w (source, destination, weight). The final line contains S (source node).",
      outputFormat: "Return space-separated integers representing the shortest path from S to each node.",
      constraints: "1 <= V <= 1000\n1 <= E <= 10000\n1 <= w <= 1000",
      explanation: "Source is 0. Distance from 0 to 0 is 0. Distance from 0 to 1 is weight 9. Array output: 0 9."
    },
    {
      id: "5",
      title: "Fibonacci Sequence recursion",
      language: "Python",
      difficulty: "Easy",
      marks: 10,
      topic: "Recursion",
      lastUpdated: "2026-05-28",
      status: "Active",
      timesUsed: 45,
      avgScore: "9.4/10",
      successRate: "95%",
      avgTime: "8m",
      createdBy: "Prof. A. Sen",
      createdDate: "2026-03-05",
      version: 1,
      tags: JSON.stringify(["Recursion", "Python"]),
      description: "Compute the Nth Fibonacci number recursively.",
      estimatedTime: 8,
      allowedLanguages: JSON.stringify(["python"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\nint fib(int n) { return 0; }`,
        cpp: `// Language: C++17\nint fib(int n) { return 0; }`,
        java: `// Language: Java\nclass Solution { public int fib(int n) { return 0; } }`,
        python: `# Language: Python 3.10\ndef fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)`
      }),
      sampleInput: "4",
      sampleOutput: "3",
      inputFormat: "Single integer N.",
      outputFormat: "Nth Fibonacci number.",
      constraints: "0 <= N <= 30",
      explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3."
    },
    {
      id: "6",
      title: "Matrix transpositions",
      language: "C",
      difficulty: "Easy",
      marks: 10,
      topic: "Arrays",
      lastUpdated: "2026-05-12",
      status: "Archived",
      timesUsed: 12,
      avgScore: "8.5/10",
      successRate: "88%",
      avgTime: "15m",
      createdBy: "Dr. K. Krishnan",
      createdDate: "2025-10-12",
      version: 1,
      tags: JSON.stringify(["Arrays", "Matrix"]),
      description: "Given a 2D matrix, return its transpose.",
      estimatedTime: 15,
      allowedLanguages: JSON.stringify(["c", "cpp"]),
      codeTemplates: JSON.stringify({
        c: `// Language: C\n#include <stdio.h>\nvoid transpose(int A[3][3]) {}`,
        cpp: `// Language: C++17\n#include <vector>\nusing namespace std;\nvoid transpose(vector<vector<int>>& A) {}`,
        java: `// Language: Java\nclass Solution { public void transpose(int[][] A) {} }`,
        python: `# Language: Python 3.10\ndef transpose(A): pass`
      }),
      sampleInput: "1 2\n3 4",
      sampleOutput: "1 3\n2 4",
      inputFormat: "Dimension N, followed by NxN elements.",
      outputFormat: "NxN transposed matrix elements.",
      constraints: "1 <= N <= 100",
      explanation: "Transpose swaps row and column indices."
    }
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: q
    });
  }
  console.log("Questions seeded.");

  // 6. Seed ReportLogs
  const reports = [
    { id: "rep-1", name: "Data Structures Practical Lab Exam Summary", category: "Assessment", generatedDate: "2026-06-17", generatedBy: "Dr. Ramesh Sharma", exportType: "PDF", downloadCount: 5 },
    { id: "rep-2", name: "CS201 Section A Student performance rank roster", category: "Student", generatedDate: "2026-06-16", generatedBy: "Dr. Ramesh Sharma", exportType: "Excel", downloadCount: 12 },
    { id: "rep-3", name: "Object Oriented Programming Final Question Difficulty Index", category: "Question", generatedDate: "2026-06-15", generatedBy: "Prof. A. Sen", exportType: "PDF", downloadCount: 3 },
    { id: "rep-4", name: "3rd Year CSE Batch Placement Eligibility report", category: "Batch", generatedDate: "2026-06-12", generatedBy: "Dr. Ramesh Sharma", exportType: "CSV", downloadCount: 8 }
  ];

  for (const rep of reports) {
    await prisma.reportLog.upsert({
      where: { id: rep.id },
      update: {},
      create: rep
    });
  }
  console.log("ReportLogs seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
