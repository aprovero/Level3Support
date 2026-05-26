# Level3Support ToolHub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Platform](https://img.shields.io/badge/Platform-Mobile--First%20Web-blueviolet.svg)](#)

Welcome to the **Level3Support ToolHub** repository. This is a centralized, mobile-first web application designed specifically for field engineers, commissioning technicians, and safety managers working on utility-scale Solar PV, Battery Energy Storage Systems (BESS), SCADA, and electrical infrastructure.

The ToolHub brings together advanced engineering calculators, standard testing forms, diagnostic decoders, reporting templates, and health, safety, and environment (HSE) forms into a cohesive, high-performance, and visually premium field toolkit.

---

## 🌟 Features & Design Philosophy

- **Mobile-First Responsive Design**: Optimized specifically for field environments, smartphones, and tablets under high-glare or low-connectivity conditions.
- **Visual Excellence**: Built with modern typography, custom HSL-tailored color palettes, sleek dark modes, and subtle micro-animations that deliver a premium, responsive, and tactile feel.
- **Central Tool Registry**: Dynamic search, tag filtering (by Category, Status, and Discipline), and intuitive quick-launch dashboard.
- **Universal Safety Guardrails**: Built-in professional-use disclaimers, clear engineering assumptions, and validation bounds on every tool to ensure field safety.
- **Offline Readiness & Portability**: Vanilla CSS and clean JS logic with robust data import/export (JSON/CSV) for reliable standalone field operation.

---

## 🛠️ Tool Registry & Architecture

The ToolHub organizes field utilities into distinct functional categories:

### 1. ☀️ Solar PV Field Tools
Calculators and commissioning checksheets to verify DC and AC health:
*   **String Current Imbalance Calculator**: Analyzes multi-string string inputs to detect shading, soilage, or blown fuses.
*   **DC Voltage Sanity Check Tool**: Checks open-circuit and operating voltage limits under varying ambient temperatures.
*   **Inverter Start-Up Checklist**: Dynamic step-by-step checklist verifying pre-energization, DC input, AC synchronization, and cool-down states.
*   **IV Curve Test Result Log**: Records, plots, and validates IV trace measurements against manufacturer STC specifications.
*   **Firmware Version Tracker**: Tracks inverter, tracker controller, and meteorology station firmware versions.

### 2. 🔋 BESS Field Tools
Battery Energy Storage Systems diagnostic and safety checklists:
*   **BESS Capacity / Energy Test Form**: Calculates round-trip efficiency (RTE) and actual vs. nameplate discharge capacity.
*   **Battery Rack / Container Inspection**: Visual and thermal checklist covering HVAC status, gas detection, rack torque, and battery cell health.
*   **BESS Pre-Energization Checklist**: Comprehensive checklist covering insulation resistance, ground faults, E-stop loops, and fire suppression systems.
*   **Spare Parts Cross-Reference**: Fast field lookup of vendor part numbers, cell module configurations, and localized warehouse stock.

### 3. ⚡ Electrical Testing Forms
Standardized field testing documents matching NETA/IEEE requirements:
*   **Insulation Resistance Test Form**: Calculates Polarization Index (PI) and Dielectric Absorption Ratio (DAR) for cables, motors, and transformers.
*   **Transformer Test Results**: Records winding resistance, turns ratio (TTR), excitation current, and oil insulation breakdown.
*   **Grounding Continuity Test**: Logs earth resistance grid measurements, soil resistivity (Wenner method), and ground loop continuity.
*   **CT/PT Ratio Verification**: Compares primary/secondary currents/voltages to verify polarity, excitation, and ratio errors.
*   **Relay Settings Checklist**: Digital sign-off sheet to verify protective relay parameter values against utility coordination studies.

### 4. 🖥️ SCADA & Diagnostics
Communication network verification and device register decoding:
*   **SCADA Tag QA/QC Checklist**: Real-time signal validation checklist comparing field sensor values to HMI displays.
*   **MODBUS Register Decoder**: Decodes raw Hex/Decimal inputs into float, signed integer, and scale-factored values on the fly.
*   **Alarm/Fault Event Timeline**: Aggregates raw text logs from multiple devices into a unified, chronological, color-coded fault timeline.
*   **UMCG Data Analysis Tool**: Advanced analytical tool for debugging and profiling Power Plant Controller (PPC) and grid regulation performance.
*   **Module/Fan Fault Code Interpreter**: Decodes manufacturer-specific hex codes into plain-language diagnostic actions.

### 5. 📋 HSE Forms & Reporting
Templates, site coordination sheets, and critical safety procedures:
*   **Safety Pre-Task Plan / JHA Form**: Creates Job Hazard Analysis sheets and site-specific risk mitigation checklists.
*   **LOTO Checklist Generator**: Builds step-by-step lockout-tagout energy isolation procedures and permits.
*   **Torque Spec Finder**: Quick lookup for electrical lug and mechanical bolt torque values based on bolt size, grade, and lubrication.
*   **Commissioning Punchlist Builder**: Generates field punchlists categorized by priority (Category A - Blocking, Category B - Minor, etc.) with automatic email export.
*   **Customer Site Visit Report**: Rapidly compiles daily field activities, progress photos, delays, and sign-offs into exportable reports.
*   **RCA Template Builder**: Guides technicians through the 5-Whys methodology to perform immediate Root Cause Analysis on failures.

### 6. 📁 Legacy / Archive Section
Maintains backwards compatibility for existing Level3Support utilities:
*   **Technical Documentation Database**
*   **Training Catalog & Evaluation Forms**
*   **Level3Support Request Form**

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm/npx
- Modern web browser (Chrome, Edge, Firefox, or Safari)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/Level3Support.git
   cd Level3Support
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📐 Technology Stack & Project Structure

The project utilizes a modern frontend architecture focused on absolute speed, reliability, and ease of deployment:
*   **Core**: HTML5, Vanilla JavaScript (ES6 Modules)
*   **Styling**: Pure CSS (using custom variables for themes, responsive layouts, and animations)
*   **Development & Bundling**: Vite (for lightning-fast Hot Module Replacement)
*   **Deployment**: Static hosting ready (GitHub Pages, Vercel, Netlify)

---

## 🔒 Safety & Professional Use Disclaimer

> [!IMPORTANT]
> The engineering calculators and procedures within this ToolHub are designed for use by qualified personnel only. Every tool contains explicit **Assumptions** and **Input Validation Bounds**. Always cross-reference results with manufacturer documentation and site-specific engineering designs before executing switching plans, energizing equipment, or applying torques.

---

## 🤝 Contributing

We welcome contributions from field engineers, developers, and safety coordinators!
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
