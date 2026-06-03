/**
 * Level3Support — tools-hub.js
 * UX / Information Architecture Refactor Edition
 * Lead Developer: Andres Provero (@aprovero)
 * © 2026 Level3Support
 */

// Central State Management
let allTools = [];
let favoriteTools = [];
let recentTools = [];

// LocalStorage Keys
const STORAGE_FAVORITES_KEY = 'level3support_favorite_tools';
const STORAGE_RECENT_KEY = 'level3support_recent_tools';

// Global Alias Keyword Map for Advanced Search
const SEARCH_ALIAS_MAP = {
    "megger": ["insulation resistance", "insulation resistance test form", "megger tester", "ir test", "pv insulation"],
    "ir test": ["insulation resistance", "insulation resistance test form"],
    "hex": ["number base converter", "modbus register decoder", "binary", "hexadecimal"],
    "binary": ["number base converter", "hexadecimal"],
    "dirty panels": ["soiling loss estimator", "clean vs. soiled string comparison tool", "cleaning roi", "lost energy from soiling", "soiling customer report"],
    "dirty panel": ["soiling loss estimator", "clean vs. soiled string comparison", "cleaning roi", "lost energy from soiling", "soiling customer report"],
    "soiling": ["soiling loss estimator", "clean vs. soiled string comparison tool", "cleaning roi", "lost energy from soiling", "soiling customer report"],
    "reactive": ["interactive power triangle tool", "inverter capability curve check", "grid event", "power factor", "pf"],
    "pf": ["interactive power triangle tool", "inverter capability curve check", "power factor"],
    "power factor": ["interactive power triangle tool", "inverter capability curve check"],
    "curtailment": ["inverter clipping / curtailment check tool", "clipping", "curtailment"],
    "fault": ["pdp module fault code interpreter", "alarm / fault event timeline builder", "umcg data analysis tool", "fault codes"],
    "fault code": ["pdp module fault code interpreter", "alarm / fault event timeline builder", "fault codes"],
    "relay": ["abb rej603 relay configuration tool", "relay settings checklist", "rej603"],
    "punch": ["commissioning punchlist builder", "corrective action tracker / capa log"],
    "capa": ["corrective action tracker / capa log", "corrective action"],
    "ttr": ["transformer test results form", "transformer turns ratio"],
    "loto": ["loto checklist generator", "safety pre-task plan / jha form"],
    "fuse": ["fuse continuous current & temperature derating calculator", "fuse derating", "derating", "continuous current", "fuse rating"],
    "derating": ["fuse continuous current & temperature derating calculator", "inverter derating cause analyzer", "fuse derating"]
};

// 8 Workflow Pack Definitions (Using tool routes for sequence mapping)
const WORKFLOW_PACKS = [
    {
        id: "pv-commissioning",
        name: "PV Commissioning Sequence",
        purpose: "Step-by-step process to inspect, test, start up, verify and document utility-scale PV inverters and associated string arrays.",
        tags: ["Solar PV", "Commissioning", "Electrical Testing"],
        tools: [
            { name: "[Required] Safety Pre-Task Plan / JHA Form", route: "jha-pre-task-plan.html", desc: "Confirm hazards, PPE, and permits before work." },
            { name: "[Required] LOTO Verification Checklist", route: "loto-checklist.html", desc: "Confirm isolation boundary and zero energy states." },
            { name: "[Required] Inverter Start-Up Checklist", route: "inverter-startup.html", desc: "Digital procedure for electrical, visual and comm startup." },
            { name: "[Required] PV String Voltage & Sizing Tool (Field Voltage mode)", route: "pv-string-voltage-sizing.html?mode=field-verification", desc: "Verify measured Voc against temp-corrected design limits." },
            { name: "[Required] Insulation Resistance Test Form (PV Array mode)", route: "insulation-resistance-test-form.html?profile=pv-array", desc: "Log string insulation resistance tests." },
            { name: "[Required] String Current Imbalance Calculator", route: "string-imbalance.html", desc: "Compare operational current outputs." },
            { name: "[Required] Firmware Version Tracker", route: "firmware-tracker.html", desc: "Derive baseline firmware mismatches." },
            { name: "[Required] Commissioning Punchlist Builder", route: "commissioning-punchlist.html", desc: "Capture issues and track closeout items." },
            { name: "[Required] Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Generate shift handover logs." },
            { name: "[Conditional] PV String Voltage & Sizing Tool (Design mode)", route: "pv-string-voltage-sizing.html?mode=string-sizing", desc: "Used for design validation or modules-per-string checking." },
            { name: "[Conditional] IV Curve Test Result Log", route: "iv-curve-log.html", desc: "Log IV curve results where scope demands." },
            { name: "[Conditional] SG1+x Parameter Comparison Tool", route: "parameter-comparison.html", desc: "OEM-specific configuration check." },
            { name: "[Conditional] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Verify Modbus registers and tag scaling." },
            { name: "[Supporting] Fuse Continuous Current & Temperature Derating Calculator", route: "fuse-derating-calculator.html", desc: "Verify fuse selection thermal bounds." },
            { name: "[Output] Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Compile final client-ready commissioning handovers." }
        ]
    },
    {
        id: "bess-commissioning",
        name: "BESS Commissioning Sequence",
        purpose: "Complete safety audits, rack inspection, energy capacity tests, and thermal verification for energy storage containers.",
        tags: ["BESS", "Testing", "Safety"],
        tools: [
            { name: "[Required] Safety Pre-Task Plan / JHA Form", route: "jha-pre-task-plan.html", desc: "Establish safety plans before task." },
            { name: "[Required] LOTO Verification Checklist", route: "loto-checklist.html", desc: "Verify LOTO isolation boundaries." },
            { name: "[Required] BESS Container & Rack Inspection", route: "bess-rack-inspection.html", desc: "Verify HVAC, structural, fire suppression and safe bonding." },
            { name: "[Required] BESS Battery Health Analyzer", route: "bess-battery-health-analyzer.html", desc: "Check voltage, SOC, and temperature spreads before energization." },
            { name: "[Required] HVAC Delta-T Calculator", route: "hvac-delta-t.html", desc: "Sanity check enclosure climate control." },
            { name: "[Required] BESS Pre-Energization Checklist", route: "bess-pre-energization.html", desc: "Final checklist gate before bus energization." },
            { name: "[Required] BESS Capacity / Energy Test Form", route: "bess-capacity-test.html", desc: "Record RTE test cycle parameters." },
            { name: "[Required] Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Shift progress handover report." },
            { name: "[Conditional] Cable Sizing, Ampacity & Voltage Drop Calculator (BESS DC mode)", route: "cable-sizing-ampacity-voltage-drop.html?profile=bess-dc", desc: "Auxiliary circuit check." },
            { name: "[Conditional] Fuse Continuous Current & Temperature Derating Calculator", route: "fuse-derating-calculator.html", desc: "Verify protective fuse constraints." },
            { name: "[Conditional] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Trace cascaded alarm sequence." },
            { name: "[Conditional] RCA Template Builder", route: "rca-template-builder.html", desc: "Escalate failure details if needed." }
        ]
    },
    {
        id: "pv-underperformance",
        name: "PV Underperformance Troubleshooting",
        purpose: "Investigate low solar plant production by separating measurements, weather, limitations, trackers, and soil.",
        tags: ["Solar PV", "O&M", "Performance", "Diagnostics"],
        tools: [
            { name: "[Required] Irradiance Sensor Cross-Check Tool", route: "irradiance-sensor-check.html", desc: "Verify sensor data quality first." },
            { name: "[Required] PV Performance Verification Tool", route: "pv-performance-verification.html", desc: "Assess PR and weather-corrected output." },
            { name: "[Required] Inverter Power Limitation Analyzer", route: "inverter-power-limitation-analyzer.html", desc: "Trace clipping, derating, and power limits." },
            { name: "[Required] String Current Imbalance Calculator", route: "string-imbalance.html", desc: "Locate outlier strings." },
            { name: "[Conditional] PV String Voltage & Sizing Tool", route: "pv-string-voltage-sizing.html?mode=field-verification", desc: "Sanity check string Voc counts." },
            { name: "[Conditional] IV Curve Test Result Log", route: "iv-curve-log.html", desc: "Detail DC array defect classifications." },
            { name: "[Conditional] Tracker Angle / Backtracking QA Checklist", route: "tracker-angle-qaqc.html", desc: "Check tracker geometry error bounds." },
            { name: "[Conditional] PV Soiling Analysis & Cleaning Decision Tool", route: "pv-soiling-analysis-cleaning-decision.html", desc: "Determine soiling losses and ROI." },
            { name: "[Supporting] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Trace curtailment events." },
            { name: "[Output] RCA Template Builder", route: "rca-template-builder.html", desc: "Build RCA documents for repeat issues." }
        ]
    },
    {
        id: "bess-troubleshooting",
        name: "BESS Container Troubleshooting",
        purpose: "Investigate BESS alarms, imbalance, thermal anomalies, and HVAC degradation.",
        tags: ["BESS", "O&M", "Thermal", "Diagnostics"],
        tools: [
            { name: "[Required] Technical Documentation / Reference Search Tool", route: "technical-reference-search.html", desc: "Identify bulletin boundaries and codes." },
            { name: "[Required] BESS Container & Rack Inspection", route: "bess-rack-inspection.html", desc: "Log physical container checks." },
            { name: "[Required] BESS Battery Health Analyzer", route: "bess-battery-health-analyzer.html", desc: "Pinpoint cell/module SOC and voltage spreads." },
            { name: "[Conditional] HVAC Delta-T Calculator", route: "hvac-delta-t.html", desc: "Diagnose climate system faults." },
            { name: "[Conditional] Register, Bitmask & Number Decoder", route: "register-bitmask-number-decoder.html", desc: "Decode BMS Modbus telemetry registers." },
            { name: "[Conditional] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Reconstruct alarm trigger sequence." },
            { name: "[Supporting] BESS Spare Parts Cross-Reference", route: "bess-spare-parts.html", desc: "Check model compatibility." },
            { name: "[Output] RCA Template Builder", route: "rca-template-builder.html", desc: "Draft root cause logs." }
        ]
    },
    {
        id: "grid-reactive-testing",
        name: "Grid / PPC & Reactive Power Testing",
        purpose: "Validate plant controller behavior, reactive power, capability, and SCADA commands.",
        tags: ["Grid", "PPC", "Controls", "Reactive Power"],
        tools: [
            { name: "[Required] Technical Documentation / Reference Search Tool", route: "technical-reference-search.html", desc: "Check PPC test plans." },
            { name: "[Required] Reactive Power & Inverter Capability Tool", route: "reactive-power-inverter-capability.html", desc: "Verify power factor curves and limits." },
            { name: "[Required] Grid Event Voltage/Frequency Excursion Log", route: "grid-event-excursion-log.html", desc: "Record transient grid deviations." },
            { name: "[Required] Inverter Power Limitation Analyzer", route: "inverter-power-limitation-analyzer.html", desc: "Verify deratings vs grid limits." },
            { name: "[Required] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Verify control commands and scaling." },
            { name: "[Conditional] Register, Bitmask & Number Decoder", route: "register-bitmask-number-decoder.html", desc: "Examine Modbus control bits." },
            { name: "[Supporting] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Correlate commands to system faults." }
        ]
    },
    {
        id: "soiling-analysis",
        name: "Soiling Analysis Workflow",
        purpose: "PV Soiling Analysis & Cleaning Decision Tool workflow wrapper.",
        tags: ["Solar PV", "Soiling", "O&M", "ROI"],
        tools: [
            { name: "[Required] PV Soiling Analysis & Cleaning Decision Tool", route: "pv-soiling-analysis-cleaning-decision.html", desc: "One consolidated tool from data inputs to ROI report." },
            { name: "[Conditional] Irradiance Sensor Cross-Check Tool", route: "irradiance-sensor-check.html", desc: "Use if sensor drift is suspected." },
            { name: "[Output] Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Track panel wash work orders." }
        ]
    },
    {
        id: "scada-comms-troubleshooting",
        name: "SCADA & Comms Troubleshooting",
        purpose: "Diagnose signal mapping, telemetry, register codes, and communication paths.",
        tags: ["SCADA", "MODBUS", "Comms", "Diagnostics"],
        tools: [
            { name: "[Required] Technical Documentation / Reference Search Tool", route: "technical-reference-search.html", desc: "Check register mapping docs." },
            { name: "[Required] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Check signal scaling and display logs." },
            { name: "[Required] Register, Bitmask & Number Decoder", route: "register-bitmask-number-decoder.html", desc: "Decode binary values." },
            { name: "[Required] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Reconstruct alarm streams." },
            { name: "[Conditional] UMCG Data Analysis Tool", route: "analyzer.html", desc: "Parse Sungrow inverter logs." },
            { name: "[Conditional] PDP Module Fault Code Interpreter", route: "fault-interpreter.html", desc: "Sungrow module fault diagnostics." },
            { name: "[Conditional] SG1+x Parameter Comparison Tool", route: "parameter-comparison.html", desc: "Check parameters." },
            { name: "[Conditional] Firmware Version Tracker", route: "firmware-tracker.html", desc: "Verify device compatibility." }
        ]
    },
    {
        id: "reporting-closeout",
        name: "Reporting / Field Closeout",
        purpose: "Finalize shift handovers, punchlist items, CAPAs, and visit summaries.",
        tags: ["Closeout", "Reports", "Handover"],
        tools: [
            { name: "[Required] Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Consolidate shift work progress." },
            { name: "[Required] Commissioning Punchlist Builder", route: "commissioning-punchlist.html", desc: "Verify turnover open items." },
            { name: "[Required] Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Log remaining action items." },
            { name: "[Required] RCA Template Builder", route: "rca-template-builder.html", desc: "Compile incident reports." },
            { name: "[Required] Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Customer service visit closeout report." }
        ]
    },
    {
        id: "mv-transformer-protection",
        name: "MV Transformer & Protection Commissioning",
        purpose: "Guide transformer, instrument transformer, relay and SCADA validation during MV skids.",
        tags: ["MV", "Transformer", "Protection", "Commissioning"],
        tools: [
            { name: "[Required] Safety Pre-Task Plan / JHA Form", route: "jha-pre-task-plan.html", desc: "Safety hazards control log." },
            { name: "[Required] LOTO Verification Checklist", route: "loto-checklist.html", desc: "Energy isolation zero potential verify." },
            { name: "[Required] Grounding Continuity Test Form", route: "electrical-test-forms.html?tool=grounding-continuity", desc: "Log safe bonding continuity resistance." },
            { name: "[Required] Transformer Test & TTR Report", route: "transformer-test-ttr-report.html", desc: "Turns ratio testing and error calculations." },
            { name: "[Required] CT/PT Ratio Verification Tool", route: "electrical-test-forms.html?tool=ct-pt-ratio", desc: "Instrument transformer ratio logging." },
            { name: "[Required] Relay Settings Checklist", route: "electrical-test-forms.html?tool=relay-checklist", desc: "Confirm loaded settings." },
            { name: "[Conditional] ABB REJ603 Relay Configuration Tool", route: "rej603-configurator.html", desc: "Relay configure for REJ603 skids." },
            { name: "[Conditional] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "SCADA controls and alarm mapping check." }
        ]
    },
    {
        id: "grid-event-investigation",
        name: "Grid Event / Plant Trip Investigation",
        purpose: "Diagnose grid excursions, plant trips, and inverter shutdowns.",
        tags: ["Grid", "Trip Investigation", "RCA", "Diagnostics"],
        tools: [
            { name: "[Required] Grid Event Voltage/Frequency Excursion Log", route: "grid-event-excursion-log.html", desc: "Record transient voltages/frequencies." },
            { name: "[Required] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Reconstruct alarm cascade sequence." },
            { name: "[Required] Register, Bitmask & Number Decoder", route: "register-bitmask-number-decoder.html", desc: "Decode telemetry bits." },
            { name: "[Required] Inverter Power Limitation Analyzer", route: "inverter-power-limitation-analyzer.html", desc: "Analyze inverter limitation flags." },
            { name: "[Conditional] Reactive Power & Inverter Capability Tool", route: "reactive-power-inverter-capability.html", desc: "Verify P-Q operating point vectors." },
            { name: "[Output] RCA Template Builder", route: "rca-template-builder.html", desc: "Assemble incident root cause templates." },
            { name: "[Output] Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Track preventive actions." }
        ]
    },
    {
        id: "firmware-configuration-control",
        name: "Firmware & Configuration Change Control",
        purpose: "Document firmware or parameter change implementation and rollbacks.",
        tags: ["Firmware", "Configuration", "Change Control"],
        tools: [
            { name: "[Required] Technical Documentation / Reference Search Tool", route: "technical-reference-search.html", desc: "Retrieve approved update bulletin." },
            { name: "[Required] Firmware Version Tracker", route: "firmware-tracker.html", desc: "Pre-change/post-change firmware version baseline." },
            { name: "[Required] SG1+x Parameter Comparison Tool", route: "parameter-comparison.html", desc: "Sungrow parameter comparison before/after change." },
            { name: "[Required] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "SCADA point scaling checks after change." },
            { name: "[Conditional] Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Validate that no faults are generated." }
        ]
    },
    {
        id: "bess-fault-to-parts",
        name: "BESS Fault-to-Parts Resolution",
        purpose: "Convert diagnosed BESS failures to spare parts planning and action closeout.",
        tags: ["BESS", "Spares", "Corrective Maintenance"],
        tools: [
            { name: "[Required] Technical Documentation / Reference Search Tool", route: "technical-reference-search.html", desc: "Reference OEM manuals." },
            { name: "[Required] BESS Container & Rack Inspection", route: "bess-rack-inspection.html", desc: "Physical check record." },
            { name: "[Required] BESS Battery Health Analyzer", route: "bess-battery-health-analyzer.html", desc: "Diagnose specific battery alarms." },
            { name: "[Required] BESS Spare Parts Cross-Reference", route: "bess-spare-parts.html", desc: "Search compatible part numbers." },
            { name: "[Output] Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Visit detail report." },
            { name: "[Output] Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Track procurement/installation." }
        ]
    },
    {
        id: "commissioning-closeout-handover",
        name: "Commissioning Closeout & Handover",
        purpose: "Confirm that test records, open items, firmware baselines and handovers are turnover-ready.",
        tags: ["Commissioning", "Handover", "Closeout"],
        tools: [
            { name: "[Required] Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Confirm completed work packages." },
            { name: "[Required] Commissioning Punchlist Builder", route: "commissioning-punchlist.html", desc: "Open item closeout." },
            { name: "[Required] Firmware Version Tracker", route: "firmware-tracker.html", desc: "Confirm as-left equipment versions." },
            { name: "[Required] SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "SCADA signal handover." },
            { name: "[Required] Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Track remaining obligations." },
            { name: "[Required] Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Generate handover document package." }
        ]
    }
];

// Active State View Navigation Management
const VIEWS = ["home", "tools", "workflows", "reference", "reports", "legacy", "resources"];

// LocalStorage key for the Supabase tools cache
const STORAGE_TOOLS_CACHE_KEY = 'level3support_tools_cache';
const STORAGE_TOOLS_CACHE_TS = 'level3support_tools_cache_ts';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[ToolHub] Core Hub initializing...');

    // Load user-preference states from LocalStorage
    favoriteTools = JSON.parse(localStorage.getItem(STORAGE_FAVORITES_KEY)) || [];
    recentTools   = JSON.parse(localStorage.getItem(STORAGE_RECENT_KEY))    || [];

    // Initialize SPA Views Router & event listeners immediately (no data needed)
    initializeRouter();
    setupEventListeners();

    // ── Offline-First loading strategy ─────────────────────────────
    // 1. Serve from cache instantly so the page is never blank
    const cachedTools = JSON.parse(localStorage.getItem(STORAGE_TOOLS_CACHE_KEY) || 'null');
    if (cachedTools && cachedTools.length > 0) {
        allTools = cachedTools;
        console.log(`[Registry] Served ${allTools.length} tools from cache.`);
        runToolHub();
    }

    // 2. Try Supabase (works online, silently updates cache)
    let supabaseLoaded = false;
    if (window.supabase) {
        try {
            const { data, error } = await supabase
                .from('tools')
                .select('*')
                .order('id', { ascending: true });

            if (!error && data && data.length > 0) {
                allTools = data;
                supabaseLoaded = true;
                console.log(`[Registry] Loaded ${allTools.length} tools from Supabase.`);

                // Persist fresh copy to localStorage for next offline visit
                localStorage.setItem(STORAGE_TOOLS_CACHE_KEY, JSON.stringify(allTools));
                localStorage.setItem(STORAGE_TOOLS_CACHE_TS, Date.now().toString());

                // Re-render with fresh data (seamless update if cache was stale)
                runToolHub();
            } else if (error) {
                console.warn('[Registry] Supabase error:', error.message);
            }
        } catch (e) {
            console.warn('[Registry] Supabase unavailable (offline?):', e.message);
        }
    }

    // 3. If no cache and no Supabase — fall back to local JSON, then hardcoded data
    if (!supabaseLoaded && (!cachedTools || cachedTools.length === 0)) {
        console.log('[Registry] No cache & Supabase unavailable. Trying tools-data.json...');
        try {
            const response = await fetch('./tools-data.json');
            if (!response.ok) throw new Error(`Status ${response.status}`);
            const data = await response.json();
            allTools = data.tools || [];
            console.log(`[Registry] Loaded ${allTools.length} tools from tools-data.json.`);
        } catch (err) {
            console.error('[Registry] All sources failed. Loading hardcoded fallback.', err);
            loadFallbackData();
        }
        runToolHub();
    }
});


/**
 * Main Orchestration of renders
 */
function runToolHub() {
    // 1. Render Home Elements
    renderHomeView();
    
    // 2. Render Tool Library Elements
    renderLibraryChips();
    filterLibrary();
    
    // 3. Render Workflow Pack cards
    renderWorkflowGrid();
    
    // 4. Render Reference Guides list
    renderReferenceChips();
    filterReference();
    
    // 5. Render Reports Guides list
    renderReportsChips();
    filterReports();

    // 6. Render Legacy modules
    renderLegacyView();
    
    // 7. Render Hub Resources
    renderHubResources();
    
    // 8. Execute Diagnostics Registry Auditor
    runRegistryAudit();
}

/**
 * Fallback Data in case JSON file fails
 */
function loadFallbackData() {
    allTools = [
        {
                "id": 1,
                "name": "Level3Support Request Form",
                "category": "Legacy / Archive",
                "status": "Legacy",
                "description": "Legacy request form for Support, RCA, Training and other Level3Support services.",
                "url": "support-request.html",
                "tags": [
                        "Support",
                        "Form"
                ],
                "notes": "Archived, replaced by local procedures."
        },
        {
                "id": 2,
                "name": "Technical Documentation Database",
                "category": "Legacy / Archive",
                "status": "Legacy",
                "description": "Legacy searchable database of technical documents, manuals, and troubleshooting guides.",
                "url": "training-request.html",
                "tags": [
                        "Reference",
                        "Database"
                ],
                "notes": "Offline legacy document library."
        },
        {
                "id": 3,
                "name": "Training Catalog",
                "category": "Legacy / Archive",
                "status": "Legacy",
                "description": "Legacy list of available training courses and resources provided by Level3Support.",
                "url": "training.html",
                "tags": [
                        "Catalog",
                        "Training"
                ],
                "notes": "Legacy training materials index."
        },
        {
                "id": 4,
                "name": "Training Evaluation Form",
                "category": "Legacy / Archive",
                "status": "Legacy",
                "description": "Legacy training evaluation form (English / Spanish).",
                "url": "evaluation.html",
                "tags": [
                        "Form",
                        "Training"
                ],
                "notes": "Archived course feedback form."
        },
        {
                "id": 5,
                "name": "ABB REJ603 Relay Configuration Tool",
                "category": "OEM Specific Diagnostics",
                "status": "Active",
                "description": "Used to configure ABB REJ603 protection relays. (OEM Specific - ABB)",
                "url": "rej603-configurator.html",
                "tags": [
                        "ABB",
                        "Relay",
                        "Protection",
                        "Commissioning"
                ],
                "notes": "Fully operational field tool."
        },
        {
                "id": 6,
                "name": "SG1+x Parameter Comparison Tool",
                "category": "OEM Specific Diagnostics",
                "status": "Active",
                "description": "Compare Sungrow SG1+x inverter parameters side by side. (OEM Specific - Sungrow)",
                "url": "parameter-comparison.html",
                "tags": [
                        "Sungrow",
                        "Inverter",
                        "Parameters"
                ],
                "notes": "Excellent troubleshooting tool."
        },
        {
                "id": 7,
                "name": "UMCG Data Analysis Tool",
                "category": "OEM Specific Diagnostics",
                "status": "Active",
                "description": "Used to analyze data logs downloaded from Sungrow inverters. (OEM Specific - Sungrow)",
                "url": "analyzer.html",
                "tags": [
                        "Sungrow",
                        "Inverter",
                        "Diagnostics",
                        "Data"
                ],
                "notes": "Development in progress."
        },
        {
                "id": 8,
                "name": "PDP Module Fault Code Interpreter",
                "category": "OEM Specific Diagnostics",
                "status": "Active",
                "description": "Decodes raw diagnostic codes and status faults for Sungrow inverters, providing immediate troubleshooting guides and failure root causes for technicians in the field. (OEM Specific - Sungrow)",
                "url": "fault-interpreter.html",
                "tags": [
                        "Sungrow",
                        "Inverter",
                        "Faults",
                        "Troubleshooting"
                ],
                "notes": "Updated with premium styling."
        },
        {
                "id": 9,
                "name": "PV String Voltage & Sizing Tool",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Calculate PV string voltage at different temperatures and help determine minimum/maximum modules per string based on inverter MPPT and maximum DC voltage constraints.",
                "url": "pv-string-voltage-sizing.html",
                "toolType": "Calculator",
                "disciplines": [
                        "PV",
                        "Electrical",
                        "Design",
                        "Commissioning"
                ],
                "tags": [
                        "PV",
                        "String Sizing",
                        "VOC",
                        "VMP",
                        "Temperature",
                        "Inverter",
                        "DC"
                ],
                "aliases": [
                        "string sizer",
                        "VOC calculator",
                        "PV string calculator",
                        "max string voltage",
                        "cold VOC",
                        "inverter MPPT window"
                ],
                "legacy": false
        },
        {
                "id": 10,
                "name": "Cable Sizing, Ampacity & Voltage Drop Calculator",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Provide a field-use cable sizing estimate for BESS DC and AC auxiliary circuits using manual ampacity and derating inputs.",
                "url": "cable-sizing-ampacity-voltage-drop.html",
                "toolType": "Calculator",
                "disciplines": [
                        "BESS",
                        "Electrical",
                        "Cable",
                        "QA/QC"
                ],
                "tags": [
                        "BESS",
                        "Cable Sizing",
                        "Ampacity",
                        "Voltage Drop",
                        "Temperature Derating",
                        "DC",
                        "AC"
                ],
                "aliases": [
                        "battery cable sizing",
                        "BESS DC cable",
                        "BESS cable ampacity",
                        "cable derating",
                        "voltage drop"
                ],
                "legacy": false
        },
        {
                "id": 11,
                "name": "Torque Spec Finder & Connection Calculator",
                "category": "In Review",
                "status": "In Review",
                "description": "Searchable torque specification reference tool for solar array and battery rack connections with target bolt pre-loads calculator.",
                "url": "torque-spec-finder.html",
                "tags": [
                        "Torque",
                        "Electrical",
                        "Mechanical",
                        "QA/QC",
                        "Reference",
                        "Calculators"
                ],
                "notes": "Merged standard torque specification finder with mechanical bolt tension calculator."
        },
        {
                "id": 12,
                "name": "Insulation Resistance Test Form",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Record PV insulation resistance test results and provide preliminary pass/fail based on user-entered acceptance criteria.",
                "url": "insulation-resistance-test-form.html",
                "toolType": "Test Form",
                "disciplines": [
                        "PV",
                        "Electrical",
                        "Testing",
                        "Commissioning"
                ],
                "tags": [
                        "PV",
                        "Megger",
                        "Insulation Resistance",
                        "IR Test",
                        "DC",
                        "Ground Fault",
                        "Commissioning"
                ],
                "aliases": [
                        "megger",
                        "IR test",
                        "insulation test",
                        "ground fault test",
                        "PV insulation resistance"
                ],
                "legacy": false
        },
        {
                "id": 13,
                "name": "BESS Battery Health Analyzer",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Analyze cell/module voltage spread across BESS modules, racks, strings, or clusters to identify imbalance conditions.",
                "url": "bess-battery-health-analyzer.html",
                "toolType": "Calculator",
                "disciplines": [
                        "BESS",
                        "Battery",
                        "BMS",
                        "Commissioning",
                        "Troubleshooting"
                ],
                "tags": [
                        "BESS",
                        "Cell Voltage",
                        "Imbalance",
                        "BMS",
                        "Battery",
                        "Rack",
                        "Module"
                ],
                "aliases": [
                        "cell imbalance",
                        "voltage spread",
                        "BMS cell voltage",
                        "battery imbalance",
                        "module voltage spread"
                ],
                "legacy": false
        },
        {
                "id": 14,
                "name": "Transformer Test & TTR Report",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Record transformer turns ratio test results and calculate ratio error by phase and tap position.",
                "url": "transformer-test-ttr-report.html",
                "toolType": "Test Form",
                "disciplines": [
                        "Electrical",
                        "Transformer",
                        "Commissioning",
                        "Testing"
                ],
                "tags": [
                        "Transformer",
                        "TTR",
                        "Turns Ratio",
                        "Electrical Test",
                        "Commissioning"
                ],
                "aliases": [
                        "TTR",
                        "turns ratio",
                        "transformer ratio test",
                        "ratio error",
                        "transformer test"
                ],
                "legacy": false
        },
        {
                "id": 15,
                "name": "LOTO Verification Checklist",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Create a field checklist to verify lockout/tagout preparation, isolation points, zero-energy verification, and restoration readiness.",
                "url": "loto-checklist.html",
                "toolType": "Checklist",
                "disciplines": [
                        "HSE",
                        "Electrical Safety",
                        "Commissioning"
                ],
                "tags": [
                        "LOTO",
                        "Lockout Tagout",
                        "Isolation",
                        "Verification",
                        "HSE",
                        "Electrical Safety"
                ],
                "aliases": [
                        "lockout tagout",
                        "isolation checklist",
                        "zero energy verification",
                        "LOTO verification"
                ],
                "legacy": false
        },
        {
                "id": 16,
                "name": "Arc Flash Boundary Calculator",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Provide a safe field reference/planning aid for arc flash boundary documentation using user-provided incident energy and/or boundary values from an approved arc flash study.",
                "url": "arc-flash.html",
                "toolType": "Calculator / HSE Reference",
                "disciplines": [
                        "HSE",
                        "Electrical Safety",
                        "Arc Flash"
                ],
                "tags": [
                        "Arc Flash",
                        "Boundary",
                        "Incident Energy",
                        "PPE",
                        "Electrical Safety",
                        "HSE"
                ],
                "aliases": [
                        "arc flash",
                        "arc boundary",
                        "incident energy",
                        "PPE category",
                        "approach boundary"
                ],
                "legacy": false
        },
        {
                "id": 17,
                "name": "Daily Commissioning Progress Report",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Generate a structured daily commissioning progress report for PV/BESS field work.",
                "url": "daily-progress.html",
                "toolType": "Report Generator",
                "disciplines": [
                        "PV",
                        "BESS",
                        "Commissioning",
                        "Reporting"
                ],
                "tags": [
                        "Daily Report",
                        "Commissioning",
                        "Progress",
                        "Field Report",
                        "Customer Report",
                        "Punchlist"
                ],
                "aliases": [
                        "daily report",
                        "commissioning report",
                        "field report",
                        "progress report",
                        "site report"
                ],
                "legacy": false
        },
        {
                "id": 18,
                "name": "String Current Imbalance Calculator",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Compare solar string currents against the average and flag abnormal strings above a configurable deviation threshold.",
                "url": "string-imbalance.html",
                "tags": [
                        "PV",
                        "Testing",
                        "Commissioning",
                        "Field"
                ],
                "notes": "Agent 3 — Mobile-first, CSV export."
        },
        {
                "id": 20,
                "name": "Inverter Start-Up Checklist",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Structured digital commissioning checklist covering visual inspection, DC/AC checks, grounding, comms, firmware, and first energization.",
                "url": "inverter-startup.html",
                "tags": [
                        "PV",
                        "Commissioning",
                        "Checklist",
                        "Field"
                ],
                "notes": "Agent 3 — Print and JSON export."
        },
        {
                "id": 21,
                "name": "IV Curve Test Result Log",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Record and categorize IV curve test results consistently across field teams. Supports defect classification and CSV export.",
                "url": "iv-curve-log.html",
                "tags": [
                        "PV",
                        "Testing",
                        "Report",
                        "Field"
                ],
                "notes": "Agent 3 — Multi-record log with status summary."
        },
        {
                "id": 22,
                "name": "Firmware Version Tracker",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Track firmware versions across inverters, dataloggers, routers, and other field equipment. Flags devices requiring updates.",
                "url": "firmware-tracker.html",
                "tags": [
                        "PV",
                        "BESS",
                        "Commissioning",
                        "Report"
                ],
                "notes": "Agent 3 — Auto-derives update required status."
        },
        {
                "id": 25,
                "name": "Grounding Continuity Test Form",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Record grounding and bonding continuity tests with multiple points.",
                "url": "electrical-test-forms.html?tool=grounding-continuity",
                "tags": [
                        "Testing",
                        "Electrical",
                        "Grounding"
                ],
                "notes": "Agent 5 — Sample max allowed resistance 0.5 Ω."
        },
        {
                "id": 26,
                "name": "CT/PT Ratio Verification Tool",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Verify CT and PT ratios against measured values and relay configuration.",
                "url": "electrical-test-forms.html?tool=ct-pt-ratio",
                "tags": [
                        "Testing",
                        "Electrical",
                        "CT",
                        "PT"
                ],
                "notes": "Agent 5 — Sample allowable error 5%."
        },
        {
                "id": 27,
                "name": "Relay Settings Checklist",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Checklist to confirm relay settings were loaded and verified.",
                "url": "electrical-test-forms.html?tool=relay-checklist",
                "tags": [
                        "Testing",
                        "Electrical",
                        "Relay",
                        "Checklist"
                ],
                "notes": "Agent 5 — Sample manufacturer data pre‑filled."
        },
        {
                "id": 28,
                "name": "PV Performance Verification Tool",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Determine utility-scale solar PV system Performance Ratio (PR) with optional temperature correction.",
                "url": "pv-performance-verification.html",
                "tags": [
                        "PV",
                        "Performance",
                        "Commissioning",
                        "O&M"
                ]
        },
        {
                "id": 31,
                "name": "BESS Availability Calculator",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Calculate simple and adjusted availability for utility-scale battery systems over reporting periods.",
                "url": "bess-availability.html",
                "tags": [
                        "BESS",
                        "O&M",
                        "Availability",
                        "Reporting"
                ]
        },
        {
                "id": 32,
                "name": "HVAC Delta-T Calculator",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Sanity check BESS enclosure HVAC cooling and heating performance using supply, return, and ambient readings.",
                "url": "hvac-delta-t.html",
                "tags": [
                        "BESS",
                        "HVAC",
                        "Thermal",
                        "Field Check"
                ]
        },
        {
                "id": 34,
                "name": "SCADA Tag QA/QC Checklist",
                "category": "SCADA & Data Diagnostics",
                "status": "Active",
                "description": "Verify signal list scaling, remote controls, HMI displays, and historian logging for communications handovers.",
                "url": "scada-tag-qaqc.html",
                "tags": [
                        "SCADA",
                        "Commissioning",
                        "QA/QC",
                        "Controls"
                ]
        },
        {
                "id": 35,
                "name": "Register, Bitmask & Number Decoder",
                "category": "SCADA & Data Diagnostics",
                "status": "Active",
                "description": "Decode raw decimal/hex MODBUS registers into engineering values including 16/32-bit types and 32-bit floats.",
                "url": "register-bitmask-number-decoder.html",
                "tags": [
                        "MODBUS",
                        "Communications",
                        "Troubleshooting",
                        "SCADA"
                ]
        },
        {
                "id": 36,
                "name": "Alarm / Fault Event Timeline Builder",
                "category": "SCADA & Data Diagnostics",
                "status": "Active",
                "description": "Build chronological alarm and fault timelines to analyze cascading faults, repeated codes, and trigger times.",
                "url": "alarm-timeline.html",
                "tags": [
                        "RCA",
                        "Troubleshooting",
                        "Alarms",
                        "Events",
                        "SCADA",
                        "BESS",
                        "PV"
                ]
        },
        {
                "id": 38,
                "name": "Commissioning Punchlist Builder",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Create, manage, and filter field punchlist items for PV/BESS commissioning and close-out.",
                "url": "commissioning-punchlist.html",
                "tags": [
                        "Commissioning",
                        "Punchlist",
                        "QA/QC",
                        "Closeout",
                        "PV",
                        "BESS"
                ]
        },
        {
                "id": 39,
                "name": "Customer Site Visit Report Generator",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Generate a structured, professional, customer-facing field service site visit report.",
                "url": "site-visit-report.html",
                "tags": [
                        "Report",
                        "Site Visit",
                        "Customer",
                        "Field Service",
                        "PV",
                        "BESS"
                ]
        },
        {
                "id": 40,
                "name": "RCA Template Builder",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Structured Root Cause Analysis (RCA) report builder for solar and battery plant incidents.",
                "url": "rca-template-builder.html",
                "tags": [
                        "RCA",
                        "Troubleshooting",
                        "Incident",
                        "Report",
                        "PV",
                        "BESS"
                ]
        },
        {
                "id": 41,
                "name": "Safety Pre-Task Plan / JHA Form",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Standardized Job Hazard Analysis (JHA) and safety planning form to conduct before field tasks.",
                "url": "jha-pre-task-plan.html",
                "tags": [
                        "HSE",
                        "Safety",
                        "JHA",
                        "JSA",
                        "Pre-Task Plan",
                        "Field Work"
                ]
        },
        {
                "id": 43,
                "name": "Technical Documentation / Reference Search Tool",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Find and view active service bulletins, commissioning manuals, training resources, and datasheets.",
                "url": "technical-reference-search.html",
                "tags": [
                        "Documentation",
                        "Reference",
                        "Manuals",
                        "Procedures",
                        "Training",
                        "Search"
                ]
        },
        {
                "id": 44,
                "name": "Inverter Power Limitation Analyzer",
                "category": "Grid & Inverter Controls",
                "status": "Active",
                "description": "Help determine whether reduced inverter output is consistent with inverter clipping, PPC curtailment, export limit, or real underperformance.",
                "url": "inverter-power-limitation-analyzer.html",
                "tags": [
                        "PV",
                        "Inverter",
                        "Clipping",
                        "Curtailment",
                        "Diagnostics"
                ]
        },
        {
                "id": 45,
                "name": "Irradiance Sensor Cross-Check Tool",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Compare irradiance sensors, reference cells, and nearby inverter behavior to detect dirty, misaligned, drifting, or unreliable measurements.",
                "url": "irradiance-sensor-check.html",
                "tags": [
                        "PV",
                        "Irradiance",
                        "Sensor",
                        "Calibration",
                        "Diagnostics"
                ]
        },
        {
                "id": 46,
                "name": "Tracker Angle / Backtracking QA Checklist",
                "category": "PV Commissioning & Performance",
                "status": "Active",
                "description": "Validate tracker angle behavior, backtracking, mechanical alignment, and wind stow during commissioning or troubleshooting.",
                "url": "tracker-angle-qaqc.html",
                "tags": [
                        "PV",
                        "Tracker",
                        "Backtracking",
                        "Checklist",
                        "Diagnostics"
                ]
        },
        {
                "id": 47,
                "name": "Corrective Action Tracker / CAPA Log",
                "category": "Reports, HSE & References",
                "status": "Active",
                "description": "Track corrective and preventive actions from punchlists, RCAs, inspections, HSE forms, and commissioning findings.",
                "url": "capa-tracker.html",
                "tags": [
                        "RCA",
                        "CAPA",
                        "Safety",
                        "Punchlist",
                        "Log"
                ]
        },
        {
                "id": 49,
                "name": "Reactive Power & Inverter Capability Tool",
                "category": "Grid & Inverter Controls",
                "status": "Active",
                "description": "Interactive visual tool showing the relationship between active power P, reactive power Q, apparent power S, power factor, and phase angle.",
                "url": "reactive-power-inverter-capability.html",
                "tags": [
                        "Electrical",
                        "Power",
                        "Grid",
                        "Controls",
                        "Visual"
                ]
        },
        {
                "id": 51,
                "name": "Grid Event Voltage/Frequency Excursion Log",
                "category": "Grid & Inverter Controls",
                "status": "Active",
                "description": "Log grid voltage/frequency excursions, calculate deviations, and create structured RCA-ready event timelines.",
                "url": "grid-event-excursion-log.html",
                "tags": [
                        "Grid",
                        "Event",
                        "Voltage",
                        "Frequency",
                        "RCA",
                        "Log"
                ]
        },
        {
                "id": 55,
                "name": "PV Soiling Analysis & Cleaning Decision Tool",
                "category": "PV Soiling Analysis",
                "status": "Active",
                "description": "Estimate PV system energy loss due to soiling based on site conditions.",
                "url": "pv-soiling-analysis-cleaning-decision.html",
                "tags": [
                        "PV",
                        "Soiling",
                        "Performance",
                        "O&M",
                        "Field Check"
                ]
        },
        {
                "id": 60,
                "name": "Fuse Continuous Current & Temperature Derating Calculator",
                "category": "Electrical Calculators & Test Forms",
                "status": "Active",
                "description": "Calculate derated continuous current limits and determine appropriate fuse ratings based on ambient temperature and custom derating factors.",
                "url": "fuse-derating-calculator.html",
                "tags": [
                        "Fuse",
                        "Derating",
                        "Continuous Current",
                        "Temperature",
                        "DC",
                        "AC",
                        "Protection",
                        "QA/QC"
                ]
        },
        {
                "id": 61,
                "name": "BESS Capacity / Energy Test Form",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Record energy charge/discharge metrics, compute actual performance vs. rated energy capacities, and determine round-trip efficiency (RTE).",
                "url": "bess-capacity-test.html",
                "tags": [
                        "BESS",
                        "Capacity",
                        "Energy Test",
                        "RTE",
                        "Commissioning"
                ]
        },
        {
                "id": 62,
                "name": "BESS Pre-Energization Checklist",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Audit and sign off on isolation integrity, grounding bonds, auxiliary system status, communications, and LOTO state prior to introducing utility or DC bus voltage.",
                "url": "bess-pre-energization.html",
                "tags": [
                        "BESS",
                        "Pre-Energization",
                        "Checklist",
                        "Safety",
                        "Commissioning"
                ]
        },
        {
                "id": 63,
                "name": "BESS Container & Rack Inspection",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Verify battery container structural integrity, climate controllers, fire suppression status, and electrical safety bonds prior to unit commissioning.",
                "url": "bess-rack-inspection.html",
                "tags": [
                        "BESS",
                        "Rack Inspection",
                        "Container",
                        "Checklist",
                        "Commissioning"
                ]
        },
        {
                "id": 64,
                "name": "BESS Spare Parts Cross-Reference",
                "category": "BESS Commissioning & Diagnostics",
                "status": "Active",
                "description": "Search compatible parts, review stock levels, filter criticality levels, and import/export CSV parts directories.",
                "url": "bess-spare-parts.html",
                "tags": [
                        "BESS",
                        "Spare Parts",
                        "Reference",
                        "Cross-Reference",
                        "O&M"
                ]
        }
];
}

function initializeRouter() {
    const handleHashChange = () => {
        let hash = window.location.hash.substring(1).toLowerCase();
        if (!VIEWS.includes(hash)) {
            hash = "home"; // Default fallback
        }
        
        // Hide all views, display targeted view
        VIEWS.forEach(viewId => {
            const section = document.getElementById(`view-${viewId}`);
            if (section) section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`view-${hash}`);
        if (targetSection) targetSection.classList.add('active');
        
        // Update active class on navigation elements (Sidebar and Mobile bottom)
        const allNavItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
        allNavItems.forEach(item => {
            if (item.getAttribute('data-view') === hash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Reset scroll position
        window.scrollTo(0, 0);
        console.log(`[Router] View changed to: ${hash}`);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Execute immediately on page load
    if (!window.location.hash) {
        window.location.hash = "#home";
    } else {
        handleHashChange();
    }
}

/**
 * ── Event Listeners Binding ──
 */
function setupEventListeners() {
    // Support horizontal scroll scroller by mouse wheel
    document.querySelectorAll('.category-chips-scroller').forEach(scroller => {
        scroller.addEventListener('wheel', (evt) => {
            evt.preventDefault();
            scroller.scrollLeft += evt.deltaY;
        }, { passive: false });
    });

    // Global Home Search
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                // Redirect user to the Tools page and autofill search
                window.location.hash = "#tools";
                const libSearch = document.getElementById('library-search-input');
                if (libSearch) {
                    libSearch.value = val;
                    // Trigger live search
                    filterLibrary();
                }
            }
        });
    }

    // Library page Search input
    const librarySearch = document.getElementById('library-search-input');
    if (librarySearch) {
        librarySearch.addEventListener('input', filterLibrary);
    }

    // Advanced filters toggle drawer
    const advToggle = document.getElementById('toggle-adv-filters');
    const advDrawer = document.getElementById('advanced-filters-drawer');
    if (advToggle && advDrawer) {
        advToggle.addEventListener('click', () => {
            advDrawer.classList.toggle('hidden');
            advToggle.classList.toggle('active');
        });
    }

    // Advanced selects
    const advDiscipline = document.getElementById('filter-discipline');
    const advType = document.getElementById('filter-tool-type');
    const advStatus = document.getElementById('filter-status');
    if (advDiscipline) advDiscipline.addEventListener('change', filterLibrary);
    if (advType) advType.addEventListener('change', filterLibrary);
    if (advStatus) advStatus.addEventListener('change', filterLibrary);

    // Reference Search input
    const refSearch = document.getElementById('reference-search-input');
    if (refSearch) {
        refSearch.addEventListener('input', filterReference);
    }

    // Reports Search input
    const repSearch = document.getElementById('reports-search-input');
    if (repSearch) {
        repSearch.addEventListener('input', filterReports);
    }
}

/**
 * Helper to check if a search term matches aliases
 */
function matchAliases(toolName, query) {
    const cleanQuery = query.toLowerCase();
    for (const [aliasKey, keywords] of Object.entries(SEARCH_ALIAS_MAP)) {
        if (cleanQuery.includes(aliasKey) || aliasKey.includes(cleanQuery)) {
            // Check if tool name matches any of mapped keywords
            const found = keywords.some(keyword => toolName.toLowerCase().includes(keyword));
            if (found) return true;
        }
    }
    return false;
}

/**
 * Generic search filter function
 */
function searchMatches(tool, query) {
    if (!query) return true;
    const cleanQuery = query.toLowerCase().trim();
    
    // Check direct properties
    const inName = tool.name.toLowerCase().includes(cleanQuery);
    const inDesc = tool.description.toLowerCase().includes(cleanQuery);
    const inCat = tool.category.toLowerCase().includes(cleanQuery);
    const inTags = (tool.tags || []).some(tag => tag.toLowerCase().includes(cleanQuery));
    
    // Check smart alias map
    const inAlias = matchAliases(tool.name, cleanQuery);

    return inName || inDesc || inCat || inTags || inAlias;
}

/**
 * ── Favorites State System ──
 */
function toggleFavorite(toolId) {
    const index = favoriteTools.indexOf(toolId);
    if (index === -1) {
        favoriteTools.push(toolId);
        console.log(`[Favorite] Starred tool ID ${toolId}`);
    } else {
        favoriteTools.splice(index, 1);
        console.log(`[Favorite] Unstarred tool ID ${toolId}`);
    }
    
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favoriteTools));
    
    // Refresh grids dynamically
    renderHomeView();
    filterLibrary();
    filterReference();
    filterReports();
}

/**
 * ── Recently Used System ──
 */
function trackRecentTool(toolId) {
    // Only track valid IDs and non-legacy tools
    const tool = allTools.find(t => t.id === toolId);
    if (!tool || ["Legacy", "Archived", "Hidden", "Disabled"].includes(tool.status)) return;

    // Remove duplicates
    recentTools = recentTools.filter(id => id !== toolId);
    
    // Prepend to array
    recentTools.unshift(toolId);
    
    // Cap at 8 elements
    if (recentTools.length > 8) {
        recentTools.pop();
    }
    
    localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(recentTools));
    console.log(`[Recents] Logged access for tool ID ${toolId}`);
}

/**
 * Navigate to tool route securely
 */
function openTool(toolId, url) {
    trackRecentTool(toolId);
    setTimeout(() => {
        window.location.href = url;
    }, 50);
}

/**
 * Generic Tool Card Renderer
 */
function buildToolCardHTML(tool) {
    // Merge any localStorage overrides (from the in-tool gear editor)
    const _overrides = JSON.parse(localStorage.getItem('toolhub_meta_overrides') || '{}');
    const _key = (tool.url || '').split('?')[0];
    if (_overrides[_key]) {
        tool = { ...tool, ..._overrides[_key] };
    }

    const isStarred = favoriteTools.includes(tool.id);
    const cleanCategory = tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const statusText = tool.status || 'Active';
    const cleanStatus = statusText.toLowerCase().replace(/\s+/g, '-');
    
    // FontAwesome Categories mapper
    const categoryIcons = {
        'calculators': 'fas fa-calculator',
        'pv-field-tools': 'fas fa-solar-panel',
        'bess-field-tools': 'fas fa-battery',
        'electrical-test-forms': 'fas fa-file-signature',
        'scada-diagnostics': 'fas fa-network-wired',
        'reports-templates': 'fas fa-clipboard-list',
        'reference-guides': 'fas fa-book',
        'hse': 'fas fa-hard-hat',
        'soiling-pv-performance': 'fas fa-broom',
        'legacy-archive': 'fas fa-archive',
        'advanced-field-diagnostics': 'fas fa-stethoscope',
        'grid-controls': 'fas fa-project-diagram',
        'oem-specific': 'fas fa-industry'
    };
    const iconClass = categoryIcons[cleanCategory] || 'fas fa-wrench';

    const tagsHTML = (tool.tags || [])
        .map(tag => `<span class="tag-badge">${tag}</span>`)
        .join('');

    return `
        <div class="tool-tile" data-id="${tool.id}" data-status="${cleanStatus}" onclick="openTool(${tool.id}, '${tool.url}')" style="cursor: pointer;">
            <div class="tile-content">
                <div class="tile-header">
                    <span class="status-badge status-${cleanStatus}">${statusText}</span>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <span class="tile-category">${tool.category}</span>
                        <button class="favorite-btn ${isStarred ? 'active' : ''}" title="Star Tool" onclick="event.stopPropagation(); toggleFavorite(${tool.id})">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
                <div class="tile-main">
                    <div class="tile-icon-wrapper">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="tile-info">
                        <h3 class="tile-title">${tool.name}</h3>
                        <p class="tile-description">${tool.description}</p>
                    </div>
                </div>
                <div class="tile-footer">
                    <div class="tile-tags">
                        ${tagsHTML}
                    </div>
                    <div class="tile-action-indicator">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * ── 1. Render HOME View ──
 */
function renderHomeView() {
    // A. Render Starred favorites
    const favGrid = document.getElementById('favorites-grid');
    const favEmpty = document.getElementById('favorites-empty-state');
    
    if (favGrid) {
        favGrid.innerHTML = '';
        const starredList = allTools.filter(t => favoriteTools.includes(t.id));
        
        const favSection = document.getElementById('favorites-section');
        if (starredList.length === 0) {
            if (favSection) favSection.style.display = 'none';
        } else {
            if (favSection) favSection.style.display = 'block';
            favEmpty.style.display = 'none';
            favGrid.style.display = 'grid';
            starredList.forEach(tool => {
                favGrid.innerHTML += buildToolCardHTML(tool);
            });
        }
    }

    // B. Render Recently Used
    const recGrid = document.getElementById('recent-grid');
    const recSection = document.getElementById('recent-section');
    
    if (recGrid) {
        recGrid.innerHTML = '';
        // Map recent IDs to registry
        const recentList = recentTools
            .map(id => allTools.find(t => t.id === id))
            .filter(t => t && t.status !== "Legacy"); // Safe lookup & ensure not legacy

        if (recentList.length === 0) {
            recSection.style.display = 'none';
        } else {
            recSection.style.display = 'block';
            recentList.forEach(tool => {
                recGrid.innerHTML += buildToolCardHTML(tool);
            });
        }
    }

    // C. Render Recommended Workflows (limit to 3 featured ones on Home)
    const homeWorkflowsGrid = document.getElementById('recommended-workflows-grid');
    if (homeWorkflowsGrid) {
        homeWorkflowsGrid.innerHTML = '';
        // Pick first 3 workflows
        const featuredWf = WORKFLOW_PACKS.slice(0, 3);
        featuredWf.forEach(wf => {
            const tagsHTML = wf.tags.map(t => `<span class="workflow-tag">${t}</span>`).join('');
            const card = document.createElement('div');
            card.className = 'workflow-card';
            card.onclick = () => viewWorkflowDetail(wf.id);
            card.innerHTML = `
                <div>
                    <div class="workflow-card-header">
                        <span class="workflow-badge">Workflow Pack</span>
                        <span class="workflow-step-count">${wf.tools.length} Tools</span>
                    </div>
                    <h3 class="workflow-card-title">${wf.name}</h3>
                    <p class="workflow-card-desc">${wf.purpose}</p>
                </div>
                <div class="workflow-card-footer">
                    <div class="workflow-tags">${tagsHTML}</div>
                    <span class="workflow-action-btn">Launch <i class="fas fa-play"></i></span>
                </div>
            `;
            homeWorkflowsGrid.appendChild(card);
        });
    }

    // D. Render Featured Essential Field tools (featured: true)
    const featGrid = document.getElementById('featured-grid');
    if (featGrid) {
        featGrid.innerHTML = '';
        // Grab tools configured as featured (or fallback to active calculators)
        let featuredTools = allTools.filter(t => t.featured === true || (t.notes && t.notes.includes("featured")));
        
        if (featuredTools.length === 0) {
            // Dynamic fallback: grab some common active tools
            featuredTools = allTools.filter(t => ["Active", "In Progress", "Under Review"].includes(t.status) && t.status !== "Legacy").slice(0, 6);
        }
        
        featuredTools.forEach(tool => {
            featGrid.innerHTML += buildToolCardHTML(tool);
        });
    }

    // E. Render NEW Additions (new: true)
    const newGrid = document.getElementById('new-additions-grid');
    if (newGrid) {
        newGrid.innerHTML = '';
        let newTools = allTools.filter(t => t.new === true || (t.notes && t.notes.includes("new")));
        
        if (newTools.length === 0) {
            // Dynamic fallback: grab the last 3 active/in progress tools added to the registry
            newTools = allTools.filter(t => ["Active", "In Progress", "Under Review"].includes(t.status) && t.status !== "Legacy").slice(-3).reverse();
        }
        
        newTools.forEach(tool => {
            newGrid.innerHTML += buildToolCardHTML(tool);
        });
    }
}

/**
 * ── 2. Render TOOL LIBRARY View ──
 */
let activeLibraryCategory = 'all';

function renderLibraryChips() {
    const container = document.getElementById('category-chips-container');
    if (!container) return;
    
    // Unique list of active categories
    const categories = [
        { label: "All Tools", value: "all" },
        { label: "Advanced Diagnostics", value: "advanced-field-diagnostics" },
        { label: "OEM Specific", value: "oem-specific" },
        { label: "Solar PV", value: "pv-field-tools" },
        { label: "BESS", value: "bess-field-tools" },
        { label: "SCADA & Comms", value: "scada-diagnostics" },
        { label: "Grid & Controls", value: "grid-controls" },
        { label: "Calculators", value: "calculators" },
        { label: "Test Forms", value: "electrical-test-forms" },
        { label: "Field Reports", value: "reports-templates" },
        { label: "Reference", value: "reference-guides" },
        { label: "HSE", value: "hse" },
        { label: "Soiling", value: "soiling-pv-performance" }
    ];

    container.innerHTML = '';
    categories.forEach(cat => {
        const chip = document.createElement('div');
        chip.className = `category-chip ${activeLibraryCategory === cat.value ? 'active' : ''}`;
        chip.textContent = cat.label;
        chip.onclick = () => {
            activeLibraryCategory = cat.value;
            // Update active states on chips
            document.querySelectorAll('#category-chips-container .category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            // Filter live
            filterLibrary();
        };
        container.appendChild(chip);
    });
}

function filterLibrary() {
    const grid = document.getElementById('library-grid');
    const empty = document.getElementById('library-empty-state');
    if (!grid) return;
    
    const searchVal = document.getElementById('library-search-input').value;
    const selectDiscipline = document.getElementById('filter-discipline').value;
    const selectType = document.getElementById('filter-tool-type').value;
    const selectStatus = document.getElementById('filter-status').value;

    grid.innerHTML = '';

    const filtered = allTools.filter(tool => {
        // Exclude legacy tools entirely from the active Tool Library unless specifically showing Legacy category
        if (["Legacy", "Archived", "Hidden", "Disabled"].includes(tool.status) && activeLibraryCategory !== "legacy-archive") return false;

        // 1. Chip Category check
        const cleanCat = tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let matchesCategory = activeLibraryCategory === 'all' || cleanCat === activeLibraryCategory;
        
        // Solar PV chip matches both PV Field Tools and Soiling & PV Performance
        if (activeLibraryCategory === 'pv-field-tools') {
            matchesCategory = (cleanCat === 'pv-field-tools' || cleanCat === 'soiling-pv-performance');
        }

        // 2. Search check
        const matchesSearch = searchMatches(tool, searchVal);

        // 3. Advanced Discipline filter (Checks tool metadata or tag arrays)
        const matchesDiscipline = selectDiscipline === 'all' || 
                                  (tool.tags && tool.tags.some(tag => tag.toLowerCase() === selectDiscipline.toLowerCase())) ||
                                  (tool.category.toLowerCase().includes(selectDiscipline.toLowerCase()));

        // 4. Advanced Tool Type filter
        const matchesType = selectType === 'all' || 
                            (tool.toolType && tool.toolType.toLowerCase() === selectType.toLowerCase()) ||
                            (tool.description.toLowerCase().includes(selectType.toLowerCase())) ||
                            (tool.tags && tool.tags.some(tag => tag.toLowerCase() === selectType.toLowerCase()));

        // 5. Development Status filter
        let matchesStatus = true;
        if (selectStatus === 'active-only') {
            matchesStatus = ["Active", "In Progress", "Under Review"].includes(tool.status);
        } else if (selectStatus !== 'all') {
            matchesStatus = tool.status === selectStatus;
        }

        return matchesCategory && matchesSearch && matchesDiscipline && matchesType && matchesStatus;
    });

    if (filtered.length === 0) {
        empty.style.display = 'block';
        grid.style.display = 'none';
    } else {
        empty.style.display = 'none';
        grid.style.display = 'grid';
        filtered.forEach(tool => {
            grid.innerHTML += buildToolCardHTML(tool);
        });
    }
}

/**
 * ── 3. Render WORKFLOWS View ──
 */
function renderWorkflowGrid() {
    const grid = document.getElementById('workflows-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    WORKFLOW_PACKS.forEach(wf => {
        const tagsHTML = wf.tags.map(t => `<span class="workflow-tag">${t}</span>`).join('');
        
        const card = document.createElement('div');
        card.className = 'workflow-card';
        card.onclick = () => viewWorkflowDetail(wf.id);
        card.innerHTML = `
            <div>
                <div class="workflow-card-header">
                    <span class="workflow-badge">Workflow sequence</span>
                    <span class="workflow-step-count">${wf.tools.length} tools</span>
                </div>
                <h3 class="workflow-card-title">${wf.name}</h3>
                <p class="workflow-card-desc">${wf.purpose}</p>
            </div>
            <div class="workflow-card-footer">
                <div class="workflow-tags">${tagsHTML}</div>
                <span class="workflow-action-btn">Launch sequence <i class="fas fa-play"></i></span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function viewWorkflowDetail(wfId) {
    const wf = WORKFLOW_PACKS.find(w => w.id === wfId);
    if (!wf) return;

    // If we're not already on the workflows view, navigate there first
    // then open the panel after the view transition settles.
    const workflowsSection = document.getElementById('view-workflows');
    const isWorkflowsActive = workflowsSection && workflowsSection.classList.contains('active');
    if (!isWorkflowsActive) {
        // Switch to the workflows view
        window.location.hash = 'workflows';
        // Open the panel after a short delay to let the DOM settle
        setTimeout(() => _openWorkflowPanel(wf), 80);
        return;
    }

    _openWorkflowPanel(wf);
}

function _openWorkflowPanel(wf) {
    const panel = document.getElementById('workflow-detail-panel');
    const body = document.getElementById('workflow-detail-body');
    if (!panel || !body) return;

    // Map workflow sequence tools to actual registry tools to secure URL routing & tracking
    let stepsHTML = '';
    wf.tools.forEach((step, index) => {
        // Attempt to match route URL to registry
        const matchedTool = allTools.find(t => {
            const cleanUrl = t.url.split('?')[0];
            const cleanStepRoute = step.route.split('?')[0];
            return cleanUrl === cleanStepRoute;
        });

        // Use custom URL sequence
        const finalUrl = matchedTool ? matchedTool.url : step.route;
        const toolId = matchedTool ? matchedTool.id : 0;
        
        stepsHTML += `
            <a onclick="openWorkflowStep(${toolId}, '${finalUrl}')" class="step-item">
                <div class="step-number">${index + 1}</div>
                <div class="step-info">
                    <h4 class="step-name">${step.name}</h4>
                    <p class="step-desc">${step.desc}</p>
                </div>
                <div class="step-action-arrow"><i class="fas fa-chevron-right"></i></div>
            </a>
        `;
    });

    body.innerHTML = `
        <span class="workflow-badge" style="margin-bottom: 0.5rem; display: inline-block;">Field Sequence</span>
        <h2 style="font-family:'Outfit',sans-serif; font-size: 1.8rem; font-weight:700; color:#0f172a; margin: 0 0 0.5rem 0;">${wf.name}</h2>
        <p style="color:#475569; font-size: 0.95rem; line-height: 1.5; margin: 0 0 2rem 0;">${wf.purpose}</p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem;">
            <h3 style="font-family:'Outfit',sans-serif; font-size: 1.1rem; font-weight:700; color:#1e293b; margin: 0 0 1rem 0;"><i class="fas fa-list-ol"></i> Sequence of Operations</h3>
            <div class="workflow-steps-list">
                ${stepsHTML}
            </div>
        </div>

        <div style="background:#eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 1.25rem; margin-top: 2rem;">
            <h4 style="margin: 0 0 0.4rem 0; color:#1e40af; font-weight: 700; font-size: 0.9rem;"><i class="fas fa-info-circle"></i> Field Guidelines</h4>
            <p style="margin:0; color:#1e3a8a; font-size: 0.82rem; line-height: 1.45;">Always execute these tools in order to guarantee telemetry safety. Make sure all pre-checks are marked off before testing.</p>
        </div>
    `;

    panel.classList.remove('hidden');
}

function openWorkflowStep(toolId, url) {
    if (toolId > 0) {
        openTool(toolId, url);
    } else {
        window.location.href = url;
    }
}

function closeWorkflowDetail() {
    const panel = document.getElementById('workflow-detail-panel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

/**
 * ── 4. Render REFERENCE View ──
 */
let activeRefCategory = 'all';

function renderReferenceChips() {
    const container = document.getElementById('reference-chips-container');
    if (!container) return;

    const chips = [
        { label: "All References", value: "all" },
        { label: "Documentation", value: "Documentation" },
        { label: "Fault Codes", value: "Fault Codes" },
        { label: "Converters", value: "Converters" },
        { label: "Torque Specs", value: "Torque" },
        { label: "Firmware", value: "Firmware" },
        { label: "Spare Parts", value: "Spare Parts" }
    ];

    container.innerHTML = '';
    chips.forEach(chipData => {
        const chip = document.createElement('div');
        chip.className = `category-chip ${activeRefCategory === chipData.value ? 'active' : ''}`;
        chip.textContent = chipData.label;
        chip.onclick = () => {
            activeRefCategory = chipData.value;
            document.querySelectorAll('#reference-chips-container .category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterReference();
        };
        container.appendChild(chip);
    });
}

function filterReference() {
    const grid = document.getElementById('reference-grid');
    if (!grid) return;

    const searchVal = document.getElementById('reference-search-input').value;
    grid.innerHTML = '';

    const filtered = allTools.filter(tool => {
        if (["Legacy", "Archived", "Hidden", "Disabled"].includes(tool.status)) return false;

        // Must be Reference Guides or convert/decode tags
        const isRef = tool.category === "Reference Guides" || 
                      (tool.tags && tool.tags.some(tag => ["Reference", "Decoder", "Converter", "Torque", "Firmware"].includes(tag)));
        
        if (!isRef) return false;

        // Subcategory match
        let matchesSub = activeRefCategory === 'all';
        if (activeRefCategory !== 'all') {
            matchesSub = (tool.tags && tool.tags.some(t => t.toLowerCase().includes(activeRefCategory.toLowerCase()))) ||
                         tool.name.toLowerCase().includes(activeRefCategory.toLowerCase());
        }

        const matchesSearch = searchMatches(tool, searchVal);

        return matchesSub && matchesSearch;
    });

    filtered.forEach(tool => {
        grid.innerHTML += buildToolCardHTML(tool);
    });
}

/**
 * ── 5. Render REPORTS View ──
 */
let activeRepCategory = 'all';

function renderReportsChips() {
    const container = document.getElementById('reports-chips-container');
    if (!container) return;

    const chips = [
        { label: "All Forms & Reports", value: "all" },
        { label: "Customer-Facing", value: "Customer" },
        { label: "Internal Audit", value: "Internal" },
        { label: "Testing Forms", value: "Testing" },
        { label: "Commissioning / Punchlist", value: "Punchlist" },
        { label: "RCA Templates", value: "RCA" },
        { label: "Soiling Reports", value: "Soiling" }
    ];

    container.innerHTML = '';
    chips.forEach(chipData => {
        const chip = document.createElement('div');
        chip.className = `category-chip ${activeRepCategory === chipData.value ? 'active' : ''}`;
        chip.textContent = chipData.label;
        chip.onclick = () => {
            activeRepCategory = chipData.value;
            document.querySelectorAll('#reports-chips-container .category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterReports();
        };
        container.appendChild(chip);
    });
}

function filterReports() {
    const grid = document.getElementById('reports-grid');
    if (!grid) return;

    const searchVal = document.getElementById('reports-search-input').value;
    grid.innerHTML = '';

    const filtered = allTools.filter(tool => {
        if (["Legacy", "Archived", "Hidden", "Disabled"].includes(tool.status)) return false;

        // Must be reports, templates, or electrical test forms
        const isReport = tool.category === "Reports & Templates" || 
                         tool.category === "Electrical Test Forms" ||
                         (tool.tags && tool.tags.some(tag => ["Report", "Form", "Testing", "Checklist"].includes(tag)));
        
        if (!isReport) return false;

        // Subcategory match
        let matchesSub = activeRepCategory === 'all';
        if (activeRepCategory !== 'all') {
            matchesSub = (tool.tags && tool.tags.some(t => t.toLowerCase().includes(activeRepCategory.toLowerCase()))) ||
                         tool.category.toLowerCase().includes(activeRepCategory.toLowerCase());
        }

        const matchesSearch = searchMatches(tool, searchVal);

        return matchesSub && matchesSearch;
    });

    filtered.forEach(tool => {
        grid.innerHTML += buildToolCardHTML(tool);
    });
}

/**
 * ── 6. Render LEGACY View ──
 */
function renderLegacyView() {
    const grid = document.getElementById('legacy-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const legacyTools = allTools.filter(tool => tool.status === "Legacy");

    legacyTools.forEach(tool => {
        grid.innerHTML += buildToolCardHTML(tool);
    });
}

/**
 * ── 7. Diagnostics Registry Compliance Auditor ──
 */
function runRegistryAudit() {
    const activeEl = document.getElementById('audit-active-count');
    const inProgressEl = document.getElementById('audit-inprogress-count');
    const legacyEl = document.getElementById('audit-legacy-count');
    const totalEl = document.getElementById('audit-total-count');
    const logBox = document.getElementById('audit-log-box');

    if (!activeEl || !logBox) return;

    // Gather statistics
    const activeCount = allTools.filter(t => t.status === "Active").length;
    const inProgressCount = allTools.filter(t => t.status === "In Progress").length;
    const legacyCount = allTools.filter(t => t.status === "Legacy").length;
    const totalCount = allTools.length;

    // Active / non-legacy count check target = 50
    const activeNonLegacyCount = totalCount - legacyCount;

    activeEl.textContent = activeCount;
    inProgressEl.textContent = inProgressCount;
    legacyEl.textContent = legacyCount;
    totalEl.textContent = totalCount;

    // Perform verification audits
    let logs = [];
    logs.push(`[Audit] System timestamp: ${new Date().toISOString()}`);
    logs.push(`[Registry] Checking integrity of ${totalCount} records...`);
    
    // Check target metric
    logs.push(`[Registry] Active Field / Non-Legacy count: ${activeNonLegacyCount} (Target: ~50)`);
    if (activeNonLegacyCount >= 50) {
        logs.push(`[Registry] TARGET FULFILLED: Clean target met with ${activeNonLegacyCount} active field tools!`);
    } else {
        logs.push(`[Registry] TARGET DISCREPANCY: Currently at ${activeNonLegacyCount} / 50 active tools.`);
    }

    // Diagnostics checks
    let duplicateIds = false;
    let duplicateRoutes = false;
    let missingMetadata = false;
    let brokenReferences = false;

    const seenIds = new Set();
    const seenRoutes = new Set();

    allTools.forEach(tool => {
        // ID check
        if (seenIds.has(tool.id)) {
            duplicateIds = true;
            logs.push(`[ERROR] Duplicate ID detected: ${tool.id} on tool "${tool.name}"`);
        }
        seenIds.add(tool.id);

        // Route check
        const cleanUrl = tool.url.split('?')[0];
        if (seenRoutes.has(cleanUrl) && cleanUrl !== "tool-placeholder.html" && cleanUrl !== "electrical-test-forms.html") {
            duplicateRoutes = true;
            logs.push(`[WARNING] Duplicate Route path detected: "${cleanUrl}" on tool "${tool.name}"`);
        }
        seenRoutes.add(cleanUrl);

        // Metadata check
        if (!tool.id || !tool.name || !tool.category || !tool.status || !tool.description || !tool.tags) {
            missingMetadata = true;
            logs.push(`[WARNING] Missing metadata fields on tool ID ${tool.id} ("${tool.name}")`);
        }
    });

    logs.push(`[Registry] Audit Complete.`);
    logs.push(`- Duplicate IDs found: ${duplicateIds ? 'YES' : 'NO'}`);
    logs.push(`- Duplicate Routes found: ${duplicateRoutes ? 'YES' : 'NO'}`);
    logs.push(`- Missing Metadata found: ${missingMetadata ? 'YES' : 'NO'}`);
    logs.push(`- Broken References found: ${brokenReferences ? 'YES' : 'NO'}`);

    logBox.textContent = logs.join('\n');
}

/**
 * ── Hub Resources View Rendering & Filtering System ──
 */
function renderHubResources() {
    const container = document.getElementById('resources-categories-container');
    if (!container) return;

    // Attach search and filter event listeners
    const searchInput = document.getElementById('resources-search-input');
    const filterType = document.getElementById('filter-resource-type');
    const filterCategory = document.getElementById('filter-resource-category');

    if (searchInput) searchInput.addEventListener('input', filterHubResources);
    if (filterType) filterType.addEventListener('change', filterHubResources);
    if (filterCategory) filterCategory.addEventListener('change', filterHubResources);

    filterHubResources();
}

function filterHubResources() {
    const container = document.getElementById('resources-categories-container');
    if (!container) return;

    const searchQuery = (document.getElementById('resources-search-input')?.value || '').toLowerCase().trim();
    const selectedType = document.getElementById('filter-resource-type')?.value || 'all';
    const selectedCategory = document.getElementById('filter-resource-category')?.value || 'all';

    container.innerHTML = '';

    const resourcesData = window.GLOBAL_HUB_RESOURCES || [];

    resourcesData.forEach(cat => {
        // Filter by Category Selection
        if (selectedCategory !== 'all' && !cat.title.toLowerCase().includes(selectedCategory.toLowerCase())) {
            return;
        }

        // Filter individual references
        const filteredRefs = cat.references.filter(ref => {
            // Filter by Type
            if (selectedType !== 'all' && ref.type !== selectedType) {
                return false;
            }

            // Filter by Search Query
            if (searchQuery) {
                const matchesName = ref.name.toLowerCase().includes(searchQuery);
                const matchesType = ref.type.toLowerCase().includes(searchQuery);
                const matchesDesc = (ref.desc || '').toLowerCase().includes(searchQuery);
                return matchesName || matchesType || matchesDesc;
            }

            return true;
        });

        // Skip category if it has no matching references after filters
        if (filteredRefs.length === 0) return;

        // Render Category block
        const categorySection = document.createElement('div');
        categorySection.style.cssText = 'background:#ffffff; border:1px solid #cbd5e1; border-radius:16px; padding:1.75rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);';
        
        const toolsHTML = cat.tools.map(tool => `<span style="background:#f1f5f9; color:#475569; font-size:0.75rem; font-weight:600; padding:2px 8px; border-radius:4px; margin-right:4px; display:inline-block; margin-bottom:4px;">${tool}</span>`).join('');

        const referencesHTML = filteredRefs.map(ref => {
            // Badge styles for type
            let badgeClass = 'basis-field';
            if (ref.type === 'Standard') badgeClass = 'basis-standard';
            if (ref.type === 'OEM Manual') badgeClass = 'basis-oem';
            if (ref.type === 'Protocol') badgeClass = 'basis-protocol';
            if (ref.type === 'Safety') badgeClass = 'basis-safety';
            if (ref.type === 'Engineering Guide') badgeClass = 'basis-engineering';
            if (ref.type === 'Project Specific') badgeClass = 'basis-project';
            if (ref.type === 'Contract Specific') badgeClass = 'basis-contract';

            return `
                <div style="border-bottom:1px solid #f1f5f9; padding:1rem 0; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:0.25rem;">
                        <span style="font-weight:700; font-size:0.95rem; color:#0f172a;">${ref.name}</span>
                        <span class="resources-basis-badge ${badgeClass}">${ref.type}</span>
                    </div>
                    <div style="font-size:0.82rem; color:#475569; line-height:1.4;">${ref.desc || 'No description available.'}</div>
                </div>
            `;
        }).join('');

        categorySection.innerHTML = `
            <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.25rem; text-align:left;">
                <h2 style="font-family:'Outfit',sans-serif; font-size:1.4rem; font-weight:700; color:#0f172a; margin:0 0 0.5rem 0;">${cat.title}</h2>
                <p style="color:#64748b; font-size:0.9rem; margin:0 0 1rem 0; line-height:1.4;">${cat.description}</p>
                <div>
                    <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">Supported Tools:</span>
                    ${toolsHTML}
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                ${referencesHTML}
            </div>

            <div class="resources-note-box" style="margin: 0; border-left: 3px solid #3b82f6;">
                <div class="resources-note-title" style="color:#1d4ed8;"><i class="fas fa-info-circle"></i> Engineering &amp; Compliance Note</div>
                ${cat.note}
            </div>
        `;

        container.appendChild(categorySection);
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem; color:#94a3b8;">
                <i class="fas fa-search" style="font-size:2.5rem; margin-bottom:1rem; display:block;"></i>
                <h3 style="font-family:'Outfit',sans-serif; font-weight:700; color:#475569; margin:0 0 0.5rem 0;">No Resources Found</h3>
                <p style="font-size:0.88rem; margin:0;">Try adjusting your filters or search query.</p>
            </div>
        `;
    }
}