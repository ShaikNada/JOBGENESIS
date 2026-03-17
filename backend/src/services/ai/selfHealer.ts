import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ts from 'typescript';
import { getIO } from '../../socketService';
import { Problem } from '../../models/Problem.model';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface PatchResult {
    startLine: number;
    endLine: number;
    replacementContent: string;
    explanation: string;
}

export class SelfHealer {
    private isHealing = false;

    // We only actively heal within the /backend/src directory to avoid messing up modules or frontend
    private readonly projectRoot = path.join(process.cwd(), 'src');

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('[Self-Healer] GEMINI_API_KEY is missing. Self-healing is disabled.');
            return;
        }
        
        console.log('[Self-Healer] Bot online. Monitoring for unhandled exceptions.');
        this.attachListeners();
    }

    private attachListeners() {
        process.on('uncaughtException', async (err: Error) => {
            console.error('\n💥 [Self-Healer] CRITICAL EXCEPTION CAUGHT:', err.message);
            await this.diagnoseAndHeal(err);
        });

        process.on('unhandledRejection', async (reason: any, promise: Promise<any>) => {
            console.error('\n💥 [Self-Healer] UNHANDLED REJECTION CAUGHT:', reason);
            const err = reason instanceof Error ? reason : new Error(String(reason));
            await this.diagnoseAndHeal(err);
        });
    }

    public expressErrorHandler = async (err: Error, req: any, res: any, next: any) => {
        console.error('\n💥 [Self-Healer] EXPRESS ERROR CAUGHT:', err.message);
        // We don't await here so Express can still return a 500 to the client while we heal in the background
        this.diagnoseAndHeal(err).catch(e => console.error('[Self-Healer] Background heal failed:', e));
        
        res.status(500).json({
            message: "A critical system error occurred. The Auto-Healing Bot has been dispatched to patch the source code.",
            error: err.message
        });
    };

    private extractFileFromStack(stack?: string): { filePath: string, line: number, col: number } | null {
        if (!stack) return null;

        // Looking for the first local src/ file in the stack trace
        // e.g., "at Object.<anonymous> (/absolute/path/to/backend/src/controllers/auth.ts:42:15)"
        const lines = stack.split('\n');
        for (const line of lines) {
            // Find paths ending in .ts
            const match = line.match(/\((.*?\.ts):(\d+):(\d+)\)/) || line.match(/at (.*?\.ts):(\d+):(\d+)/);
            if (match) {
                const filePath = match[1];
                // Only heal files inside our backend src directory
                if (filePath.includes(this.projectRoot) || filePath.includes('\\src\\')) {
                    return {
                        filePath: path.resolve(filePath),
                        line: parseInt(match[2], 10),
                        col: parseInt(match[3], 10)
                    };
                }
            }
        }
        return null;
    }

    private async diagnoseAndHeal(err: Error) {
        if (this.isHealing) {
            console.log('[Self-Healer] Already processing a heal operation. Skipping duplicate.');
            return;
        }

        const trace = this.extractFileFromStack(err.stack);
        if (!trace) {
            console.log('[Self-Healer] Could not determine local source file from stack trace. Terminating process.');
            process.exit(1);
        }

        console.log(`[Self-Healer] Fault localized to ${trace.filePath} at line ${trace.line}`);
        this.isHealing = true;

        try {
            const fileContent = fs.readFileSync(trace.filePath, 'utf-8');
            const fileLines = fileContent.split('\n');
            
            // Extract a window of context (e.g., 20 lines before and 20 lines after)
            const startLine = Math.max(0, trace.line - 20);
            const endLine = Math.min(fileLines.length, trace.line + 20);
            // INCLUDE LINE NUMBERS so the AI can define startLine and endLine
            const contextSnippet = fileLines.slice(startLine, endLine).map((l, i) => `${startLine + i + 1}: ${l}`).join('\n');

            // 🌐 Broadcast Matrix Glitch Event to Frontend
            try {
                const io = getIO();
                io.emit('system-breach', { type: err.name, message: err.message, file: trace.filePath, snippet: contextSnippet });
                console.log('[Self-Healer] Emitted system-breach WebSocket event to frontend clients.');
            } catch (wErr) {
                console.error('[Self-Healer] Failed to emit WebSocket event:', wErr);
            }

            console.log('[Self-Healer] Analyzing fault context with AI...');

            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `
You are an advanced self-healing code robot tasked with recovering a Node.js/TypeScript backend from a fatal crash.

ERROR CAUGHT:
${err.name}: ${err.message}

STACK TRACE:
${err.stack}

FAULTY FILE SNIPPET (${trace.filePath}):
${contextSnippet}

INSTRUCTIONS:
1. Examine the error message and the exact code snippet provided above.
2. Identify the exact lines of code causing the crash (e.g., undefined variable, bad property access, missing await, syntax error).
3. Determine the fix.
4. Output a JSON object containing the \`startLine\` and \`endLine\` numbers of the buggy code to be replaced, and the \`replacementContent\` that fixes the bug.
5. EXTREMELY IMPORTANT: The \`startLine\` and \`endLine\` MUST be integers representing the exact range of lines in the file that should be overwritten. Focus ONLY on the minimum number of lines needed to change.
6. The \`replacementContent\` is your fixed version of those lines, maintaining the original indentation, BUT DO NOT prefix these replacement lines with line numbers! Just pure code.
7. Wrap your entire response in a \`\`\`json block.

JSON FORMAT:
{
  "startLine": 48,
  "endLine": 50,
  "replacementContent": "    const size = bug?.length ?? 0;",
  "explanation": "brief overview of the fix"
}
`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            
            // Extract JSON
            const jsonMatch = responseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
            if (!jsonMatch) {
                throw new Error("AI did not return valid JSON format.");
            }

            const patch: PatchResult = JSON.parse(jsonMatch[1]);
            
            if (patch.startLine > patch.endLine || patch.startLine < 1 || patch.endLine > fileLines.length) {
                 throw new Error("AI returned invalid line numbers. Safety abort.");
            }

            console.log(`[Self-Healer] AI Diagnosis: ${patch.explanation}`);
            console.log(`[Self-Healer] Applying patch to ${trace.filePath} from line ${patch.startLine} to ${patch.endLine}...`);

            // Apply patch via array splicing
            const originalTargetLines = fileLines.slice(patch.startLine - 1, patch.endLine).join('\n');
            const patchLines = patch.replacementContent.split('\n');
            fileLines.splice(patch.startLine - 1, patch.endLine - patch.startLine + 1, ...patchLines);
            const patchedContent = fileLines.join('\n');
            
            // 🛡️ AST Verification Check
            console.log('[Self-Healer] Verifying Abstract Syntax Tree (AST) of the patched code...');
            const transpileResult = ts.transpileModule(patchedContent, { reportDiagnostics: true });
            const parseErrors = transpileResult.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error);
            if (parseErrors && parseErrors.length > 0) {
                console.error('[Self-Healer] AST Verification Failed. The AI generated invalid syntax:');
                parseErrors.forEach(err => console.error(err.messageText));
                throw new Error("AI generated invalid syntax. Safety abort.");
            }
            console.log('[Self-Healer] AST Verification Passed!');

            fs.writeFileSync(trace.filePath, patchedContent, 'utf-8');

            // Log the heal
            const logEntry = `[${new Date().toISOString()}] HEALED: ${trace.filePath}\nERROR: ${err.message}\nFIX: ${patch.explanation}\n\n`;
            fs.appendFileSync(path.join(process.cwd(), 'healing.log'), logEntry, 'utf-8');

            // 🤖 Autonomous Git Commit
            try {
                console.log('[Self-Healer] Creating autonomous Git commit synchronously...');
                const gitRoot = path.resolve(process.cwd(), '..');
                const branchName = `bot/auto-heal-${Date.now()}`;
                
                // Construct shell commands
                const commands = [
                    'git checkout master',
                    'git pull origin master',
                    `git checkout -b ${branchName}`,
                    `git add backend/src/server.ts`,
                    `git commit -m "fix(auto-heal): self-healing bot automated patch" -m "Error: ${err.message}" -m "Fix: ${patch.explanation}"`,
                    `git push -u origin ${branchName}`
                ];

                for (const cmd of commands) {
                    execSync(cmd, { cwd: gitRoot, stdio: 'ignore' });
                }
                
                console.log(`[Self-Healer] Git commit created and pushed on branch ${branchName}.`);
            } catch (gitErr) {
                console.error('[Self-Healer] Failed to create git commit:', gitErr);
            }

            // 🎮 Auto-Generate Gauntlet Level from Bug
            try {
                console.log('[Self-Healer] Generating Gauntlet Level from this bug...');
                const levelPrompt = `
You are a technical game designer for 'Coding Gauntlet'. We just intercepted a real bug in our backend:
ERROR: ${err.name}: ${err.message}
FILE: ${path.basename(trace.filePath)}

BROKEN CODE:
${originalTargetLines}

FIXED CODE:
${patch.replacementContent}

Turn this into a new coding challenge for our users to play.
Output a JSON object matching this schema:
{
  "id": "generate_a_unique_slug_like_fix_typeerror_server_${Date.now()}",
  "title": "Fix the ${err.name} in ${path.basename(trace.filePath)}",
  "difficulty": "Hard",
  "tags": ["bug-fix", "auto-generated", "real-world", "self-healer"],
  "companies": ["JobGenesis"],
  "description": "Write a short markdown description explaining the bug and asking the player to fix it. Keep it engaging and lore-friendly.",
  "starterCode": {
    "javascript": "string: The BROKEN CODE exactly as provided",
    "python": "",
    "java": "",
    "cpp": ""
  },
  "functionName": "fixBug",
  "testCases": [
    {
       "input": "Function arguments or 'execute'",
       "expected": "Expected result or 'No Crash'"
    }
  ],
  "isPremium": false
}
Wrap your response in a \`\`\`json block.
`;
                const levelResult = await model.generateContent(levelPrompt);
                const levelText = levelResult.response.text();
                const levelJsonMatch = levelText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
                
                if (levelJsonMatch) {
                    const problemData = JSON.parse(levelJsonMatch[1]);
                    
                    // We need to bypass the mongoose required validations cleanly, since AI generated it
                    const newProblem = new Problem(problemData);
                    await newProblem.save();
                    console.log(`[Self-Healer] 🎮 Generated Gauntlet Level: ${problemData.title} and saved to database!`);
                    
                    // Tell clients the level is ready
                    try {
                        const io = getIO();
                        io.emit('new-gauntlet-level', { id: problemData.id, title: problemData.title });
                    } catch (e) {}
                }
            } catch (levelErr) {
                console.error('[Self-Healer] Failed to generate Gauntlet Level:', levelErr);
            }

            console.log(`[Self-Healer] ✨ Auto-patch successful! Rebooting process to clear state...`);
            
            // We exit so nodemon/pm2/docker can restart the server with the new clean code.
            process.exit(1);

        } catch (healErr) {
            console.error('\n[Self-Healer] ❌ Auto-heal failed:', healErr);
            // Don't leave the server hanging on a fatal exception
            process.exit(1);
        } finally {
            this.isHealing = false;
        }
    }
}
