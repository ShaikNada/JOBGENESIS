async function test() {
    try {
        console.log("--- PDF-PARSE ---");
        const pdfModule = await import("pdf-parse");
        console.log("Module type:", typeof pdfModule);
        console.log("Default type:", typeof pdfModule.default);
        if (typeof pdfModule.default === 'function') console.log("Default is FUNCTION");
        if (typeof pdfModule === 'function') console.log("Module is FUNCTION");

        console.log("\n--- MAMMOTH ---");
        const mammothModule = await import("mammoth");
        console.log("Module type:", typeof mammothModule);
        console.log("extractRawText type:", typeof mammothModule.extractRawText);
        console.log("Default type:", typeof mammothModule.default);
    } catch (err) {
        console.error(err);
    }
}
test();
