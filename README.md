# Level3Support ToolHub

[![License: All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](#-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Platform](https://img.shields.io/badge/Platform-Mobile--First%20Web-blueviolet.svg)](#)

Welcome to the **Level3Support ToolHub** repository. This is a centralized, mobile-first, offline-capable field engineering and commissioning suite built specifically for technicians, site supervisors, and safety leads in utility-scale **Solar PV**, **Battery Energy Storage Systems (BESS)**, **SCADA**, and **Electrical Power Infrastructure**.

ToolHub brings together calculation engines, interactive diagrams, diagnostic decoders, compliance checklists, dynamic report generators, and HSE plans into a responsive, cohesive web application that fits in your pocket and runs reliably in the field.

> Built by **Andres Provero** to support field engineering, commissioning, QA/QC, troubleshooting, and technical service execution in utility-scale PV, BESS, SCADA, and electrical power infrastructure.

---

## 🌟 Core Features & Design Philosophy

-   📱 **Mobile-First Responsive Design**: Tailored layout structures that remain highly readable and easy to navigate on smartphones and tablets under harsh outdoor glares or remote site environments.
-   🎨 **Visual Excellence & High-End Aesthetics**: Implements curated HSL-tailored color palettes, seamless dark/light modes, premium typography, and subtle micro-animations for an interactive and high-end enterprise utility experience.
-   🔍 **Dynamic Global Tool Registry**: Featuring instantaneous fuzzy search, filter tags (by Discipline, Category, and Project Phase), and a personalized bookmarks dashboard to immediately launch tools.
-   ⚠️ **Standardized Engineering Assumptions & Validation**: Built-in safety warnings, real-time input validation limits, and visible boundary check alerts on calculations.
-   🔌 **PWA & Offline Portability**: Features standard service worker integration for complete offline availability in remote environments with zero network signals.
-   📥 **Robust Local Data Management**: Complete client-side JSON/CSV data import, export, and printer-friendly PDF formatting templates without requiring server-side storage.

---

## 💡 Why This Matters for Field Operations

Field teams operating on remote utility-scale sites face challenges that office tools were never designed to solve. Level3Support ToolHub directly addresses these gaps:

-   ✅ **Reduces variation between field teams** — shared tools enforce consistent measurement, recording, and decision-making standards across crews and contractors.
-   📋 **Improves quality of commissioning records** — structured digital forms replace handwritten notes and ad-hoc spreadsheets with traceable, exportable data.
-   📡 **Supports offline work in remote sites** — full PWA offline capability means tools work even without cellular or Wi-Fi coverage on the plant.
-   📸 **Standardizes evidence capture and reporting** — built-in photo, timestamp, and export workflows ensure every finding is documented and defensible.
-   🔎 **Helps supervisors review site work consistently** — standardized outputs make it easy to spot gaps, compare crews, and validate quality gates.
-   🔁 **Converts field lessons learned into repeatable workflows** — tools are built from real commissioning and troubleshooting experience, encoding best practices directly into the interface.

---

## 🛠️ Complete Tool Suite Directory

The ToolHub features a production-ready set of field utilities currently spanning **60+ tools** organized by discipline:

### 1. ☀️ PV Commissioning & Performance
Commissioning checksheets, measurement trackers, and performance verification for solar arrays:
*   **[String Current Imbalance Calculator](string-imbalance.html)**: Flags outlier solar string current deviations against live average thresholds to pinpoint shading, soilage, or blown inline fuses.
*   **[DC Voltage Sanity Check Tool](dc-voltage-sanity.html)**: Verifies measured string voltage against module specs, string size, and temperature-corrected Voc/Vmp parameters.
*   **[PV String Voltage & Sizing Tool](pv-string-voltage-sizing.html)**: Calculates string open-circuit and operating voltages across temperature ranges and validates string count against inverter input specs.
*   **[Inverter Start-Up Checklist](inverter-startup.html)**: Structured digital commissioning checks covering pre-energization, DC insulation, auxiliary checks, communications, and power-up phases.
*   **[IV Curve Test Result Log](iv-curve-log.html)**: Standardized field logs to record, categorize, and export IV curve measurements with instant defect tagging (e.g., bypass diode failure, soilage, mismatch).
*   **[Firmware Version Tracker](firmware-tracker.html)**: Tracks and logs firmware statuses across field controllers, inverters, and met-stations with auto-derived update recommendations.
*   **[Irradiance Sensor Cross-Check Tool](irradiance-sensor-check.html)**: Compares irradiance sensors, reference cells, and neighboring inverter behavior to detect dirty, misaligned, drifting, or unreliable measurements.
*   **[Tracker Angle / Backtracking QA Checklist](tracker-angle-qaqc.html)**: Validates tracker angle behavior, backtracking, mechanical alignment, and wind stow during commissioning or troubleshooting.
*   **[PV Performance Verification Tool](pv-performance-verification.html)**: Verifies measured plant output against expected performance benchmarks under current irradiance and temperature conditions.
*   **[Weather Correction Calculator for PV Testing](pv-weather-correction.html)**: Translates open-air PV power measurements to Standard Test Conditions (STC) using real-time irradiance and temperature.

### 2. 🔋 BESS Commissioning & Diagnostics
Battery storage performance diagnostics, thermal profiles, health analysis, and safety checklists:
*   **[BESS Capacity / Energy Test Form](bess-capacity-test.html)**: Records energy charge/discharge metrics, computes actual performance vs. rated energy capacities, and determines round-trip efficiency (RTE).
*   **[BESS Pre-Energization Checklist](bess-pre-energization.html)**: Audits isolation integrity, grounding bonds, auxiliary system status, communications, and LOTO state prior to introducing utility or DC bus voltage.
*   **[BESS Container & Rack Inspection](bess-rack-inspection.html)**: Verifies battery container structural integrity, climate controllers, fire suppression status, and electrical safety bonds prior to commissioning.
*   **[BESS Spare Parts Cross-Reference](bess-spare-parts.html)**: Search compatible parts, review stock levels, filter by criticality, and import/export CSV parts directories.
*   **[BESS Battery Health Analyzer](bess-battery-health-analyzer.html)**: Assesses battery module and string health indicators including capacity fade, internal resistance trends, and cycle count benchmarks.
*   **[BESS Availability Calculator](bess-availability.html)**: Standardizes contractual uptime tracking — simple availability and energy-adjusted availability indexes over billing cycles.
*   **[Battery SOC Imbalance Analyzer](embed-battery-soc-imbalance-analyzer.html)**: Analyzes SOC spread and balancing status across battery racks, strings, containers, or clusters.
*   **[Battery Temperature Spread Analyzer](embed-battery-temperature-spread.html)**: Analyzes battery temperature variation across racks, modules, or clusters to detect HVAC or fan issues.
*   **[HVAC Delta-T Calculator](hvac-delta-t.html)**: Sanity-checks BESS enclosure HVAC cooling and heating performance using supply, return, and ambient readings.

### 3. ⚡ Electrical Calculators & Test Forms
Standardized digital testing forms and calculators built to align with NETA, IEEE, and NFPA protocols:
*   **[Cable Sizing, Ampacity & Voltage Drop Calculator](cable-sizing-ampacity-voltage-drop.html)**: Unified cable selection tool covering conductor sizing, ampacity derating, and voltage drop calculations for DC, single-phase, and three-phase AC circuits.
*   **[Arc Flash Boundary Calculator](arc-flash.html)**: Documents arc flash incident energy, protection boundaries, and required PPE levels for electrical work permits.
*   **[Fuse Continuous Current & Temperature Derating Calculator](fuse-derating-calculator.html)**: Calculates derated continuous current limits and determines appropriate fuse ratings based on ambient temperature and derating factors.
*   **[Insulation Resistance Test Form](insulation-resistance-test-form.html)**: Standalone field form to log megger test results, compute Polarization Index (PI), and Dielectric Absorption Ratio (DAR).
*   **[Transformer Test & TTR Report](transformer-test-ttr-report.html)**: Records transformer health data covering winding resistance, insulation resistance, turns ratio (TTR), and oil test results.
*   **[Insulation Resistance Commissioning Form](electrical-test-forms.html?tool=insulation-resistance)**: Integrated commissioning-phase megger logging with PI/DAR auto-calculation.
*   **[Transformer Test Results Form](electrical-test-forms.html?tool=transformer-test)**: Aggregates transformer health records within the multi-test electrical forms suite.
*   **[Grounding Continuity Test Form](electrical-test-forms.html?tool=grounding-continuity)**: Tracks earth grid resistance tests, Wenner soil resistivity metrics, and localized bonding paths.
*   **[CT/PT Ratio Verification Tool](electrical-test-forms.html?tool=ct-pt-ratio)**: Verifies current/potential transformer ratios, phase polarity, excitation curves, and ratio errors.
*   **[Relay Settings Checklist](electrical-test-forms.html?tool=relay-checklist)**: Quality checklist verifying relay model parameters, protection curves, and settings groups against engineering studies.
*   **[Torque Spec Finder & Connection Calculator](torque-spec-finder.html)**: Lookup utility for mechanical pre-load torques on copper/aluminum contacts across connector types and sizes.

### 4. 🔍 Advanced Field Diagnostics
System profiling and event diagnostics for high-level troubleshooting:
*   **[Inverter Derating Cause Analyzer](embed-inverter-derating-analyzer.html)**: Identifies whether an inverter is limiting power due to temperature, grid voltage, frequency, reactive power, or protection response.
*   **[Inverter Power Limitation Analyzer](inverter-power-limitation-analyzer.html)**: Determines whether reduced inverter output is consistent with clipping, PPC curtailment, export limits, or real underperformance.
*   **[PV Soiling Analysis & Cleaning Decision Tool](pv-soiling-analysis-cleaning-decision.html)**: Estimates PV system energy loss due to soiling based on site conditions and helps drive data-backed cleaning decisions.

### 5. 🌐 SCADA & Data Diagnostics
Signal mapping tools and low-level protocol encoders/decoders:
*   **[SCADA Tag QA/QC Checklist](scada-tag-qaqc.html)**: Verifies signal list scaling, remote controls, HMI displays, and historian logging for communications handovers.
*   **[Register, Bitmask & Number Decoder](register-bitmask-number-decoder.html)**: Decodes raw decimal/hex MODBUS registers into engineering values including 16/32-bit types and 32-bit floats.
*   **[Alarm / Fault Event Timeline Builder](alarm-timeline.html)**: Builds chronological alarm and fault timelines to analyze cascading faults, repeated codes, and trigger times.
*   **[Number Base Converter](embed-number-base-converter.html)**: Converts values between binary, decimal, hex, and octal with bit-width, byte-order swaps, and manual register bit viewer.

### 6. ⚡ Grid & Inverter Controls
Reactive power, grid compliance, and inverter operating envelope tools:
*   **[Reactive Power & Inverter Capability Tool](reactive-power-inverter-capability.html)**: Interactive visual tool showing the relationship between active power (P), reactive power (Q), apparent power (S), power factor, and phase angle.
*   **[Inverter Capability Curve Check](embed-inverter-capability-curve-check.html)**: Checks whether a requested active/reactive power operating point is within inverter apparent power limits.
*   **[Grid Event Voltage/Frequency Excursion Log](grid-event-excursion-log.html)**: Logs grid voltage/frequency excursions, calculates deviations, and creates structured RCA-ready event timelines.

### 7. 🔧 OEM-Specific Tools
Vendor-specific configuration utilities and fault decoders:
*   **[ABB REJ603 Relay Configuration Tool](rej603-configurator.html)**: Custom OEM setup assistant providing rapid configuration mapping and parameter values for REJ603 relays.
*   **[SG1+x Parameter Comparison Tool](parameter-comparison.html)**: Side-by-side parameter comparison to isolate drifting settings across Sungrow SG1+x central inverters.
*   **[PDP Module Fault Code Interpreter](fault-interpreter.html)**: Decodes Sungrow fault hex codes into clear corrective maintenance procedures.
*   **[UMCG Data Analysis Tool](analyzer.html)** *(In Progress)*: Data log parser to analyze diagnostic files exported from Sungrow inverter systems.

### 8. 🌱 Soiling & PV Performance
Custom toolset to quantify and report soiling-related production impacts:
*   **[Clean vs. Soiled String Comparison Tool](embed-clean-vs-soiled-strings.html)**: Compares electrical output between clean and soiled strings to quantify performance impact.
*   **[Cleaning ROI Calculator](embed-cleaning-roi.html)**: Calculates the return on investment for PV array cleaning based on performance gain vs. cleaning costs.
*   **[Lost Energy from Soiling Calculator](embed-soiling-lost-energy.html)**: Quantifies total lost energy (kWh) attributed to soiling over a specific time period.
*   **[Soiling Customer Report Generator](embed-soiling-customer-report.html)**: Generates a customer-facing report detailing soiling impacts and recommended cleaning actions.

### 9. 📋 Reports, HSE & References
HSE permits, punchlist managers, progress tracking, and field event documentation:
*   **[Commissioning Punchlist Builder](commissioning-punchlist.html)**: Creates, manages, and filters field punchlist items for PV/BESS commissioning and close-out.
*   **[Daily Commissioning Progress Report](daily-progress.html)**: Generates structured daily progress reports capturing completed work, manpower counts, weather, blockers, and open actions.
*   **[Customer Site Visit Report Generator](site-visit-report.html)**: Generates professional, customer-facing field service site visit reports.
*   **[RCA Template Builder](rca-template-builder.html)**: Structured Root Cause Analysis (RCA) report builder for solar and battery plant incidents.
*   **[Corrective Action Tracker / CAPA Log](capa-tracker.html)**: Tracks corrective and preventive actions from punchlists, RCAs, inspections, HSE forms, and commissioning findings.
*   **[Safety Pre-Task Plan / JHA Form](jha-pre-task-plan.html)**: Standardized Job Hazard Analysis (JHA) and safety planning form to complete before beginning field tasks.
*   **[LOTO Verification Checklist](loto-checklist.html)**: Verifies lockout/tagout preparation, isolation points, zero-energy verification, and restoration readiness.
*   **[Technical Documentation / Reference Search Tool](technical-reference-search.html)**: Finds and displays active service bulletins, commissioning manuals, training resources, and datasheets.

### 10. 📁 Legacy & Internal Tools
Reference frameworks and legacy support utilities preserved for backwards compatibility:
*   **[Technical Documentation Database](training-request.html)**: Searchable repository of legacy manuals and technical references.
*   **[Training Catalog](training.html)**: Index of legacy vocational training modules.
*   **[Training Evaluation Form](evaluation.html)**: Multi-language student feedback collector.
*   **[Level3Support Request Form](support-request.html)**: Historical support ticketing tool.

---

## 📐 Technology Stack

The ToolHub is engineered to load instantly, work offline, and have minimal package overhead:
*   **Core**: HTML5, Modern ES6 Javascript (ES Modules)
*   **Styling**: Pure CSS3 utilizing semantic custom variables, modern flex/grid layouts, responsive typography, and glassmorphism.
*   **Build & HMR**: Vite
*   **Deployment**: Static file hosting (GitHub Pages, Vercel, Netlify, or AWS S3).
*   **Service Worker**: Dynamic caching `sw.js` for reliable offline execution.

---

## 🔒 Safety & Professional Use Disclaimer

> [!IMPORTANT]
> The calculations, checklists, and references provided by Level3Support ToolHub are specialized engineering aides intended **exclusively** for qualified commissioning, QA/QC, and safety personnel. Every tool incorporates distinct design assumptions. Field personnel must independently verify outputs against physical nameplates, manufacturer manuals, and local utility regulations prior to initiating equipment energization, applying torque limits, or conducting protective relay changes.

---

## 📄 License

Copyright (c) 2026 Andres A. Provero D. All rights reserved.

This repository is made publicly available for portfolio and evaluation purposes only.

No permission is granted to copy, modify, distribute, sublicense, host, resell, or use this software or any substantial part of it for commercial purposes without prior written permission.

Public visibility of this repository does not grant any license or reuse rights.
