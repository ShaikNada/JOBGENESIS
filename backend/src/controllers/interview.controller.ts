import { Request, Response } from 'express';
import { askAI } from '../services/ai/modelRouter';
import { retrieveCompanyContext } from '../services/rag/knowledgeBase';
import { Interview } from '../models/Interview.model';

// @desc    Start AI Interview Session
// @route   POST /api/interview/start
export const startInterview = async (req: Request, res: Response) => {
    try {
        const { code, problemTitle, problemDescription, targetRole, company, difficulty, isStressMode, problemId, jobId } = req.body;
        const candidateId = (req as any).user._id;

        if (!code) {
            return res.status(400).json({ message: "Code payload is required." });
        }

        const ragContext = company ? retrieveCompanyContext(company) : "";

        // Generate the VERY FIRST question based purely on their code
        const initialPrompt = `
        You are an expert Senior Engineering Manager conducting a technical interview for a ${targetRole || 'Software Engineer'} role at ${company || 'your tech company'}.
        
        ${ragContext}

        ${isStressMode ? `
        !!! STRESS PROTOCOL ACTIVE !!!
        Your personality is: AGGRESSIVE, UNIMPRESSED, SKEPTICAL, and RUTHLESS.
        ` : 'Your personality is professional, rigorous but fair.'}

        The candidate just completed a coding challenge titled "${problemTitle || 'Algorithm Test'}".
        
        Here is the code the candidate submitted:
        ${code}
        
        Task: Ask ONE penetrating technical question about a specific design choice in their code (Complexity, Data Structures, or Edge Cases).
        Ensure your question strictly aligns with the engineering culture and constraints provided in the SYSTEM RAG INJECTION above.
        
        Do not answer the question. Just ask it directly as if you are on a video call.
        `;

        const initialQuestion = await askAI(initialPrompt);

        // Create the Interview session in MongoDB
        const interview = await Interview.create({
            candidateId,
            problemId,
            jobId,
            problemTitle,
            role: targetRole,
            company,
            difficulty,
            isStressMode,
            turns: [] 
        });

        return res.status(201).json({ 
            interviewId: interview._id,
            question: initialQuestion 
        });

    } catch (error: any) {
        console.error("Error starting interview:", error);
        return res.status(500).json({ message: "Failed to start interview session." });
    }
};

// @desc    Submit Interview Turn & Get Next Question
// @route   POST /api/interview/submit-turn
export const submitTurn = async (req: Request, res: Response) => {
    try {
        const { interviewId, transcript, question, turnIndex } = req.body;
        const isStressMode = req.body.isStressMode;

        if (!interviewId || !transcript) {
            return res.status(400).json({ message: "InterviewId and transcript are required." });
        }

        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ message: "Interview session not found." });

        // 1. Evaluate the previous answer
        const evalPrompt = `
        You are an expert technical interviewer evaluating a candidate's verbal response to your question: "${question}"
        
        The candidate's transcribed spoken response: "${transcript}"
        
        ${isStressMode ? 'PROTOCOLS: ZERO TOLERANCE for generic or vague answers.' : 'Evaluate fairly based on technical depth.'}

        Provide a JSON response strictly:
        {
            "feedback": "Direct feedback to candidate (2-3 sentences).",
            "communicationScore": <1-10>,
            "technicalAccuracyScore": <1-10>
        }
        `;

        const evalResponse = await askAI(evalPrompt);
        let cleanEval = evalResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        let evaluation = JSON.parse(cleanEval);

        // 2. Save turn to DB
        interview.turns.push({
            question,
            transcript,
            feedback: evaluation.feedback,
            communicationScore: evaluation.communicationScore,
            technicalAccuracyScore: evaluation.technicalAccuracyScore,
            timestamp: new Date()
        });

        // 3. Determine if interview should end (Limit 3 questions)
        if (interview.turns.length >= 3) {
            interview.status = 'completed';
            
            // Generate final summary
            const summaryPrompt = `Summarize this interview for a recruiter. Candidate: ${interview.candidateId}. Highlights and lowlights. Keep it 4-5 sentences. Conversation: ${JSON.stringify(interview.turns)}.`;
            const summary = await askAI(summaryPrompt);

            const avgComm = interview.turns.reduce((acc, t) => acc + t.communicationScore, 0) / 3;
            const avgTech = interview.turns.reduce((acc, t) => acc + t.technicalAccuracyScore, 0) / 3;

            interview.finalReport = {
                summary,
                overallScore: Math.round((avgComm + avgTech) / 2),
                avgCommunication: Math.round(avgComm),
                avgTechnical: Math.round(avgTech)
            };

            await interview.save();
            return res.json({ 
                status: 'completed', 
                feedback: evaluation.feedback,
                finalReport: interview.finalReport 
            });
        }

        // 4. Else, generate next follow-up question
        const nextPrompt = `
        Continue the interview.
        Previous Question: ${question}
        Candidate Answer: ${transcript}
        
        Ask ONE follow-up question (either probing deeper into their last answer or moving to a related architectural concern). 
        ${isStressMode ? 'Be more aggressive and skeptical.' : ''}
        `;
        const nextQuestion = await askAI(nextPrompt);

        await interview.save();

        return res.json({ 
            status: 'ongoing', 
            feedback: evaluation.feedback,
            question: nextQuestion 
        });

    } catch (error: any) {
        console.error("Error submitting turn:", error);
        res.status(500).json({ message: "Failed to process interview turn." });
    }
};

export const getInterviewSummary = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ message: "No interview found." });
        res.json(interview);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
