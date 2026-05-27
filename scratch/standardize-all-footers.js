const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..');

const standardFooterHTML = `    <footer class="footer">
        <div class="footer-text">
            <div class="footer-copyright">© 2026 LEVEL3SUPPORT. ALL RIGHTS RESERVED.</div>
        </div>
        <div class="footer-logo">
            <span style="font-style: italic; opacity: 0.85; font-size: 0.85rem; color: var(--text-light);">Powered by</span>
            <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 32px; width: auto; opacity: 0.85; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.85';">
        </div>
    </footer>`;

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    
    const htmlFiles = files.filter(file => 
        file.endsWith('.html') && 
        file !== 'index.html' && 
        file !== '404.html' && 
        file !== 'offline.html' &&
        file !== 'tool-placeholder.html'
    );
    
    console.log(`Standardizing footers in ${htmlFiles.length} HTML files...`);
    
    htmlFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Pattern 1: Match existing footer tags (<footer class="..." style="...">...</footer>)
        const footerPattern = /<footer[\s\S]*?<\/footer>/gi;
        
        // Pattern 2: Match div class="footer" (<div class="footer"...>...</div>)
        // If there's an existing footer, replace it
        if (footerPattern.test(content)) {
            content = content.replace(footerPattern, standardFooterHTML);
            console.log(`✅ Standardized existing footer in: ${file}`);
        } else {
            // No footer found, let's inject it before <script src="js/common.js"> or before </body>
            const scriptMatch = /<script\s+src=["']js\/common\.js["']/i;
            if (scriptMatch.test(content)) {
                content = content.replace(scriptMatch, (match) => {
                    return standardFooterHTML + "\n\n  " + match;
                });
                console.log(`➕ Injected standardized footer in: ${file}`);
            } else {
                // fallback to before </body>
                content = content.replace(/<\/body>/i, (match) => {
                    return standardFooterHTML + "\n" + match;
                });
                console.log(`➕ Injected standardized footer (fallback) in: ${file}`);
            }
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
    });
    
    console.log("All HTML footers have been successfully standardized!");
});
