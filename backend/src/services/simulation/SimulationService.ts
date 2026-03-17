import { getIO } from '../../socketService';

interface VirtualCandidate {
    id: string;
    name: string;
    role: string;
    score: number;
    risk: string;
    fit: number;
    storyline: 'prodigy' | 'struggler' | 'cheater';
}

export class SimulationService {
    private activeSimulations: Map<string, NodeJS.Timeout> = new Map();

    public startSimulation(storyline: 'prodigy' | 'struggler' | 'cheater') {
        const id = `SIM-${Math.floor(Math.random() * 9000 + 1000)}`;
        const candidate: VirtualCandidate = this.generateCandidate(id, storyline);
        
        console.log(`[Simulation] Starting ${storyline} simulation for ${candidate.name} (${id})`);
        
        const interval = setInterval(() => {
            this.updateAndEmit(candidate);
        }, 5000);

        this.activeSimulations.set(id, interval);
        return { id, name: candidate.name };
    }

    private generateCandidate(id: string, storyline: string): VirtualCandidate {
        const names = ["Alex Rivera", "Jordan Chen", "Sarah Jenkins", "Michael Vogt", "Elena Rossi"];
        const name = names[Math.floor(Math.random() * names.length)] + " (SIM)";
        
        return {
            id,
            name,
            role: "Senior Full Stack Engineer",
            score: storyline === 'prodigy' ? 90 : storyline === 'cheater' ? 95 : 40,
            risk: storyline === 'cheater' ? 'High' : 'Low',
            fit: storyline === 'prodigy' ? 88 : 60,
            storyline: storyline as any
        };
    }

    private updateAndEmit(candidate: VirtualCandidate) {
        const io = getIO();
        
        // Dynamic score/fit fluctuation
        candidate.score += (Math.random() * 4 - 2);
        candidate.fit += (Math.random() * 2 - 1);
        candidate.score = Math.max(0, Math.min(100, candidate.score));
        
        // Emit Telemetry
        io.to("recruiter_room").emit("candidate_telemetry", {
            ...candidate,
            status: "In Progress"
        });

        // Occasional Logs
        if (Math.random() > 0.7) {
            const logs = {
                prodigy: [
                    "> [ENGINE] High algorithmic efficiency detected.",
                    "> [AI] Semantic alignment: 98% with Target Role.",
                    "> [SYSTEM] Telemetry nominal."
                ],
                struggler: [
                    "> [AI] Logical inconsistency detected in function 'calculateBalance'.",
                    "> [ENGINE] High time complexity warning (O(n^3)).",
                    "> [SYSTEM] Candidate pulse elevated."
                ],
                cheater: [
                    "> [ENGINE] Proctor Strike: Tab focus lost (Blur event).",
                    "> [AI] Vision Alert: Mobile device detected in frame.",
                    "> [ENGINE] Unnatural keystroke cadence detected (Paste suspected)."
                ]
            };
            
            const pool = logs[candidate.storyline];
            const log = pool[Math.floor(Math.random() * pool.length)];
            
            io.to("recruiter_room").emit("candidate_log", { log });
        }
    }

    public stopAll() {
        this.activeSimulations.forEach(interval => clearInterval(interval));
        this.activeSimulations.clear();
    }
}

export const simulationService = new SimulationService();
