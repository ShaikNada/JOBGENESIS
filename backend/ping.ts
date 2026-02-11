console.log("PING: Module system check...");

async function test() {
    try {
        console.log("1. Loading express...");
        const express = await import("express");
        console.log("   Express ok");

        console.log("2. Loading app.js...");
        const app = await import("./src/app.js");
        console.log("   App ok");

        console.log("3. Loading auth.controller.js...");
        const auth = await import("./src/controllers/auth.controller.js");
        console.log("   Auth controller ok");

        console.log("4. Loading resume.controller.js...");
        const resume = await import("./src/controllers/resume.controller.js");
        console.log("   Resume controller ok");

        console.log("5. Loading job.controller.js...");
        const job = await import("./src/controllers/job.controller.js");
        console.log("   Job controller ok");

        console.log("\n✅ ALL MODULES LOADED SUCCESSFULLY");
    } catch (err) {
        console.error("\n❌ MODULE LOAD FAILED");
        console.error(err);
    }
}

test();
