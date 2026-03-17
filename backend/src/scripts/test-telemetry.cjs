const { io } = require("socket.io-client");

console.log("🚀 Starting Headless WebSocket Telemetry Test...");

const SERVER_URL = "http://localhost:4000";

// 1. Create Recruiter Client
const recruiter = io(SERVER_URL, { transports: ["websocket"] });

// 2. Create Candidate Client
const candidate = io(SERVER_URL, { transports: ["websocket"] });

let testsPassed = 0;
const expectedTests = 2;

recruiter.on("connect", () => {
  console.log("👁️ Recruiter Connected. Joining room...");
  recruiter.emit("join_recruiter_room");

  // Setup Listeners
  recruiter.on("candidate_telemetry", (data) => {
    console.log(`✅ Recruiter received telemetry:`, data);
    if (data.id === "C-TEST-123" && data.score === 80) {
      testsPassed++;
      checkCompletion();
    } else {
        console.error("❌ Telemetry payload mismatch!");
        process.exit(1);
    }
  });

  recruiter.on("candidate_log", (data) => {
    console.log(`✅ Recruiter received log:`, data.log);
    if (data.log.includes("Proctor Strike")) {
      testsPassed++;
      checkCompletion();
    } else {
        console.error("❌ Log payload mismatch!");
        process.exit(1);
    }
  });

  // Once recruiter is set up, candidate can start emitting
  candidate.on("connect", () => {
    console.log("🧑‍💻 Candidate Connected. Emitting signals in 1 second...");
    setTimeout(() => {
        candidate.emit("candidate_telemetry", { id: "C-TEST-123", name: "Test Operative", score: 80, risk: "High" });
        candidate.emit("candidate_log", { log: "> [ENGINE] Proctor Strike on Candidate C-TEST-123: Tab Switched" });
    }, 1000);
  });
});

candidate.on("connect_error", (err) => {
    console.error("Candidate connection error:", err.message);
    process.exit(1);
});

recruiter.on("connect_error", (err) => {
    console.error("Recruiter connection error:", err.message);
    process.exit(1);
});

function checkCompletion() {
    if (testsPassed === expectedTests) {
        console.log("\n🎉 ALL TELEMETRY ROUTING TESTS PASSED SUCCESSFULLY! 🎉");
        recruiter.disconnect();
        candidate.disconnect();
        process.exit(0); // Success
    }
}

// Timeout fail-safe
setTimeout(() => {
    console.error("❌ Test timed out. WebSockets might not be routing correctly.");
    process.exit(1);
}, 5000);
