const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..');

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    
    // Filter for HTML files
    const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html');
    
    console.log(`Scanning and updating footer in ${htmlFiles.length} HTML files.`);
    
    htmlFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match footer opening tag, inner contents, and closing tag
        const footerPattern = /(<footer class="footer[^"]*">)([\s\S]*?)(<\/footer>)/g;
        
        if (footerPattern.test(content)) {
            content = content.replace(footerPattern, (match, openTag, innerContent, closeTag) => {
                // Construct the updated inner contents, replacing "Developed by" with "ALL RIGHTS RESERVED"
                // and adding the "Powered by" logo on the right side.
                const updatedFooter = `${openTag}
        <div class="footer-text">
            <div class="footer-copyright">© 2026 LEVEL3SUPPORT &amp; COR SOLUTIONS. ALL RIGHTS RESERVED.</div>
        </div>
        <div class="footer-logo">
            <span style="font-style: italic; opacity: 0.85; font-size: 0.85rem; color: var(--text-light);">Powered by</span>
            <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 32px; width: auto; opacity: 0.85; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.85';">
        </div>
    ${closeTag}`;
                return updatedFooter;
            });
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated footer in: ${file}`);
        }
    });
});
