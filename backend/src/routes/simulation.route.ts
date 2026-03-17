import { Router } from "express";
import { simulationService } from "../services/simulation/SimulationService";

export const simulationRouter = Router();

simulationRouter.post("/start", (req, res) => {
    const { storyline } = req.body;
    const result = simulationService.startSimulation(storyline || 'prodigy');
    res.json({ message: "Simulation started", ...result });
});

simulationRouter.post("/stop", (req, res) => {
    simulationService.stopAll();
    res.json({ message: "All simulations terminated" });
});

/**
 * THE GLITCH ENDPOINT
 * This is designed to trigger the Self-Healer by causing a predictable crash
 */
simulationRouter.get("/trigger-glitch", (req, res) => {
    console.log("⚠️ [SIMULATION] TRIGGERING INTENTIONAL SYSTEM GLITCH...");
    
    // We use a timeout to let the response finish or just crash immediately
    // For a real self-healing demo, we actually want a crash that can be patched.
    // Let's call a non-existent function or access property of undefined.
    const systemCore: any = undefined;
    
    setTimeout(() => {
        console.log(systemCore.neuralMatrix); // This will throw TypeError
    }, 100);

    res.json({ 
        message: "Matrix glitch initiated. Dispatched Self-Healing bot.",
        protocol: "OMEGA-HEAL" 
    });
});
