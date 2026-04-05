import { Request, Response } from "express";
import { askAI } from "../services/ai/modelRouter";

/**
 * Generates an AI-driven career path/roadmap for a target role.
 * Optimized for Hackathon "Wow" Factor.
 */
export const generateCareerPath = async (req: Request, res: Response) => {
  try {
    const { role, company, experienceLevel } = req.body;

    if (!role || !company) {
      return res.status(400).json({ error: "ROLE_AND_COMPANY_REQUIRED" });
    }

    console.log(`[CareerPath] Analyzing strategic journey for ${role} at ${company}`);

    const prompt = `
        You are a Principal Engineering Lead at ${company}.
        A ${experienceLevel || 'Mid-Career'} candidate wants to join your team as a "${role}".
        
        Provide a strategic competitive roadmap and deep-link analysis of what they need to master.
        
        FORMAT YOUR RESPONSE AS CLEAN HTML (No markdown headers like ###). 
        Use <h4> for section titles and <ul><li> for lists.
        
        Include these sections:
        1. "THE ${company.toUpperCase()} BAR": What is unique about their engineering culture?
        2. "60-DAY ACCELERATION PLAN": Specific steps to be ready.
        3. "VALLEY OF DEATH": Common interview traps for this role and how to avoid them.
        4. "MISSION-CRITICAL TECH": Specific tools/frameworks.
    `;

    const aiResponse = await askAI(prompt);
    
    // Clean up any AI artifacts (unwanted headers)
    const sanitizedPath = aiResponse
      .replace(/```html|```/g, "")
      .replace(/<head>[\s\S]*<\/head>/g, "")
      .replace(/<html>|<body>|<\/html>|<\/body>/g, "")
      .trim();

    return res.json({
      careerPath: sanitizedPath || "Analysis completed locally. Refer to critical gap report for next steps.",
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Career Path Generation Error:", error);
    return res.status(500).json({ 
        error: "INTERNAL_AI_FAULT",
        message: "Strategic analysis engine temporarily offline." 
    });
  }
};
