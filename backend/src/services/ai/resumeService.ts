

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  field?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Keywords {
  technical: string[];
  softSkills: string[];
  domains: string[];
}

export interface ResumeAnalysis {
  skills: string[];
  experienceLevel: "Junior" | "Mid" | "Senior" | "Lead";
  summary: string;
  suggestedRoles: string[];
  extractedText: string;
  personalInfo: PersonalInfo;
  education: Education[];
  workExperience: WorkExperience[];
  keywords: Keywords;
}

export async function analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
  try {
    console.log("🔬 Starting AI analysis...");
    console.log("🔑 Groq API Key present:", !!process.env.GROQ_API_KEY);

    const prompt = `You are an expert technical recruiter and career coach.
Analyze the following resume text and extract comprehensive information.

Extract:
1. Personal Information: name, email, phone, location
2. Education: array of {degree, institution, year, field}
3. Work Experience: array of {title, company, duration, description}
4. Skills: array of technical skills
5. Keywords categorized into:
   - technical: programming languages, frameworks, tools
   - softSkills: communication, leadership, etc.
   - domains: industries, specializations
6. Experience Level: Junior, Mid, Senior, or Lead (based on years and depth)
7. Professional Summary: 2-3 sentence overview
8. Suggested Job Roles: 3-5 roles that fit this profile

Resume Text:
"${resumeText.slice(0, 10000)}"

Return ONLY valid JSON in this EXACT format:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1234567890",
    "location": "City, State"
  },
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "University Name",
      "year": "2020",
      "field": "Computer Science"
    }
  ],
  "workExperience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 - Present",
      "description": "Brief description of role and achievements"
    }
  ],
  "skills": ["React", "Node.js", "Python"],
  "keywords": {
    "technical": ["JavaScript", "TypeScript", "Docker"],
    "softSkills": ["Leadership", "Communication"],
    "domains": ["Web Development", "Cloud Computing"]
  },
  "experienceLevel": "Senior",
  "summary": "Professional summary here.",
  "suggestedRoles": ["Frontend Engineer", "Full Stack Developer"]
}`;

    console.log("📤 Calling Groq API...");
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const text = completion.choices[0]?.message?.content || "";

    console.log("📥 Received AI response, length:", text.length);
    console.log("📝 First 300 chars:", text.slice(0, 300));

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    console.log("✅ Successfully parsed AI response");
    console.log("👤 Extracted name:", parsed.personalInfo?.name);

    return {
      ...parsed,
      extractedText: resumeText.slice(0, 500) // Preview of raw text
    };
  } catch (error) {
    console.error("❌ Resume Analysis Failed:", error);
    console.error("Error details:", error instanceof Error ? error.message : error);

    // Fallback Mock Data
    console.log("⚠️ Returning fallback data");
    return {
      skills: ["General Programming", "Problem Solving"],
      experienceLevel: "Mid",
      summary: "Could not analyze resume deeply, but candidate shows technical potential.",
      suggestedRoles: ["Software Engineer", "Full Stack Developer"],
      extractedText: resumeText.slice(0, 500),
      personalInfo: {
        name: "Candidate",
        email: "Not extracted",
        phone: "Not extracted"
      },
      education: [],
      workExperience: [],
      keywords: {
        technical: ["Programming"],
        softSkills: ["Problem Solving"],
        domains: ["Software Development"]
      }
    };
  }
}
