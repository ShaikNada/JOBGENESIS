import fs from 'fs';
import path from 'path';

const searchStr = 'http://localhost:4000';
const replaceStr = "${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}";

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // We only want to replace it if it's inside backticks or quotes.
    // Replace 'http://localhost:4000' with `...`
    if (content.includes("'http://localhost:4000")) {
        content = content.replace(/'http:\/\/localhost:4000/g, "`" + replaceStr);
        // We also need to change the closing quote to a backtick if we just changed the opening quote.
        // This is tricky. Let's do string exact replacements where we know formatting.
        hasChanges = true;
    }

    // A simpler way: we just replace 'http://localhost:4000' with (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000')
    // Actually, just find the files first.
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Replaces "http://localhost:4000/api..." with `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api...`
            // Replaces 'http://localhost:4000/api...' with `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api...`
            // Replaces \`http://localhost:4000/api...\` with \`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api...\`

            const modified = content
                .replace(/'http:\/\/localhost:4000([^']*)'/g, '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}$1`')
                .replace(/"http:\/\/localhost:4000([^"]*)"/g, '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}$1`')
                .replace(/`http:\/\/localhost:4000([^`]*)`/g, '`${import.meta.env.VITE_BACKEND_URL || \'http://localhost:4000\'}$1`');

            if (content !== modified) {
                fs.writeFileSync(fullPath, modified, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./src');
