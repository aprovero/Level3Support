const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Read all files in the directory
fs.readdir(rootDir, (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    } 
    
    // Filter for HTML files, excluding index, 404, offline
    const excludeList = ['index.html', '404.html', 'offline.html', 'tool-placeholder.html'];
    const htmlFiles = files.filter(file => file.endsWith('.html') && !excludeList.includes(file));
    
    console.log(`Scanning ${htmlFiles.length} HTML files for common.js injection...`);
    let injectedCount = 0;
    
    htmlFiles.forEach(file => {
        const filePath = path.join(rootDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if common.js is already imported
        if (!content.includes('js/common.js')) {
            // Find the last script tag or </body> tag to inject before it
            if (content.includes('</body>')) {
                // If it has other script tags, try to place it before the first custom tool script tag
                // Let's locate the last script tag
                const lastScriptIndex = content.lastIndexOf('<script');
                if (lastScriptIndex !== -1) {
                    // Inject before this last script tag
                    const before = content.substring(0, lastScriptIndex);
                    const after = content.substring(lastScriptIndex);
                    content = before + '<script src="js/common.js"></script>\n  ' + after;
                } else {
                    // Inject before </body>
                    content = content.replace('</body>', '  <script src="js/common.js"></script>\n</body>');
                }
                
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`[INJECTED] common.js in ${file}`);
                injectedCount++;
            }
        }
    });
    
    console.log(`Injection completed. Injected common.js into ${injectedCount} files.`);
});
