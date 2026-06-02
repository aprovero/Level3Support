/**
 * Level3Support — tool-resources.js
 * Centralized Resources and Reference Data System
 * © 2026 Level3Support
 */

window.TOOL_RESOURCES = {
    // 1. OEM SPECIFIC TOOLS
    "rej603-configurator.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "ABB REJ603 Feeder Protection Relay User Manual", type: "OEM Manual" },
            { name: "IEC 60255 Protection Relay Standards", type: "Standard" },
            { name: "Project Protection Coordination Study", type: "Project Specific" }
        ],
        note: "Relay settings must be validated against the approved protection coordination study, the latest ABB documentation, and formal relay test results. This tool supports configuration review but does not replace protection testing or commissioning approval."
    },
    "parameter-comparison.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "Sungrow Inverter User Manuals", type: "OEM Manual" },
            { name: "Sungrow Modbus / Communication Protocol Documentation", type: "OEM Manual" },
            { name: "Firmware Release Notes", type: "OEM Manual" },
            { name: "Site Commissioning Baseline", type: "Project Specific" }
        ],
        note: "Parameter differences should be reviewed together with firmware version, model variant, site configuration, and the approved commissioning baseline. Do not assume a difference is wrong without checking the approved reference set."
    },
    "analyzer.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "Sungrow Logger / EMS Documentation", type: "OEM Manual" },
            { name: "Sungrow Modbus / Communication Protocol Documentation", type: "OEM Manual" },
            { name: "SunSpec Modbus Models", type: "Protocol" },
            { name: "Site SCADA Historian Export", type: "Project Specific" }
        ],
        note: "Always confirm timestamp alignment, timezone, units, scaling, missing samples, and duplicate timestamps before comparing logs from different systems."
    },
    "fault-interpreter.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "Sungrow Fault Code Documentation", type: "OEM Manual" },
            { name: "Sungrow PDP / Module Service Documentation", type: "OEM Manual" },
            { name: "Site Troubleshooting Records", type: "Field Practice" }
        ],
        note: "Fault-code interpretation must be validated against the exact product model, firmware version, and OEM service documentation. Use the OEM corrective action as the final authority."
    },

    // 2. SCADA & COMMUNICATIONS DIAGNOSTICS
    "modbus-decoder.html": {
        basis: "Protocol-based",
        basisClass: "basis-protocol",
        references: [
            { name: "MODBUS Application Protocol Specification", type: "Protocol" },
            { name: "Device-Specific Register Map", type: "OEM Manual" },
            { name: "SunSpec Modbus Models", type: "Protocol" }
        ],
        note: "Register decoding depends on byte order, word order, data type, signed or unsigned interpretation, and scaling. A valid decoded number does not guarantee the selected register interpretation is correct."
    },
    "scada-tag-qaqc.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "Project SCADA Point List", type: "Project Specific" },
            { name: "SunSpec Modbus Models", type: "Protocol" },
            { name: "DNP3 / IEEE 1815", type: "Protocol" },
            { name: "Site SCADA Functional Test Procedure", type: "Project Specific" }
        ],
        note: "Final acceptance should be based on the project point list, approved naming convention, customer test procedure, and utility requirements."
    },
    "alarm-timeline.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "ISA-18.2 Alarm Management Standard", type: "Standard" },
            { name: "SCADA Historian / Alarm Export", type: "Project Specific" },
            { name: "OEM Alarm Dictionary", type: "OEM Manual" }
        ],
        note: "Timeline analysis requires synchronized clocks. Confirm controller time, historian time, timezone, export format, and sequence-of-events source before using the timeline as investigation evidence."
    },
    "number-base-converter.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "Digital Systems Number Representation", type: "Engineering Guide" },
            { name: "MODBUS Application Protocol Specification", type: "Protocol" },
            { name: "Device-Specific Register Map", type: "OEM Manual" }
        ],
        note: "Bit order and word order must match the device documentation. For alarm words, confirm whether bit numbering starts at 0 or 1."
    },

    // 3. BESS FIELD TOOLS & COMMISSIONING SEQUENCE
    "bess-pre-energization.html": {
        basis: "Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "NFPA 855", type: "Standard" },
            { name: "UL 9540 / UL 9540A", type: "Standard" },
            { name: "NFPA 70E", type: "Safety" },
            { name: "OSHA 1910.147 Lockout/Tagout", type: "Safety" },
            { name: "OEM BESS Commissioning Manual", type: "OEM Manual" }
        ],
        note: "This checklist is a field aid. It does not replace the approved method statement, LOTO plan, energization permit, OEM commissioning procedure, or site safety authorization."
    },
    "bess-rack-inspection.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "NFPA 855", type: "Standard" },
            { name: "UL 9540A", type: "Standard" },
            { name: "OEM Battery Rack Installation Manual", type: "OEM Manual" },
            { name: "OEM Thermal Management Manual", type: "OEM Manual" }
        ],
        note: "Visible abnormalities, coolant leaks, abnormal odor, deformation, thermal indications, or fire protection issues should be escalated immediately using the site emergency and OEM escalation process."
    },
    "bess-capacity-test.html": {
        basis: "Contract-specific",
        basisClass: "basis-contract",
        references: [
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard" },
            { name: "OEM Capacity Test Procedure", type: "OEM Manual" },
            { name: "Project Contract / Performance Test Procedure", type: "Contract Specific" },
            { name: "Revenue Meter / Power Quality Meter Data", type: "Project Specific" }
        ],
        note: "Capacity and RTE definitions vary by contract. Confirm whether the measurement boundary is DC terminals, PCS AC output, transformer LV side, POI, or revenue meter."
    },
    "battery-soc-imbalance-analyzer.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "IEEE 2686", type: "Standard" },
            { name: "OEM BMS Manual", type: "OEM Manual" },
            { name: "Battery Rack Commissioning Report", type: "Project Specific" }
        ],
        note: "SOC imbalance should be interpreted with BMS status, rest time, charge/discharge state, balancing mode, alarm state, and OEM thresholds."
    },
    "battery-temperature-spread.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "OEM Battery Thermal Management Manual", type: "OEM Manual" },
            { name: "OEM BMS Alarm Thresholds", type: "OEM Manual" },
            { name: "NFPA 855 / UL 9540A", type: "Standard" },
            { name: "BESS HVAC Commissioning Data", type: "Project Specific" }
        ],
        note: "Temperature spread is a diagnostic indicator, not a complete root-cause conclusion. Review HVAC operation, airflow paths, filters, fan status, coolant status, rack loading, and BMS alarms together."
    },

    // 4. PV FIELD & ARRAY COMMISSIONING
    "inverter-startup.html": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "IEC 62446-1", type: "Standard" },
            { name: "NEC / NFPA 70", type: "Standard" },
            { name: "NFPA 70E", type: "Safety" },
            { name: "OEM Inverter Commissioning Manual", type: "OEM Manual" }
        ],
        note: "Follow the OEM startup sequence and the approved energization plan. Startup should not proceed if insulation, grounding, polarity, grid conditions, communication, or protection checks are incomplete."
    },
    "dc-voltage-sanity.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 62446-1", type: "Standard" },
            { name: "PV Module Datasheet", type: "OEM Manual" },
            { name: "OEM Inverter Datasheet", type: "OEM Manual" },
            { name: "NEC / Local Electrical Code", type: "Standard" }
        ],
        note: "Cold-temperature Voc correction must be checked against local code and inverter maximum DC voltage. Measured deviations may indicate wrong module count, reverse polarity, wiring error, shorted module, open circuit, or measurement error."
    },
    "string-imbalance.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 62446-1", type: "Standard" },
            { name: "PV Module Datasheet", type: "OEM Manual" },
            { name: "I-V Curve Interpretation Guides", type: "Engineering Guide" },
            { name: "Combiner Box / Inverter String Current Data", type: "Project Specific" }
        ],
        note: "Compare strings within the same inverter, MPPT, orientation, irradiance condition, and module type. Normalize against irradiance when possible."
    },
    "iv-curve-log.html": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "IEC 62446-1", type: "Standard" },
            { name: "I-V Curve Tester Manufacturer Manual", type: "OEM Manual" },
            { name: "I-V Curve Interpretation Guides", type: "Engineering Guide" },
            { name: "PV Module Datasheet", type: "OEM Manual" }
        ],
        note: "I-V curve interpretation depends heavily on irradiance stability, temperature measurement, correct string metadata, and tester correction method."
    },
    "firmware-tracker.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "OEM Firmware Release Notes", type: "OEM Manual" },
            { name: "OEM Commissioning Manual", type: "OEM Manual" },
            { name: "Site Firmware Baseline Register", type: "Project Specific" },
            { name: "Management of Change Procedure", type: "Field Practice" }
        ],
        note: "Firmware updates should be controlled through an approved change process. Do not mix firmware versions across a site unless the OEM and project team approve the configuration."
    },

    // 5. MATHEMATICAL ENGINEERING CALCULATORS
    "fuse-derating-calculator.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "Fuse Manufacturer Datasheets", type: "OEM Manual" },
            { name: "Littelfuse Fuseology", type: "Engineering Guide" },
            { name: "Eaton Bussmann Fuse Application Guides", type: "Engineering Guide" },
            { name: "NEC / Local Electrical Code", type: "Standard" }
        ],
        note: "Use manufacturer-specific derating curves whenever available. Final fuse selection must confirm voltage rating, interrupting rating, time-current coordination, enclosure temperature, duty cycle, and local code requirements."
    },
    "cable-ampacity.html": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "NEC / NFPA 70 Ampacity Tables", type: "Standard" },
            { name: "Cable Manufacturer Datasheet", type: "OEM Manual" },
            { name: "Project Electrical Design Basis", type: "Project Specific" }
        ],
        note: "Ampacity depends on installation method, ambient temperature, conductor grouping, insulation rating, and local electrical code. This tool does not replace stamped electrical design."
    },
    "voltage-drop.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "NEC / Local Electrical Code", type: "Standard" },
            { name: "Cable Manufacturer Resistance Tables", type: "OEM Manual" },
            { name: "Project Electrical Design Basis", type: "Project Specific" }
        ],
        note: "Voltage drop calculations are estimates unless conductor temperature, power factor, routing, and actual load current are known. Validate final design against project specifications and local code."
    },
    "hvac-delta-t.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "ASHRAE Fundamentals", type: "Engineering Guide" },
            { name: "OEM HVAC Manual", type: "OEM Manual" },
            { name: "BESS Container Thermal Design / Commissioning Data", type: "Project Specific" }
        ],
        note: "Delta-T is a diagnostic indicator. Review it together with airflow, filter condition, fan status, compressor status, alarms, ambient temperature, and heat load."
    },
    "pv-performance-ratio.html": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "NREL Weather-Corrected Performance Ratio Method", type: "Engineering Guide" },
            { name: "Project Performance Test Procedure", type: "Contract Specific" }
        ],
        note: "PR depends on measurement boundary, irradiance source, temperature correction method, data quality, and exclusion rules. Use the contract test procedure as the final authority for acceptance."
    },
    "pv-weather-correction.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "NREL Weather-Corrected Performance Ratio Method", type: "Engineering Guide" },
            { name: "IEC 61724", type: "Standard" },
            { name: "PV Module Datasheet", type: "OEM Manual" },
            { name: "Project Performance Test Procedure", type: "Contract Specific" }
        ],
        note: "Weather correction is sensitive to sensor accuracy, irradiance stability, module temperature estimate, and measurement boundary. Do not use corrected values for contractual acceptance unless the method is approved."
    },
    "bess-availability.html": {
        basis: "Contract-specific",
        basisClass: "basis-contract",
        references: [
            { name: "Project Availability Guarantee / Contract", type: "Contract Specific" },
            { name: "OEM Warranty / Service Agreement", type: "OEM Manual" },
            { name: "SCADA Outage and Curtailment Logs", type: "Project Specific" },
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard" }
        ],
        note: "Availability is contract-defined. Separate planned maintenance, forced outage, grid curtailment, external outage, and derated operation according to the contract."
    },

    // 6. ELECTRICAL FIELD TEST FORMS
    "electrical-test-forms.html?tool=insulation-resistance": {
        basis: "Standard-based / Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "IEC 62446-1", type: "Standard", desc: "Reference for PV system testing, documentation, commissioning inspection, and insulation resistance testing requirements." },
            { name: "NETA ATS / NETA MTS", type: "Standard", desc: "Reference for electrical acceptance and maintenance testing practices." },
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety work practice reference for shock risk, arc-flash risk, energized work, and safe work conditions." },
            { name: "Megger / Insulation Tester Manufacturer Manual", type: "OEM Manual", desc: "Final source for test instrument setup, test voltage, connection method, limitations, and safety precautions." },
            { name: "OEM Equipment Manual", type: "OEM Manual", desc: "Required to confirm permitted insulation test voltage and whether sensitive electronics must be disconnected before testing." },
            { name: "Project Commissioning Procedure", type: "Project Specific", desc: "Final source for test method, test voltage, minimum acceptable value, documentation format, and acceptance criteria." }
        ],
        note: "Before applying insulation resistance test voltage, confirm that inverters, optimizers, combiner electronics, surge protection devices, meters, communication equipment, BMS components, and other sensitive devices are isolated or protected according to OEM instructions. Incorrect megger testing can damage equipment."
    },
    "electrical-test-forms.html?tool=transformer-test": {
        basis: "Standard-based / Project-specific",
        basisClass: "basis-standard",
        references: [
            { name: "NETA ATS / NETA MTS", type: "Standard", desc: "Acceptance and maintenance testing reference for transformers, including turns-ratio testing, winding resistance, insulation resistance, and visual inspection practices." },
            { name: "IEEE C57 Transformer Standards", type: "Standard", desc: "Transformer reference family covering design, testing, loading, insulation, and performance." },
            { name: "Transformer OEM Manual", type: "OEM Manual", desc: "Primary source for nameplate ratio, vector group, tap changer configuration, winding configuration, test requirements, and acceptable tolerances." },
            { name: "Transformer Nameplate", type: "Project Specific", desc: "Field reference for rated voltages, tap positions, winding connections, phase relationship, impedance, and serial number." },
            { name: "Project SAT / Commissioning Procedure", type: "Project Specific", desc: "Final source for test sequence, tap positions to test, acceptance criteria, required evidence, and reporting format." },
            { name: "TTR Test Set Manufacturer Manual", type: "OEM Manual", desc: "Reference for instrument setup, connection method, excitation voltage, phase selection, ratio error, and safety limitations." }
        ],
        note: "Transformer test acceptance should follow the approved SAT procedure, OEM documentation, project specifications, and applicable testing standard. Confirm vector group, winding configuration, tap position, and phase connections before judging the result."
    },
    "electrical-test-forms.html?tool=grounding-continuity": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "NEC / Local Electrical Code", type: "Standard" },
            { name: "IEEE Grounding References", type: "Standard" },
            { name: "NETA ATS / MTS", type: "Standard" },
            { name: "Project Grounding Design", type: "Project Specific" }
        ],
        note: "Grounding acceptance limits are project-specific and jurisdiction-specific. Use the approved grounding design and test procedure as the final authority."
    },
    "electrical-test-forms.html?tool=ct-pt-ratio": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "Instrument Transformer OEM Datasheets", type: "OEM Manual" },
            { name: "Protection Drawings and Metering Drawings", type: "Project Specific" },
            { name: "Relay Test Set Manual", type: "OEM Manual" },
            { name: "IEEE / IEC Instrument Transformer Standards", type: "Standard" }
        ],
        note: "Ratio verification must confirm both ratio and polarity. Check the full measurement chain, including CT/PT, wiring, relay or meter configuration, scaling, and SCADA display."
    },
    "electrical-test-forms.html?tool=relay-checklist": {
        basis: "Project-specific",
        basisClass: "basis-project",
        references: [
            { name: "Approved Protection Coordination Study", type: "Project Specific" },
            { name: "Protection Relay OEM Manual", type: "OEM Manual" },
            { name: "IEC 60255 Protection Relay Standards", type: "Standard" },
            { name: "Relay Test Report", type: "Project Specific" }
        ],
        note: "Relay settings must match the approved coordination study and the latest issued-for-construction setting file. A checklist does not replace secondary injection testing or formal protection sign-off."
    },

    // 7. ADVANCED FIELD DIAGNOSTICS & GRID CONTROLS
    "clipping-curtailment-check.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "OEM Inverter Manual", type: "OEM Manual" },
            { name: "PPC / Plant Controller Manual", type: "OEM Manual" },
            { name: "IEEE 1547", type: "Standard" },
            { name: "Utility Interconnection Agreement", type: "Contract Specific" }
        ],
        note: "Differentiate inverter clipping from PPC curtailment, grid curtailment, thermal derating, voltage constraints, reactive power requirements, equipment faults, and firmware behavior."
    },
    "irradiance-sensor-check.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "Pyranometer / Reference Cell Manual", type: "OEM Manual" },
            { name: "Sensor Calibration Certificate", type: "Project Specific" },
            { name: "Nearby Inverter Performance Data", type: "Field Practice" }
        ],
        note: "Irradiance comparisons should consider sensor plane, tilt, azimuth, soiling, shading, calibration, timestamp alignment, and irradiance stability."
    },
    "tracker-angle-qaqc.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "Tracker OEM Manual", type: "OEM Manual" },
            { name: "Project Tracker Design Files", type: "Project Specific" },
            { name: "Wind Stow Procedure", type: "Safety" },
            { name: "SCADA Tracker Position Logs", type: "Project Specific" }
        ],
        note: "Backtracking validation depends on row geometry, slope, tracker algorithm, sun position, and site configuration. Always confirm wind-stow behavior and mechanical limits against the OEM manual."
    },
    "inverter-derating-analyzer.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "OEM Inverter Manual", type: "OEM Manual" },
            { name: "OEM Derating Curves", type: "OEM Manual" },
            { name: "IEEE 1547", type: "Standard" },
            { name: "SCADA / Inverter Event Logs", type: "Project Specific" }
        ],
        note: "Derating can be caused by thermal limits, grid limits, reactive power requirements, frequency response, voltage constraints, PPC setpoints, or firmware behavior. Use OEM curves and field logs together."
    },
    "power-triangle.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "AC Power Fundamentals", type: "Engineering Guide" },
            { name: "OEM Inverter Reactive Power Manual", type: "OEM Manual" },
            { name: "Utility Grid Code / Interconnection Agreement", type: "Contract Specific" }
        ],
        note: "The power triangle shows the mathematical relationship between P, Q, S, and PF. It does not confirm whether an inverter can operate at that point. Validate requested reactive power against the inverter capability curve."
    },
    "inverter-capability-curve-check.html": {
        basis: "OEM-based",
        basisClass: "basis-oem",
        references: [
            { name: "OEM Inverter P-Q Capability Curve", type: "OEM Manual" },
            { name: "OEM Inverter Manual", type: "OEM Manual" },
            { name: "IEEE 1547", type: "Standard" },
            { name: "Utility Grid Code / Interconnection Agreement", type: "Contract Specific" }
        ],
        note: "Capability curves are model-specific and can depend on voltage, temperature, altitude, cooling mode, firmware, and apparent power limits. Do not assume nameplate apparent power allows every P-Q combination."
    },
    "grid-event-excursion-log.html": {
        basis: "Standard-based",
        basisClass: "basis-standard",
        references: [
            { name: "IEEE 1547", type: "Standard" },
            { name: "Utility Grid Code", type: "Contract Specific" },
            { name: "Protection Relay Disturbance Records", type: "Project Specific" },
            { name: "SCADA Historian / PPC Logs", type: "Project Specific" }
        ],
        note: "Event classification depends on measurement location, timestamp alignment, sampling rate, and applicable grid-code limits. Use relay disturbance records when higher-resolution event evidence is required."
    },

    // 8. SOILING & PV PERFORMANCE ANALYSIS
    "soiling-loss-estimator.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "NREL PV Performance References", type: "Engineering Guide" },
            { name: "Site Soiling Station / Irradiance Data", type: "Project Specific" },
            { name: "Cleaning History", type: "Project Specific" }
        ],
        note: "Soiling loss estimates are sensitive to irradiance quality, rainfall, sensor cleaning, sensor alignment, and comparison methodology. Use clean reference devices or controlled string comparisons when available."
    },
    "clean-vs-soiled-strings.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "I-V Curve Interpretation Guides", type: "Engineering Guide" },
            { name: "Clean Control String Methodology", type: "Field Practice" },
            { name: "Site Cleaning Records", type: "Project Specific" }
        ],
        note: "Compare strings with the same orientation, inverter or MPPT grouping, module type, and irradiance condition. Avoid comparisons during unstable irradiance or rapidly changing cloud cover."
    },
    "cleaning-roi.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "Site Soiling Loss Analysis", type: "Project Specific" },
            { name: "PPA / Energy Price Assumptions", type: "Contract Specific" },
            { name: "Cleaning Contractor Quote", type: "Project Specific" },
            { name: "NREL PV Performance References", type: "Engineering Guide" }
        ],
        note: "Cleaning ROI depends on energy price, soiling recovery, weather forecast, cleaning cost, operational access, water availability, curtailment, and seasonal irradiance."
    },
    "soiling-lost-energy.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "NREL Weather-Corrected PR Method", type: "Engineering Guide" },
            { name: "SCADA Energy and Irradiance Data", type: "Project Specific" },
            { name: "PPA / Energy Tariff", type: "Contract Specific" }
        ],
        note: "Lost-energy estimates should exclude unrelated curtailment, outages, inverter faults, and data-quality issues where possible. Revenue calculations depend on tariff and measurement boundary."
    },
    "soiling-customer-report.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "IEC 61724", type: "Standard" },
            { name: "NREL PV Performance References", type: "Engineering Guide" },
            { name: "Site Soiling / Cleaning Records", type: "Project Specific" },
            { name: "Customer Reporting Requirements", type: "Contract Specific" }
        ],
        note: "Customer-facing soiling reports should clearly separate measured data, estimated losses, assumptions, and recommendations. Avoid presenting estimated recovery as guaranteed revenue unless supported by contract language."
    },

    // 9. REPORTS, SAFETY & CLOSEOUT TEMPLATES
    "commissioning-punchlist.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "IEC 62446-1", type: "Standard" },
            { name: "Project Turnover / Handover Procedure", type: "Project Specific" },
            { name: "OEM Commissioning Checklists", type: "OEM Manual" }
        ],
        note: "Punchlist category definitions should match the project contract or handover procedure. Safety-critical and energization-blocking items should be clearly separated from cosmetic or documentation items."
    },
    "site-visit-report.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "Customer SLA / Service Agreement", type: "Contract Specific" },
            { name: "Internal Service Reporting Standard", type: "Field Practice" },
            { name: "Site Work Order / Service Ticket", type: "Project Specific" },
            { name: "Photo Evidence and Sign-Off Requirements", type: "Project Specific" }
        ],
        note: "Customer reports should clearly separate observations, completed work, pending issues, recommendations, and customer action items."
    },
    "rca-template-builder.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "5 Whys Root Cause Analysis Method", type: "Engineering Guide" },
            { name: "Incident Investigation Procedure", type: "Safety" },
            { name: "OEM Troubleshooting Documentation", type: "OEM Manual" },
            { name: "Corrective Action / CAPA Procedure", type: "Field Practice" }
        ],
        note: "RCA should distinguish symptoms, contributing factors, root cause, corrective actions, and preventive actions. Do not assign root cause without evidence."
    },
    "capa-tracker.html": {
        basis: "Field-practice based",
        basisClass: "basis-field",
        references: [
            { name: "ISO 9001 Corrective Action Concepts", type: "Standard" },
            { name: "Internal CAPA Procedure", type: "Field Practice" },
            { name: "Audit / Site Walk Findings", type: "Project Specific" },
            { name: "RCA Outputs", type: "Field Practice" }
        ],
        note: "CAPA items should include owner, due date, evidence required, status, verification method, and closeout approval."
    },
    "torque-spec-finder.html": {
        basis: "Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "OEM Torque Tables", type: "OEM Manual" },
            { name: "NASA Fastener Design References", type: "Engineering Guide" },
            { name: "Bolt Grade / Material Specifications", type: "Engineering Guide" },
            { name: "Lubrication and Thread Guidance", type: "Field Practice" }
        ],
        note: "Torque is an indirect and imperfect method for controlling preload. Final torque values should come from the OEM manual, project specification, or approved engineering document."
    },
    "technical-reference-search.html": {
        basis: "Project-specific",
        basisClass: "basis-project",
        references: [
            { name: "OEM Manuals and Service Bulletins", type: "OEM Manual" },
            { name: "Commissioning Standards", type: "Standard" },
            { name: "Firmware Release Notes", type: "OEM Manual" },
            { name: "Project Closeout Documentation", type: "Project Specific" }
        ],
        note: "Search results should be controlled by document revision, approval status, equipment model, firmware version, and project applicability."
    },
    "jha-pre-task-plan.html": {
        basis: "Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "OSHA Job Hazard Analysis Guide", type: "Safety" },
            { name: "NFPA 70E", type: "Safety" },
            { name: "Site HSE Plan", type: "Project Specific" },
            { name: "Emergency Response Plan", type: "Safety" }
        ],
        note: "A JHA must be reviewed at the job site before work starts and updated when conditions, crew, scope, or hazards change."
    },
    "loto-checklist.html": {
        basis: "Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "OSHA 1910.147 Lockout/Tagout", type: "Safety", desc: "Control of hazardous energy standard for servicing and maintenance activities." },
            { name: "OSHA Control of Hazardous Energy Guidance", type: "Safety", desc: "Practical OSHA guidance for employer responsibilities, worker training, lockout/tagout procedures, and verification." },
            { name: "NFPA 70E Article 120, type: Safety", type: "Safety", desc: "Electrical safety reference for establishing and verifying an electrically safe work condition." },
            { name: "Site Energy Control Procedure", type: "Project Specific", desc: "Final site-specific procedure for identifying energy sources, isolation points, lock placement, verification, and restoration." },
            { name: "Equipment-Specific Isolation Plan", type: "OEM Manual", desc: "Source for equipment isolation points, stored energy hazards, discharge requirements, interlocks, and special precautions." },
            { name: "Single-Line Diagram / Electrical Drawings", type: "Project Specific", desc: "Reference for identifying upstream/downstream sources, backfeed risk, auxiliary power, control power, and stored energy sources." },
            { name: "Work Permit / Energization Permit", type: "Project Specific", desc: "Field authorization record for work scope, isolation boundary, responsible persons, and approval status." }
        ],
        note: "A LOTO checklist must be verified in the field. Always identify all energy sources, apply locks/tags, release or restrain stored energy, and verify zero-energy state before work begins. The site-specific energy control procedure and competent-person approval are the final authority."
    },
    "loto-checklist": {
        basis: "Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "OSHA 1910.147 Lockout/Tagout", type: "Safety", desc: "Control of hazardous energy standard for servicing and maintenance activities." },
            { name: "OSHA Control of Hazardous Energy Guidance", type: "Safety", desc: "Practical OSHA guidance for employer responsibilities, worker training, lockout/tagout procedures, and verification." },
            { name: "NFPA 70E Article 120, type: Safety", type: "Safety", desc: "Electrical safety reference for establishing and verifying an electrically safe work condition." },
            { name: "Site Energy Control Procedure", type: "Project Specific", desc: "Final site-specific procedure for identifying energy sources, isolation points, lock placement, verification, and restoration." },
            { name: "Equipment-Specific Isolation Plan", type: "OEM Manual", desc: "Source for equipment isolation points, stored energy hazards, discharge requirements, interlocks, and special precautions." },
            { name: "Single-Line Diagram / Electrical Drawings", type: "Project Specific", desc: "Reference for identifying upstream/downstream sources, backfeed risk, auxiliary power, control power, and stored energy sources." },
            { name: "Work Permit / Energization Permit", type: "Project Specific", desc: "Field authorization record for work scope, isolation boundary, responsible persons, and approval status." }
        ],
        note: "A LOTO checklist must be verified in the field. Always identify all energy sources, apply locks/tags, release or restrain stored energy, and verify zero-energy state before work begins. The site-specific energy control procedure and competent-person approval are the final authority."
    },
    "pv-string-sizer.html": {
        basis: "Standard-based / Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 62548", type: "Standard", desc: "PV array design requirements, including string configuration, array voltage considerations, and DC design requirements." },
            { name: "NEC / NFPA 70 Article 690", type: "Standard", desc: "PV system requirements including maximum voltage, source circuits, overcurrent protection, and equipment ratings where NEC applies." },
            { name: "NEC 690.7 Maximum PV System Voltage", type: "Standard", desc: "Reference for calculating maximum PV circuit voltage using module Voc and cold-temperature correction." },
            { name: "PV Module Datasheet", type: "OEM Manual", desc: "Final source for module Voc, Vmp, Isc, Imp, maximum system voltage, and temperature coefficients." },
            { name: "Inverter Datasheet / MPPT Specification", type: "OEM Manual", desc: "Final source for maximum DC voltage, MPPT operating range, startup voltage, maximum input current, and string input limits." },
            { name: "Project Minimum Ambient Temperature / Weather File", type: "Project Specific", desc: "Required input for cold-temperature Voc correction and maximum string length validation." }
        ],
        note: "String sizing must verify both cold-temperature maximum Voc and hot-temperature operating Vmp against the inverter DC limits. Final design must confirm module datasheet values, inverter MPPT window, maximum DC voltage, local code, equipment ratings, and project design criteria."
    },
    "pv-string-sizer": {
        basis: "Standard-based / Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "IEC 62548", type: "Standard", desc: "PV array design requirements, including string configuration, array voltage considerations, and DC design requirements." },
            { name: "NEC / NFPA 70 Article 690", type: "Standard", desc: "PV system requirements including maximum voltage, source circuits, overcurrent protection, and equipment ratings where NEC applies." },
            { name: "NEC 690.7 Maximum PV System Voltage", type: "Standard", desc: "Reference for calculating maximum PV circuit voltage using module Voc and cold-temperature correction." },
            { name: "PV Module Datasheet", type: "OEM Manual", desc: "Final source for module Voc, Vmp, Isc, Imp, maximum system voltage, and temperature coefficients." },
            { name: "Inverter Datasheet / MPPT Specification", type: "OEM Manual", desc: "Final source for maximum DC voltage, MPPT operating range, startup voltage, maximum input current, and string input limits." },
            { name: "Project Minimum Ambient Temperature / Weather File", type: "Project Specific", desc: "Required input for cold-temperature Voc correction and maximum string length validation." }
        ],
        note: "String sizing must verify both cold-temperature maximum Voc and hot-temperature operating Vmp against the inverter DC limits. Final design must confirm module datasheet values, inverter MPPT window, maximum DC voltage, local code, equipment ratings, and project design criteria."
    },
    "bess-cable-sizer.html": {
        basis: "Standard-based / Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "NEC / NFPA 70", type: "Standard", desc: "Electrical installation reference for conductor ampacity, overcurrent protection, insulation ratings, grounding, wiring methods, and correction factors where NEC applies." },
            { name: "NEC Article 706 Energy Storage Systems", type: "Standard", desc: "Reference for ESS installation requirements, disconnecting means, overcurrent protection, conductor sizing, and safety considerations." },
            { name: "NEC Article 705 Interconnected Electric Power Production Sources", type: "Standard", desc: "Reference for interconnected power sources and output circuit requirements where applicable." },
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard", desc: "Reference family for electrical energy storage system terminology, planning, safety, and performance." },
            { name: "Cable Manufacturer Datasheet", type: "OEM Manual", desc: "Final source for conductor material, insulation rating, ampacity, voltage rating, temperature rating, resistance, and installation limitations." },
            { name: "PCS / Battery OEM Installation Manual", type: "OEM Manual", desc: "Source for terminal ratings, cable size limits, recommended cable types, DC/AC connection requirements, and torque values." },
            { name: "Project Electrical Design Basis", type: "Project Specific", desc: "Defines installation method, conductor grouping, ambient temperature, tray/conduit routing, voltage drop limits, short-circuit rating, and local design criteria." }
        ],
        note: "BESS cable sizing must consider continuous current, charge/discharge duty, DC or AC side location, conductor temperature rating, installation method, grouping, ambient correction, voltage drop, short-circuit withstand, terminal ratings, and overcurrent protection. This tool does not replace stamped electrical design or OEM installation requirements."
    },
    "bess-cable-sizer": {
        basis: "Standard-based / Engineering estimate",
        basisClass: "basis-engineering",
        references: [
            { name: "NEC / NFPA 70", type: "Standard", desc: "Electrical installation reference for conductor ampacity, overcurrent protection, insulation ratings, grounding, wiring methods, and correction factors where NEC applies." },
            { name: "NEC Article 706 Energy Storage Systems", type: "Standard", desc: "Reference for ESS installation requirements, disconnecting means, overcurrent protection, conductor sizing, and safety considerations." },
            { name: "NEC Article 705 Interconnected Electric Power Production Sources", type: "Standard", desc: "Reference for interconnected power sources and output circuit requirements where applicable." },
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard", desc: "Reference family for electrical energy storage system terminology, planning, safety, and performance." },
            { name: "Cable Manufacturer Datasheet", type: "OEM Manual", desc: "Final source for conductor material, insulation rating, ampacity, voltage rating, temperature rating, resistance, and installation limitations." },
            { name: "PCS / Battery OEM Installation Manual", type: "OEM Manual", desc: "Source for terminal ratings, cable size limits, recommended cable types, DC/AC connection requirements, and torque values." },
            { name: "Project Electrical Design Basis", type: "Project Specific", desc: "Defines installation method, conductor grouping, ambient temperature, tray/conduit routing, voltage drop limits, short-circuit rating, and local design criteria." }
        ],
        note: "BESS cable sizing must consider continuous current, charge/discharge duty, DC or AC side location, conductor temperature rating, installation method, grouping, ambient correction, voltage drop, short-circuit withstand, terminal ratings, and overcurrent protection. This tool does not replace stamped electrical design or OEM installation requirements."
    },
    "pv-megger-tester.html": {
        basis: "Standard-based / Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "IEC 62446-1", type: "Standard", desc: "Reference for PV system testing, documentation, commissioning inspection, and insulation resistance testing requirements." },
            { name: "IEC 62548", type: "Standard", desc: "PV array design reference that supports understanding of array configuration and insulation requirements." },
            { name: "NEC / NFPA 70 Article 690", type: "Standard", desc: "PV system installation reference for DC circuits, grounding, bonding, equipment ratings, and safety considerations where NEC applies." },
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety work practice reference for shock risk, arc-flash risk, energized work, and establishing safe work conditions." },
            { name: "Megger / Insulation Tester Manufacturer Manual", type: "OEM Manual", desc: "Final source for test equipment setup, test voltage, connection method, limitations, and safety precautions." },
            { name: "PV Module and Inverter OEM Manuals", type: "OEM Manual", desc: "Required to confirm permitted insulation test voltage and whether sensitive electronics must be disconnected before testing." },
            { name: "Project Commissioning Procedure", type: "Project Specific", desc: "Final source for required test method, test voltage, minimum acceptable value, documentation format, and acceptance criteria." }
        ],
        note: "Before applying insulation resistance test voltage, confirm that inverters, optimizers, combiner electronics, surge protection devices, meters, and communication equipment are isolated or protected according to OEM instructions. Incorrect megger testing can damage equipment. Use the approved project procedure and OEM manuals as the final authority."
    },
    "pv-megger-tester": {
        basis: "Standard-based / Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "IEC 62446-1", type: "Standard", desc: "Reference for PV system testing, documentation, commissioning inspection, and insulation resistance testing requirements." },
            { name: "IEC 62548", type: "Standard", desc: "PV array design reference that supports understanding of array configuration and insulation requirements." },
            { name: "NEC / NFPA 70 Article 690", type: "Standard", desc: "PV system installation reference for DC circuits, grounding, bonding, equipment ratings, and safety considerations where NEC applies." },
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety work practice reference for shock risk, arc-flash risk, energized work, and establishing safe work conditions." },
            { name: "Megger / Insulation Tester Manufacturer Manual", type: "OEM Manual", desc: "Final source for test equipment setup, test voltage, connection method, limitations, and safety precautions." },
            { name: "PV Module and Inverter OEM Manuals", type: "OEM Manual", desc: "Required to confirm permitted insulation test voltage and whether sensitive electronics must be disconnected before testing." },
            { name: "Project Commissioning Procedure", type: "Project Specific", desc: "Final source for required test method, test voltage, minimum acceptable value, documentation format, and acceptance criteria." }
        ],
        note: "Before applying insulation resistance test voltage, confirm that inverters, optimizers, combiner electronics, surge protection devices, meters, and communication equipment are isolated or protected according to OEM instructions. Incorrect megger testing can damage equipment. Use the approved project procedure and OEM manuals as the final authority."
    },
    "bess-cell-imbalance.html": {
        basis: "OEM-based / Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "OEM Battery Module Manual", type: "OEM Manual", desc: "Primary reference for cell voltage limits, module operating range, balancing behavior, alarm thresholds, and safety limits." },
            { name: "OEM BMS Manual", type: "OEM Manual", desc: "Final source for cell voltage measurement behavior, balancing thresholds, warning levels, trip levels, and diagnostic logic." },
            { name: "IEEE 2686", type: "Standard", desc: "Recommended practice reference for battery management systems in stationary energy storage applications." },
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard", desc: "Reference family for ESS terminology, planning, safety, and performance." },
            { name: "NFPA 855", type: "Standard", desc: "Stationary energy storage system safety reference for installation and hazard mitigation." },
            { name: "UL 9540 / UL 9540A", type: "Standard", desc: "ESS safety and thermal runaway fire propagation references." },
            { name: "BESS Commissioning Report", type: "Project Specific", desc: "Baseline field record for initial cell/module voltages, SOC, rack readiness, and balancing state." },
            { name: "SCADA / BMS Export", type: "Project Specific", desc: "Field evidence source for cell voltage spread, rack-level deviations, alarms, and balancing status." }
        ],
        note: "Cell voltage imbalance must be interpreted with SOC, rest time, charge/discharge state, temperature, balancing status, rack status, and OEM thresholds. Do not use generic limits for safety decisions. OEM BMS alarm limits and escalation procedures are the final authority."
    },
    "bess-cell-imbalance": {
        basis: "OEM-based / Safety-critical",
        basisClass: "basis-safety",
        references: [
            { name: "OEM Battery Module Manual", type: "OEM Manual", desc: "Primary reference for cell voltage limits, module operating range, balancing behavior, alarm thresholds, and safety limits." },
            { name: "OEM BMS Manual", type: "OEM Manual", desc: "Final source for cell voltage measurement behavior, balancing thresholds, warning levels, trip levels, and diagnostic logic." },
            { name: "IEEE 2686", type: "Standard", desc: "Recommended practice reference for battery management systems in stationary energy storage applications." },
            { name: "IEC 62933 Energy Storage System Standards", type: "Standard", desc: "Reference family for ESS terminology, planning, safety, and performance." },
            { name: "NFPA 855", type: "Standard", desc: "Stationary energy storage system safety reference for installation and hazard mitigation." },
            { name: "UL 9540 / UL 9540A", type: "Standard", desc: "ESS safety and thermal runaway fire propagation references." },
            { name: "BESS Commissioning Report", type: "Project Specific", desc: "Baseline field record for initial cell/module voltages, SOC, rack readiness, and balancing state." },
            { name: "SCADA / BMS Export", type: "Project Specific", desc: "Field evidence source for cell voltage spread, rack-level deviations, alarms, and balancing status." }
        ],
        note: "Cell voltage imbalance must be interpreted with SOC, rest time, charge/discharge state, temperature, balancing status, rack status, and OEM thresholds. Do not use generic limits for safety decisions. OEM BMS alarm limits and escalation procedures are the final authority."
    },
    "ttr-form.html": {
        basis: "Standard-based / Project-specific",
        basisClass: "basis-project",
        references: [
            { name: "NETA ATS / NETA MTS", type: "Standard", desc: "Acceptance and maintenance testing reference for transformers, including turns-ratio testing practices and comparison against calculated ratios." },
            { name: "IEEE C57 Transformer Standards", type: "Standard", desc: "Transformer reference family covering design, testing, loading, and performance." },
            { name: "Transformer OEM Manual", type: "OEM Manual", desc: "Primary source for nameplate ratio, vector group, tap changer configuration, winding configuration, test requirements, and acceptable tolerances." },
            { name: "Transformer Nameplate", type: "Project Specific", desc: "Field reference for rated voltages, tap positions, winding connections, phase relationship, impedance, and serial number." },
            { name: "Project SAT / Commissioning Procedure", type: "Project Specific", desc: "Final source for test sequence, tap positions to test, acceptance criteria, required evidence, and reporting format." },
            { name: "TTR Test Set Manufacturer Manual", type: "OEM Manual", desc: "Reference for instrument setup, connection method, excitation voltage, phase selection, and error calculation." }
        ],
        note: "TTR testing should be performed on all required tap positions and compared against calculated/nameplate ratios. Acceptance criteria must follow the approved project procedure, OEM documentation, and applicable testing standard. Confirm vector group, winding configuration, tap position, and phase connections before judging the result."
    },
    "ttr-form": {
        basis: "Standard-based / Project-specific",
        basisClass: "basis-project",
        references: [
            { name: "NETA ATS / NETA MTS", type: "Standard", desc: "Acceptance and maintenance testing reference for transformers, including turns-ratio testing practices and comparison against calculated ratios." },
            { name: "IEEE C57 Transformer Standards", type: "Standard", desc: "Transformer reference family covering design, testing, loading, and performance." },
            { name: "Transformer OEM Manual", type: "OEM Manual", desc: "Primary source for nameplate ratio, vector group, tap changer configuration, winding configuration, test requirements, and acceptable tolerances." },
            { name: "Transformer Nameplate", type: "Project Specific", desc: "Field reference for rated voltages, tap positions, winding connections, phase relationship, impedance, and serial number." },
            { name: "Project SAT / Commissioning Procedure", type: "Project Specific", desc: "Final source for test sequence, tap positions to test, acceptance criteria, required evidence, and reporting format." },
            { name: "TTR Test Set Manufacturer Manual", type: "OEM Manual", desc: "Reference for instrument setup, connection method, excitation voltage, phase selection, and error calculation." }
        ],
        note: "TTR testing should be performed on all required tap positions and compared against calculated/nameplate ratios. Acceptance criteria must follow the approved project procedure, OEM documentation, and applicable testing standard. Confirm vector group, winding configuration, tap position, and phase connections before judging the result."
    },
    "arc-flash.html": {
        basis: "Safety-critical / Engineering estimate",
        basisClass: "basis-safety",
        references: [
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety work practice reference for shock hazards, arc-flash risk assessment, PPE selection, approach boundaries, labeling, and energized work controls." },
            { name: "IEEE 1584-2018", type: "Standard", desc: "Guide for performing arc-flash hazard calculations, including incident energy and arc-flash boundary calculation methods." },
            { name: "Equipment Arc Flash Label", type: "Project Specific", desc: "Field source for available incident energy, arc-flash boundary, working distance, PPE level, nominal voltage, and equipment identification." },
            { name: "Short-Circuit and Coordination Study", type: "Project Specific", desc: "Engineering source for available fault current, protective device clearing time, equipment configuration, and arc-flash inputs." },
            { name: "NFPA 70 / NEC", type: "Standard", desc: "Electrical installation reference used with equipment ratings, labeling, and installation requirements where NEC applies." },
            { name: "Electrical Single-Line Diagram", type: "Project Specific", desc: "Reference for system configuration, source contribution, transformer data, protective devices, and switching arrangement." }
        ],
        note: "This calculator must not be treated as a substitute for a formal arc-flash study. Arc-flash results depend on available fault current, clearing time, working distance, enclosure type, electrode configuration, conductor gap, equipment voltage, and system configuration. For real work planning, use the approved arc-flash label, current arc-flash study, NFPA 70E requirements, and site safety procedure."
    },
    "arc-flash": {
        basis: "Safety-critical / Engineering estimate",
        basisClass: "basis-safety",
        references: [
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety work practice reference for shock hazards, arc-flash risk assessment, PPE selection, approach boundaries, labeling, and energized work controls." },
            { name: "IEEE 1584-2018", type: "Standard", desc: "Guide for performing arc-flash hazard calculations, including incident energy and arc-flash boundary calculation methods." },
            { name: "Equipment Arc Flash Label", type: "Project Specific", desc: "Field source for available incident energy, arc-flash boundary, working distance, PPE level, nominal voltage, and equipment identification." },
            { name: "Short-Circuit and Coordination Study", type: "Project Specific", desc: "Engineering source for available fault current, protective device clearing time, equipment configuration, and arc-flash inputs." },
            { name: "NFPA 70 / NEC", type: "Standard", desc: "Electrical installation reference used with equipment ratings, labeling, and installation requirements where NEC applies." },
            { name: "Electrical Single-Line Diagram", type: "Project Specific", desc: "Reference for system configuration, source contribution, transformer data, protective devices, and switching arrangement." }
        ],
        note: "This calculator must not be treated as a substitute for a formal arc-flash study. Arc-flash results depend on available fault current, clearing time, working distance, enclosure type, electrode configuration, conductor gap, equipment voltage, and system configuration. For real work planning, use the approved arc-flash label, current arc-flash study, NFPA 70E requirements, and site safety procedure."
    },
    "daily-progress.html": {
        basis: "Field-practice based / Project-specific",
        basisClass: "basis-field",
        references: [
            { name: "Project Commissioning Plan", type: "Project Specific", desc: "Primary reference for commissioning sequence, systems/subsystems, milestones, responsibilities, and acceptance process." },
            { name: "Project ITP / Quality Plan", type: "Project Specific", desc: "Reference for inspection points, hold points, witness points, required evidence, and quality sign-off." },
            { name: "OEM Commissioning Checklists", type: "OEM Manual", desc: "Equipment-specific source for required checks, test sequence, open items, and startup dependencies." },
            { name: "Project Schedule / Lookahead Plan", type: "Project Specific", desc: "Source for planned activities, milestone tracking, constraints, manpower planning, and progress measurement." },
            { name: "HSE Daily Report / JHA Records", type: "Safety", desc: "Source for safety observations, incidents, toolbox talks, permits, and hazard controls." },
            { name: "Punchlist / Open Items Register", type: "Project Specific", desc: "Field source for blockers, constraints, defects, pending inspections, owner actions, and closeout tracking." },
            { name: "Customer Reporting Requirements", type: "Contract Specific", desc: "Final source for report format, required fields, frequency, sign-offs, distribution list, and contractual language." },
            { name: "Photo Evidence and Test Records", type: "Project Specific", desc: "Supporting evidence for completed work, test status, site conditions, and pending issues." }
        ],
        note: "Daily progress reports should clearly separate completed work, work in progress, blockers, safety observations, manpower, equipment status, tests performed, open issues, customer actions, and next-day plan. Avoid making contractual claims unless supported by approved test records, signed inspections, or customer acceptance."
    },
    "daily-progress": {
        basis: "Field-practice based / Project-specific",
        basisClass: "basis-field",
        references: [
            { name: "Project Commissioning Plan", type: "Project Specific", desc: "Primary reference for commissioning sequence, systems/subsystems, milestones, responsibilities, and acceptance process." },
            { name: "Project ITP / Quality Plan", type: "Project Specific", desc: "Reference for inspection points, hold points, witness points, required evidence, and quality sign-off." },
            { name: "OEM Commissioning Checklists", type: "OEM Manual", desc: "Equipment-specific source for required checks, test sequence, open items, and startup dependencies." },
            { name: "Project Schedule / Lookahead Plan", type: "Project Specific", desc: "Source for planned activities, milestone tracking, constraints, manpower planning, and progress measurement." },
            { name: "HSE Daily Report / JHA Records", type: "Safety", desc: "Source for safety observations, incidents, toolbox talks, permits, and hazard controls." },
            { name: "Punchlist / Open Items Register", type: "Project Specific", desc: "Field source for blockers, constraints, defects, pending inspections, owner actions, and closeout tracking." },
            { name: "Customer Reporting Requirements", type: "Contract Specific", desc: "Final source for report format, required fields, frequency, sign-offs, distribution list, and contractual language." },
            { name: "Photo Evidence and Test Records", type: "Project Specific", desc: "Supporting evidence for completed work, test status, site conditions, and pending issues." }
        ],
        note: "Daily progress reports should clearly separate completed work, work in progress, blockers, safety observations, manpower, equipment status, tests performed, open issues, customer actions, and next-day plan. Avoid making contractual claims unless supported by approved test records, signed inspections, or customer acceptance."
    }
};

window.GLOBAL_HUB_RESOURCES = [
    {
        title: "1. Electrical Installation, Testing & Commissioning",
        description: "References used for PV commissioning, electrical test forms, startup procedures, cable sizing, insulation testing, grounding checks, and punchlist closeout.",
        tools: ["Inverter Start-Up Checklist", "DC Voltage Sanity Check", "Electrical Test Forms", "Commissioning Punchlist Builder", "Cable Ampacity Calculator", "Voltage Drop Calculator", "PV String Sizer & VOC Calculator", "BESS Cable Sizing Calculator", "PV Megger Field Log", "Transformer Turns Ratio (TTR) Form", "Daily Commissioning Progress Report"],
        references: [
            { name: "IEC 62446-1", type: "Standard", desc: "PV system documentation, commissioning tests, inspection, verification, handover, and periodic testing." },
            { name: "NEC / NFPA 70", type: "Standard", desc: "Electrical installation requirements, conductor sizing, ampacity, overcurrent protection, grounding, bonding, and PV circuit requirements where applicable." },
            { name: "NETA ATS / NETA MTS", type: "Standard", desc: "Acceptance and maintenance testing references for electrical power equipment." },
            { name: "IEEE C57 Transformer Standards", type: "Standard", desc: "Reference family for transformer testing, loading, design, and performance." },
            { name: "IEEE / IEC Instrument Transformer Standards", type: "Standard", desc: "Reference family for CT/PT ratio, polarity, burden, accuracy class, and testing." },
            { name: "Project SAT / Commissioning Procedure", type: "Project Specific", desc: "Final source for site-specific test sequence, required evidence, acceptance criteria, and handover requirements." }
        ],
        note: "For field acceptance, the approved project commissioning procedure, local code, and OEM manuals always take priority over generic calculator results."
    },
    {
        title: "2. Electrical Safety, LOTO & HSE",
        description: "References used for pre-task planning, LOTO, energized work controls, arc-flash awareness, BESS safety checks, and site safety documentation.",
        tools: ["BESS Pre-Energization Checklist", "Safety Pre-Task Plan / JHA Form", "Inverter Start-Up Checklist", "Battery Rack Container Inspection", "LOTO Verification Checklist", "Arc Flash Boundary Calculator", "Daily Commissioning Progress Report"],
        references: [
            { name: "OSHA 1910.147", type: "Safety", desc: "Hazardous energy control requirements during servicing and maintenance." },
            { name: "NFPA 70E", type: "Safety", desc: "Electrical safety-related work practices, shock risk, arc-flash risk, energized work controls, and electrically safe work condition." },
            { name: "OSHA Job Hazard Analysis Guide", type: "Safety", desc: "Reference for breaking a job into steps, identifying hazards, and defining controls." },
            { name: "Site HSE Plan", type: "Project Specific", desc: "Final source for site-specific safety expectations, PPE, emergency response, and escalation requirements." },
            { name: "Emergency Response Plan", type: "Safety", desc: "Reference for emergency contacts, evacuation, fire response, medical response, and incident escalation." }
        ],
        note: "Safety-critical tools are field aids only. They do not replace the approved site safety plan, LOTO procedure, work permit, or competent-person approval."
    },
    {
        title: "3. BESS Safety, Commissioning & Performance",
        description: "References used for BESS inspections, pre-energization checks, battery SOC/temperature diagnostics, capacity testing, RTE, and availability.",
        tools: ["BESS Pre-Energization Checklist", "Battery Rack Container Inspection", "BESS Capacity / Energy Test Form", "Battery SOC Imbalance Analyzer", "Battery Temperature Spread Analyzer", "BESS Availability Calculator", "BESS Cable Sizing Calculator", "BESS Cell Voltage Imbalance Calculator", "Daily Commissioning Progress Report"],
        references: [
            { name: "NFPA 855", type: "Standard", desc: "Stationary energy storage system installation safety requirements." },
            { name: "UL 9540", type: "Standard", desc: "Energy storage system and equipment safety certification reference." },
            { name: "UL 9540A", type: "Standard", desc: "Thermal runaway fire propagation test method for energy storage systems." },
            { name: "UL 1973", type: "Standard", desc: "Battery safety reference for stationary and motive auxiliary power applications." },
            { name: "UL 1741", type: "Standard", desc: "Inverter, converter, controller, and interconnection equipment safety reference." },
            { name: "IEC 62933", type: "Standard", desc: "Electrical energy storage system reference family for terminology, planning, safety, and performance." },
            { name: "IEEE 2686", type: "Standard", desc: "Recommended practice reference for battery management systems in stationary energy storage applications." },
            { name: "OEM BESS Commissioning Manual", type: "OEM Manual", desc: "Final authority for product-specific energization, interlocks, alarms, limits, and startup conditions." },
            { name: "Project Contract / Performance Test Procedure", type: "Contract Specific", desc: "Final source for guaranteed capacity, RTE, availability, exclusions, and acceptance criteria." }
        ],
        note: "BESS tools must be validated against OEM documentation, site procedures, contract definitions, and the applicable AHJ or local code requirements."
    },
    {
        title: "4. PV Performance, Testing & Soiling",
        description: "References used for PR calculations, weather correction, irradiance validation, string comparison, I-V curve interpretation, soiling loss, and customer reporting.",
        tools: ["PV Performance Ratio Calculator", "Weather Correction Calculator for PV Testing", "Irradiance Sensor Cross-Check Tool", "String Current Imbalance Calculator", "IV Curve Test Result Log", "Soiling Loss Estimator", "Clean vs. Soiled String Comparison Tool", "Cleaning ROI Calculator", "Lost Energy from Soiling Calculator", "Soiling Customer Report Generator", "PV String Sizer & VOC Calculator", "PV Megger Field Log", "Daily Commissioning Progress Report"],
        references: [
            { name: "IEC 61724", type: "Standard", desc: "PV system performance monitoring, irradiance measurement, data quality, and performance indicators." },
            { name: "NREL Weather-Corrected Performance Ratio Method", type: "Engineering Guide", desc: "Reference method for normalizing PV performance against irradiance and temperature conditions." },
            { name: "NREL PV Performance References", type: "Engineering Guide", desc: "Reference material for PR, weather correction, performance loss analysis, and data interpretation." },
            { name: "I-V Curve Interpretation Guides", type: "Engineering Guide", desc: "Reference for identifying mismatch, soiling, shading, bypass diode issues, series resistance, and module degradation." },
            { name: "PV Module Datasheet", type: "OEM Manual", desc: "Final reference for module electrical characteristics, STC values, temperature coefficients, and operating limits." },
            { name: "Sensor Calibration Certificate", type: "Project Specific", desc: "Reference for irradiance sensor calibration date, factor, uncertainty, and traceability." },
            { name: "Project Performance Test Procedure", type: "Contract Specific", desc: "Final source for contractual PR, correction method, exclusions, test window, and acceptance criteria." }
        ],
        note: "PV performance tools depend heavily on data quality, sensor calibration, measurement boundary, exclusions, and contractual definitions."
    },
    {
        title: "5. SCADA, Communications & Data Protocols",
        description: "References used for Modbus decoding, SCADA tag validation, alarm timelines, event reconstruction, data exports, and communication QA/QC.",
        tools: ["MODBUS Register Decoder", "SCADA Tag QA/QC Checklist", "Alarm / Fault Event Timeline Builder", "Number Base Converter", "UMCG Data Analysis Tool", "Firmware Version Tracker", "Technical Documentation / Reference Search Tool", "BESS Cell Voltage Imbalance Calculator"],
        references: [
            { name: "MODBUS Application Protocol Specification", type: "Protocol", desc: "Register structure, coils, discrete inputs, input registers, holding registers, and function code behavior." },
            { name: "SunSpec Modbus Models", type: "Protocol", desc: "Standardized DER models for inverters, meters, storage systems, and plant controls." },
            { name: "DNP3 / IEEE 1815", type: "Protocol", desc: "Utility SCADA communication and interoperability reference." },
            { name: "ISA-18.2 Alarm Management Standard", type: "Standard", desc: "Alarm lifecycle, rationalization, monitoring, maintenance, and management of change." },
            { name: "Device-Specific Register Map", type: "OEM Manual", desc: "Final source for register address, scaling, signed/unsigned interpretation, word order, and alarm bit definitions." },
            { name: "SCADA Historian / Alarm Export", type: "Project Specific", desc: "Evidence source for timestamps, events, alarms, measurements, and operational sequence." }
        ],
        note: "SCADA and protocol tools must be validated against device-specific register maps, timestamp alignment, scaling, units, and communication architecture."
    },
    {
        title: "6. Grid Controls, Inverter Operation & Capability",
        description: "References used for clipping, curtailment, derating, reactive power, power factor, capability curves, and grid event analysis.",
        tools: ["Inverter Clipping / Curtailment Check Tool", "Inverter Derating Cause Analyzer", "Interactive Power Triangle Tool", "Inverter Capability Curve Check", "Grid Event Voltage/Frequency Excursion Log", "Irradiance Sensor Cross-Check Tool", "PV String Sizer & VOC Calculator", "Arc Flash Boundary Calculator"],
        references: [
            { name: "IEEE 1547", type: "Standard", desc: "DER interconnection, interoperability, voltage/frequency ride-through, trip behavior, and grid support functions." },
            { name: "OEM Inverter Manual", type: "OEM Manual", desc: "Final reference for inverter operating limits, alarms, derating behavior, active power limits, and reactive power modes." },
            { name: "OEM Inverter P-Q Capability Curve", type: "OEM Manual", desc: "Model-specific active and reactive power operating envelope." },
            { name: "PPC / Plant Controller Manual", type: "OEM Manual", desc: "Reference for plant-level active power control, curtailment commands, ramp rates, and voltage/reactive power controls." },
            { name: "Utility Grid Code / Interconnection Agreement", type: "Contract Specific", desc: "Final source for voltage, frequency, PF, reactive power, ride-through, curtailment, and reporting requirements." },
            { name: "Protection Relay Disturbance Records", type: "Project Specific", desc: "High-resolution evidence for voltage dips, frequency excursions, protection trips, and event sequence." }
        ],
        note: "Grid-related tools should not be treated as compliance certification tools unless they are tied to the applicable grid code, approved test method, and validated measurement source."
    },
    {
        title: "7. Mechanical, Torque & Field Quality",
        description: "References used for torque lookup, bolted connections, mechanical QA/QC, tracker checks, and field workmanship validation.",
        tools: ["Torque Spec Finder / Bolted Connection Calculator", "Tracker Angle / Backtracking QA Checklist", "Battery Rack Container Inspection", "Commissioning Punchlist Builder", "Customer Site Visit Report Generator"],
        references: [
            { name: "OEM Torque Tables", type: "OEM Manual", desc: "Final source for equipment-specific torque values, bolt types, lubrication requirements, and connection requirements." },
            { name: "NASA Fastener Design References", type: "Engineering Guide", desc: "Reference for fastener preload, torque limitations, joint behavior, and bolted-connection fundamentals." },
            { name: "Tracker OEM Manual", type: "OEM Manual", desc: "Reference for tracker limits, calibration, stow behavior, backtracking logic, and fault handling." },
            { name: "Project Tracker Design Files", type: "Project Specific", desc: "Reference for row geometry, terrain assumptions, slope, tracker blocks, and backtracking parameters." },
            { name: "Project Turnover / Handover Procedure", type: "Project Specific", desc: "Final source for punchlist categories, closeout requirements, and acceptance criteria." }
        ],
        note: "For bolted connections and mechanical checks, OEM values and project specifications override generic engineering estimates."
    },
    {
        title: "8. Reporting, RCA, CAPA & Documentation Control",
        description: "References used for customer reports, RCA, corrective actions, document control, punchlists, and service evidence.",
        tools: ["Customer Site Visit Report Generator", "RCA Template Builder", "Corrective Action Tracker / CAPA Log", "Commissioning Punchlist Builder", "Technical Documentation / Reference Search Tool", "Transformer Turns Ratio (TTR) Form", "Daily Commissioning Progress Report"],
        references: [
            { name: "ISO 9001 Corrective Action Concepts", type: "Standard", desc: "Management-system reference for nonconformity, corrective action, effectiveness review, and continuous improvement." },
            { name: "5 Whys Root Cause Analysis Method", type: "Engineering Guide", desc: "Simple RCA method for drilling down from symptom to probable root cause." },
            { name: "Internal Service Reporting Standard", type: "Field Practice", desc: "Reference for customer-facing service report structure, evidence rules, and communication expectations." },
            { name: "Customer SLA / Service Agreement", type: "Contract Specific", desc: "Final source for response commitments, reporting obligations, scope boundaries, and deliverable expectations." },
            { name: "OEM Manuals and Service Bulletins", type: "OEM Manual", desc: "Product-specific reference library for troubleshooting, corrective actions, firmware, and field service procedures." },
            { name: "Project Closeout Documentation", type: "Project Specific", desc: "Final record of commissioning evidence, punchlist closure, test reports, and accepted deliverables." }
        ],
        note: "Customer-facing reports should separate measured facts, observations, assumptions, recommendations, pending actions, and contractual conclusions."
    }
];
