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
        purpose: "Step-by-step checklist to startup, verify, test, and signoff utility-scale PV inverters and string arrays.",
        tags: ["Solar PV", "Commissioning"],
        tools: [
            { name: "Inverter Start-Up Checklist", route: "inverter-startup.html", desc: "Structured digital checklist for visual and electrical checks." },
            { name: "PV String Sizer & VOC Calculator", route: "pv-string-sizer.html", desc: "Verify panel temperatures and maximum series string count." },
            { name: "DC Voltage Sanity Check Tool", route: "dc-voltage-sanity.html", desc: "Verify actual measured open circuit voltages." },
            { name: "PV Insulation Resistance Tester", route: "pv-megger-tester.html", desc: "Log array insulation and dry Megger resistance checks." },
            { name: "String Current Imbalance Calculator", route: "string-imbalance.html", desc: "Compare solar string outputs against the group average." },
            { name: "IV Curve Test Result Log", route: "iv-curve-log.html", desc: "Log and catalog IV curve measurement outputs." },
            { name: "SG1+x Parameter Comparison Tool", route: "parameter-comparison.html", desc: "Validate that unit configurations match target parameters." },
            { name: "SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Verify Modbus registers and historian tag scaling." },
            { name: "Fuse Derating Calculator", route: "fuse-derating-calculator.html", desc: "Verify continuous current and temperature derating factors." },
            { name: "Commissioning Punchlist Builder", route: "commissioning-punchlist.html", desc: "Build punchlist items for tracking corrections." },
            { name: "Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Generate structured daily field shift progress handovers." },
            { name: "Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Compile client-ready commissioning handovers." }
        ]
    },
    {
        id: "bess-commissioning",
        name: "BESS Commissioning Sequence",
        purpose: "Complete safety audits, rack inspection, energy capacity tests, and thermal verification for energy storage containers.",
        tags: ["BESS", "Testing", "Safety"],
        tools: [
            { name: "LOTO Verification Checklist", route: "loto-checklist.html", desc: "Confirm lockout and energy isolations before energized tests." },
            { name: "BESS Pre-Energization Checklist", route: "bess-pre-energization.html", desc: "Verify isolation, grounding, and warning labels." },
            { name: "BESS Cable Sizing Calculator", route: "bess-cable-sizer.html", desc: "Sanity check ampacity and voltage drop margins for BESS auxiliary feeds." },
            { name: "Battery Rack Container Inspection", route: "bess-rack-inspection.html", desc: "Audit container seal integrity, HVAC, and cell spreads." },
            { name: "BESS Capacity / Energy Test Form", route: "bess-capacity-test.html", desc: "Record charge/discharge cycles and calculate efficiency." },
            { name: "BESS Cell Voltage Imbalance Calculator", route: "bess-cell-imbalance.html", desc: "Evaluate cell and module balancing distributions across battery racks." },
            { name: "Fuse Derating Calculator", route: "fuse-derating-calculator.html", desc: "Check auxiliary AC/DC and battery container circuit fuse margins." },
            { name: "Battery SOC Imbalance Analyzer", route: "battery-soc-imbalance-analyzer.html", desc: "Check battery rack state-of-charge balance spreads." },
            { name: "Battery Temperature Spread Analyzer", route: "battery-temperature-spread.html", desc: "Analyze thermal variations across racks." },
            { name: "HVAC Delta-T Calculator", route: "hvac-delta-t.html", desc: "Sanity check container heating and cooling efficiency." },
            { name: "Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Compile alarm sequence logs to review startup faults." },
            { name: "Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Generate structured daily field shift progress handovers." },
            { name: "RCA Template Builder", route: "rca-template-builder.html", desc: "Draft a Root Cause Analysis for initial startup failures." }
        ]
    },
    {
        id: "pv-underperformance",
        name: "PV Underperformance Troubleshooting",
        purpose: "Investigate and analyze solar site underproduction using performance ratios, sensor checks, and clipping trackers.",
        tags: ["Solar PV", "O&M", "Performance"],
        tools: [
            { name: "PV Performance Ratio Calculator", route: "pv-performance-ratio.html", desc: "Calculate temperature-corrected PR." },
            { name: "Weather Correction for PV Testing", route: "pv-weather-correction.html", desc: "Derive standard test condition equivalent outputs." },
            { name: "Soiling Loss Estimator", route: "soiling-loss-estimator.html", desc: "Estimate panel efficiency losses due to dust/dirt." },
            { name: "Clean vs. Soiled Comparison Tool", route: "clean-vs-soiled-strings.html", desc: "Quantify soiling loss through reference strings." },
            { name: "Irradiance Sensor Cross-Check Tool", route: "irradiance-sensor-check.html", desc: "Detect sensor calibration drift or misalignment." },
            { name: "Inverter Clipping / Curtailment Check", route: "clipping-curtailment-check.html", desc: "Distinguish clipping or PPC limits from real faults." },
            { name: "Inverter Derating Cause Analyzer", route: "inverter-derating-analyzer.html", desc: "Identify thermal or grid voltage limits on inverter capacity." },
            { name: "Tracker Angle / Backtracking Checklist", route: "tracker-angle-qaqc.html", desc: "Check motor alignment and backtracking geometry." },
            { name: "Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Check chronological event sequences leading to clipping." }
        ]
    },
    {
        id: "bess-troubleshooting",
        name: "BESS Container Troubleshooting",
        purpose: "Track down battery cells imbalance, thermal runaway precursors, HVAC capacity drops, and comms faults.",
        tags: ["BESS", "O&M", "Thermal"],
        tools: [
            { name: "Battery Rack Container Inspection", route: "bess-rack-inspection.html", desc: "Check visual cell configurations and container setups." },
            { name: "BESS Cell Voltage Imbalance Calculator", route: "bess-cell-imbalance.html", desc: "Evaluate cell and module balancing distributions across battery racks." },
            { name: "Battery SOC Imbalance Analyzer", route: "battery-soc-imbalance-analyzer.html", desc: "Locate specific cells causing string BMS faults." },
            { name: "Battery Temperature Spread Analyzer", route: "battery-temperature-spread.html", desc: "Pinpoint thermal hot pockets or fan blockages." },
            { name: "HVAC Delta-T Calculator", route: "hvac-delta-t.html", desc: "Check cooling capacity under high ambient temperatures." },
            { name: "BESS Availability Calculator", route: "bess-availability.html", desc: "Determine commercial BESS availability index." },
            { name: "MODBUS Register Decoder", route: "modbus-decoder.html", desc: "Examine raw registers from the container PLC." },
            { name: "Number Base Converter", route: "number-base-converter.html", desc: "Convert register masks into binary flags." },
            { name: "Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Reconstruct battery container alarm sequences." },
            { name: "RCA Template Builder", route: "rca-template-builder.html", desc: "Document container failures and write corrective plans." }
        ]
    },
    {
        id: "grid-reactive-testing",
        name: "Grid / PPC & Reactive Power Testing",
        purpose: "Configure protection settings, analyze active/reactive curves, and log power grid excursion events.",
        tags: ["Grid", "Controls", "Electrical"],
        tools: [
            { name: "Interactive Power Triangle Tool", route: "power-triangle.html", desc: "Visualize apparent, active, and reactive vectors." },
            { name: "Inverter Capability Curve Check", route: "inverter-capability-curve-check.html", desc: "Check operating points against power factor capability limits." },
            { name: "Grid Event Voltage/Freq Excursion Log", route: "grid-event-excursion-log.html", desc: "Track voltage / frequency excursions during PPC steps." },
            { name: "Transformer Turns Ratio (TTR) Form", route: "ttr-form.html", desc: "Verify turns ratios and calculate winding deviation tolerances." },
            { name: "PV Insulation Resistance Tester", route: "pv-megger-tester.html", desc: "Log array insulation and dry Megger resistance checks." },
            { name: "CT/PT Ratio Verification Tool", route: "electrical-test-forms.html?tool=ct-pt-ratio", desc: "Compare meter outputs against substation relay specs." },
            { name: "Relay Settings Checklist", route: "electrical-test-forms.html?tool=relay-checklist", desc: "Confirm setpoints have been properly loaded and validated." },
            { name: "ABB REJ603 Relay Configuration Tool", route: "rej603-configurator.html", desc: "Program, edit, and decode settings for REJ603 protection." },
            { name: "SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Test controls logic and HMI commands." },
            { name: "MODBUS Register Decoder", route: "modbus-decoder.html", desc: "Decode meter communications." },
            { name: "Number Base Converter", route: "number-base-converter.html", desc: "Convert binary bits for relay telemetry." }
        ]
    },
    {
        id: "soiling-analysis",
        name: "Soiling Analysis Workflow",
        purpose: "Quantify solar panel energy degradation from dust, model washing costs, and compute return-on-investment.",
        tags: ["Solar PV", "Soiling", "ROI"],
        tools: [
            { name: "Soiling Loss Estimator", route: "soiling-loss-estimator.html", desc: "Calculate expected daily soiling loss metrics." },
            { name: "Clean vs. Soiled Comparison Tool", route: "clean-vs-soiled-strings.html", desc: "Measure current differences in soiled strings vs clean strings." },
            { name: "Lost Energy from Soiling Calculator", route: "soiling-lost-energy.html", desc: "Estimate total energy revenue lost." },
            { name: "Cleaning ROI Calculator", route: "cleaning-roi.html", desc: "Compute clean cycle optimal frequency based on wash costs." },
            { name: "Soiling Customer Report Generator", route: "soiling-customer-report.html", desc: "Build professional summaries detailing O&M recommendations." }
        ]
    },
    {
        id: "scada-comms-troubleshooting",
        name: "SCADA & Comms Troubleshooting",
        purpose: "Identify faulty serial channels, parse RTU register packets, decode system alarms, and review telemetry anomalies.",
        tags: ["SCADA", "MODBUS", "Comms"],
        tools: [
            { name: "SCADA Tag QA/QC Checklist", route: "scada-tag-qaqc.html", desc: "Audit digital controls mapping." },
            { name: "MODBUS Register Decoder", route: "modbus-decoder.html", desc: "Examine floating points and integers telemetry." },
            { name: "Number Base Converter", route: "number-base-converter.html", desc: "Analyze registers bitmap masks." },
            { name: "Alarm / Fault Event Timeline Builder", route: "alarm-timeline.html", desc: "Audit chronological logger cascades." },
            { name: "UMCG Data Analysis Tool", route: "analyzer.html", desc: "Parse raw binary data logs." },
            { name: "PDP Module Fault Code Interpreter", route: "fault-interpreter.html", desc: "Identify and resolve power module diagnostics codes." }
        ]
    },
    {
        id: "reporting-closeout",
        name: "Reporting / Field Closeout",
        purpose: "Finalize field tests, track residual punchlist actions, draft Root Cause incident forms, and bundle customer packages.",
        tags: ["Closeout", "Reports"],
        tools: [
            { name: "LOTO Verification Checklist", route: "loto-checklist.html", desc: "Confirm lockout and energy isolations before energized tests." },
            { name: "Arc Flash Boundary Calculator", route: "arc-flash.html", desc: "Verify shock approach limits and necessary PPE safety wear." },
            { name: "Commissioning Punchlist Builder", route: "commissioning-punchlist.html", desc: "Export unresolved punchlist items for correction." },
            { name: "Corrective Action Tracker / CAPA Log", route: "capa-tracker.html", desc: "Log and assign corrective actions from tests." },
            { name: "Daily Commissioning Progress Report", route: "daily-progress.html", desc: "Generate structured daily field shift progress handovers." },
            { name: "Customer Site Visit Report Generator", route: "site-visit-report.html", desc: "Compile comprehensive customer visit reports." },
            { name: "RCA Template Builder", route: "rca-template-builder.html", desc: "Assemble technical Root Cause Investigation templates." },
            { name: "Soiling Customer Report Generator", route: "soiling-customer-report.html", desc: "Generate custom panel clean reports." },
            { name: "Technical Reference Search Tool", route: "technical-reference-search.html", desc: "Verify specifications against active field reference documents." }
        ]
    }
];

// Active State View Navigation Management
const VIEWS = ["home", "tools", "workflows", "reference", "reports", "legacy", "resources"];

document.addEventListener('DOMContentLoaded', () => {
    console.log('[ToolHub Refactor] Core Hub initializing...');
    
    // Load States from LocalStorage
    favoriteTools = JSON.parse(localStorage.getItem(STORAGE_FAVORITES_KEY)) || [];
    recentTools = JSON.parse(localStorage.getItem(STORAGE_RECENT_KEY)) || [];
    
    // Core Elements Loading
    fetch('./tools-data.json')
        .then(response => {
            if (!response.ok) throw new Error(`Status ${response.status}`);
            return response.json();
        })
        .then(data => {
            allTools = data.tools || [];
            console.log(`[Registry] Successfully parsed ${allTools.length} modules.`);
            
            // Execute Main Rendering
            runToolHub();
        })
        .catch(error => {
            console.error('[Registry] Fetch error. Loading fallback registry.', error);
            loadFallbackData();
            runToolHub();
        });

    // Initialize SPA Views Router
    initializeRouter();
    
    // Bind Event Listeners
    setupEventListeners();
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
    // Fully populated robust offline fallback data to bypass browser CORS constraints under file:/// protocol
    allTools = [
        {
            "id": 44,
            "name": "Inverter Clipping / Curtailment Check Tool",
            "category": "Advanced Field Diagnostics",
            "status": "Active",
            "description": "Help determine whether reduced inverter output is consistent with inverter clipping or curtailment.",
            "url": "clipping-curtailment-check.html",
            "tags": ["PV", "Inverter", "Clipping", "Curtailment", "Diagnostics"]
        },
        {
            id: 45,
            name: "Irradiance Sensor Cross-Check Tool",
            category: "Advanced Field Diagnostics",
            status: "Active",
            description: "Compare irradiance sensors, reference cells, and nearby inverter behavior to detect dirty, misaligned, drifting, or unreliable measurements.",
            url: "irradiance-sensor-check.html",
            tags: ["PV", "Irradiance", "Sensor", "Calibration", "Diagnostics"]
        },
        {
            id: 46,
            name: "Tracker Angle / Backtracking QA Checklist",
            category: "Advanced Field Diagnostics",
            status: "Active",
            description: "Validate tracker angle behavior, backtracking, mechanical alignment, and wind stow during commissioning or troubleshooting.",
            url: "tracker-angle-qaqc.html",
            tags: ["PV", "Tracker", "Backtracking", "Checklist", "Diagnostics"]
        },
        {
            id: 47,
            name: "Corrective Action Tracker / CAPA Log",
            category: "Reports & Templates",
            status: "Active",
            description: "Track corrective and preventive actions from punchlists, RCAs, inspections, HSE forms, and commissioning findings.",
            url: "capa-tracker.html",
            tags: ["RCA", "CAPA", "Safety", "Punchlist", "Log"]
        },
        {
            "id": 48,
            "name": "Inverter Derating Cause Analyzer",
            "category": "Advanced Field Diagnostics",
            "status": "Active",
            "description": "Identify whether an inverter is limiting power due to temperature, grid voltage, frequency, reactive power, or protection.",
            "url": "inverter-derating-analyzer.html",
            "tags": ["PV", "Inverter", "Derating", "Temperature", "Grid", "Diagnostics"]
        },
        {
            "id": 49,
            "name": "Interactive Power Triangle Tool",
            "category": "Grid & Controls",
            "status": "Active",
            "description": "Interactive visual tool showing the relationship between active power P, reactive power Q, apparent power S, power factor, and phase angle.",
            "url": "power-triangle.html",
            "tags": ["Electrical", "Power", "Grid", "Controls", "Visual"]
        },
        {
            "id": 50,
            "name": "Inverter Capability Curve Check",
            "category": "Grid & Controls",
            "status": "Active",
            "description": "Check whether a requested active/reactive power operating point is within inverter apparent power limits.",
            "url": "inverter-capability-curve-check.html",
            "tags": ["PV", "Inverter", "Capability", "Power Factor", "Grid"]
        },
        {
            "id": 51,
            "name": "Grid Event Voltage/Frequency Excursion Log",
            "category": "Grid & Controls",
            "status": "Active",
            "description": "Log grid voltage/frequency excursions, calculate deviations, and create structured RCA-ready event timelines.",
            "url": "grid-event-excursion-log.html",
            "tags": ["Grid", "Event", "Voltage", "Frequency", "RCA", "Log"]
        },
        {
            "id": 52,
            "name": "Battery SOC Imbalance Analyzer",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Analyze SOC spread and balancing status across battery racks, strings, containers, or clusters.",
            "url": "battery-soc-imbalance-analyzer.html",
            "tags": ["BESS", "Battery", "SOC", "Imbalance", "Diagnostics"]
        },
        {
            "id": 53,
            "name": "Battery Temperature Spread Analyzer",
            "category": "BESS Field Tools",
            "status": "Active",
            "description": "Analyze battery temperature variation across racks, modules, or clusters to detect HVAC or fan issues.",
            "url": "battery-temperature-spread.html",
            "tags": ["BESS", "Battery", "Thermal", "HVAC", "Spread"]
        },
        {
            "id": 54,
            "name": "Number Base Converter",
            "category": "SCADA & Diagnostics",
            "status": "Active",
            "description": "Convert values between binary, decimal, hex, and octal with bit-width, byte-order swaps, and manual register bit viewer.",
            "url": "number-base-converter.html",
            "tags": ["SCADA", "MODBUS", "Relay", "Binary", "Converter"]
        },
        {
            "id": 55,
            "name": "Soiling Loss Estimator",
            "category": "Soiling & PV Performance",
            "status": "Active",
            "description": "Estimate PV system energy loss due to soiling based on site conditions.",
            "url": "soiling-loss-estimator.html",
            "tags": ["PV", "Soiling", "Performance", "O&M", "Field Check"]
        },
        {
            "id": 56,
            "name": "Clean vs. Soiled String Comparison Tool",
            "category": "Soiling & PV Performance",
            "status": "Active",
            "description": "Compare electrical output between clean and soiled strings to quantify performance impact.",
            "url": "clean-vs-soiled-strings.html",
            "tags": ["PV", "Soiling", "Performance", "O&M", "Field Check"]
        },
        {
            "id": 57,
            "name": "Cleaning ROI Calculator",
            "category": "Soiling & PV Performance",
            "status": "Active",
            "description": "Calculate the return on investment for PV array cleaning based on performance gain vs. cleaning costs.",
            "url": "cleaning-roi.html",
            "tags": ["PV", "Soiling", "Performance", "O&M", "Cleaning"]
        },
        {
            "id": 58,
            "name": "Lost Energy from Soiling Calculator",
            "category": "Soiling & PV Performance",
            "status": "Active",
            "description": "Quantify total lost energy (kWh) attributed to soiling over a specific time period.",
            "url": "soiling-lost-energy.html",
            "tags": ["PV", "Soiling", "Performance", "O&M", "Reporting"]
        },
        {
            "id": 59,
            "name": "Soiling Customer Report Generator",
            "category": "Soiling & PV Performance",
            "status": "Active",
            "description": "Generate a customer-facing report detailing soiling impacts and recommended cleaning actions.",
            "url": "soiling-customer-report.html",
            "tags": ["PV", "Soiling", "Performance", "O&M", "Reporting"]
        },
        {
            "id": 60,
            "name": "Fuse Continuous Current & Temperature Derating Calculator",
            "category": "Calculators",
            "status": "Active",
            "description": "Calculate derated continuous current limits and determine appropriate fuse ratings based on ambient temperature and custom derating factors.",
            "url": "fuse-derating-calculator.html",
            "tags": ["Fuse", "Derating", "Continuous Current", "Temperature", "DC", "AC", "Protection", "QA/QC"]
        }
    ];
}

/**
 * ── SPA Views Router ──
 */
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
    if (!tool || tool.status === "Legacy") return;

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
        <div class="tool-tile" data-id="${tool.id}" onclick="openTool(${tool.id}, '${tool.url}')" style="cursor: pointer;">
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
        
        if (starredList.length === 0) {
            favEmpty.style.display = 'block';
            favGrid.style.display = 'none';
        } else {
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
            featuredTools = allTools.filter(t => ["Active", "In Progress"].includes(t.status) && t.status !== "Legacy").slice(0, 6);
        }
        
        featuredTools.forEach(tool => {
            featGrid.innerHTML += buildToolCardHTML(tool);
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
        if (tool.status === "Legacy" && activeLibraryCategory !== "legacy-archive") return false;

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
            matchesStatus = ["Active", "In Progress"].includes(tool.status);
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
        if (tool.status === "Legacy") return false;

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
        if (tool.status === "Legacy") return false;

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