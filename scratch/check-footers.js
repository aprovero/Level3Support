const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..');

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
    
    console.log(`Checking ${htmlFiles.length} HTML files...`);
    
    htmlFiles.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const hasFooterTag = /<footer/i.test(content);
        const hasDivFooter = /<div[^>]*class=["'][^"']*footer[^"']*["']/i.test(content);
        const hasMainFooter = /class=["'][^"']*main-footer[^"']*["']/i.test(content);
        
        if (!hasFooterTag && !hasDivFooter) {
            console.log(`❌ NO FOOTER FOUND: ${file}`);
        } else {
            // Check content styling or type
            let footerType = "unknown";
            if (content.includes('class="footer"')) footerType = "standard-footer";
            else if (content.includes('class="main-footer"')) footerType = "main-footer";
            else if (content.includes('class="global-footer"')) footerType = "global-footer";
            
            // Check if it has custom style attribute that overrides shared-styles
            const styleAttr = content.match(/<footer[^>]*style="([^"]*)"/i);
            const styleString = styleAttr ? styleAttr[1] : '';
            
            console.log(`✅ ${file}: type=${footerType}, custom-style="${styleString}"`);
        }
    });
});
