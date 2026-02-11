console.log("Checking resume controller...");
try {
    const resume = await import("./src/controllers/resume.controller.js");
    console.log("SUCCESS");
} catch (err) {
    console.error("FAIL", err);
}
