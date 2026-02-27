
import { createRequire } from "module";
const cjsRequire = createRequire(import.meta.url);

import fs from "fs";

async function test() {
    try {
        const pdfParse = cjsRequire("pdf-parse");
        const log = [
            "1. typeof pdfParse: " + typeof pdfParse,
            "2. JSON: " + JSON.stringify(pdfParse),
            "3. Keys: " + Object.keys(pdfParse).join(", "),
            "4. Is Default? " + (pdfParse.default ? "YES" : "NO")
        ].join("\n");

        fs.writeFileSync("debug-pdf.log", log);
        console.log("Write done.");

    } catch (e) {
        fs.writeFileSync("debug-pdf.log", "ERROR: " + e);
    }
}

test();
