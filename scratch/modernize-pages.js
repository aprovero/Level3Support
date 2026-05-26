const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. REJ603 Configurator Modernization
function modernizeRej603() {
    const filePath = path.join(rootDir, 'rej603-configurator.html');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    // Replace outer container opening tag and whole header/mode selector section cleanly
    const targetHeaderBlock = `    <div class="container" style="max-width: 900px; margin: 20px auto; background: var(--background-light); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); padding: 24px;">
        <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
        <!-- Portal Header - Using shared styles -->
        <div class="header">
            <div class="logo">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support">
            </div>
            <div class="abb-logo">
                <img src="images/ABB_LOGO.png" alt="ABB Logo">
            </div>
        </div>
        
        <!-- Original DIP Switch Configurator Content -->
        <h1 class="configurator-title">REJ603 Relay DIP Switch Configurator</h1>
        
        <div class="mode-selector">
                <h2>Operation Mode</h2>
                <div class="mode-buttons">
                    <div class="mode-button active" onclick="setMode('configure')">Configure Settings</div>
                    <div class="mode-button" onclick="setMode('reverse')">Reverse Settings</div>
                </div>
                <div class="mode-description" id="modeDescription">
                    Enter your protection requirements and generate DIP switch positions.
                </div>
            </div>`;

    const replacementHeaderBlock = `    <div class="page-container">
        <a href="index.html" class="btn-back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
        
        <!-- Header Card -->
        <div class="tool-header-card">
            <div class="tool-header-flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                <div class="logo">
                    <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height: 50px; width: auto;">
                </div>
                <div class="abb-logo">
                    <img src="images/ABB_LOGO.png" alt="ABB Logo" style="height: 24px; width: auto;">
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <h1 style="text-align: left; margin: 0 0 8px 0; font-size: 1.8rem; font-family: 'Outfit', sans-serif;">REJ603 Relay DIP Switch Configurator</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                    Interactive configuration utility to calculate and reverse-engineer protection settings on ABB REJ603 relays.
                </p>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">⚡ PROTECTION RELAY</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #15803d; background: #dcfce7; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">ACTIVE</span>
                </div>
            </div>
        </div>

        <div class="card-panel-wrapper">
            <div class="mode-selector">
                <h2>Operation Mode</h2>
                <div class="mode-buttons">
                    <div class="mode-button active" onclick="setMode('configure')">Configure Settings</div>
                    <div class="mode-button" onclick="setMode('reverse')">Reverse Settings</div>
                </div>
                <div class="mode-description" id="modeDescription">
                    Enter your protection requirements and generate DIP switch positions.
                </div>
            </div>
        </div>`;

    content = content.replace(targetHeaderBlock, replacementHeaderBlock);

    // Div structures
    content = content.replace('<div id="configureMode">', '<div id="configureMode" class="card-panel-wrapper">');
    content = content.replace('<div id="reverseMode" style="display: none;">', '<div id="reverseMode" class="card-panel-wrapper" style="display: none;">');
    content = content.replace('<div id="errorDisplay" style="display: none;" class="configurator-error">', '<div id="errorDisplay" style="display: none;" class="configurator-error card-panel-wrapper">');
    content = content.replace('<div id="results" style="display: none;">', '<div id="results" class="card-panel-wrapper" style="display: none;">');

    // Close the page-container div just before </body>
    content = content.replace('</body>', '    </div>\n</body>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modernized: rej603-configurator.html');
}

// 2. Parameter Comparison Modernization
function modernizeParameterComparison() {
    const filePath = path.join(rootDir, 'parameter-comparison.html');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    const targetHeaderBlock = `    <div class="container" style="max-width: 900px; margin: 20px auto; background: var(--background-light); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); padding: 24px;">
        <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
        <div class="header">
            <div class="logo">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support">
            </div>

        </div>
        
        <!-- Parameter Comparison Tool -->
        <h1>SG1+x Parameter Comparison Tool</h1>`;

    const replacementHeaderBlock = `    <div class="page-container">
        <a href="index.html" class="btn-back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
        
        <!-- Header Card -->
        <div class="tool-header-card">
            <div class="tool-header-flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                <div class="logo">
                    <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height: 50px; width: auto;">
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <h1 style="text-align: left; margin: 0 0 8px 0; font-size: 1.8rem; font-family: 'Outfit', sans-serif;">SG1+x Parameter Comparison Tool</h1>
                <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                    Upload and compare parameter configuration files between multiple SG1+x units to isolate deviations.
                </p>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 0.75rem; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">⚡ REF. GUIDES</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #15803d; background: #dcfce7; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">ACTIVE</span>
                </div>
            </div>
        </div>`;

    content = content.replace(targetHeaderBlock, replacementHeaderBlock);

    // Div structures
    content = content.replace('<div class="upload-section">', '<div class="card-panel-wrapper"><div class="upload-section">');
    content = content.replace(
        `            <div id="loading-message" class="loading-message" style="display: none;">Loading...</div>
            <div id="error-message" class="error-message" style="display: none;"></div>
        </div>`,
        `            <div id="loading-message" class="loading-message" style="display: none;">Loading...</div>
            <div id="error-message" class="error-message" style="display: none;"></div>
        </div></div>`
    );

    content = content.replace(
        '<div id="comparison-controls" class="comparison-controls" style="display: none;">',
        '<div id="comparison-controls" class="comparison-controls card-panel-wrapper" style="display: none;">'
    );

    content = content.replace(
        '<div id="comparison-table-container" style="display: none;">',
        '<div id="comparison-table-container" class="card-panel-wrapper" style="display: none;">'
    );

    content = content.replace(
        '<div id="instructions" class="instructions-container">',
        '<div class="card-panel-wrapper"><div id="instructions" class="instructions-container">'
    );
    
    // Add closing div for instructions card before footer
    content = content.replace(
        `            <p class="instructions-note">
                <strong>Disclaimer:</strong> Always verify parameter changes against site-specific design criteria.
            </p>
        </div>`,
        `            <p class="instructions-note">
                <strong>Disclaimer:</strong> Always verify parameter changes against site-specific design criteria.
            </p>
        </div></div>`
    );

    // Close the page-container div just before </body>
    content = content.replace('</body>', '    </div>\n</body>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modernized: parameter-comparison.html');
}

// 3. Fault Interpreter Modernization
function modernizeFaultInterpreter() {
    const filePath = path.join(rootDir, 'fault-interpreter.html');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    const targetHeaderBlock = `  <div class="container" style="max-width: 900px; margin: 20px auto; background: var(--background-light); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); padding: 24px;">
    <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" />
      </div>
    </div>

    <h1>Module/Fan Fault Code Interpreter</h1>`;

    const replacementHeaderBlock = `  <div class="page-container">
    <a href="index.html" class="btn-back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
    
    <!-- Header Card -->
    <div class="tool-header-card">
        <div class="tool-header-flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
            <div class="logo">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height: 50px; width: auto;">
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <h1 style="text-align: left; margin: 0 0 8px 0; font-size: 1.8rem; font-family: 'Outfit', sans-serif;">Module/Fan Fault Code Interpreter</h1>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                Decode binary status words and hexadecimal codes for cooling fan or power module diagnostic systems.
            </p>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">⚡ DIAGNOSTICS</span>
                <span style="font-size: 0.75rem; font-weight: 600; color: #15803d; background: #dcfce7; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">ACTIVE</span>
            </div>
        </div>
    </div>`;

    content = content.replace(targetHeaderBlock, replacementHeaderBlock);

    // Wrap form input section
    content = content.replace(
        '<div class="upload-section">',
        '<div class="card-panel-wrapper"><div class="upload-section">'
    );
    content = content.replace(
        `      <div id="message-container" style="margin-top: 16px;"></div>
    </div>`,
        `      <div id="message-container" style="margin-top: 16px;"></div>
    </div></div>`
    );

    // Wrap dynamically generated output sections
    content = content.replace(
        '<div id="binary-output" class="form-group" style="display: none;"></div>',
        '<div id="binary-output" class="form-group card-panel-wrapper" style="display: none;"></div>'
    );
    content = content.replace(
        '<div id="fault-result" class="form-group" style="display: none;"></div>',
        '<div id="fault-result" class="form-group card-panel-wrapper" style="display: none;"></div>'
    );

    // Close the page-container div just before </body>
    content = content.replace('</body>', '    </div>\n</body>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modernized: fault-interpreter.html');
}

// 4. Analyzer Modernization
function modernizeAnalyzer() {
    const filePath = path.join(rootDir, 'analyzer.html');
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

    const targetHeaderBlock = `  <div class="container" style="max-width: 900px; margin: 20px auto; background: var(--background-light); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-md); padding: 24px;">
    <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
    <!-- Header -->
    <div class="header">
      <div class="logo">
        <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" />
      </div>
    </div>

    <h1 class="text-center">SG3125 Series Data Analyzer</h1>`;

    const replacementHeaderBlock = `  <div class="page-container">
    <a href="index.html" class="btn-back-link"><i class="fas fa-arrow-left"></i> Back to ToolHub</a>
    
    <!-- Header Card -->
    <div class="tool-header-card">
        <div class="tool-header-flex" style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
            <div class="logo">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height: 50px; width: auto;">
            </div>
        </div>
        <div style="margin-top: 1rem;">
            <h1 style="text-align: left; margin: 0 0 8px 0; font-size: 1.8rem; font-family: 'Outfit', sans-serif;">SG3125 Series Data Analyzer</h1>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 16px;">
                Load history files and event logs to construct visual operational charts and performance diagnostics.
            </p>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 0.75rem; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">⚡ ANALYZER</span>
                <span style="font-size: 0.75rem; font-weight: 600; color: #15803d; background: #dcfce7; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">ACTIVE</span>
            </div>
        </div>
    </div>`;

    content = content.replace(targetHeaderBlock, replacementHeaderBlock);

    // Wrap upload section
    content = content.replace(
        '<section class="upload-section">',
        '<div class="card-panel-wrapper"><section class="upload-section" style="margin: 0; padding: 0; border: none; box-shadow: none;">'
    );
    content = content.replace(
        `      <div class="upload-instructions">Upload the HisData file (left) and the Events file (right).</div>
    </section>`,
        `      <div class="upload-instructions">Upload the HisData file (left) and the Events file (right).</div>
    </section></div>`
    );

    // Wrap parameter selection and state filter in a single card
    content = content.replace(
        '<section class="parameter-selection">',
        '<div class="card-panel-wrapper"><section class="parameter-selection" style="margin: 0 0 1.5rem 0; padding: 0; border: none; box-shadow: none;">'
    );
    content = content.replace(
        `      <select id="state-select">
        <option value="">All</option>
      </select>
    </section>`,
        `      <select id="state-select">
        <option value="">All</option>
      </select>
    </section></div>`
    );

    // Wrap Chart Section in a card panel
    content = content.replace(
        '<section class="chart-section">',
        '<div class="card-panel-wrapper"><section class="chart-section" style="margin: 0; padding: 0; border: none; box-shadow: none;">'
    );
    content = content.replace(
        `      <div id="chart-container" class="chart-container">
        <canvas id="chart-canvas" height="300"></canvas>
      </div>
    </section>`,
        `      <div id="chart-container" class="chart-container">
        <canvas id="chart-canvas" height="300"></canvas>
      </div>
    </section></div>`
    );

    // Wrap results section
    content = content.replace(
        '<section class="results-section" id="diagnostics-results" style="display: none;">',
        '<div id="diagnostics-results" class="card-panel-wrapper" style="display: none;"><section class="results-section" style="margin: 0; padding: 0; border: none; box-shadow: none;">'
    );
    
    // closing div for results card is handled dynamically by JS normally, but the wrapper is closed cleanly because it wraps the whole section block
    content = content.replace(
        `      </div>
    </section>`,
        `      </div>
    </section></div>`
    );

    // Close the page-container div just before </body>
    content = content.replace('</body>', '    </div>\n</body>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modernized: analyzer.html');
}

// Execute modernization pipeline
modernizeRej603();
modernizeParameterComparison();
modernizeFaultInterpreter();
modernizeAnalyzer();
