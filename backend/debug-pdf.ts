import { createRequire } from "module";
const cjsRequire = createRequire(import.meta.url);
const pdf = cjsRequire("pdf-parse");

console.log("PDF TYPE:", typeof pdf);
console.log("PDF KEYS:", Object.keys(pdf));
if (typeof pdf === 'function') {
    console.log("PDF is a function");
} else if (pdf && typeof pdf.default === 'function') {
    console.log("PDF.default is a function");
} else {
    console.log("PDF structure is unusual:", pdf);
}
