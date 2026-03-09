const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function searchForRedis(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchForRedis(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.toLowerCase().includes('redis')) {
                console.log(`FOUND IN: ${fullPath}`);
                if (content.includes('connect')) {
                    console.log(content.split('\n').filter(line => line.includes('redis')));
                }
            }
        }
    });
}

searchForRedis(srcDir);
