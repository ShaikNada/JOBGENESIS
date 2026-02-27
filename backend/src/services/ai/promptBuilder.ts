/**
 * Prompt builder for AI generation and evaluation
 * ALL prompts live here
 */

export function buildGeneratePrompt({
  title,
  description,
  difficulty,
  starterCode
}: {
  title: string;
  description: string;
  difficulty: string;
  starterCode: any;
}) {
  return `
You are an expert coding interview preparer.

I have a coding problem for you:
Title: ${title}
Difficulty: ${difficulty}
Description:
${description}

Existing Starter Code (Current Context):
${typeof starterCode === 'object' ? JSON.stringify(starterCode, null, 2) : (starterCode || "None")}

Your Task:
Generate/Complete the starter code for this specific problem in ALL of these languages: JavaScript, Python, Java, and C++.
Ensure the function names and signatures are identical across languages where possible.
Always include the basic class/function structure.

Return JSON exactly in this format:
{
  "starterCode": {
    "javascript": "...",
    "python": "...",
    "java": "...",
    "cpp": "..."
  },
  "visualType": "Flowchart",
  "visualData": []
}
`;
}

export function buildEvaluatePrompt({
  code,
  problemDescription,
  language,
  mode,
  customInput
}: {
  code: string;
  problemDescription: string;
  language: string;
  mode: string;
  customInput?: string;
}) {
  return `
You are a strict coding interview evaluator.

Rules:
- Be strict
- No assumptions
- totalTests must always be 10

Problem:
${problemDescription}

Language:
${language}

Candidate Code:
${code}

${mode === "custom" ? `Custom Input:\n${customInput}` : ""}

Return ONLY valid JSON:
{
  "passed": boolean,
  "passCount": number,
  "totalTests": 10,
  "feedback": "short explanation"
}
`;
}

export function buildDomainSpecificPrompt({
  role,
  experienceLevel,
  company
}: {
  role: string;
  experienceLevel: string;
  company: string;
}) {
  return `
You are a senior technical interviewer at ${company}.
Your candidate is applying for a ${experienceLevel} ${role} position.

Task:
Generate a single, unique, practical coding problem relevant to this role.
Do NOT generate a generic LeetCode DSA problem unless it's critical for the role.
Focus on domain skills (e.g., React for Frontend, API Design for Backend).

Requirements:
1. Title: Professional and clear.
2. Description: Detailed scenario in HTML format.
3. Starter Code: Provide boilerplate for the relevant languages.
   - For Frontend, provide a React component stub in 'javascript' or 'typescript'.
   - For Backend, provide a function stub.

Return JSON exactly as follows:
{
  "title": "Problem Title",
  "difficulty": "${experienceLevel}",
  "description": "<p>Problem description...</p>",
  "starterCode": {
    "javascript": "// JS/React starter code...",
    "python": "# Python starter code...",
    "java": "// Java starter code...",
    "cpp": "// C++ starter code..."
  },
  "visualType": "Flowchart",
  "visualData": []
}
`;
}

export function buildComplexityPrompt(code: string, language: string) {
  return `
Analyze the Time and Space complexity of this ${language} code.

Code:
${code}

Return JSON:
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "Brief explanation (max 2 sentences)."
}
`;
}

export function buildHintPrompt(code: string, problemDescription: string, language: string) {
  return `
You are a helpful coding coach. The user is stuck on this problem.
Give a subtle hint that nudges them in the right direction WITHOUT revealing the solution or writing code.

Problem:
${problemDescription}

User Code:
${code}

Return JSON:
{
  "hint": "Your subtle hint here..."
}
`;
}
