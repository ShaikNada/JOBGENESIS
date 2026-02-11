const API_URL = "http://localhost:4000/api/ai";

export async function generateChallenge(payload: any) {
    const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to generate challenge");
    return res.json();
}

export async function evaluateSubmission(payload: any) {
    const res = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to evaluate submission");
    return res.json();
}

export async function assistCandidate(payload: any) {
    const res = await fetch(`${API_URL}/assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to get assistant response");
    const data = await res.json();
    return data.reply;
}
