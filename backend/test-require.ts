import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    console.log("1. Requiring pdf-parse...");
    const pdf = require('pdf-parse');
    console.log("   pdf type:", typeof pdf);
    if (typeof pdf === 'function') console.log("   pdf is a FUNCTION");

    console.log("2. Requiring mammoth...");
    const mammoth = require('mammoth');
    console.log("   mammoth type:", typeof mammoth);
    console.log("   extractRawText type:", typeof mammoth.extractRawText);

    console.log("\n✅ ALL MODULES LOADED SUCCESSFULLY VIA REQUIRE");
} catch (err) {
    console.error("\n❌ REQUIRE FAILED");
    console.error(err);
}
