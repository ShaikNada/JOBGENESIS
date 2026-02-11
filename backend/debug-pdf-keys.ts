import { createRequire } from "module";
const cjsRequire = createRequire(import.meta.url);
const pdf = cjsRequire("pdf-parse");

console.log("PDF KEYS:", Object.keys(pdf));
for (const key of Object.keys(pdf)) {
    console.log(`Key: ${key}, Type: ${typeof (pdf as any)[key]}`);
}

try {
    const pdfLib = cjsRequire("pdf-parse/lib/pdf-parse.js");
    console.log("PDF LIB TYPE:", typeof pdfLib);
} catch (e) {
    console.log("Could not require pdf-parse/lib/pdf-parse.js");
}
