import { askAI } from "../ai/modelRouter";

export const executeCareerPathAnalysis = async (
  resumeData: any,
  targetRole: string,
  targetCompany: string,
  experienceLevel: string
) => {
  console.log(`Analyzing Career Path for ${targetRole} at ${targetCompany}`);

  try {
    const prompt = `
      You are an elite Silicon Valley tech recruiter and engineering manager at ${targetCompany}.
      Evaluate this candidate for a ${experienceLevel} ${targetRole} position.

      CANDIDATE PROFILE:
      ${JSON.stringify(resumeData, null, 2)}

      TASKS:
      1. Determine if this exact role (${targetRole} at ${targetCompany}) is currently hiring or common in the market right now.
      2. Analyze the candidate's skills against the industry standard requirements for a ${experienceLevel} ${targetRole} at a company like ${targetCompany}.
      3. Identify exactly what critical skills, tools, or architectural knowledge the candidate is missing.
      4. Provide 2-3 specific, high-quality learning resources (courses, documentation, or books) that would bridge these precise gaps.
      5. Write a brief, encouraging, but direct message from the "Hiring Manager" summarizing their standing.

      Format your response to match this exact schema:
      {
        "jobFound": boolean, // Whether this role is commonly found/realistic at this company right now.
        "matchScore": number, // 0-100 Percentage match of candidate's skills vs role requirements.
        "missingSkills": [string], // Specific tools, languages, or concepts the candidate lacks.
        "learningResources": [
          {
            "title": string,
            "type": string, // "Course", "Documentation", "Book"
            "url": string
          }
        ],
        "coachMessage": string // 2-3 sentence direct, constructive message from the hiring manager.
      }
      Do not include any other markdown formatting like \`\`\`json. Return bare JSON.
    `;

    const rawResponse = await askAI(prompt);
    
    // Clean potential markdown from AI response
    let cleanResponse = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    // Find first { and last }
    const firstBrace = cleanResponse.indexOf('{');
    const lastBrace = cleanResponse.lastIndexOf('}');
    if(firstBrace !== -1 && lastBrace !== -1) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error("Failed Career Path Analysis:", error);
    throw new Error("Failed to generate career path analysis.");
  }
};
