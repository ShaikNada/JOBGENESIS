async function test() {
    try {
        console.log("Loading pdf-parse...");
        const pdfModule = await import("pdf-parse");
        console.log("pdf-parse keys:", Object.keys(pdfModule));
        console.log("pdf-parse default type:", typeof pdfModule.default);

        console.log("Loading mammoth...");
        const mammothModule = await import("mammoth");
        console.log("mammoth keys:", Object.keys(mammothModule));
        console.log("mammoth default type:", typeof mammothModule.default);
    } catch (err) {
        console.error(err);
    }
}
test();
