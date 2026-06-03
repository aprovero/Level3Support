# Level3Support Tool Library Consolidation and Workflow Architecture Recommendation

## 1. Purpose

This document updates the Tool Library consolidation recommendation to include a workflow architecture aligned with the proposed merged tools, status sections, and sidebar organization.

The objective is not to remove engineering functionality. The objective is to reduce duplicate tool pages, organize the Hub around real field workflows, and make the platform easier to use during PV, BESS, commissioning, diagnostics, HSE, and reporting activities.

---

## 2. Current Inventory Baseline

The supplied Tool Library inventory contains **62 listed entries**:

| Classification | Count |
|---|---:|
| Active operational/development tools | 57 |
| In Review tool | 1 |
| Legacy tools | 4 |
| **Total listed entries** | **62** |

### Status decisions

| Tool / Group | Status Decision |
|---|---|
| Torque Spec Finder & Connection Calculator `ID 11` | Move to **In Review**, not Legacy or Archive |
| Level3Support Request Form `ID 1` | Move to **Legacy** sidebar section |
| Technical Documentation Database `ID 2` | Move to **Legacy** sidebar section; superseded operationally by Active Technical Reference Search |
| Training Catalog `ID 3` | Move to **Legacy** sidebar section |
| Training Evaluation Form `ID 4` | Move to **Legacy** sidebar section |

---

# 3. Consolidation Recommendation

## 3.1 Tools Recommended for Immediate Merge

These mergers should be prioritized before rebuilding incomplete tools independently.

| Existing Tools | Recommended Merged Tool | Rationale |
|---|---|---|
| PV Megger Field Log `ID 12` + Insulation Resistance Commissioning Form `ID 23` | **Insulation Resistance Test Form** | Same test record and evaluation logic. PV becomes an equipment/application mode. |
| Transformer Turns Ratio Form `ID 14` + Transformer Test Results Form `ID 24` | **Transformer Test & TTR Report** | TTR is a core section of a complete transformer test report. Support Quick TTR and Full Report modes. |
| PV String Sizer & VOC Calculator `ID 9` + DC Voltage Sanity Check Tool `ID 19` | **PV String Voltage & Sizing Tool** | Same voltage, module-count, temperature and inverter-limit inputs; design vs. field-verification modes. |
| BESS Cable Sizing Calculator `ID 10` + Cable Ampacity Calculator `ID 29` + Voltage Drop Calculator `ID 30` | **Cable Sizing, Ampacity & Voltage Drop Calculator** | BESS is an application profile of cable sizing, not a separate calculation engine. |
| MODBUS Register Decoder `ID 35` + Number Base Converter `ID 54` | **Register, Bitmask & Number Decoder** | Number conversion, word swap and bit inspection are supporting functions of register decoding. |
| Inverter Clipping / Curtailment Check `ID 44` + Inverter Derating Cause Analyzer `ID 48` | **Inverter Power Limitation Analyzer** | Both answer: “Why is inverter output below expected?” |
| Soiling Loss Estimator `ID 55` + Clean vs. Soiled String Comparison `ID 56` + Cleaning ROI `ID 57` + Lost Energy from Soiling `ID 58` + Soiling Customer Report `ID 59` | **PV Soiling Analysis & Cleaning Decision Tool** | One continuous workflow from evidence to commercial recommendation/report. |

---

## 3.2 Workflow Consolidations Recommended After Core Merges

| Existing Tools | Recommended User-Facing Tool | Implementation Recommendation |
|---|---|---|
| PV Performance Ratio Calculator `ID 28` + Weather Correction Calculator `ID 33` | **PV Performance Verification Tool** | Tabs for PR Analysis and Weather-Corrected Output Test. Keep calculations separate internally. |
| Interactive Power Triangle `ID 49` + Inverter Capability Curve Check `ID 50` | **Reactive Power & Inverter Capability Tool** | Embed power triangle as explanatory/interactive module inside operational P-Q capability workflow. |
| BESS Cell Voltage Imbalance `ID 13` + Battery SOC Imbalance `ID 52` + Battery Temperature Spread `ID 53` | **BESS Battery Health Analyzer** | Tabs for Voltage, SOC and Temperature with combined outlier summary. Do not collapse distinct diagnostic logic. |

---

# 4. Tools That Should Remain Separate

## 4.1 BESS Tools

| Tool | ID | Reason to Keep Separate |
|---|---:|---|
| BESS Capacity / Energy Test Form | 61 | Contractual performance/RTE test, not battery health diagnostic. |
| BESS Pre-Energization Checklist | 62 | Safety and commissioning gate before energization. |
| BESS Container & Rack Inspection | 63 | Physical installation/readiness inspection. |
| BESS Spare Parts Cross-Reference | 64 | Inventory/reference function. |
| HVAC Delta-T Calculator | 32 | HVAC diagnostic that can be linked from thermal analysis but should retain standalone use. |
| BESS Availability Calculator | 31 | Contractual/reporting KPI, separate from capacity and diagnostics. |

## 4.2 PV Tools

| Tool | ID | Reason to Keep Separate |
|---|---:|---|
| String Current Imbalance Calculator | 18 | Operational current mismatch diagnosis, different from voltage sizing/verification. |
| Inverter Start-Up Checklist | 20 | Commissioning procedure/evidence record. |
| IV Curve Test Result Log | 21 | Instrument-result record and defect classification form. |
| Firmware Version Tracker | 22 | Configuration/change-control function. |
| Irradiance Sensor Cross-Check Tool | 45 | Measurement-quality diagnostic. |
| Tracker Angle / Backtracking QA Checklist | 46 | Mechanical and controls commissioning verification. |

## 4.3 Electrical, Controls, Reporting and HSE Tools

| Tool | ID | Reason to Keep Separate |
|---|---:|---|
| Grounding Continuity Test Form | 25 | Dedicated grounding/bonding measurement workflow. |
| CT/PT Ratio Verification Tool | 26 | Instrument transformer verification workflow. |
| Relay Settings Checklist | 27 | Protection/settings verification workflow. |
| Fuse Continuous Current & Temperature Derating Calculator | 60 | Distinct protective-device sizing calculation. |
| Grid Event Voltage/Frequency Excursion Log | 51 | Dedicated event/compliance evidence log. |
| Daily Commissioning Progress Report | 17 | Daily execution/progress report. |
| Commissioning Punchlist Builder | 38 | Turnover open-item tracking workflow. |
| Customer Site Visit Report Generator | 39 | Customer-facing service/reporting workflow. |
| RCA Template Builder | 40 | Cause analysis and evidence workflow. |
| Corrective Action Tracker / CAPA Log | 47 | Action lifecycle management after findings/RCA. |
| LOTO Verification Checklist | 15 | Formal hazardous-energy verification record. |
| Arc Flash Boundary Calculator | 16 | Electrical safety planning aid. |
| Safety Pre-Task Plan / JHA Form | 41 | Pre-job hazard assessment and controls record. |
| Technical Documentation / Reference Search Tool | 43 | Current operational documentation search interface. |

---

# 5. Recommended Future Sidebar Structure

## 5.1 Active Operational Tools

### A. OEM Specific Diagnostics — 4 tools

| Tool |
|---|
| ABB REJ603 Relay Configuration Tool |
| SG1+x Parameter Comparison Tool |
| UMCG Data Analysis Tool |
| PDP Module Fault Code Interpreter |

### B. BESS Commissioning & Diagnostics — 7 tools

| Tool | Composition |
|---|---|
| BESS Battery Health Analyzer | Merges IDs `13`, `52`, `53` |
| BESS Capacity / Energy Test Form | Keeps ID `61` |
| BESS Pre-Energization Checklist | Keeps ID `62` |
| BESS Container & Rack Inspection | Keeps ID `63` |
| BESS Spare Parts Cross-Reference | Keeps ID `64` |
| HVAC Delta-T Calculator | Keeps ID `32` |
| BESS Availability Calculator | Keeps ID `31` |

### C. PV Commissioning & Performance — 8 tools

| Tool | Composition |
|---|---|
| PV String Voltage & Sizing Tool | Merges IDs `9`, `19` |
| String Current Imbalance Calculator | Keeps ID `18` |
| Inverter Start-Up Checklist | Keeps ID `20` |
| IV Curve Test Result Log | Keeps ID `21` |
| Firmware Version Tracker | Keeps ID `22` |
| PV Performance Verification Tool | Merges IDs `28`, `33` |
| Irradiance Sensor Cross-Check Tool | Keeps ID `45` |
| Tracker Angle / Backtracking QA Checklist | Keeps ID `46` |

### D. SCADA & Data Diagnostics — 3 tools

| Tool | Composition |
|---|---|
| SCADA Tag QA/QC Checklist | Keeps ID `34` |
| Register, Bitmask & Number Decoder | Merges IDs `35`, `54` |
| Alarm / Fault Event Timeline Builder | Keeps ID `36` |

### E. Electrical Calculators & Test Forms — 8 tools

| Tool | Composition |
|---|---|
| Cable Sizing, Ampacity & Voltage Drop Calculator | Merges IDs `10`, `29`, `30` |
| Fuse Continuous Current & Temperature Derating Calculator | Keeps ID `60` |
| Insulation Resistance Test Form | Merges IDs `12`, `23` |
| Transformer Test & TTR Report | Merges IDs `14`, `24` |
| Grounding Continuity Test Form | Keeps ID `25` |
| CT/PT Ratio Verification Tool | Keeps ID `26` |
| Relay Settings Checklist | Keeps ID `27` |
| Arc Flash Boundary Calculator | Keeps ID `16` |

### F. Grid & Inverter Controls — 3 tools

| Tool | Composition |
|---|---|
| Inverter Power Limitation Analyzer | Merges IDs `44`, `48` |
| Reactive Power & Inverter Capability Tool | Merges IDs `49`, `50` |
| Grid Event Voltage/Frequency Excursion Log | Keeps ID `51` |

### G. PV Soiling Analysis — 1 tool

| Tool | Composition |
|---|---|
| PV Soiling Analysis & Cleaning Decision Tool | Merges IDs `55`, `56`, `57`, `58`, `59` |

### H. Reports, HSE & References — 8 tools

| Tool |
|---|
| Daily Commissioning Progress Report |
| Commissioning Punchlist Builder |
| Customer Site Visit Report Generator |
| RCA Template Builder |
| Corrective Action Tracker / CAPA Log |
| LOTO Verification Checklist |
| Safety Pre-Task Plan / JHA Form |
| Technical Documentation / Reference Search Tool |

---

## 5.2 In Review Sidebar Section

Create a sidebar section called **In Review**.

| Tool | ID | Reason |
|---|---:|---|
| Torque Spec Finder & Connection Calculator | 11 | Useful potential field-QA resource, but not safe for active use until data sourcing, OEM priority, connection conditions and validation warnings are properly implemented. |

### In Review display rules

- Show an `In Review` badge.
- Do not count the tool as active/operational.
- Do not display it in the default active Tool Library filter.
- Allow access for evaluation and continued development.
- Include this notice inside the tool:

> This tool is currently under technical review. Torque values must be confirmed against the applicable OEM manual, approved project specification, connection type, bolt grade, thread condition and lubrication state before field use.

---

## 5.3 Legacy Sidebar Section

Create a sidebar section called **Legacy**.

| Tool | ID | Reason |
|---|---:|---|
| Level3Support Request Form | 1 | Historical request workflow, not an active field tool. |
| Technical Documentation Database | 2 | Superseded operationally by Technical Documentation / Reference Search Tool `ID 43`. |
| Training Catalog | 3 | Training workflow, outside current operational field-tool library. |
| Training Evaluation Form | 4 | Historical/training workflow, outside active operational tools. |

### Legacy display rules

- Show a `Legacy` badge.
- Exclude Legacy tools from default active search/filter results.
- Allow users to enable `Show Legacy`.
- Use this notice on legacy pages:

> This tool is retained for historical reference and may no longer reflect the current Level3Support workflow. For current operational use, refer to the active Tool Library.

---

# 6. Final Proposed Counts

| Classification | Current Count | Recommended Visible Count |
|---|---:|---:|
| Active operational tools | 57 | 42 |
| In Review tools | 1 | 1 |
| Legacy tools | 4 | 4 |
| **Total visible entries** | **62** | **47** |

| Reduction Metric | Value |
|---|---:|
| Active navigation entries removed through consolidation | 15 |
| Active menu reduction | 26.3% |
| Engineering functionality removed | None intended |

---

---

# 7. Confirmed Field Workflow Packs: Assessment and Update Strategy

The Hub already includes **8 Field Workflow Packs**. These should not be replaced by a completely new workflow structure. They should be **updated to use the merged tools**, tightened so required steps are not confused with optional diagnostic steps, and supplemented only where a real workflow gap exists.

## 7.1 Existing Workflow Pack Assessment

| Existing Workflow Pack | Keep / Change | Main Recommendation |
|---|---|---|
| PV Commissioning Sequence | Keep and update | Replace separate string sizing/DC voltage and PV Megger steps with merged tools; distinguish required commissioning steps from conditional tools. |
| BESS Commissioning Sequence | Keep and update | Replace separate battery health analyzers and BESS cable tool with merged tools; move RCA to conditional output only. |
| PV Underperformance Troubleshooting | Keep and update | Replace PR/weather, clipping/derating and soiling tools with merged diagnostic workspaces. |
| BESS Container Troubleshooting | Keep and update | Use BESS Battery Health Analyzer and Register/Bitmask Decoder; make availability conditional rather than a core troubleshooting step. |
| Grid / PPC & Reactive Power Testing | Split / refocus | Keep grid/PPC focus; move transformer/protection testing into a new dedicated MV Transformer & Protection Commissioning workflow. |
| Soiling Analysis Workflow | Keep and collapse | It becomes a direct workflow wrapper around the merged PV Soiling Analysis & Cleaning Decision Tool. |
| SCADA & Comms Troubleshooting | Keep and update | Use Register, Bitmask & Number Decoder instead of two separate tools; retain OEM diagnostics as conditional branches. |
| Reporting / Field Closeout | Keep and refocus | Remove LOTO and Arc Flash as default closeout steps; those belong to active work/safety workflows unless additional field work is required. |

---

# 8. Tool Merge Mapping for Existing Workflow Packs

Use this mapping anywhere an existing workflow currently references an old or redundant tool.

| Existing Tool Reference in Workflows | Replace With | Mode / Tab to Preselect |
|---|---|---|
| PV String Sizer & VOC Calculator | **PV String Voltage & Sizing Tool** | `Design / String Sizing` |
| DC Voltage Sanity Check Tool | **PV String Voltage & Sizing Tool** | `Field Voltage Verification` |
| PV Insulation Resistance Tester / PV Megger Field Log | **Insulation Resistance Test Form** | `PV Array / String` |
| Insulation Resistance Commissioning Form | **Insulation Resistance Test Form** | Select applicable equipment profile |
| Transformer Turns Ratio Form | **Transformer Test & TTR Report** | `Quick TTR` |
| Transformer Test Results Form | **Transformer Test & TTR Report** | `Full Transformer Test` |
| BESS Cable Sizing Calculator | **Cable Sizing, Ampacity & Voltage Drop Calculator** | `BESS DC` or `BESS Auxiliary AC` |
| Cable Ampacity / Max Current Calculator | **Cable Sizing, Ampacity & Voltage Drop Calculator** | Applicable circuit profile |
| Voltage Drop Calculator | **Cable Sizing, Ampacity & Voltage Drop Calculator** | Applicable circuit profile |
| BESS Cell Voltage Imbalance Calculator | **BESS Battery Health Analyzer** | `Cell / Module Voltage Spread` |
| Battery SOC Imbalance Analyzer | **BESS Battery Health Analyzer** | `SOC Spread` |
| Battery Temperature Spread Analyzer | **BESS Battery Health Analyzer** | `Temperature Spread` |
| PV Performance Ratio Calculator | **PV Performance Verification Tool** | `PR Analysis` |
| Weather Correction for PV Testing | **PV Performance Verification Tool** | `Weather-Corrected Output` |
| Inverter Clipping / Curtailment Check | **Inverter Power Limitation Analyzer** | `Power Limitation Diagnosis` |
| Inverter Derating Cause Analyzer | **Inverter Power Limitation Analyzer** | `Power Limitation Diagnosis` |
| Interactive Power Triangle Tool | **Reactive Power & Inverter Capability Tool** | `Power Triangle / PF Scenario` |
| Inverter Capability Curve Check | **Reactive Power & Inverter Capability Tool** | `P-Q Capability Check` |
| MODBUS Register Decoder | **Register, Bitmask & Number Decoder** | `Register Decode` |
| Number Base Converter | **Register, Bitmask & Number Decoder** | `Bitmask / Number Conversion` |
| Soiling Loss Estimator | **PV Soiling Analysis & Cleaning Decision Tool** | `Loss Estimate` |
| Clean vs. Soiled Comparison Tool | **PV Soiling Analysis & Cleaning Decision Tool** | `Clean vs. Soiled Comparison` |
| Lost Energy from Soiling Calculator | **PV Soiling Analysis & Cleaning Decision Tool** | `Lost Energy` |
| Cleaning ROI Calculator | **PV Soiling Analysis & Cleaning Decision Tool** | `Cleaning ROI` |
| Soiling Customer Report Generator | **PV Soiling Analysis & Cleaning Decision Tool** | `Customer Report` |

---

# 9. Updated Existing Workflow Packs

## Workflow Pack 1: PV Commissioning Sequence

### Purpose

Step-by-step process to inspect, test, start up, verify and document utility-scale PV inverters and associated string arrays.

### Tags

`Solar PV` `Commissioning` `Electrical Testing`

### Workflow structure recommendation

Separate the workflow into **Required Core Steps** and **Conditional / Supporting Steps**. Not every commissioning day requires IV-curve testing, Sungrow parameter comparison, fuse verification or a customer-facing report.

## Required Core Steps

| Step | Updated Tool / Module | Use in Workflow | Output |
|---:|---|---|---|
| 1 | Safety Pre-Task Plan / JHA Form | Confirm work scope, hazards, PPE, permits and emergency controls before field work. | Approved pre-task safety record |
| 2 | LOTO Verification Checklist, when testing or inspection requires isolation | Confirm energy isolation and zero-energy verification before intrusive electrical checks. | LOTO verification record |
| 3 | Inverter Start-Up Checklist | Perform visual inspection, AC/DC readiness, grounding, communications and initial startup checks. | Startup checklist record |
| 4 | **PV String Voltage & Sizing Tool** - `Field Voltage Verification` mode | Verify measured string voltage against expected module count and temperature-corrected values. | Voltage verification results |
| 5 | **Insulation Resistance Test Form** - `PV Array / String` mode | Log insulation resistance testing where included in the approved commissioning procedure. | PV IR/Megger test record |
| 6 | String Current Imbalance Calculator | Compare current output across comparable strings after operation is available. | Current imbalance summary |
| 7 | Firmware Version Tracker | Record as-left firmware baseline and flag mismatches. | Firmware baseline register |
| 8 | Commissioning Punchlist Builder | Capture failures, missing items and required corrections. | Punchlist record |
| 9 | Daily Commissioning Progress Report | Record completed work, blockers, test status and next-day plan. | Daily field handover report |

## Conditional / Supporting Steps

| Condition | Tool / Module | Why It Is Conditional |
|---|---|---|
| String design or installed module-count verification is required | **PV String Voltage & Sizing Tool** - `Design / String Sizing` mode | Needed for design validation or suspected configuration mismatch, not every daily startup. |
| Detailed array performance or acceptance testing is required | IV Curve Test Result Log | IV testing is not required for every inverter startup activity. |
| Site uses Sungrow SG1+x and configuration validation is required | SG1+x Parameter Comparison Tool | OEM/model-specific validation step. |
| SCADA/control handover is included in current scope | SCADA Tag QA/QC Checklist | Should occur when communications/control scope is ready for validation. |
| Fuse selection or thermal derating is specifically in scope | Fuse Continuous Current & Temperature Derating Calculator | Design/verification aid, not a default commissioning signoff step. |
| Customer report is required for milestone or visit closeout | Customer Site Visit Report Generator | External deliverable, not required for every shift. |

### Main correction to the existing pack

The original workflow placed string design calculation, field voltage verification, PV Megger testing, fuse calculation and customer reporting in one flat sequence. The updated workflow preserves all capabilities while separating **mandatory commissioning evidence** from **scope-dependent support tasks**.

---

## Workflow Pack 2: BESS Commissioning Sequence

### Purpose

Complete safe BESS inspection, pre-energization verification, battery condition checks, commissioning tests and daily evidence records for storage containers or blocks.

### Tags

`BESS` `Commissioning` `Safety` `Testing`

## Required Core Steps

| Step | Updated Tool / Module | Use in Workflow | Output |
|---:|---|---|---|
| 1 | Safety Pre-Task Plan / JHA Form | Establish job hazards, controls, PPE, permits and emergency response. | Approved safety record |
| 2 | LOTO Verification Checklist | Confirm isolation boundaries, lock/tag status and zero-energy verification when required. | LOTO record |
| 3 | BESS Container & Rack Inspection | Verify structural condition, electrical bonds, HVAC, fire suppression and rack readiness. | Container/rack inspection record |
| 4 | **BESS Battery Health Analyzer** - Voltage, SOC and Temperature tabs | Review cell/module voltage, rack SOC balance and temperature outliers before or during commissioning. | Battery health baseline |
| 5 | HVAC Delta-T Calculator | Validate initial thermal-management behavior once HVAC is operable. | HVAC sanity-check result |
| 6 | BESS Pre-Energization Checklist | Complete final safety and technical gate before utility/DC bus energization. | Energization authorization record |
| 7 | BESS Capacity / Energy Test Form, when performance testing is in scope | Record charge/discharge cycles, delivered energy and RTE. | Capacity/RTE test report |
| 8 | Daily Commissioning Progress Report | Capture completed work, blockers, abnormal findings and next steps. | Daily progress report |

## Conditional / Supporting Steps

| Condition | Updated Tool / Module | Why It Is Conditional |
|---|---|---|
| Auxiliary or external cable sizing needs verification | **Cable Sizing, Ampacity & Voltage Drop Calculator** - `BESS Auxiliary AC/DC` mode | Not a default commissioning field test and should not substitute for design approval. |
| Fuse sizing/derating verification is specifically required | Fuse Continuous Current & Temperature Derating Calculator | Used only when protective-device verification is in scope. |
| Startup faults or repeated alarms occur | Alarm / Fault Event Timeline Builder | Diagnostic escalation step, not default commissioning paperwork. |
| Startup failure requires formal investigation | RCA Template Builder | Only required when failure significance warrants formal RCA. |
| Deficiencies require tracked resolution | Commissioning Punchlist Builder or Corrective Action Tracker / CAPA Log | Used based on finding type and closeout requirements. |

### Critical safety correction

Do not include generic insulation resistance testing directly through connected battery racks, BMS electronics or battery modules as a routine step. Any IR test on BESS-associated circuits must be limited to circuits and test conditions permitted by the OEM and the approved commissioning procedure.

---

## Workflow Pack 3: PV Underperformance Troubleshooting

### Purpose

Investigate low solar plant production by separating measurement-quality issues, weather effects, inverter limitations, tracker behavior, string-level faults and soiling impacts.

### Tags

`Solar PV` `O&M` `Performance` `Diagnostics`

## Updated Diagnostic Sequence

| Step | Updated Tool / Module | Diagnostic Question | Output |
|---:|---|---|---|
| 1 | Irradiance Sensor Cross-Check Tool | Can the irradiance data be trusted for further performance diagnosis? | Sensor reliability finding |
| 2 | **PV Performance Verification Tool** - `PR Analysis` and/or `Weather-Corrected Output` | Is the performance shortfall real after accounting for weather and measurement boundary? | Quantified performance deviation |
| 3 | **Inverter Power Limitation Analyzer** | Is low output explained by clipping, PPC/export curtailment, thermal limits, voltage/frequency conditions, reactive-power demand or faults? | Probable limitation classification |
| 4 | String Current Imbalance Calculator | Are selected strings or MPPT groups underperforming relative to comparable strings? | Flagged string-current outliers |
| 5 | **PV String Voltage & Sizing Tool** - `Field Voltage Verification` mode, when DC issues are suspected | Does string voltage suggest incorrect module count, polarity, open string or other DC issue? | Voltage anomaly record |
| 6 | IV Curve Test Result Log, when deeper DC-array evidence is required | Do IV curves indicate shading, soiling, diode issues, mismatch or degradation? | Detailed IV evidence |
| 7 | Tracker Angle / Backtracking QA Checklist, tracker sites only | Is tracker behavior contributing to underproduction? | Tracker QA finding |
| 8 | **PV Soiling Analysis & Cleaning Decision Tool**, when soiling is plausible | What portion of loss is attributable to soiling and is cleaning justified? | Cleaning recommendation / soiling report |
| 9 | Alarm / Fault Event Timeline Builder, when event behavior is involved | Do alarms/events explain the timing or cause of production losses? | Event timeline |
| 10 | RCA Template Builder and CAPA Log, when material or repeated failure is confirmed | What corrective/preventive action is required? | RCA/CAPA record |

### Main correction to the existing pack

The five existing soiling tools should no longer appear as independent steps, and PR/weather correction plus clipping/derating should be represented by their merged diagnostic workspaces.

---

## Workflow Pack 4: BESS Container Troubleshooting

### Purpose

Investigate battery container alarms, rack imbalance, thermal anomalies, HVAC degradation, PLC/BMS data issues and repeated failures.

### Tags

`BESS` `O&M` `Thermal` `Diagnostics`

## Updated Diagnostic Sequence

| Step | Updated Tool / Module | Diagnostic Question | Output |
|---:|---|---|---|
| 1 | Technical Documentation / Reference Search Tool | What OEM procedure, alarm definition and threshold applies to this event? | Reference basis |
| 2 | BESS Container & Rack Inspection | Is there visible evidence of physical, thermal, fire-system, bonding or cooling abnormality? | Inspection evidence |
| 3 | **BESS Battery Health Analyzer** - Voltage, SOC and Temperature tabs | Which rack/module/cluster is abnormal and what type of spread exists? | Outlier summary |
| 4 | HVAC Delta-T Calculator, when thermal or HVAC issue is suspected | Is the HVAC system showing an abnormal supply/return/ambient relationship? | HVAC finding |
| 5 | **Register, Bitmask & Number Decoder** | Do raw PLC/BMS registers or alarm masks clarify the failure state? | Decoded telemetry evidence |
| 6 | Alarm / Fault Event Timeline Builder | What is the alarm sequence and recurrence pattern? | Event timeline |
| 7 | BESS Spare Parts Cross-Reference, when replacement may be required | Is a compatible critical spare identified and available? | Parts recommendation |
| 8 | RCA Template Builder, for significant/repeated fault | What is the supported root cause? | RCA record |
| 9 | Corrective Action Tracker / CAPA Log | What actions, owners and verification steps are required? | CAPA record |

## Conditional Commercial Assessment

| Condition | Tool | Reason |
|---|---|---|
| The failure has generated commercial unavailability or contractual reporting implications | BESS Availability Calculator | Availability is an impact/reporting calculation, not a primary fault diagnostic step. |

### Main correction to the existing pack

BESS Availability should no longer appear as a default troubleshooting sequence step. It should be triggered only when the diagnosed event affects contractual/commercial availability reporting.

---

## Workflow Pack 5: Grid / PPC & Reactive Power Testing

### Purpose

Validate plant controller behavior, active/reactive power response, inverter capability, grid excursion response and SCADA/control evidence.

### Tags

`Grid` `PPC` `Controls` `Reactive Power`

## Updated Grid / PPC Test Sequence

| Step | Updated Tool / Module | Use in Workflow | Output |
|---:|---|---|---|
| 1 | Technical Documentation / Reference Search Tool | Retrieve PPC/inverter procedure, grid-code requirement, test plan and active revision. | Reference basis |
| 2 | **Reactive Power & Inverter Capability Tool** - `P-Q Capability Check` and `Power Triangle / PF Scenario` | Verify requested operating points and interpret active/reactive/apparent power behavior. | Capability verification |
| 3 | Grid Event Voltage/Frequency Excursion Log | Record grid voltage/frequency behavior during PPC or compliance steps. | Grid event log |
| 4 | **Inverter Power Limitation Analyzer**, when output limits are observed | Determine whether the plant response is attributable to control commands or equipment/grid limitations. | Limitation diagnosis |
| 5 | SCADA Tag QA/QC Checklist | Validate PPC control commands, setpoints, HMI data and historian logging. | Controls QA/QC record |
| 6 | **Register, Bitmask & Number Decoder**, when raw telemetry verification is required | Decode control/status/meter registers and flags. | Register validation |
| 7 | Alarm / Fault Event Timeline Builder, when alarms/events occur | Correlate control steps with fault/event sequence. | Timeline evidence |
| 8 | Customer Site Visit Report Generator or Daily Commissioning Progress Report | Document completed testing, observations and pending items. | Test summary/report |

## Tools removed from the default Grid / PPC sequence

| Tool Previously Included | Decision | Reason |
|---|---|---|
| Transformer Turns Ratio Form | Move to new **MV Transformer & Protection Commissioning** workflow | Transformer ratio testing is not a normal PPC/reactive-power test step. |
| PV Insulation Resistance Tester | Remove from default grid/PPC workflow | PV megger testing is unrelated unless separate electrical testing scope exists. |
| CT/PT Ratio Verification Tool | Move to new MV/Protection workflow or include only when meter/protection chain validation is explicitly in scope | Not required for every PPC reactive-power test. |
| Relay Settings Checklist | Move to new MV/Protection workflow or include only when protection controls are affected | Protection commissioning is separate from routine PPC operation testing. |
| ABB REJ603 Relay Configuration Tool | Move to new MV/Protection workflow or conditional OEM branch | OEM relay configuration does not belong in the default PPC workflow. |

### Main correction to the existing pack

The original Grid / PPC pack mixed power-control testing with transformer and protection commissioning. These are related at system level but require different evidence, personnel and procedures. Keep the Grid/PPC workflow focused and create a dedicated MV/Protection workflow.

---

## Workflow Pack 6: Soiling Analysis Workflow

### Purpose

Quantify PV energy degradation from soiling, assess cleaning value and generate a customer-facing recommendation.

### Tags

`Solar PV` `Soiling` `O&M` `ROI`

## Updated Workflow

This workflow now becomes a guided workflow inside one merged tool:

# **PV Soiling Analysis & Cleaning Decision Tool**

| Step / Tab | Function | Output |
|---:|---|---|
| 1. Input Data & Measurement Quality | Record site, period, irradiance source, energy source, cleaning history and assumptions. Link to Irradiance Sensor Cross-Check when data quality is uncertain. | Validated analysis inputs |
| 2. Clean vs. Soiled Comparison | Compare cleaned reference and soiled test strings/areas where available. | Measured soiling comparison |
| 3. Soiling Loss Estimate | Estimate loss percentage using selected method and data. | Soiling loss estimate |
| 4. Lost Energy | Calculate energy impact over the evaluation period. | Lost kWh/MWh estimate |
| 5. Cleaning ROI | Compare expected recoverable revenue against cleaning cost. | Cleaning economic decision |
| 6. Customer Report | Generate evidence-based recommendation and report. | Customer-ready output |

### Optional linked actions

| Condition | Tool |
|---|---|
| Sensor reliability is uncertain | Irradiance Sensor Cross-Check Tool |
| Cleaning action must be assigned/tracked | Corrective Action Tracker / CAPA Log |
| Broader underperformance analysis is required | PV Underperformance Troubleshooting workflow |

### Main correction to the existing pack

The five original soiling tools should be merged into one workflow tool rather than presented as five separate Tool Library cards and five disconnected workflow steps.

---

## Workflow Pack 7: SCADA & Comms Troubleshooting

### Purpose

Diagnose signal mapping, protocol interpretation, raw data anomalies, equipment alarms and communication failures.

### Tags

`SCADA` `MODBUS` `Communications` `Diagnostics`

## Updated Troubleshooting Sequence

| Step | Updated Tool / Module | Diagnostic Question | Output |
|---:|---|---|---|
| 1 | Technical Documentation / Reference Search Tool | Which active point list, register map, OEM protocol document and bulletin applies? | Document/revision basis |
| 2 | SCADA Tag QA/QC Checklist | Are signal scaling, controls, HMI displays and historian logs correct? | SCADA QA/QC record |
| 3 | **Register, Bitmask & Number Decoder** | Are register values, float types, byte/word order and alarm bitmasks interpreted correctly? | Decoded values/evidence |
| 4 | Alarm / Fault Event Timeline Builder | What chronological alarm/event sequence occurred? | Event timeline |
| 5 | UMCG Data Analysis Tool, for applicable Sungrow exports | What do the OEM operational logs show? | Trend/log analysis |
| 6 | PDP Module Fault Code Interpreter, for applicable Sungrow module/PDP faults | What does the raw OEM diagnostic status indicate? | Fault interpretation |
| 7 | SG1+x Parameter Comparison Tool, when configuration mismatch is suspected | Does configuration variance explain communication/control behavior? | Parameter comparison |
| 8 | Firmware Version Tracker, when device compatibility/version may contribute | Is firmware mismatch or baseline deviation involved? | Firmware evidence |
| 9 | CAPA / Customer Report / Daily Report, based on outcome | Track action or communicate findings. | Closure record |

### Main correction to the existing pack

MODBUS Register Decoder and Number Base Converter become one integrated tool. OEM tools should only appear when the installed equipment and issue type make them applicable.

---

## Workflow Pack 8: Reporting / Field Closeout

### Purpose

Finalize field evidence, track unresolved actions, close reports and generate customer-ready documentation after field work has been performed.

### Tags

`Closeout` `Reports` `Actions` `Handover`

## Updated Closeout Sequence

| Step | Updated Tool / Module | Use in Workflow | Output |
|---:|---|---|---|
| 1 | Daily Commissioning Progress Report | Consolidate completed work, tests, constraints, blockers and next actions for the period. | Daily/progress record |
| 2 | Commissioning Punchlist Builder, when commissioning or handover deficiencies exist | Record remaining items, categories, owners and closure requirements. | Punchlist register |
| 3 | Corrective Action Tracker / CAPA Log, when formal action tracking is required | Track corrective/preventive actions, ownership, due dates and evidence. | CAPA register |
| 4 | RCA Template Builder, when a failure or significant incident requires formal analysis | Document evidence, causes and corrective/preventive action basis. | RCA document |
| 5 | Customer Site Visit Report Generator, when customer deliverable is needed | Compile observations, work performed, results, recommendations and signoff. | Customer report |
| 6 | Technical Documentation / Reference Search Tool | Validate that reported specifications/procedures reference active documents. | Documentation validation |
| 7 | Relevant specialized report output, when applicable | Include soiling report, capacity/RTE report, SCADA handover record or other discipline evidence. | Supporting deliverable package |

## Tools removed as default closeout steps

| Tool Previously Included | Decision | Reason |
|---|---|---|
| LOTO Verification Checklist | Remove from default closeout flow; retain as linked prerequisite when field work involved isolation | LOTO is a work execution safety record, not a reporting/closeout activity. |
| Arc Flash Boundary Calculator | Remove from default closeout flow; retain where further electrical work planning is required | Arc-flash planning is not a default reporting step. |
| Soiling Customer Report Generator as standalone tool | Replace with output from **PV Soiling Analysis & Cleaning Decision Tool** | Soiling reporting belongs inside the merged soiling workflow. |

### Main correction to the existing pack

Closeout should aggregate completed evidence, unresolved actions and customer deliverables. It should not make safety-planning tools appear to be routine reporting steps.

---

# 10. New Workflow Packs to Add

Your existing eight packs cover most operating needs. The following additional packs close genuine workflow gaps created by the current tool inventory and the merged-tool strategy.

## New Workflow Pack 9: MV Transformer & Protection Commissioning

### Why this is needed

The existing Grid / PPC workflow contains transformer TTR, CT/PT verification, relay settings and ABB REJ603 steps. Those tasks are important, but they represent a distinct MV/protection commissioning workflow rather than a PPC reactive-power test.

### Purpose

Guide transformer, instrument transformer, relay and SCADA validation during MV skid, substation or inverter-station commissioning.

### Tags

`MV` `Transformer` `Protection` `Commissioning`

### Workflow Steps

| Step | Tool / Module | Output |
|---:|---|---|
| 1 | Safety Pre-Task Plan / JHA Form | Task hazards and controls documented. |
| 2 | LOTO Verification Checklist | Isolation and zero-energy verification documented. |
| 3 | Arc Flash Boundary Calculator, when approved study/label inputs are available and relevant to planning | Electrical safety planning evidence. |
| 4 | Grounding Continuity Test Form | Grounding/bonding test record. |
| 5 | **Transformer Test & TTR Report** - `Full Transformer Test` or `Quick TTR` mode | Transformer commissioning evidence. |
| 6 | CT/PT Ratio Verification Tool | Instrument transformer ratio/polarity record. |
| 7 | Relay Settings Checklist | Settings, firmware, I/O and test reference verification. |
| 8 | ABB REJ603 Relay Configuration Tool, ABB applicable equipment only | OEM-specific relay configuration verification. |
| 9 | SCADA Tag QA/QC Checklist, when protection/SCADA signals are in scope | Telemetry/control/alarm validation. |
| 10 | Commissioning Punchlist Builder | Open items recorded. |
| 11 | Daily Commissioning Progress Report or Customer Site Visit Report | Completion/handover report. |

---

## New Workflow Pack 10: Grid Event / Plant Trip Investigation

### Why this is needed

You have tools for event logs, alarm timelines, inverter power limitations, registers, OEM diagnostics, RCA and CAPA, but there is no direct investigation pack for plant trips or grid excursions.

### Purpose

Reconstruct, diagnose and document voltage/frequency excursions, plant trips, repeated inverter shutdowns and PPC-related event responses.

### Tags

`Grid` `Trip Investigation` `RCA` `Diagnostics`

### Workflow Steps

| Step | Tool / Module | Output |
|---:|---|---|
| 1 | Grid Event Voltage/Frequency Excursion Log | Event measurements and excursion classification. |
| 2 | Alarm / Fault Event Timeline Builder | Chronological event sequence. |
| 3 | **Register, Bitmask & Number Decoder**, when raw codes/registers exist | Decoded control/fault data. |
| 4 | **Inverter Power Limitation Analyzer** | Assessment of control/derating/fault response. |
| 5 | **Reactive Power & Inverter Capability Tool**, when reactive/PF behavior is relevant | P-Q operating point evidence. |
| 6 | UMCG / PDP / SG1+x / ABB REJ603 OEM tool, only where applicable | Equipment-specific evidence. |
| 7 | RCA Template Builder | Root cause analysis. |
| 8 | Corrective Action Tracker / CAPA Log | Action tracking and verification. |
| 9 | Customer Site Visit Report Generator, if external communication is required | Customer-facing report. |

---

## New Workflow Pack 11: Firmware & Configuration Change Control

### Why this is needed

The Hub can identify firmware and parameter differences, but a controlled before/after workflow is needed to avoid creating faults during updates or configuration changes.

### Purpose

Document firmware or parameter baseline, implementation, validation and rollback evidence for plant equipment changes.

### Tags

`Firmware` `Configuration` `Change Control` `SCADA`

### Workflow Steps

| Step | Tool / Module | Output |
|---:|---|---|
| 1 | Technical Documentation / Reference Search Tool | Approved firmware note/procedure/reference identified. |
| 2 | Firmware Version Tracker | Current and proposed firmware baseline recorded. |
| 3 | SG1+x Parameter Comparison Tool, applicable Sungrow devices only | Pre-change/post-change parameter comparison. |
| 4 | SCADA Tag QA/QC Checklist, when communication or control points may be affected | Functional validation evidence. |
| 5 | Alarm / Fault Event Timeline Builder, when validation produces alarms | Event evidence. |
| 6 | Corrective Action Tracker / CAPA Log or dedicated change record | Action, approval and rollback/closure record. |
| 7 | Customer Site Visit Report Generator, if change is customer-facing | Formal field report. |

---

## New Workflow Pack 12: BESS Fault-to-Parts Resolution

### Why this is needed

The BESS Spare Parts Cross-Reference becomes significantly more valuable when tied to a validated diagnostic and action-tracking workflow.

### Purpose

Convert confirmed BESS alarms or degraded components into compatible spare-part identification, replacement planning and action closeout.

### Tags

`BESS` `Spares` `Service` `Corrective Maintenance`

### Workflow Steps

| Step | Tool / Module | Output |
|---:|---|---|
| 1 | Technical Documentation / Reference Search Tool | Applicable OEM fault/service reference identified. |
| 2 | BESS Container & Rack Inspection | Physical evidence recorded. |
| 3 | **BESS Battery Health Analyzer** and/or HVAC Delta-T Calculator | Fault location/thermal condition confirmed. |
| 4 | Alarm / Fault Event Timeline Builder | Recurrence and trigger evidence recorded. |
| 5 | BESS Spare Parts Cross-Reference | Compatible part and criticality identified. |
| 6 | Customer Site Visit Report Generator | Replacement recommendation documented. |
| 7 | Corrective Action Tracker / CAPA Log | Procurement/replacement/verification closeout tracked. |

---

## New Workflow Pack 13: Commissioning Closeout & Handover

### Why this is needed

The existing Reporting / Field Closeout pack is designed around individual field reports. A project milestone or block turnover requires an evidence-completeness workflow.

### Purpose

Confirm that test records, open items, firmware baselines, SCADA handover records and customer deliverables are ready for turnover.

### Tags

`Commissioning` `Handover` `Closeout` `Quality`

### Workflow Steps

| Step | Tool / Module | Output |
|---:|---|---|
| 1 | Daily Commissioning Progress Report | Confirm scope executed and remaining constraints. |
| 2 | Commissioning Punchlist Builder | Confirm open/closed turnover items. |
| 3 | Applicable completed test records | Confirm required PV/BESS/MV/electrical evidence exists. |
| 4 | Firmware Version Tracker | Confirm as-left device baseline. |
| 5 | SCADA Tag QA/QC Checklist, when SCADA is part of turnover | Confirm communication/control handover. |
| 6 | Corrective Action Tracker / CAPA Log | Confirm remaining actions, owners and closure obligations. |
| 7 | Customer Site Visit Report Generator or future Handover Summary output | Generate turnover summary. |

### Product recommendation

Do not build a separate Handover Package Builder immediately. First validate this workflow. If users need a combined PDF/export package later, then create the report-generation feature.

---

# 11. Workflows Not Recommended as Separate Packs Yet

Avoid creating too many workflows prematurely. The following ideas should remain branches inside existing packs unless field usage proves they deserve standalone entry points.

| Possible Workflow | Decision | Reason |
|---|---|---|
| Repeat Fault Investigation & CAPA Validation | Keep as a branch of Grid Event / Plant Trip Investigation or BESS Container Troubleshooting for now | Useful, but overlaps heavily with existing RCA/CAPA escalation logic. |
| General Field Service Visit Workflow | Keep as an entry mode in Reporting / Field Closeout | Too generic unless different disciplines require different paths. |
| Dedicated PV Sensor Calibration Workflow | Keep within PV Underperformance until sensor work becomes frequent | Only one dedicated sensor tool currently exists. |
| Dedicated Fuse Verification Workflow | Do not create | Calculator is supporting activity, not a full workflow. |

---

# 12. Updated Workflow Sidebar Structure

Create or preserve a sidebar section called:

# **Field Workflow Packs**

## Recommended visible packs

| # | Workflow Pack | Status | Main Change |
|---:|---|---|---|
| 1 | PV Commissioning Sequence | Existing - Update | Use merged PV voltage and IR tools; split core vs conditional steps. |
| 2 | BESS Commissioning Sequence | Existing - Update | Use merged battery health and cable tools; RCA conditional. |
| 3 | PV Underperformance Troubleshooting | Existing - Update | Use merged PR/weather, limitation and soiling tools. |
| 4 | BESS Container Troubleshooting | Existing - Update | Use merged battery health and register decoder; availability conditional. |
| 5 | Grid / PPC & Reactive Power Testing | Existing - Refocus | Remove default transformer/protection and PV Megger steps. |
| 6 | Soiling Analysis Workflow | Existing - Collapse | Workflow now opens the merged soiling tool. |
| 7 | SCADA & Comms Troubleshooting | Existing - Update | Replace separate Modbus/base tools with combined decoder. |
| 8 | Reporting / Field Closeout | Existing - Refocus | Remove LOTO/Arc Flash as default report steps. |
| 9 | MV Transformer & Protection Commissioning | New - Recommended | Absorbs protection/MV tests removed from Grid/PPC workflow. |
| 10 | Grid Event / Plant Trip Investigation | New - Recommended | Provides RCA-ready trip/event diagnostic flow. |
| 11 | Firmware & Configuration Change Control | New - Recommended | Controls version/parameter changes and validation. |
| 12 | BESS Fault-to-Parts Resolution | New - Recommended | Connects diagnostics to spare parts and CAPA. |
| 13 | Commissioning Closeout & Handover | New - Recommended | Provides turnover evidence completeness workflow. |

## Recommended initial release decision

Do not build all five new workflows at once.

### Release with the consolidation update

| Pack | Action |
|---|---|
| Existing Packs 1-8 | Update them to reference the merged tools and revised required/conditional logic. |
| Pack 9: MV Transformer & Protection Commissioning | Add now, because it corrects the mixed scope currently inside Grid/PPC. |
| Pack 10: Grid Event / Plant Trip Investigation | Add now, because existing diagnostic tools already support it well. |
| Pack 11: Firmware & Configuration Change Control | Add now as a controlled workflow for firmware and parameter baselines, change validation and traceability. |
| Pack 12: BESS Fault-to-Parts Resolution | Add now to connect BESS diagnostics, spare-part identification and CAPA closeout. |
| Pack 13: Commissioning Closeout & Handover | Add now to formalize turnover readiness, evidence completeness and customer handover reporting. |

### Dependency note

Packs 11-13 may be implemented initially with the tools currently available and then enhanced as the merged workspaces mature:

| Pack | Initial Implementation Dependency | Later Enhancement |
|---|---|---|
| Firmware & Configuration Change Control | Firmware Version Tracker, SG1+x Parameter Comparison, SCADA Tag QA/QC, Technical Reference Search | Shared before/after baseline export and rollback record |
| BESS Fault-to-Parts Resolution | BESS inspection tools, existing battery analyzers, HVAC Delta-T, Spare Parts Cross-Reference, CAPA | Replace individual analyzers with BESS Battery Health Analyzer after merge |
| Commissioning Closeout & Handover | Progress Report, Punchlist, CAPA, Customer Report, SCADA checklist, completed test records | Combined handover package export after report interoperability is stable |

---

# 13. Workflow UX and Data Architecture Recommendation

## 13.1 Tools Must Remain Independently Accessible

A merged tool should be usable:

- From the Tool Library as a standalone utility.
- From a Workflow Pack with a specific mode/tab preselected.
- From an existing saved draft or report.

## 13.2 Workflow Step Types

Each workflow step should support one of these statuses:

| Status | Meaning |
|---|---|
| Not Started | No work performed yet |
| In Progress | Draft started but not completed |
| Complete | Record completed and saved |
| Not Applicable | Step intentionally skipped with reason |
| Blocked | Cannot proceed due to failed prerequisite or open safety/technical issue |
| Action Required | Finding generated a punchlist/CAPA/RCA item |

## 13.3 Shared Metadata

Enter these values once at workflow start and carry them into every tool/report opened from the workflow:

| Shared Metadata |
|---|
| Project name |
| Site name |
| Customer |
| Asset type |
| Equipment identifier / block / container / inverter / feeder |
| Work order / ticket |
| Technician |
| Witness / reviewer |
| Start date and time |
| Environmental conditions where relevant |
| Notes / photo evidence links |
| Related punchlist, RCA or CAPA IDs |

## 13.4 Required Versus Conditional Steps

Each workflow should visually distinguish:

| Step Type | Behavior |
|---|---|
| Required | Must be completed or marked blocked before workflow closure. |
| Conditional | Appears when selected or triggered by a finding/scope option. |
| Supporting | Can be opened as needed but does not prevent closure. |
| Output | Report, punchlist, RCA or CAPA deliverable generated from completed work. |

## 13.5 Workflow Links into Merged Tools

Workflows should open the correct merged tool tab automatically. Example deep-link structure, adapt to existing routing:

| Workflow Context | Example Route Intent |
|---|---|
| PV commissioning voltage field check | `pv-string-voltage-sizing?mode=field-verification` |
| PV design string sizing | `pv-string-voltage-sizing?mode=string-sizing` |
| PV megger test | `insulation-resistance?profile=pv-array` |
| Quick transformer ratio test | `transformer-test-ttr?mode=quick-ttr` |
| BESS battery thermal concern | `bess-battery-health?tab=temperature` |
| BESS cable sanity check | `cable-sizing?profile=bess-auxiliary` |
| Soiling ROI decision | `pv-soiling-analysis?tab=roi` |
| Register alarm-bit decode | `register-decoder?tab=bitmask` |

---

# 14. Implementation Priority Sequence

## Phase 1: Tool consolidation that prevents duplicated development

| Priority | Action |
|---:|---|
| 1 | Merge PV Megger Field Log and Insulation Resistance Commissioning Form into **Insulation Resistance Test Form**. |
| 2 | Merge Transformer TTR Form and Transformer Test Results Form into **Transformer Test & TTR Report**. |
| 3 | Merge PV String Sizer/VOC and DC Voltage Sanity Check into **PV String Voltage & Sizing Tool**. |
| 4 | Merge BESS Cable Sizing, Cable Ampacity and Voltage Drop into **Cable Sizing, Ampacity & Voltage Drop Calculator**. |
| 5 | Create `In Review` and `Legacy` sections and move the identified tools accordingly. |

## Phase 2: Update Existing Workflow Packs

| Priority | Action |
|---:|---|
| 6 | Update PV Commissioning Sequence to use merged tools and core/conditional step logic. |
| 7 | Update BESS Commissioning Sequence to use merged tools and correct safety/test logic. |
| 8 | Update PV Underperformance Troubleshooting using merged diagnostic workspaces. |
| 9 | Update BESS Container Troubleshooting and make availability conditional. |
| 10 | Refocus Grid / PPC & Reactive Power Testing by removing MV/protection defaults. |
| 11 | Collapse Soiling Workflow into the merged Soiling Analysis tool. |
| 12 | Update SCADA & Comms Troubleshooting with the combined register decoder. |
| 13 | Refocus Reporting / Field Closeout by removing default safety-planning steps. |

## Phase 3: Add the Five New Workflow Packs

| Priority | Action |
|---:|---|
| 14 | Add **MV Transformer & Protection Commissioning**. |
| 15 | Add **Grid Event / Plant Trip Investigation**. |
| 16 | Add **Firmware & Configuration Change Control**. |
| 17 | Add **BESS Fault-to-Parts Resolution**. |
| 18 | Add **Commissioning Closeout & Handover**. |

## Phase 4: Complete Diagnostic Workspace Merges

| Priority | Action |
|---:|---|
| 19 | Build **Inverter Power Limitation Analyzer**. |
| 20 | Build **Register, Bitmask & Number Decoder**. |
| 21 | Build **PV Soiling Analysis & Cleaning Decision Tool**. |
| 22 | Build **PV Performance Verification Tool**. |
| 23 | Build **Reactive Power & Inverter Capability Tool**. |
| 24 | Build **BESS Battery Health Analyzer**. |

## Phase 5: Enhance Workflow Interoperability and Exports

| Priority | Action |
|---:|---|
| 25 | Allow Firmware & Configuration Change Control to create before/after baseline comparison exports. |
| 26 | Allow BESS Fault-to-Parts Resolution to pull results directly from BESS Battery Health Analyzer after merge completion. |
| 27 | Allow Commissioning Closeout & Handover to generate a combined handover package from completed records. |

---

# 15. Final Recommendation

Retain the original concept of **Field Workflow Packs**, because it is exactly the layer that transforms a tool collection into a useful field-engineering platform.

Update the Hub as follows:

| Area | Recommendation |
|---|---|
| Active tools | Consolidate to approximately **42 active operational visible tools**. |
| In Review | Move Torque Spec Finder & Connection Calculator `ID 11` into an **In Review** sidebar section. |
| Legacy | Move IDs `1-4` into a dedicated **Legacy** sidebar section. |
| Existing workflows | Preserve and update all **8 current Field Workflow Packs** using the merged tool architecture. |
| New workflows to add | Add **MV Transformer & Protection Commissioning**, **Grid Event / Plant Trip Investigation**, **Firmware & Configuration Change Control**, **BESS Fault-to-Parts Resolution**, and **Commissioning Closeout & Handover**. |
| Workflow enhancement path | Implement the new packs with current tools first, then strengthen shared data, merged-tool integration and combined export functions as the supporting tools mature. |

## Critical design correction

The workflow packs should no longer be simple lists of every possibly related tool. They should distinguish:

- **Required steps** needed to complete the field objective.
- **Conditional diagnostics** opened only when scope or findings require them.
- **Supporting tools** available without blocking completion.
- **Outputs** such as reports, punchlists, RCA and CAPA records.

That change will make the Hub substantially more usable in the field, prevent users from performing unnecessary steps, and make the merged-tool architecture feel deliberate rather than merely reduced.
