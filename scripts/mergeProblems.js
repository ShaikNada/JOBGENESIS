import fs from 'fs';
import path from 'path';

const PROBLEMS_DIR = './scripts/problems'; 
const OUTPUT_FILE = 'src/lib/database/problemSet.ts';
const COMPANIES = ["Google", "Amazon", "Meta", "Netflix", "Microsoft", "Arasaka", "Militech", "Uber"];

// Helper to sanitize text so symbols like "<=" don't break HTML
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

console.log(`🚀 Reading problems from ${PROBLEMS_DIR}...`);

try {
  if (!fs.existsSync(PROBLEMS_DIR)) {
    throw new Error(`Directory not found: ${PROBLEMS_DIR}`);
  }

  const files = fs.readdirSync(PROBLEMS_DIR).filter(file => file.endsWith('.json'));
  console.log(`📂 Found ${files.length} files. Reordering Layout...`);

  let successCount = 0;

  const mergedProblems = files.map(file => {
    try {
      const content = fs.readFileSync(path.join(PROBLEMS_DIR, file), 'utf-8');
      const p = JSON.parse(content);

      // 1. STARTER CODE
      let starter = "// Write your solution here";
      if (p.code_snippets && p.code_snippets.javascript) starter = p.code_snippets.javascript;
      else if (p.code_snippets && p.code_snippets.js) starter = p.code_snippets.js;
      
      // 2. DIFFICULTY & COMPANIES
      let difficulty = "Medium";
      if (p.difficulty === "Easy" || p.difficulty === 1) difficulty = "Easy";
      if (p.difficulty === "Hard" || p.difficulty === 3) difficulty = "Hard";

      const randomCompanies = [];
      const numCompanies = Math.floor(Math.random() * 3) + 1;
      for(let i=0; i < numCompanies; i++) randomCompanies.push(COMPANIES[Math.floor(Math.random() * COMPANIES.length)]);

      // 3. ASSEMBLE DESCRIPTION
      let fullHtml = p.description || p.content || "";
      
      // Cut off old broken "Example" headers at the bottom
      fullHtml = fullHtml.split(/Example 1:/)[0]; 

      // --- SECTION A: CONSTRAINTS (Moved Up!) ---
      // Now placed immediately after the description text
      if (p.constraints && Array.isArray(p.constraints)) {
        fullHtml += `<div class="constraints-wrapper"><h3 class="constraint-header">Constraints</h3><ul class="constraint-list">`;
        p.constraints.forEach(c => {
          // Escape HTML so symbols like "<=" render correctly
          fullHtml += `<li>${escapeHtml(c)}</li>`;
        });
        fullHtml += `</ul></div>`;
      }

      // --- SECTION B: EXAMPLES (Moved Down!) ---
      if (p.examples && Array.isArray(p.examples)) {
        p.examples.forEach((ex, index) => {
          let text = ex.example_text || "";
          
          // Beautify Badges
          text = text
            .replace(/(Input:)/g, '<br/><span class="ex-label input">Input</span>')
            .replace(/(Output:)/g, '<br/><span class="ex-label output">Output</span>')
            .replace(/(Explanation:)/g, '<br/><span class="ex-label explain">Explanation</span>');

          fullHtml += `
            <div class="example-wrapper">
              <h3 class="example-header">Example ${index + 1}</h3>
              <div class="example-block">${text}</div>
            </div>
          `;
        });
      }

      // 4. RAW EXAMPLES FOR RUNNER
      let rawExamples = [];
      if (p.examples && Array.isArray(p.examples)) {
         rawExamples = p.examples.map(ex => {
            const text = ex.example_text || "";
            const inMatch = text.match(/Input:\s*(.*?)(?:\n|$)/);
            const outMatch = text.match(/Output:\s*(.*?)(?:\n|$)/);
            return {
              input: inMatch ? inMatch[1] : "See details",
              output: outMatch ? outMatch[1] : "See details"
            };
         });
      }

      successCount++;

      return {
        id: `lc-${p.problem_id || p.id}`,
        title: p.title,
        difficulty: difficulty, 
        tags: p.topics || ["Algorithms"],
        companies: [...new Set(randomCompanies)],
        description: fullHtml, 
        examples: rawExamples.slice(0, 3), 
        starterCode: starter
      };

    } catch (e) {
      return null; 
    }
  }).filter(p => p !== null); 

  const fileContent = `
// ⚠️ AUTOMATICALLY GENERATED FILE.
export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  companies: string[];
  description: string;
  examples: { input: string; output: string }[];
  starterCode: string;
}

export const PROBLEM_SET: CodingProblem[] = ${JSON.stringify(mergedProblems, null, 2)};
  `;

  fs.writeFileSync(OUTPUT_FILE, fileContent);
  console.log(`\n✅ Database Regenerated! Processed ${successCount} files.`);

} catch (err) {
  console.error(err);
}