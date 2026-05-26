const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Helper to write file
function saveFile(filename, content) {
    const filePath = path.join(rootDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully recreated: ${filename}`);
}

// 1. REBUILD REJ603 CONFIGURATOR
function rebuildRej603() {
    const originalFile = path.join(rootDir, 'rej603-configurator.html');
    const originalContent = fs.readFileSync(originalFile, 'utf8').replace(/\r\n/g, '\n');
    
    // Extract the entire script block from the original file
    const scriptMatch = originalContent.match(/<!-- Original JavaScript - EXACTLY as it was -->\s*<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
        console.error('Could not find original script block in rej603-configurator.html!');
        return;
    }
    const originalScript = scriptMatch[1];

    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REJ603 Relay DIP Switch Configurator — Level3Support</title>
    <link rel="icon" type="image/x-icon" href="images/L3S_ICON.png">
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- Portal frame styles -->
    <link href="css/shared-styles.css?v=19" rel="stylesheet">
    <link href="css/rej603-configurator.css?v=19" rel="stylesheet">

    <style>
        .placeholder-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }
        .tool-header-section {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }
        .tool-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 0rem;
        }
        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 1.5rem;
            transition: transform 0.2s ease;
        }
        .btn-back:hover {
            transform: translateX(-4px);
            color: var(--primary-hover);
        }
        .tool-body-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        @media (min-width: 768px) {
            .tool-body-grid {
                grid-template-columns: 3fr 2fr;
            }
        }
        .card-panel {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 1.5rem;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 650;
            font-size: 1.15rem;
            color: #0f172a;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    </style>
</head>
<body>
    <nav class="navbar" style="background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.06); padding:1rem 2rem;">
        <div style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height:60px; width:auto;">
            </a>
        </div>
    </nav>

    <div class="placeholder-container">
        <!-- Back Link -->
        <a href="index.html" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to ToolHub
        </a>

        <!-- Header Panel -->
        <div class="tool-header-section">
            <div class="tool-title-row">
                <div>
                    <h1 style="text-align:left; margin:0; font-size:1.8rem; font-family:'Outfit',sans-serif; display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                        REJ603 Relay DIP Switch Configurator
                        <img src="images/ABB_LOGO.png" alt="ABB Logo" style="height: 24px; width: auto; margin-left: auto;">
                    </h1>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; font-size:1rem;">
                        Calculate and reverse-engineer protection settings on ABB REJ603 relays.
                    </p>
                </div>
                <div class="tool-meta" style="margin-top:0.75rem;">
                    <span class="tile-category category-protection-relays" style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">⚡ PROTECTION RELAYS</span>
                    <span class="status-badge status-active" style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">Active</span>
                </div>
            </div>
        </div>

        <!-- Global Safety Disclaimer -->
        <div class="warning-box" style="margin-top:0; margin-bottom:2rem;">
            <i class="fas fa-shield-alt"></i>
            <div>
                <div class="warning-title">Safety & Professional Use Disclaimer</div>
                This ToolHub assists field engineers but does not replace official project documents, local electrical codes, manufacturer manuals, approved commissioning procedures, or site-specific HSE procedures. Any safety-critical work must involve direct reference verification.
            </div>
        </div>

        <!-- Grid Body -->
        <div class="tool-body-grid">
            <!-- Left Column: Inputs & Outputs -->
            <div>
                <!-- Mode Selector -->
                <div class="card-panel" style="border-left:4px solid var(--primary-color);">
                    <div class="card-title"><i class="fas fa-cogs"></i> Operation Mode</div>
                    <div class="mode-buttons" style="display:flex; gap:10px; margin-bottom:12px;">
                        <div class="mode-button active" onclick="setMode('configure')">Configure Settings</div>
                        <div class="mode-button" onclick="setMode('reverse')">Reverse Settings</div>
                    </div>
                    <div class="mode-description" id="modeDescription" style="font-size:0.9rem; color:var(--text-secondary);">
                        Enter your protection requirements and generate DIP switch positions.
                    </div>
                </div>

                <!-- Input Panel -->
                <div id="configureMode" class="card-panel">
                    <div class="card-title"><i class="fas fa-edit"></i> Basic Settings</div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Transformer Current (Is):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW1 (1-4)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="transformerCurrent" min="8" max="448" step="1" placeholder="8A min - 448A max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">A</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Earth Fault Measurement (Io>):</label>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="earthFault" value="internal" checked style="accent-color: var(--primary-color);"> Internal
                            </label>
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="earthFault" value="external" style="accent-color: var(--primary-color);"> External
                            </label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">HMI:</label>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="hmi" value="disabled" checked style="accent-color: var(--primary-color);"> No (DIP switches only)
                            </label>
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="hmi" value="enabled" style="accent-color: var(--primary-color);"> Yes (DIP + HMI fine)
                            </label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Frequency (Fn):</label>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="frequency" value="50Hz" style="accent-color: var(--primary-color);"> 50 Hz
                            </label>
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="frequency" value="60Hz" checked style="accent-color: var(--primary-color);"> 60 Hz
                            </label>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Failsafe (Fs):</label>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="failsafe" value="disabled" style="accent-color: var(--primary-color);"> Disable
                            </label>
                            <label style="min-width: auto; font-weight: normal; display:flex; align-items:center; gap:6px;">
                                <input type="radio" name="failsafe" value="enabled" checked style="accent-color: var(--primary-color);"> Enable
                            </label>
                        </div>
                    </div>

                    <div class="card-title" style="margin-top: 2rem;"><i class="fas fa-wave-square"></i> Phase Overcurrent Protection (50/51)</div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51 - Pickup Current (I>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW3 (1-5)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="phasePickup51" min="0.9" max="2.5" step="0.05" placeholder="0.9min - 2.5max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">× In</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51 - Curve Type:</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW3 (6-8)</div>
                        <select id="phaseCurve51" style="width: 100%; max-width: 320px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #ffffff;">
                            <option value="NI" selected>Normal Inverse - standard feeder protection</option>
                            <option value="VI">Very Inverse - faster at high fault current</option>
                            <option value="EI">Extremely Inverse - coordinates tightly with fuses</option>
                            <option value="LI">Long-time Inverse - slowest curve, protects cables</option>
                            <option value="RI">RI-type Inverse - legacy reset-inverse retrofits</option>
                            <option value="HR">HR-type Fuse - matches high-rupture fuse shape</option>
                            <option value="FR">FR-type Fuse - matches fast-acting fuse profiles</option>
                            <option value="DMT">Definite Minimum Time - flat fixed time</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51 - Time Constant (t>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW2 (1-4)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="phaseTime51" min="0.05" max="3" step="0.05" placeholder="0.05min - 3max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">s</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 50 - Pickup Current (I>>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW5 (1-4)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="phasePickup50" min="1" max="20" step="0.1" placeholder="1min - 20max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">× In</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 50 - Definite Time (t>>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW5 (5-8)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="phaseTime50" min="0.04" max="3" step="0.01" placeholder="0.04min - 3max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">s</span>
                        </div>
                    </div>

                    <div class="card-title" style="margin-top: 2rem;"><i class="fas fa-globe"></i> Earth Fault Protection (50N/51N)</div>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51N - Pickup Current (Io>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW4 (1-5)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="earthPickup51N" min="0.1" max="1.0" step="0.025" placeholder="0.1min - 1.0max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">× Is</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51N - Curve Type:</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW4 (6-8)</div>
                        <select id="earthCurve51N" style="width: 100%; max-width: 320px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; background: #ffffff;">
                            <option value="NI" selected>Normal Inverse - standard feeder protection</option>
                            <option value="VI">Very Inverse - faster at high fault current</option>
                            <option value="EI">Extremely Inverse - coordinates tightly with fuses</option>
                            <option value="LI">Long-time Inverse - slowest curve, protects cables</option>
                            <option value="RI">RI-type Inverse - legacy reset-inverse shape</option>
                            <option value="HR">HR-type Fuse - matches high-rupture fuse shape</option>
                            <option value="FR">FR-type Fuse - matches fast-acting fuse profile</option>
                            <option value="DMT">Definite Minimum Time - flat fixed time</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 51N - Time Constant (to>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW2 (5-8)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="earthTime51N" min="0.05" max="3" step="0.05" placeholder="0.05min - 3max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">s</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 50N - Pickup Current (Io>>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW6 (1-4)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="earthPickup50N" min="1" max="20" step="0.01" placeholder="1min - 20max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">× Is</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: bold; color: #334155; font-size: 0.9rem; margin-bottom: 6px; display:block;">Function 50N - Definite Time (to>>):</label>
                        <div style="color: #64748b; font-size: 0.75rem; font-style: italic; margin-bottom: 8px;">SW6 (5-8)</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="number" id="earthTime50N" min="0.04" max="3" step="0.01" placeholder="0.04min - 3max" style="flex: 1; max-width: 300px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;">
                            <span style="color: #475569; font-weight: 600; font-size: 14px;">s</span>
                        </div>
                    </div>

                    <button class="configurator-button" onclick="calculateDipSwitches()" style="margin-top: 1rem; width: 100%; background-color: var(--primary-color); color: #ffffff; padding: 12px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: background-color 0.2s;"><i class="fas fa-calculator"></i> Calculate DIP Switch Configuration</button>
                </div>

                <!-- Reverse Mode Panel -->
                <div id="reverseMode" class="card-panel" style="display: none;">
                    <div class="card-title"><i class="fas fa-info-circle"></i> Reverse Settings Instructions</div>
                    <p style="margin-bottom: 8px;">👉 <strong>Click on each DIP switch below to match the physical relay configuration.</strong></p>
                    <p style="margin-bottom: 8px;">🔍 The app will automatically decode and display the protection settings.</p>
                    <p style="margin-bottom: 8px;">📋 Use this to document existing installations or troubleshoot unexpected behavior.</p>
                </div>

                <!-- Error Display -->
                <div id="errorDisplay" class="card-panel" style="display: none; border-left: 4px solid #ef4444; background: #fef2f2;">
                    <div class="card-title" style="color: #991b1b;"><i class="fas fa-exclamation-triangle"></i> Configuration Error</div>
                    <div id="errorMessage" style="font-size: 0.95rem; color: #991b1b; line-height:1.5;"></div>
                </div>

                <!-- Results Output Card -->
                <div id="results" class="card-panel" style="display: none;">
                    <div class="card-title"><i class="fas fa-list-check"></i> Relay Configuration Results</div>
                    <div id="calculatedValues" class="calculated-values" style="margin-top: 10px; background: #f1f5f9; padding: 1rem; border-radius: 8px; font-size: 0.95rem; line-height: 1.6; color: #334155; margin-bottom: 1.5rem;"></div>
                    
                    <div class="switch-display">
                        <div class="switch-block-container">
                            <div class="switch-label">S1</div>
                            <div class="switch-info" id="s1-info">Is = 112A</div>
                            <div id="switchS1" class="dip-switch-bank"></div>
                        </div>
                        
                        <div class="switch-block-container">
                            <div class="switch-label">S3</div>
                            <div class="switch-info" id="s3-info">Pickup 51F<br>112A × 1.2</div>
                            <div id="switchS3" class="dip-switch-bank"></div>
                        </div>
                        
                        <div class="switch-block-container">
                            <div class="switch-label">S5</div>
                            <div class="switch-info" id="s5-info">Pickup 50F<br>I>></div>
                            <div id="switchS5" class="dip-switch-bank"></div>
                        </div>
                        
                        <div class="switch-block-container">
                            <div class="switch-label">S2</div>
                            <div class="switch-info" id="s2-info">Time dial 51F<br>t>/k = 0.4</div>
                            <div id="switchS2" class="dip-switch-bank"></div>
                        </div>
                        
                        <div class="switch-block-container">
                            <div class="switch-label">S4</div>
                            <div class="switch-info" id="s4-info">Pickup 51G<br>Io></div>
                            <div id="switchS4" class="dip-switch-bank"></div>
                        </div>
                        
                        <div class="switch-block-container">
                            <div class="switch-label">S6</div>
                            <div class="switch-info" id="s6-info">Pickup 50G<br>Io>></div>
                            <div id="switchS6" class="dip-switch-bank"></div>
                        </div>
                    </div>
                    
                    <div id="reverseDecodeButton" style="display: none; margin-top: 20px;">
                        <button class="reverse-button configurator-button" onclick="reverseEngineerConfiguration()" style="width: 100%; background: var(--primary-color); color:white; padding:12px; border-radius:6px; border:none; font-weight:600; cursor:pointer;"><i class="fas fa-search"></i> Decode Current DIP Settings</button>
                    </div>
                </div>
            </div>

            <!-- Right Column: Safety & Assumptions -->
            <div>
                <div class="assumptions-box">
                    <div class="assumptions-title"><i class="fas fa-clipboard-list"></i> Standards & Assumptions</div>
                    <ul class="assumptions-list">
                        <li>DIP Switch positions logic reflects official ABB REJ603 manuals.</li>
                        <li>Compatible CT ranges must support both the phase and earth setting row limits simultaneously (first row or second row constraint).</li>
                        <li>Overcurrent protection features auto-round upward for maximum safe current loading.</li>
                    </ul>
                </div>

                <div class="card-panel" style="border-top:4px solid var(--primary-color);">
                    <div class="card-title"><i class="fas fa-laptop-code"></i> Engineering Module Info</div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
                        This module calculates discrete protection relay positions with active restriction checks.
                    </p>
                    <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-size:0.8rem; margin-top:0.75rem;">
                        <strong>Device Category:</strong> MV Overcurrent Relay<br>
                        <strong>API Hook:</strong> Client-Side JS logic<br>
                        <strong>Status:</strong> Active
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="main-footer" style="background: #0f172a; padding: 1.5rem 2rem; border-top: 1px solid #1e293b; margin-top: 4rem;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; width: 100%;">
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">
                <span>&copy; 2026 LEVEL3SUPPORT. ALL RIGHTS RESERVED.</span>
            </p>
            <div class="powered-by-wrapper" style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-style: italic; font-weight: 400; color: #64748b; font-size: 0.85rem; font-family: 'Inter', sans-serif;">Powered by</span>
                <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 28px; width: auto; opacity: 0.75; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.75';">
            </div>
        </div>
    </footer>

    <!-- Original JavaScript - EXACTLY as it was -->
    <script>
        ${originalScript}
    </script>
</body>
</html>`;

    saveFile('rej603-configurator.html', content);
}

// 2. REBUILD PARAMETER COMPARISON
function rebuildParameterComparison() {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SG1+x Parameter Comparison Tool — Level3Support</title>
    <link rel="icon" type="image/x-icon" href="images/L3S_ICON.png">
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- Portal styles -->
    <link href="css/shared-styles.css?v=19" rel="stylesheet">
    <link href="css/parameter-comparison.css?v=19" rel="stylesheet">

    <style>
        .placeholder-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }
        .tool-header-section {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }
        .tool-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 0rem;
        }
        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 1.5rem;
            transition: transform 0.2s ease;
        }
        .btn-back:hover {
            transform: translateX(-4px);
            color: var(--primary-hover);
        }
        .tool-body-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        @media (min-width: 768px) {
            .tool-body-grid {
                grid-template-columns: 3fr 2fr;
            }
        }
        .card-panel {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 1.5rem;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 650;
            font-size: 1.15rem;
            color: #0f172a;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    </style>
</head>
<body>
    <nav class="navbar" style="background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.06); padding:1rem 2rem;">
        <div style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height:60px; width:auto;">
            </a>
        </div>
    </nav>

    <div class="placeholder-container">
        <!-- Back Link -->
        <a href="index.html" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to ToolHub
        </a>

        <!-- Header Panel -->
        <div class="tool-header-section">
            <div class="tool-title-row">
                <div>
                    <h1 style="text-align:left; margin:0; font-size:1.8rem; font-family:'Outfit',sans-serif;">SG1+x Parameter Comparison Tool</h1>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; font-size:1rem;">
                        Compare configuration parameters across SG1+x units to isolate deviations.
                    </p>
                </div>
                <div class="tool-meta" style="margin-top:0.75rem;">
                    <span class="tile-category category-reference-guides" style="background:#f1f5f9; color:#475569; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">⚡ REFERENCE GUIDES</span>
                    <span class="status-badge status-active" style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">Active</span>
                </div>
            </div>
        </div>

        <!-- Global Safety Disclaimer -->
        <div class="warning-box" style="margin-top:0; margin-bottom:2rem;">
            <i class="fas fa-shield-alt"></i>
            <div>
                <div class="warning-title">Safety & Professional Use Disclaimer</div>
                This ToolHub assists field engineers but does not replace official project documents, local electrical codes, manufacturer manuals, approved commissioning procedures, or site-specific HSE procedures. Any safety-critical work must involve direct reference verification.
            </div>
        </div>

        <!-- Grid Body -->
        <div class="tool-body-grid">
            <!-- Left Column: Inputs & Tables -->
            <div>
                <!-- File Upload Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-cloud-upload-alt"></i> Upload CSV Files (2-3 recommended)</div>
                    <div class="upload-section" style="border:none; padding:0; background:transparent;">
                        <div class="upload-input-container" style="margin-bottom:12px;">
                            <input type="file" id="file-input" accept=".csv" class="file-input" style="width:100%;">
                        </div>
                        <p style="color: var(--primary-color); margin-bottom: 16px; font-size: 0.9rem;">
                            Upload your parameter files to compare settings and identify differences.
                        </p>
                        
                        <!-- Show uploaded files -->
                        <div class="uploaded-files-section" style="background:#f8fafc; padding:1rem; border-radius:8px; border:1px solid #e2e8f0;">
                            <h4 class="uploaded-files-title" style="font-weight:600; color:#334155; font-size:0.85rem; margin-bottom:8px;">Uploaded Files (<span id="file-count">0</span>):</h4>
                            <div id="uploaded-files-list" class="uploaded-files-list">
                                <p class="no-files-message" style="font-size:0.85rem; color:#94a3b8; font-style:italic;">No files uploaded yet</p>
                            </div>
                        </div>
                        
                        <div id="loading-message" class="loading-message" style="display: none; margin-top:10px; color:var(--primary-color); font-weight:600;"><i class="fas fa-spinner fa-spin"></i> Loading and parsing...</div>
                        <div id="error-message" class="error-message" style="display: none; margin-top:10px; color:#ef4444; font-weight:600;"></div>
                    </div>
                </div>

                <!-- Comparison Controls -->
                <div id="comparison-controls" class="card-panel" style="display: none;">
                    <div class="card-title"><i class="fas fa-sliders-h"></i> Comparison Filter Settings</div>
                    
                    <div class="controls-row" style="display:flex; flex-direction:column; gap:12px;">
                        <div class="checkbox-container">
                            <label class="checkbox-label" style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                <input type="checkbox" id="show-differences-only" class="differences-checkbox" style="accent-color:var(--primary-color);">
                                <span style="font-size:0.9rem; font-weight:600; color:#334155;">Show only different parameters</span>
                            </label>
                        </div>
                        
                        <div class="search-container" style="position: relative; width: 100%;">
                            <input type="text" id="search-input" placeholder="Search parameters..." class="search-input" style="width:100%; padding:8px 12px 8px 32px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px;">
                            <div class="search-icon" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94a3b8;">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                        
                        <button id="reset-button" class="reset-button" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; background:#f1f5f9; color:#475569; font-weight:600; cursor:pointer; transition:all 0.2s;"><i class="fas fa-undo"></i> Reset All</button>
                    </div>
                    
                    <div id="comparison-status" class="comparison-status" style="margin-top: 1rem; font-size:0.85rem; color:#64748b; font-weight:550; border-top:1px dashed #cbd5e1; padding-top:8px;">
                        <span id="parameters-shown">0</span> parameters shown
                        <span id="differences-note" style="display: none; color:#b45309;"> (only showing differences)</span>
                        <span id="search-note" style="display: none;"></span>
                    </div>
                </div>

                <!-- Comparison Table Panel -->
                <div id="comparison-table-container" class="card-panel" style="display: none; overflow-x: auto;">
                    <div class="card-title"><i class="fas fa-table"></i> Parameter Matrices</div>
                    <div class="table-wrapper" style="width:100%;">
                        <table id="comparison-table" class="comparison-table" style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                            <thead id="table-header">
                                <!-- Dynamic header will be inserted here -->
                            </thead>
                            <tbody id="table-body">
                                <!-- Dynamic rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Right Column: Safety & Instructions -->
            <div>
                <!-- Instructions Panel -->
                <div id="instructions" class="assumptions-box">
                    <div class="assumptions-title"><i class="fas fa-info-circle"></i> How to Use This Tool</div>
                    <ul class="assumptions-list" style="margin-top:0.5rem;">
                        <li>Upload 2 or 3 CSV files containing system parameters.</li>
                        <li>The tool will automatically compare all parameters across files.</li>
                        <li>Use the filter checkbox to isolate differing parameters.</li>
                        <li>Search parameter names using the search query filter.</li>
                        <li>Values with differences are highlighted in light amber.</li>
                    </ul>
                </div>

                <div class="card-panel" style="border-top:4px solid var(--primary-color); margin-top:1.5rem;">
                    <div class="card-title"><i class="fas fa-laptop-code"></i> Engineering Module Info</div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
                        This module compares register definitions and settings arrays.
                    </p>
                    <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-size:0.8rem; margin-top:0.75rem;">
                        <strong>Compatibility:</strong> SG1+X Firmware Matrix<br>
                        <strong>API Hook:</strong> Client-Side JS logic<br>
                        <strong>Status:</strong> Active
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="main-footer" style="background: #0f172a; padding: 1.5rem 2rem; border-top: 1px solid #1e293b; margin-top: 4rem;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; width: 100%;">
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">
                <span>&copy; 2026 LEVEL3SUPPORT. ALL RIGHTS RESERVED.</span>
            </p>
            <div class="powered-by-wrapper" style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-style: italic; font-weight: 400; color: #64748b; font-size: 0.85rem; font-family: 'Inter', sans-serif;">Powered by</span>
                <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 28px; width: auto; opacity: 0.75; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.75';">
            </div>
        </div>
    </footer>

    <!-- App Scripts -->
    <script src="js/common.js"></script>
    <script src="js/parameter-comparison.js"></script>
</body>
</html>`;

    saveFile('parameter-comparison.html', content);
}

// 3. REBUILD FAULT INTERPRETER
function rebuildFaultInterpreter() {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Module/Fan Fault Code Interpreter — Level3Support</title>
    <link rel="icon" type="image/x-icon" href="images/L3S_ICON.png">
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- Portal styles -->
    <link href="css/shared-styles.css?v=19" rel="stylesheet">
    <link href="css/fault-interpreter.css?v=19" rel="stylesheet">

    <style>
        .placeholder-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }
        .tool-header-section {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }
        .tool-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 0rem;
        }
        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 1.5rem;
            transition: transform 0.2s ease;
        }
        .btn-back:hover {
            transform: translateX(-4px);
            color: var(--primary-hover);
        }
        .tool-body-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        @media (min-width: 768px) {
            .tool-body-grid {
                grid-template-columns: 3fr 2fr;
            }
        }
        .card-panel {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 1.5rem;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 650;
            font-size: 1.15rem;
            color: #0f172a;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    </style>
</head>
<body>
    <nav class="navbar" style="background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.06); padding:1rem 2rem;">
        <div style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height:60px; width:auto;">
            </a>
        </div>
    </nav>

    <div class="placeholder-container">
        <!-- Back Link -->
        <a href="index.html" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to ToolHub
        </a>

        <!-- Header Panel -->
        <div class="tool-header-section">
            <div class="tool-title-row">
                <div>
                    <h1 style="text-align:left; margin:0; font-size:1.8rem; font-family:'Outfit',sans-serif;">Module/Fan Fault Code Interpreter</h1>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; font-size:1rem;">
                        Decode binary status words and hexadecimal codes for cooling fan or power module diagnostic systems.
                    </p>
                </div>
                <div class="tool-meta" style="margin-top:0.75rem;">
                    <span class="tile-category category-scada-diagnostics" style="background:#fdf2f8; color:#9d174d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">⚡ SCADA & DIAGNOSTICS</span>
                    <span class="status-badge status-active" style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">Active</span>
                </div>
            </div>
        </div>

        <!-- Global Safety Disclaimer -->
        <div class="warning-box" style="margin-top:0; margin-bottom:2rem;">
            <i class="fas fa-shield-alt"></i>
            <div>
                <div class="warning-title">Safety & Professional Use Disclaimer</div>
                This ToolHub assists field engineers but does not replace official project documents, local electrical codes, manufacturer manuals, approved commissioning procedures, or site-specific HSE procedures. Any safety-critical work must involve direct reference verification.
            </div>
        </div>

        <!-- Grid Body -->
        <div class="tool-body-grid">
            <!-- Left Column: Inputs & Outputs -->
            <div>
                <!-- Upload/Inputs Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-edit"></i> Interpreter Configurator Inputs</div>
                    <div class="upload-section" style="border:none; padding:0; background:transparent;">
                        <!-- Inverter Series -->
                        <fieldset class="radio-group" style="border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-bottom:16px;">
                            <legend style="font-weight:600; color:#334155; padding:0 6px; font-size:0.85rem;">Inverter Series</legend>
                            <div class="radio-options" style="display:flex; gap:16px;">
                                <label class="radio-option" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                                    <input type="radio" name="inverter" value="sg3125" checked style="accent-color:var(--primary-color);"> SG3125 Series
                                </label>
                                <label class="radio-option" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                                    <input type="radio" name="inverter" value="onePlusX" style="accent-color:var(--primary-color);"> 1+X Series
                                </label>
                            </div>
                        </fieldset>

                        <!-- Fault Section -->
                        <fieldset class="radio-group" style="border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-bottom:16px;">
                            <legend style="font-weight:600; color:#334155; padding:0 6px; font-size:0.85rem;">Fault Section</legend>
                            <div class="radio-options" id="section-options" style="display:flex; gap:16px; flex-wrap:wrap;">
                                <!-- dynamically filled -->
                            </div>
                        </fieldset>

                        <!-- Fault Code Input -->
                        <div class="form-group">
                            <label for="fault-code" style="display:block; font-weight:600; color:#334155; margin-bottom:8px; font-size:0.9rem;">Enter Fault Code</label>
                            <div class="input-wrapper" style="position:relative;">
                                <div class="input-with-prefix">
                                    <input type="text" id="fault-code" placeholder="e.g. 0A1B or 123" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; box-sizing:border-box;">
                                </div>
                            </div>
                        </div>

                        <div id="message-container" style="margin-top: 16px; font-size:0.85rem; font-weight:550;"></div>
                    </div>
                </div>

                <!-- Dynamic Outputs Panels -->
                <div id="binary-output" class="card-panel" style="display: none;"></div>
                <div id="fault-result" class="card-panel" style="display: none;"></div>
            </div>

            <!-- Right Column: Safety & Assumptions -->
            <div>
                <!-- Assumptions Panel -->
                <div class="assumptions-box">
                    <div class="assumptions-title"><i class="fas fa-clipboard-list"></i> Standards & Assumptions</div>
                    <ul class="assumptions-list">
                        <li>Fault registers match SG3125 and 1+X cooling system specifications.</li>
                        <li>Supports hexadecimal or decimal fault codes.</li>
                        <li>Safety limits auto-flag critical alerts based on decoded bit registers.</li>
                    </ul>
                </div>

                <div class="card-panel" style="border-top:4px solid var(--primary-color); margin-top:1.5rem;">
                    <div class="card-title"><i class="fas fa-laptop-code"></i> Engineering Module Info</div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
                        This module decodes register arrays for fan and cooling diagnostics.
                    </p>
                    <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-size:0.8rem; margin-top:0.75rem;">
                        <strong>Target Hardware:</strong> Sungrow Central Inverters<br>
                        <strong>API Hook:</strong> Client-Side JS logic<br>
                        <strong>Status:</strong> Active
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="main-footer" style="background: #0f172a; padding: 1.5rem 2rem; border-top: 1px solid #1e293b; margin-top: 4rem;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; width: 100%;">
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">
                <span>&copy; 2026 LEVEL3SUPPORT. ALL RIGHTS RESERVED.</span>
            </p>
            <div class="powered-by-wrapper" style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-style: italic; font-weight: 400; color: #64748b; font-size: 0.85rem; font-family: 'Inter', sans-serif;">Powered by</span>
                <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 28px; width: auto; opacity: 0.75; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.75';">
            </div>
        </div>
    </footer>

    <!-- App Scripts -->
    <script src="js/fault-interpreter.js"></script>
</body>
</html>`;

    saveFile('fault-interpreter.html', content);
}

// 4. REBUILD ANALYZER
function rebuildAnalyzer() {
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SG3125 Series Data Analyzer — Level3Support</title>
    <link rel="icon" type="image/x-icon" href="images/L3S_ICON.png">
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

    <!-- Portal styles -->
    <link href="css/shared-styles.css?v=19" rel="stylesheet">
    <link href="css/analyzer.css?v=19" rel="stylesheet">

    <style>
        .placeholder-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }
        .tool-header-section {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
        }
        .tool-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 0rem;
        }
        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-weight: 600;
            text-decoration: none;
            margin-bottom: 1.5rem;
            transition: transform 0.2s ease;
        }
        .btn-back:hover {
            transform: translateX(-4px);
            color: var(--primary-hover);
        }
        .tool-body-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        @media (min-width: 768px) {
            .tool-body-grid {
                grid-template-columns: 3fr 2fr;
            }
        }
        .card-panel {
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
            margin-bottom: 1.5rem;
        }
        .card-title {
            font-family: 'Outfit', sans-serif;
            font-weight: 650;
            font-size: 1.15rem;
            color: #0f172a;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
    </style>
</head>
<body>
    <nav class="navbar" style="background:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.06); padding:1rem 2rem;">
        <div style="max-width:1400px; margin:0 auto; display:flex; justify-content:space-between; align-items:center;">
            <a href="index.html">
                <img src="images/L3S_HEADER_LOGO.png" alt="Level3Support" style="height:60px; width:auto;">
            </a>
        </div>
    </nav>

    <div class="placeholder-container">
        <!-- Back Link -->
        <a href="index.html" class="btn-back">
            <i class="fas fa-arrow-left"></i> Back to ToolHub
        </a>

        <!-- Header Panel -->
        <div class="tool-header-section">
            <div class="tool-title-row">
                <div>
                    <h1 style="text-align:left; margin:0; font-size:1.8rem; font-family:'Outfit',sans-serif;">SG3125 Series Data Analyzer</h1>
                    <p style="color:var(--text-secondary); margin-top:0.5rem; font-size:1rem;">
                        Load history files and event logs to construct visual operational charts and performance diagnostics.
                    </p>
                </div>
                <div class="tool-meta" style="margin-top:0.75rem;">
                    <span class="tile-category category-scada-diagnostics" style="background:#fdf2f8; color:#9d174d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">⚡ SCADA & DIAGNOSTICS</span>
                    <span class="status-badge status-active" style="background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">Active</span>
                </div>
            </div>
        </div>

        <!-- Global Safety Disclaimer -->
        <div class="warning-box" style="margin-top:0; margin-bottom:2rem;">
            <i class="fas fa-shield-alt"></i>
            <div>
                <div class="warning-title">Safety & Professional Use Disclaimer</div>
                This ToolHub assists field engineers but does not replace official project documents, local electrical codes, manufacturer manuals, approved commissioning procedures, or site-specific HSE procedures. Any safety-critical work must involve direct reference verification.
            </div>
        </div>

        <!-- Grid Body -->
        <div class="tool-body-grid">
            <!-- Left Column: Inputs & Tables/Charts -->
            <div>
                <!-- CSV Upload Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-cloud-upload-alt"></i> Upload CSV Files</div>
                    <section class="upload-section" style="margin:0; padding:0; border:none; box-shadow:none; background:transparent;">
                        <div class="upload-input-container double" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:12px;">
                            <input type="file" id="his-upload" accept=".csv" class="file-input" style="width:100%;" />
                            <input type="file" id="events-upload" accept=".csv" class="file-input" style="width:100%;" />
                        </div>
                        <div class="upload-instructions" style="font-size:0.8rem; color:#64748b; font-style:italic;">Upload the HisData file (left) and the Events file (right).</div>
                    </section>
                </div>

                <!-- Parameters Selection Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-tasks"></i> Parameter Selection & State Filters</div>
                    
                    <section class="parameter-selection" style="margin:0 0 1.5rem 0; padding:0; border:none; box-shadow:none;">
                        <div class="section-title" style="font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:10px;">Select Parameters (Max 6)</div>
                        <div id="param-container" class="grid grid-cols-1 md:grid-cols-3 gap-4" style="font-size:0.85rem;">
                            <!-- JS will populate 3 columns here -->
                        </div>
                    </section>
                    
                    <section class="state-filter" style="margin:0; padding:12px 0 0 0; border-top:1px dashed #cbd5e1; box-shadow:none;">
                        <label for="state-select" style="display:block; font-weight:600; font-size:0.85rem; color:#334155; margin-bottom:6px;">Filter by Unit 1 State:</label>
                        <select id="state-select" style="width:100%; max-width:300px; padding:8px; border:1px solid #cbd5e1; border-radius:6px; font-size:14px; background:#ffffff;">
                            <option value="">All</option>
                        </select>
                    </section>
                </div>

                <!-- Chart Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-chart-line"></i> Power Chart</div>
                    <section class="chart-section" style="margin:0; padding:0; border:none; box-shadow:none;">
                        <div id="chart-container" class="chart-container" style="position:relative; height:320px; width:100%;">
                            <canvas id="chart-canvas" height="300"></canvas>
                        </div>
                    </section>
                    
                    <!-- Export Button Below Chart -->
                    <div class="mt-4 flex justify-center">
                        <button id="export-chart" class="chart-export" style="background:var(--primary-color); color:white; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer; font-size:0.9rem; transition:background 0.2s;"><i class="fas fa-file-image"></i> Export as PNG</button>
                    </div>
                </div>

                <!-- Events Card -->
                <div class="card-panel">
                    <div class="card-title"><i class="fas fa-list-ul"></i> Event Log Timelines</div>
                    <section class="event-summary" style="margin:0; padding:0; border:none; box-shadow:none;">
                        <div id="event-summary" class="summary-box" style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-size:0.85rem; font-style:italic; color:#64748b;">No events loaded yet.</div>
                    </section>
                </div>
                
                <!-- Dynamic Results Diagnostics Panels -->
                <div id="diagnostics-results" class="card-panel" style="display: none;">
                    <div class="card-title"><i class="fas fa-stethoscope"></i> Central Inverter Diagnostics</div>
                    <div class="results-content">
                        <!-- Filled dynamically by analyzer.js -->
                    </div>
                </div>
            </div>

            <!-- Right Column: Safety & Assumptions -->
            <div>
                <!-- Assumptions Panel -->
                <div class="assumptions-box">
                    <div class="assumptions-title"><i class="fas fa-clipboard-list"></i> Engineering Reference</div>
                    <ul class="assumptions-list">
                        <li>Visual charts map history files for active power, reactive power, and cell temperatures.</li>
                        <li>Supports central inverter Sungrow CSV structures.</li>
                        <li>Identifies outliers and schedules event logs chronologically.</li>
                    </ul>
                </div>

                <div class="card-panel" style="border-top:4px solid var(--primary-color); margin-top:1.5rem;">
                    <div class="card-title"><i class="fas fa-laptop-code"></i> Engineering Module Info</div>
                    <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
                        This module analyzes Central Inverter SCADA outputs and logs.
                    </p>
                    <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; font-size:0.8rem; margin-top:0.75rem;">
                        <strong>Target Hardware:</strong> Sungrow Central Inverters<br>
                        <strong>API Hook:</strong> Client-Side JS logic<br>
                        <strong>Status:</strong> Active
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="main-footer" style="background: #0f172a; padding: 1.5rem 2rem; border-top: 1px solid #1e293b; margin-top: 4rem;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; width: 100%;">
            <p style="margin: 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.75rem;">
                <span>&copy; 2026 LEVEL3SUPPORT. ALL RIGHTS RESERVED.</span>
            </p>
            <div class="powered-by-wrapper" style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-style: italic; font-weight: 400; color: #64748b; font-size: 0.85rem; font-family: 'Inter', sans-serif;">Powered by</span>
                <img src="images/APROVERO_LOGO.png" alt="aprovero" style="height: 28px; width: auto; opacity: 0.75; transition: all 0.2s ease; cursor: pointer;" onmouseover="this.style.opacity='1';" onmouseout="this.style.opacity='0.75';">
            </div>
        </div>
    </footer>

    <!-- Libraries and App Scripts -->
    <script src="js/papaparse.min.js"></script>
    <script src="js/common.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script type="module" src="js/analyzer.js"></script>
</body>
</html>`;

    saveFile('analyzer.html', content);
}

rebuildRej603();
rebuildParameterComparison();
rebuildFaultInterpreter();
rebuildAnalyzer();
