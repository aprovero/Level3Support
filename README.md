# Level3Support ToolHub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Platform](https://img.shields.io/badge/Platform-Mobile--First%20Web-blueviolet.svg)](#)

Welcome to the **Level3Support ToolHub** repository. This is a centralized, mobile-first, offline-capable field engineering and commissioning suite built specifically for technicians, site supervisors, and safety leads in utility-scale **Solar PV**, **Battery Energy Storage Systems (BESS)**, **SCADA**, and **Electrical Power Infrastructure**.

ToolHub brings together calculation engines, interactive diagrams, diagnostic decoders, compliance checklists, dynamic report generators, and HSE plans into a responsive, cohesive web application that fits in your pocket and runs reliably in the field.

---

## 🌟 Core Features & Design Philosophy

-   📱 **Mobile-First Responsive Design**: Tailored layout structures that remain highly readable and easy to navigate on smartphones and tablets under harsh outdoor glares or remote site environments.
-   🎨 **Visual Excellence & High-End Aesthetics**: Implements curated HSL-tailored color palettes, seamless dark/light modes, premium typography, and subtle micro-animations for an interactive and high-end enterprise utility experience.
-   🔍 **Dynamic Global Tool Registry**: Featuring instantaneous fuzzy search, filter tags (by Discipline, Category, and Project Phase), and a personalized bookmarks dashboard to immediately launch tools.
-   ⚠️ **Standardized Engineering Assumptions & Validation**: Built-in safety warnings, real-time input validation limits, and visible boundary check alerts on calculations.
-   🔌 **PWA & Offline Portability**: Features standard service worker integration for complete offline availability in remote environments with zero network signals.
-   📥 **Robust Local Data Management**: Complete client-side JSON/CSV data import, export, and printer-friendly PDF formatting templates without requiring server-side storage.

---

## 🛠️ Complete Tool Suite Directory

The ToolHub features a highly diversified, production-ready set of field utilities organized by categories:

### 1. ☀️ Solar PV Field Tools
Commissioning checksheets and measurement trackers to verify array health:
*   **[String Current Imbalance Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/string-imbalance.html)**: Flags outlier solar string current deviations against live average thresholds to pinpoint shading, soilage, or blown inline fuses.
*   **[DC Voltage Sanity Check Tool](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/dc-voltage-sanity.html)**: Verifies if measured string voltage aligns with module specs, string size, and live temperature-corrected Voc/Vmp parameters.
*   **[Inverter Start-Up Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/inverter-startup.html)**: Structured digital commissioning checks covering pre-energization, DC insulation, auxiliary checks, communications, and power-up phases.
*   **[IV Curve Test Result Log](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/iv-curve-log.html)**: Standardized field logs to record, categorize, and export IV curve measurements with instant defect tagging (e.g., bypass diode failure, soilage, mismatch).
*   **[Firmware Version Tracker](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/firmware-tracker.html)**: Tracks, reviews, and logs firmware statuses across field controllers, inverters, and met-stations with auto-derived update recommendations.

### 2. 🔋 BESS Field Tools
Battery Storage performance diagnostics, thermal profiles, and safety checklists:
*   **[BESS Capacity / Energy Test Form](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/bess-capacity-test.html)**: Logs battery energy discharge tests to calculate round-trip efficiency (RTE), capacity margins, and nameplate degradation.
*   **[Battery Rack / Container Inspection Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/bess-rack-inspection.html)**: Digital inspection logs covering cell torque, HVAC health, gas detection systems, enclosure integrity, and electrical safety.
*   **[BESS Pre-Energization Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/bess-pre-energization.html)**: Comprehensive quality gates verifying grounding paths, insulation resistance, coolant levels, fire suppression loops, and E-stops.
*   **[Spare Parts Cross-Reference](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/bess-spare-parts.html)**: Field lookup directory for safety gear, electrical components, and battery module variants with localized warehouse tracking.
*   **[Battery SOC Imbalance Analyzer](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/battery-soc-imbalance-analyzer.html)**: Visualizes and flags State-of-Charge (SOC) imbalances and cell dispersion outliers across BESS racks and blocks.
*   **[Battery Temperature Spread Analyzer](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/battery-temperature-spread.html)**: Maps cell thermal variances across battery containers to detect fan anomalies, unbalanced racks, or localized HVAC failures.

### 3. ⚡ Electrical Testing Forms
Standardized digital testing forms built to comply with NETA, IEEE, and NFPA protocols:
*   **[Insulation Resistance Test Form](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/electrical-test-forms.html?tool=insulation-resistance)**: Logs insulation megger values, and automatically computes Polarization Index (PI) and Dielectric Absorption Ratio (DAR).
*   **[Transformer Test Results Form](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/electrical-test-forms.html?tool=transformer-test)**: Aggregates transformer health records, covering winding resistance, winding insulation, turns ratio (TTR), and oil tests.
*   **[Grounding Continuity Test Form](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/electrical-test-forms.html?tool=grounding-continuity)**: Tracks earth grid resistance tests, Wenner soil resistivity metrics, and localized bonding paths.
*   **[CT/PT Ratio Verification Tool](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/electrical-test-forms.html?tool=ct-pt-ratio)**: Verifies current/potential transformer ratios, phase polarity, excitation curves, and ratio errors.
*   **[Relay Settings Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/electrical-test-forms.html?tool=relay-checklist)**: Quality checklist to verify relay model parameters, curves, and settings groups match coordinated engineering studies.

### 4. 🧮 Advanced Engineering Calculators
High-precision math engines solving daily field equations:
*   **[PV Performance Ratio Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/pv-performance-ratio.html)**: Computes active plant Performance Ratio (PR) with optional temperature corrections to assess performance against design forecasts.
*   **[Cable Ampacity & Temperature Derating](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/cable-ampacity.html)**: Standard cable sizing checks reflecting insulation grades, layout styles, conduit configurations, and ambient heat deratings.
*   **[Voltage Drop Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/voltage-drop.html)**: Supports rapid calculations of conductor voltage drops and power losses for DC, single-phase AC, and three-phase AC runs.
*   **[BESS Availability Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/bess-availability.html)**: Standardizes contractual uptime, tracking simple availability and energy-adjusted availability indexes over billing cycles.
*   **[HVAC Delta-T Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/hvac-delta-t.html)**: Compares cooling and heating supply/return splits against ambient benchmarks to diagnose HVAC degradation.
*   **[Weather Correction Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/pv-weather-correction.html)**: Translates open-air PV power measurements directly to Standard Test Conditions (STC) using live plane-of-array (POA) irradiance.
*   **[Fuse Continuous Current & Derating Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/fuse-derating-calculator.html)**: Determines continuous current capacity, safety margins, and temperature deratings to select correct fuse links.

### 5. 🔍 Advanced Field Diagnostics
System profiling and event diagnostics for high-level troubleshooting:
*   **[Inverter Derating Cause Analyzer](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/inverter-derating-analyzer.html)**: Analyzes inverter states to identify limiting factors like ambient temperature, grid high voltage, high frequency, or power factor curtailments.
*   **[Inverter Clipping / Curtailment Check](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/clipping-curtailment-check.html)**: Distinguishes between normal high-irradiance inverter clipping, PPC utility limits, or grid underperformance.
*   **[Irradiance Sensor Cross-Check Tool](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/irradiance-sensor-check.html)**: Cross-references multiple reference cells, pyranometers, and neighboring string performance to detect dirt, drift, or sensor misalignment.
*   **[Tracker Angle & Backtracking QA](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/tracker-angle-qaqc.html)**: Commissioning utility to audit astronomical backtracking targets, stow triggers, and mechanical torque discrepancies.

### 6. 🌐 SCADA & Communications
Signal mapping tools and low-level protocol encoders/decoders:
*   **[SCADA Tag QA/QC Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/scada-tag-qaqc.html)**: Signal verification utility to audit controls, HMI display parameters, scaling ratios, and historian bindings.
*   **[MODBUS Register Decoder](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/modbus-decoder.html)**: Fast translation of raw hex, octal, and decimal inputs into float32, signed, unsigned, or bitmask indicators.
*   **[Alarm / Fault Event Timeline](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/alarm-timeline.html)**: Merges flat-file data dumps from different equipment into a clean, unified, color-coded chronological fault sequence.
*   **[Number Base Converter](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/number-base-converter.html)**: Handheld tool converting values between binary, decimal, hex, and octal with custom bit-width, endianness swaps, and manual bit visualizers.

### 7. 🔌 Grid, Controls & OEM Specific
Visual interactive utilities and vendor-specific configuration utilities:
*   **[Interactive Power Triangle Tool](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/power-triangle.html)**: Vector visualizer mapping active power (P), reactive power (Q), apparent power (S), power factor, and phase angle shifts.
*   **[Inverter Capability Curve Check](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/inverter-capability-curve-check.html)**: Evaluates requested P/Q operating points against standard inverter active/reactive P-Q PQ capability envelopes.
*   **[Grid Event Voltage/Frequency Excursion Log](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/grid-event-excursion-log.html)**: Logs transient grid frequency/voltage rides and calculates precise trip deviations for utility reporting.
*   **[ABB REJ603 Relay Configurator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/rej603-configurator.html)**: Custom OEM setup assistant providing rapid configuration mapping and parameter values for REJ603 relays.
*   **[Sungrow SG1+x Parameter Comparison](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/parameter-comparison.html)**: Side-by-side parameter comparison tool to isolate drifting settings across SG1+x central inverters.
*   **[Sungrow PDP Module Fault Decoder](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/fault-interpreter.html)**: Decodes complex Sungrow fault hex codes into clear corrective maintenance procedures.
*   **[Sungrow UMCG Analyzer](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/analyzer.html)** *(In Progress)*: Data log parser to analyze diagnostic files exported from Sungrow inverter systems.

### 8. 🌱 Soiling & PV Performance
Custom toolset to analyze and report soiling-related production impacts:
*   **[Soiling Loss Estimator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/soiling-loss-estimator.html)**: Estimates monthly and cumulative soiling losses based on dust factors, rain cycles, and slope adjustments.
*   **[Clean vs. Soiled String Comparison](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/clean-vs-soiled-strings.html)**: Compares performance metrics of adjacent washed and unwashed control strings to confirm degradation rates.
*   **[Cleaning ROI Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/cleaning-roi.html)**: Financial calculator weighing washing costs against prospective generation yield increases to identify optimal clean schedules.
*   **[Lost Energy from Soiling](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/soiling-lost-energy.html)**: Aggregates total MWh energy lost and revenue sacrificed due to array soiling over operational cycles.
*   **[Soiling Customer Report Generator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/soiling-customer-report.html)**: Creates structured, executive-ready PDFs detailing soiling impacts and cleaning recommendations.

### 9. 📋 Reports, Templates & HSE
HSE permits, punchlist managers, and field event documentation:
*   **[Commissioning Punchlist Builder](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/commissioning-punchlist.html)**: Field audit tracker dividing punchlist items by priority (Category A - Blocking, Category B, etc.) with JSON/CSV export.
*   **[Customer Site Visit Report](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/site-visit-report.html)**: Generates complete Daily Reports compiling weather, contractor counts, completed items, delays, and photos.
*   **[RCA Template Builder](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/rca-template-builder.html)**: Leads engineering teams through 5-Whys methodology to generate formal Root Cause Analysis incident summaries.
*   **[Corrective Action Tracker / CAPA Log](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/capa-tracker.html)**: Comprehensive tracker mapping corrective and preventive actions from punchlists, inspections, and audit actions.
*   **[Safety Pre-Task Plan / JHA Form](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/jha-pre-task-plan.html)**: Job Hazard Analysis wizard to review hazard controls, tool inspections, emergency procedures, and PPE before beginning field tasks.
*   **[LOTO Verification Checklist](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/loto-checklist.html)**: Field checklist to verify lockout/tagout preparation, isolation points, zero-energy verification, and restoration readiness.

### 10. 📁 Legacy & References
Reference frameworks and legacy support utilities preserved for backwards compatibility:
*   **[Torque Spec Finder & Connection Calculator](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/torque-spec-finder.html)**: Highly optimized lookup utility showing target mechanical pre-load torques for copper/aluminum contacts.
*   **[Technical Documentation Search Tool](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/technical-reference-search.html)**: Consolidated lookup tool to browse internal technical guides, manuals, and service logs.
*   **[Technical Database (Legacy)](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/training-request.html)**: Searchable repository of legacy manuals.
*   **[Training Catalog (Legacy)](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/training.html)**: Index of legacy vocational training modules.
*   **[Training Feedback Form (Legacy)](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/evaluation.html)**: Multi-language student feedback collector.
*   **[Support Request Form (Legacy)](file:///c:/Users/aprov/OneDrive/Desktop/GitHub/Level3Support/support-request.html)**: Historical ticketing tool.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher) and npm
- A modern web browser with PWA support

### Installation & Run
1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/Level3Support.git
   cd Level3Support
   ```

2. Install development tools:
   ```bash
   npm install
   ```

3. Spin up the local HMR dev server:
   ```bash
   npm run dev
   ```

4. Package a compressed static build:
   ```bash
   npm run build
   ```

---

## 📐 Technology Stack

The ToolHub is engineered to load instantly, work offline, and have minimal package overhead:
*   **Core**: HTML5, Modern ES6 Javascript (ES Modules)
*   **Styling**: Pure CSS3 utilizing semantic custom variables, modern flex/grid layouts, responsive typography, and glassmorphism.
*   **Build & HMR**: Vite
*   **Deployment**: Static file hosting (easily deployed to standard CDN buckets like GitHub Pages, Vercel, Netlify, or AWS S3).
*   **Service Worker**: Dynamic caching sw.js for reliable offline execution.

---

## 🔒 Safety & Professional Use Disclaimer

> [!IMPORTANT]
> The calculations, checklists, and references provided by Level3Support ToolHub are specialized engineering aides intended **exclusively** for qualified commissioning, QA/QC, and safety personnel. Every tool incorporates distinct design assumptions. Field personnel must independently verify outputs against physical nameplates, manufacturer manuals, and local utility regulations prior to initiating equipment energization, applying torque limits, or conducting protective relay changes.

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more information.
