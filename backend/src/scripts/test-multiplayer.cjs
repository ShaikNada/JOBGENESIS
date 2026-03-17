const { io } = require("socket.io-client");

console.log("🚀 Starting Headless Multiplayer/Co-Op WebSocket Test...");

const SERVER_URL = "http://localhost:4000";

const clientA = io(SERVER_URL, { transports: ["websocket"] });
const clientB = io(SERVER_URL, { transports: ["websocket"] });

let testsPassed = 0;
const expectedTests = 2; // code_update, cursor_move

const MISSION_ID = "M-999-COOP";

clientA.on("connect", () => {
    console.log("Player A connected. Joining mission room...");
    clientA.emit("join_mission", { missionId: MISSION_ID });

    clientB.on("connect", () => {
        console.log("Player B connected. Joining mission room...");
        clientB.emit("join_mission", { missionId: MISSION_ID });

        // Setup Player B to listen to A's emissions
        clientB.on("code_update", (data) => {
            console.log("✅ Player B received code_update from Player A:", data);
            if (data.code === "console.log('Hello World');") {
                testsPassed++;
                checkCompletion();
            } else {
                console.error("❌ Code payload mismatch!");
                process.exit(1);
            }
        });

        clientB.on("cursor_move", (data) => {
            console.log("✅ Player B received cursor_move from Player A:", data);
            if (data.cursor.lineNumber === 5 && data.cursor.column === 10) {
                testsPassed++;
                checkCompletion();
            } else {
                console.error("❌ Cursor payload mismatch!");
                process.exit(1);
            }
        });

        // Player A emits data after B has joined and had time to establish listeners
        setTimeout(() => {
            console.log("Player A emitting code and cursor updates...");
            clientA.emit("code_update", { missionId: MISSION_ID, code: "console.log('Hello World');" });
            clientA.emit("cursor_move", { missionId: MISSION_ID, cursor: { lineNumber: 5, column: 10 } });
        }, 1000);
    });
});

clientA.on("connect_error", (err) => {
    console.error("Client A connection error:", err.message);
    process.exit(1);
});

clientB.on("connect_error", (err) => {
    console.error("Client B connection error:", err.message);
    process.exit(1);
});

function checkCompletion() {
    if (testsPassed === expectedTests) {
        console.log("\n🎉 ALL MULTIPLAYER CO-OP ROUTING TESTS PASSED SUCCESSFULLY! 🎉");
        clientA.disconnect();
        clientB.disconnect();
        process.exit(0);
    }
}

setTimeout(() => {
    console.error("❌ Test timed out. WebSockets might not be routing CO-OP mission events correctly.");
    process.exit(1);
}, 5000);
