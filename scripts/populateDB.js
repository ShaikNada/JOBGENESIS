import fs from 'fs';
import https from 'https';

// ✅ NEW SOURCE: This dataset is formatted specifically for readability
const SOURCE_URL = "https://raw.githubusercontent.com/clean-leetcode/leetcode-problems/master/all.json"; 
const OUTPUT_FILE = "src/lib/database/problemSet.ts";
const COMPANIES = ["Google", "Amazon", "Meta", "Netflix", "Microsoft", "Arasaka", "Militech", "Uber"];

console.log("🚀 Initializing High-Quality Database Injection...");

https.get(SOURCE_URL, (res) => {
  let data = '';

  res.on('data', chunk => data += chunk);

  res.on('end', () => {
    try {
      console.log("⬇️  Parsing Data...");
      const rawData = JSON.parse(data);
      
      // Handle Object vs Array format
      const problemsArray = Array.isArray(rawData) ? rawData : Object.values(rawData);
      
      const transformed = problemsArray.map(p => {
         // Random Companies
         const randomCompanies = [];
         for(let i=0; i<3; i++) randomCompanies.push(COMPANIES[Math.floor(Math.random() * COMPANIES.length)]);

         // Clean up content: Ensure <pre> tags have a class for styling
         let cleanContent = p.content || p.description || "<p>No description available.</p>";
         
         // Formatting Fix: Some questions use just text. We wrap "Example" in bold if needed.
         cleanContent = cleanContent
            .replace(/Example (\d+):/g, '<strong>Example $1:</strong>')
            .replace(/Input:/g, '<strong>Input:</strong>')
            .replace(/Output:/g, '<strong>Output:</strong>');

         return {
            id: `lc-${p.id}`,
            title: p.title,
            difficulty: p.difficulty || "Medium",
            tags: ["Algorithms"], 
            companies: [...new Set(randomCompanies)],
            description: cleanContent,
            examples: [], 
            starterCode: "// Write your solution here" // This dataset lacks code snippets, so we use generic
         };
      }).slice(0, 300); // Limit to 300 for performance

      const fileContent = `
// ⚠️ AUTOMATICALLY GENERATED FILE.
// Total Problems: ${transformed.length}

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

export const PROBLEM_SET: CodingProblem[] = ${JSON.stringify(transformed, null, 2)};
      `;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Success! Imported ${transformed.length} clean problems.`);

    } catch (e) {
      console.error("❌ Error:", e.message);
    }
  });
});