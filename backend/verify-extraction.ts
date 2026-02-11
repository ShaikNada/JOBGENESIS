import { extractTextAndAnalyze } from "./src/controllers/resume.controller.js";

async function testExtraction() {
    console.log("Starting Extraction Test...");

    // Mock Express Req/Res
    const mockReq = {
        file: {
            buffer: Buffer.from("%PDF-1.4 test content"),
            mimetype: "application/pdf"
        }
    } as any;

    const mockRes = {
        status: (code: number) => {
            console.log("Status Code:", code);
            return mockRes;
        },
        json: (data: any) => {
            console.log("Response JSON:", JSON.stringify(data, null, 2));
            return mockRes;
        }
    } as any;

    try {
        await extractTextAndAnalyze(mockReq, mockRes);
    } catch (err) {
        console.error("Test Failed with Error:", err);
    }
}

testExtraction();
