# Level3Support Platform Enhancement Specification
## Drafts, Evidence Capture, Device Transfer and PDF Export Without Mandatory Workflows

## 1. Purpose

The Level3Support / Tool Hub PWA has been consolidated into a cleaner operational structure:

- **32 independent active tools**
- **10 consolidated workspaces**
- **42 active visible tool entries**
- **13 Field Workflow Packs**
- **1 In Review tool**
- **4 Legacy tools**

This specification defines the next platform layer:

1. **Drafts sidebar and local saved records**
2. **Auto-save and resume for appropriate record-based tools**
3. **Photo evidence and digital signature capture**
4. **Export/import packages for moving saved work between devices**
5. **PDF report and handover package export**
6. **Optional workflow persistence only when a workflow is intentionally started**

The objective is to improve real field use without turning every tool interaction into a saved record or forcing users through workflows.

---

# 2. Core Product Principle

Do **not** make every tool automatically generate a draft.

Do **not** make workflows mandatory.

The correct product behavior is:

```txt
Tools are independent by default.
Formal records can be saved as drafts and resumed later.
Quick calculations remain quick and stateless unless the user chooses to save them.
Workflows are optional guided paths, never prerequisites.
```

A user must be able to:

- Open the **RCA Template Builder**, start an RCA, save it as a draft, leave, return from Drafts and complete it without starting any workflow.
- Open the **Customer Site Visit Report Generator**, add photos and signatures, save/export it independently.
- Open the **Insulation Resistance Test Form**, complete and export a formal test record without using a commissioning workflow.
- Open the **PV Soiling Analysis & Cleaning Decision Tool**, perform calculations and close it without creating a draft or permanent record.
- Use any existing export feature without being forced to create a draft first.

---

# 3. Relationship Between Tools, Records and Workflows

## 3.1 Tools

Tools are the independent functional layer of the app.

A tool can be:

- A calculator
- An analyzer
- A checklist
- A test form
- A report builder
- A register/tracker
- A reference/search tool

Every active tool must remain directly accessible from the Tool Library.

## 3.2 Records

A record exists only when a user intentionally starts or saves meaningful work.

Examples:

- An RCA draft
- A completed BESS inspection
- A customer site visit report
- An insulation resistance test
- A saved PV performance analysis
- A saved calculation attached to a report
- A saved workflow instance

## 3.3 Workflows

Field Workflow Packs are optional guided sequences.

They may:

- Recommend a sequence of tools.
- Prepopulate shared metadata.
- Track progress only when the user explicitly starts the workflow.
- Collect records created from workflow steps.
- Generate a workflow summary or handover package.

They must **not**:

- Prevent direct access to tools.
- Require a workflow before saving a tool record.
- Display missing-workflow-step alerts on standalone records.
- Block a standalone RCA, CAPA, report, inspection or test record.
- Force completion of every suggested or conditional tool.

---

# 4. Sidebar: Add Drafts

Add a main navigation button called:

# **Drafts**

## Route

Use the routing pattern matching the existing app.

Suggested route:

```txt
/drafts
```

or, for static HTML routing:

```txt
drafts.html
```

## Recommended sidebar placement

```txt
Dashboard / Home
Tool Library
Field Workflow Packs
Drafts
Hub Resources
In Review
Legacy
```

Adjust only when the existing sidebar architecture requires a different order.

## Drafts badge

Show a badge count only for records with status:

- `draft`
- `in-progress`

Example:

```txt
Drafts (4)
```

Do not count completed, exported, imported or archived records in the badge.

## Offline availability

The Drafts page and saved records must work offline.

---

# 5. Draft Creation Rules

## 5.1 Never create a draft on page load

Opening any tool page must not create a draft.

This rule applies even to formal record tools.

## 5.2 Record-based tools

A draft may be automatically created after the user meaningfully begins a formal record.

A meaningful start includes:

- Entering a key header field such as site, equipment ID, report title or date.
- Filling a substantive test/report/checklist input.
- Adding a dynamic table row containing data.
- Uploading a photo or attachment.
- Capturing a signature.
- Clicking `Save Draft`.

Once a record exists, auto-save may continue normally.

## 5.3 Stateless-by-default tools

Calculators and analyzers must not create drafts automatically through ordinary use.

A record is created only when the user explicitly selects an action such as:

- `Save Result`
- `Create Report`
- `Attach to Existing Draft`
- `Create Finding`
- `Save Analysis`

## 5.4 Workflow records

A workflow record is created only when the user explicitly selects:

```txt
Start Workflow
```

Browsing or reviewing a workflow definition must not create a draft.

---

# 6. Tool Classification for Draft Behavior

## 6.1 Record-Based Tools: Draft Support Enabled

These tools create formal records, field evidence, reports, checklists, inspections or action logs.

They should support:

- `Save Draft`
- Auto-save after meaningful record start
- Resume from Drafts
- `Complete Record`
- Evidence capture where applicable
- Signature capture where applicable
- PDF export where applicable
- Record package export/import where applicable

| Tool | Draft Support | Photos | Signatures | PDF / Formal Export |
|---|---:|---:|---:|---:|
| LOTO Verification Checklist | Yes | Yes | Yes | Yes |
| Safety Pre-Task Plan / JHA Form | Yes | Optional | Yes | Yes |
| Grounding Continuity Test Form | Yes | Optional | Optional | Yes |
| CT/PT Ratio Verification Tool | Yes | Optional | Optional | Yes |
| Relay Settings Checklist | Yes | Optional | Optional | Yes |
| Inverter Start-Up Checklist | Yes | Yes | Optional | Yes |
| IV Curve Test Result Log | Yes | Yes | Optional | Yes |
| Firmware Version Tracker, when creating a site/equipment baseline record | Yes | Optional | No | Export/register output |
| BESS Container & Rack Inspection | Yes | Yes | Optional | Yes |
| BESS Pre-Energization Checklist | Yes | Yes | Yes | Yes |
| BESS Capacity / Energy Test Form | Yes | Optional | Optional | Yes |
| Daily Commissioning Progress Report | Yes | Yes | Yes | Yes |
| Commissioning Punchlist Builder | Yes | Yes | Optional | Yes |
| Customer Site Visit Report Generator | Yes | Yes | Yes | Yes |
| RCA Template Builder | Yes | Yes | Optional | Yes |
| Corrective Action Tracker / CAPA Log | Yes | Yes | Optional | Yes |
| Transformer Test & TTR Report | Yes | Yes | Yes | Yes |
| Insulation Resistance Test Form | Yes | Optional | Yes | Yes |
| Grid Event Voltage/Frequency Excursion Log | Yes | Yes | Optional | Yes |
| SCADA Tag QA/QC Checklist, when used as a formal validation record | Yes | Optional | Optional | Yes |

## 6.2 Stateless-by-Default Tools: No Automatic Draft

These tools are commonly opened for quick calculations, checks, searches or diagnostics.

They must remain lightweight and must not create drafts automatically.

| Tool / Workspace | Default Behavior | Optional Saved Action |
|---|---|---|
| PV String Voltage & Sizing Tool | Stateless calculation | Save Result / Attach to Draft |
| Cable Sizing, Ampacity & Voltage Drop Calculator | Stateless calculation | Save Result / Attach to Draft |
| BESS Battery Health Analyzer | Stateless diagnostic analysis | Save Analysis / Create Finding |
| Register, Bitmask & Number Decoder | Stateless utility | Attach Decoded Result where useful |
| PV Soiling Analysis & Cleaning Decision Tool | Stateless analysis by default | Save Analysis / Create Customer Report |
| Inverter Power Limitation Analyzer | Stateless diagnostic analysis | Save Finding / Attach to RCA |
| Reactive Power & Inverter Capability Tool | Stateless calculation/visualization | Save Result |
| PV Performance Verification Tool | Stateless performance analysis | Save Analysis / Create Report |
| String Current Imbalance Calculator | Stateless calculation | Save Result |
| Irradiance Sensor Cross-Check Tool | Stateless diagnostic check by default | Create Formal Validation Record |
| Tracker Angle / Backtracking QA Checklist | Stateless unless intentionally recorded | Save Inspection |
| HVAC Delta-T Calculator | Stateless calculation | Save Result / Attach to Finding |
| Fuse Continuous Current & Temperature Derating Calculator | Stateless calculation | Save Result / Export |
| Arc Flash Boundary Calculator | Stateless planning aid | Save Calculation / Export |
| ABB REJ603 Relay Configuration Tool | Stateless configuration utility | Save Configuration Record |
| SG1+x Parameter Comparison Tool | Stateless comparison | Save Comparison |
| UMCG Data Analysis Tool | Stateless data analysis | Save Analysis |
| PDP Module Fault Code Interpreter | Stateless interpretation utility | Save Finding |
| Technical Documentation / Reference Search Tool | Stateless reference tool | No automatic saved record |
| BESS Spare Parts Cross-Reference | Stateless lookup | Attach Selected Part to Record |

## 6.3 Critical example: Soiling workspace

The user may:

```txt
Open PV Soiling Analysis & Cleaning Decision Tool
→ Enter data
→ Calculate soiling loss and cleaning ROI
→ Review result
→ Close tool
```

This must **not** create a draft.

Only if the user selects an intentional action such as:

```txt
Save Analysis
Create Customer Report
Attach to Existing Draft
Export Results
```

should the app save or export data according to that action.

---

# 7. Standalone Records Must Work Without Workflows

## 7.1 RCA Template Builder

This must be a valid direct path:

```txt
Tool Library
→ RCA Template Builder
→ Enter RCA information
→ Save Draft
→ Leave page
→ Drafts
→ Continue RCA
→ Complete Record
→ Generate PDF
```

Do not require:

- A started workflow.
- An Alarm / Fault Event Timeline first.
- A CAPA record first.
- A customer report first.
- A missing-step warning.

A standalone RCA is a complete valid user action.

## 7.2 Customer Site Visit Report Generator

Allow the user to:

- Open it directly.
- Create a draft.
- Attach photos.
- Capture customer/technician signatures.
- Generate/export a report.

No Reporting / Field Closeout workflow is required.

## 7.3 Insulation Resistance Test Form

Allow the user to:

- Open it directly.
- Select the relevant equipment profile.
- Enter test measurements.
- Save or complete the record.
- Export it.

No PV Commissioning, MV Protection or BESS workflow is required.

## 7.4 BESS Container & Rack Inspection

Allow standalone inspections and saved records without requiring:

- BESS Commissioning Sequence.
- BESS Fault-to-Parts Resolution.
- BESS Pre-Energization.

## 7.5 Calculators and analyzers

A quick analysis remains independent and stateless unless the user intentionally saves it.

---

# 8. Field Workflow Packs Are Optional

Current Field Workflow Packs include:

1. PV Commissioning Sequence
2. BESS Commissioning Sequence
3. PV Underperformance Troubleshooting
4. BESS Container Troubleshooting
5. Grid / PPC & Reactive Power Testing
6. Soiling Analysis Workflow
7. SCADA & Comms Troubleshooting
8. Reporting / Field Closeout
9. MV Transformer & Protection Commissioning
10. Grid Event / Plant Trip Investigation
11. Firmware & Configuration Change Control
12. BESS Fault-to-Parts Resolution
13. Commissioning Closeout & Handover

If added, **BESS Performance & Availability Assessment** should follow these same rules.

## 8.1 Allowed workflow behavior

When a user explicitly starts a workflow, it may:

- Create a workflow draft.
- Ask for shared project/site/asset metadata.
- Show required, conditional, supporting and output steps.
- Track completion statuses.
- Launch a tool with the appropriate tab/mode selected.
- Link saved tool records to the workflow.
- Generate a workflow summary or package.

## 8.2 Prohibited workflow behavior

Workflows must not:

- Be required to open tools.
- Be required to save records.
- Make standalone tool records display workflow validation.
- Warn a user that workflow steps were missed when they are working outside a saved workflow.
- Prevent a user from generating a standalone PDF/report.
- Automatically create child records for steps the user has not started.

## 8.3 Linked child record behavior

If a tool is launched from an active workflow, allow the saved tool record to store:

- Parent workflow ID
- Workflow step ID
- Shared metadata
- Completion state returned to the workflow

If a tool is launched directly from the Tool Library, store it as:

```txt
Standalone Record
```

It must not inherit workflow requirements.

---

# 9. Drafts Page

## Purpose

The Drafts page shows saved work products and explicitly started workflows.

It does not show unsaved calculator interactions or tools that were only opened for reference.

## Page title

```txt
Drafts
```

## Subtitle

```txt
Continue reports, tests, inspections, action records and saved analyses stored on this device.
```

## Default tab

```txt
In Progress
```

## Tabs and filters

Support these record views:

| Tab / Filter | Purpose |
|---|---|
| In Progress | Draft and in-progress saved records |
| Completed | Finalized formal records |
| Exported | Records with generated PDF/package/export history |
| Imported | Records imported from another device |
| Archived | Records intentionally removed from normal active view |
| All | All saved records |

Additional filters:

- Tool / workflow type
- Discipline:
  - PV
  - BESS
  - Electrical
  - Grid
  - SCADA
  - HSE
  - Reports
- Project
- Site
- Equipment tag / asset ID
- Work order
- Search text

## Draft card content

Each record card should show:

- Record title or tool name
- Standalone or workflow-linked indicator
- Status badge
- Project/site, when available
- Asset/equipment ID, when available
- Last updated date/time
- Photo/evidence count, when applicable
- Export indicator, when applicable

Buttons:

- `Continue`
- `Export Package`
- `Duplicate`
- `Archive`
- `Delete`

Only display workflow progress on records that are actual workflow instances.

### Example standalone record card

```txt
RCA Template Builder
Standalone Record · In Progress
Site: La Pimienta
Updated: 02 Jun 2026, 14:41
[Continue] [Export Package] [Archive]
```

### Example workflow record card

```txt
PV Commissioning Sequence
Workflow · In Progress
5 of 9 selected required steps complete
Site: Project Alpha / INV-03
Updated: 02 Jun 2026, 14:41
[Continue Workflow] [Export Package] [Archive]
```

## Empty state

```txt
No records in progress.

Start a formal report, test, inspection or workflow, or explicitly save a calculator/analyzer result to continue it later from this page.
```

---

# 10. Storage Model and Data Architecture

## 10.1 Use IndexedDB

Use **IndexedDB** as the primary local persistence layer.

Do not rely only on `localStorage`, because saved records may contain:

- Large form data structures
- Photos
- Signature images
- Attachments
- Workflow state
- Export metadata
- Imported/exported record packages

If a storage library already exists, such as Dexie, idb or localForage, reuse the project pattern.

## 10.2 Context types

Every saved record must clearly store whether it is standalone or associated with a workflow.

```ts
export type ContextType =
  | "standalone"
  | "saved-analysis"
  | "workflow"
  | "workflow-child";
```

Only records with context type `workflow` or `workflow-child` may show workflow relationships or progress behavior.

## 10.3 Suggested record model

```ts
export type RecordStatus =
  | "draft"
  | "in-progress"
  | "completed"
  | "exported"
  | "imported"
  | "archived";

export type EvidenceType =
  | "photo"
  | "signature"
  | "attachment";

export type SavedRecord = {
  id: string;
  contextType: ContextType;
  status: RecordStatus;

  toolId?: string;
  toolName?: string;
  toolRoute?: string;
  toolMode?: string;

  workflowId?: string;
  workflowName?: string;
  parentWorkflowRecordId?: string;
  workflowStepId?: string;
  workflowStepStates?: WorkflowStepState[];

  title: string;
  discipline?: "PV" | "BESS" | "Electrical" | "Grid" | "SCADA" | "HSE" | "Reports" | "OEM";

  projectName?: string;
  siteName?: string;
  customer?: string;
  assetType?: string;
  assetId?: string;
  equipmentTag?: string;
  workOrder?: string;

  technician?: string;
  witness?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  formData: Record<string, unknown>;
  evidenceIds: string[];
  generatedOutputs?: GeneratedOutput[];

  notes?: string;
};

export type WorkflowStepState = {
  stepId: string;
  stepName: string;
  stepType: "required" | "conditional" | "supporting" | "output";
  status:
    | "not-started"
    | "in-progress"
    | "complete"
    | "not-applicable"
    | "blocked"
    | "action-required";
  linkedRecordId?: string;
  notes?: string;
};

export type EvidenceRecord = {
  id: string;
  recordId: string;
  type: EvidenceType;
  fileName?: string;
  mimeType: string;
  blob: Blob;
  caption?: string;
  tag?: string;
  createdAt: string;
  relatedToolId?: string;
  relatedWorkflowStepId?: string;
  signatureRole?:
    | "technician"
    | "supervisor"
    | "customer"
    | "witness"
    | "approver"
    | "energization-authorizer";
  signatureMeaning?: string;
};

export type GeneratedOutput = {
  id: string;
  type: "pdf" | "json-package" | "csv" | "print" | "report";
  fileName: string;
  createdAt: string;
};
```

Use `crypto.randomUUID()` or the existing app UUID strategy for stable record IDs.

---

# 11. Auto-Save and Resume Behavior

## 11.1 Record-based tools

For record-based tools:

- Do not save on opening the tool.
- Create a saved record only once meaningful data is entered or `Save Draft` is clicked.
- Once a record exists, auto-save changes locally.
- Use a debounce interval of approximately `750 ms to 1500 ms`.
- Provide a manual `Save Draft` button.

Show a subtle save indicator:

```txt
Not saved
Saving...
Saved locally
Save failed
```

Example:

```txt
Saved locally · Updated 2:41 PM
```

## 11.2 Stateless-by-default tools

For calculators and analyzers:

- Never create a draft automatically.
- Do not auto-save normal inputs.
- Do not store every calculation permanently.
- Preserve any existing quick export behavior.

When a meaningful calculated result exists, optionally show:

- `Save Result`
- `Add to Existing Draft`
- `Create Finding`
- `Create Report`
- Existing export button, if already supported

If the user clicks `Save Result`, create a record with:

```txt
contextType: "saved-analysis"
```

## 11.3 Resume behavior

Selecting `Continue` from Drafts must:

1. Open the correct tool or workflow.
2. Load the saved form data.
3. Restore dynamic rows, checklist states, notes and evidence.
4. Restore the correct consolidated-workspace tab or mode.
5. Restore linked workflow status only when appropriate.
6. Continue auto-saving into the same saved record.

Show an indicator:

```txt
Continuing saved record
```

## 11.4 Consolidated workspace mode restoration

Drafts or saved analyses must preserve selected modes/tabs.

| Consolidated Workspace | Modes / Tabs to Preserve |
|---|---|
| PV String Voltage & Sizing Tool | String Sizing / Field Voltage Verification |
| Insulation Resistance Test Form | PV Array / BESS Auxiliary / AC Feeder / Transformer / General |
| Transformer Test & TTR Report | Quick TTR / Full Transformer Test |
| Cable Sizing, Ampacity & Voltage Drop Calculator | BESS DC / BESS Auxiliary AC / PV DC / AC Feeder / General |
| BESS Battery Health Analyzer | Voltage / SOC / Temperature / Summary |
| Register, Bitmask & Number Decoder | Register Decode / Bitmask / Number Conversion |
| PV Soiling Analysis & Cleaning Decision Tool | Inputs / Comparison / Loss / ROI / Report |
| Inverter Power Limitation Analyzer | Diagnostic Input / Findings / Summary |
| Reactive Power & Inverter Capability Tool | Power Triangle / P-Q Capability |
| PV Performance Verification Tool | PR Analysis / Weather-Corrected Output |

---

# 12. Existing Export Buttons Must Be Preserved

Some tools already have export functionality. Do not rebuild or replace exports blindly.

## 12.1 Audit before changing exports

Inspect each active tool/workspace for existing:

- CSV export
- JSON export
- PDF export
- Print button
- Download result
- Image/export output
- Report generation

## 12.2 Rules

1. Preserve all working export functions.
2. Do not remove an export button unless it is confirmed redundant or broken.
3. Standardize styling and placement only where it does not change functionality.
4. Existing quick exports must work without saving a record.
5. New package export applies only to intentionally saved records.
6. New PDF report export applies to formal records or intentionally saved analyses/reports.

## 12.3 Valid export distinctions

| Export Type | Intended Purpose | Requires Saved Record? |
|---|---|---:|
| CSV | Export raw tabular results for analysis | No, if already supported |
| Print | Quick hardcopy/browser output | No |
| Existing one-off calculation export | User-requested quick output | No |
| Saved record package | Continue/edit on another device | Yes |
| Individual formal PDF report | Final report/test/inspection record | Yes |
| Workflow/handover package PDF | Combined formal deliverable | Explicitly assembled workflow/package only |

---

# 13. Photo Evidence Capture

## 13.1 Scope

Add photo evidence only to formal saved records or intentionally saved findings/reports where evidence adds value.

Do not force photos into normal quick calculator use.

## 13.2 Required functionality

Allow users to:

- Take a photo using the mobile device camera when supported.
- Upload an existing photo.
- Add a caption.
- Select an evidence tag.
- Associate the photo to a saved record.
- Associate the photo to a workflow step only if it belongs to an explicitly started workflow.
- Preview thumbnails.
- Delete or replace evidence before finalization.
- Include selected photos in final PDF exports.

## 13.3 Evidence tags

Provide selectable tags such as:

```txt
Nameplate
Serial Number
Before Work
After Work
Defect
Corrective Action
Test Setup
Test Result
Safety Condition
LOTO Point
Grounding Connection
Cable Termination
Thermal Finding
Alarm Screenshot
Commissioning Evidence
Other
```

## 13.4 Priority tools for photo evidence

| Priority | Tool |
|---:|---|
| 1 | Customer Site Visit Report Generator |
| 2 | Commissioning Punchlist Builder |
| 3 | Daily Commissioning Progress Report |
| 4 | RCA Template Builder |
| 5 | Corrective Action Tracker / CAPA Log |
| 6 | BESS Container & Rack Inspection |
| 7 | LOTO Verification Checklist |
| 8 | Safety Pre-Task Plan / JHA Form |
| 9 | Transformer Test & TTR Report |
| 10 | Insulation Resistance Test Form |
| 11 | BESS Pre-Energization Checklist |
| 12 | Commissioning Closeout & Handover workflow, only when explicitly started |

## 13.5 Serial number/nameplate preparation

For this development stage:

- Support photo capture.
- Allow tagging photos as `Nameplate` or `Serial Number`.
- Allow manual entry of manufacturer/model/serial number beside evidence.

Do not implement full OCR yet.

Structure the evidence data model so OCR-assisted extraction can be added later without replacing stored photo records.

---

# 14. Digital Signature Capture

## 14.1 Reusable component

Create or reuse a component such as:

```txt
SignaturePad
```

It must support mobile finger input.

## 14.2 Signature data

Each signature should store:

- Signer name
- Signer role
- Signature image/blob
- Date/time captured
- Associated saved record
- Optional workflow-step association, only when applicable
- Selected signoff meaning

## 14.3 Roles

Support:

```txt
Technician
Supervisor / Reviewer
Customer Representative
Witness
Approver
Energization Authorizer
```

## 14.4 Signoff meanings

Do not treat all signatures as contractual acceptance.

Allow:

```txt
Completed by
Reviewed by
Witnessed by
Acknowledged on site
Accepted
Accepted with comments
Authorized for energization
Pending corrective actions
```

## 14.5 Priority tools for signatures

| Priority | Tool |
|---:|---|
| 1 | Customer Site Visit Report Generator |
| 2 | Daily Commissioning Progress Report |
| 3 | BESS Pre-Energization Checklist |
| 4 | LOTO Verification Checklist |
| 5 | Safety Pre-Task Plan / JHA Form |
| 6 | Transformer Test & TTR Report |
| 7 | Insulation Resistance Test Form |
| 8 | Commissioning Closeout & Handover workflow, only when explicitly started |
| 9 | Commissioning Punchlist Builder, where signoff exists |

---

# 15. Export / Import Between Devices

## 15.1 Purpose

Allow a user to begin a saved record on a phone and continue it on a computer without adding a central multi-user backend.

## 15.2 Scope

Package transfer applies only to:

- Saved standalone draft records
- Completed records
- Explicitly saved analyses
- Explicitly started workflow records and their linked saved child records

Do not force a quick calculation into Drafts merely to allow an existing quick export.

## 15.3 Export actions

From a saved record:

```txt
Export Record Package
```

From an explicitly started workflow:

```txt
Export Workflow Package
```

## 15.4 Suggested package format

Use a portable compressed file format, such as:

```txt
.l3spkg
```

or:

```txt
.zip
```

Suggested package content:

```txt
manifest.json
record.json
workflow.json          // only for workflow package
/evidence/photos/
/evidence/signatures/
/attachments/
/outputs/
```

## 15.5 Package file naming

Examples:

```txt
Level3Support_RCA_SiteName_EquipmentID_2026-06-02.l3spkg
Level3Support_PV-Commissioning_SiteName_INV-03_2026-06-02.l3spkg
```

## 15.6 Import behavior

Add an action on the Drafts page:

```txt
Import Package
```

On import:

1. Validate file structure and schema version.
2. Show an import summary before committing:
   - Record/workflow name
   - Project/site
   - Asset/equipment ID
   - Created and updated dates
   - Status
   - Evidence count
3. Allow:
   - `Import as New Record`
   - `Replace Existing Record`, only after explicit confirmation when IDs match
   - `Cancel`
4. Store imported data in IndexedDB.
5. Show the imported record in the `Imported` tab.
6. Allow continuation if the imported record is editable.

## 15.7 Conflict handling

Never overwrite silently.

If a matching record already exists, display:

- Existing record updated date
- Imported record updated date
- Record identity/details

Offer:

```txt
Keep Existing
Replace with Imported
Import as Duplicate Copy
Cancel
```

---

# 16. PDF Report and Handover Package Export

## 16.1 Scope

PDF generation applies to:

- Formal saved records
- Saved analyses intentionally converted into a report
- Explicitly started workflows
- Intentionally assembled handover packages

It does not apply automatically to every calculator interaction.

## 16.2 Individual record PDFs

Prioritize PDF export for:

| Record |
|---|
| Customer Site Visit Report |
| Daily Commissioning Progress Report |
| Insulation Resistance Test Form |
| Transformer Test & TTR Report |
| BESS Container & Rack Inspection |
| BESS Pre-Energization Checklist |
| BESS Capacity / Energy Test Form |
| RCA Template Builder |
| Corrective Action Tracker / CAPA Log |
| Commissioning Punchlist Builder |
| LOTO Verification Checklist |
| Safety Pre-Task Plan / JHA Form |
| Grid Event Voltage/Frequency Excursion Log |

## 16.3 Workflow PDF summaries

Generate a workflow PDF only for a workflow the user explicitly started.

Candidate workflows:

- PV Commissioning Sequence
- BESS Commissioning Sequence
- MV Transformer & Protection Commissioning
- Grid Event / Plant Trip Investigation
- BESS Fault-to-Parts Resolution
- Commissioning Closeout & Handover

## 16.4 Combined handover package PDF

Use primarily for:

- Commissioning Closeout & Handover
- Customer milestone packages
- Completed test evidence packages intentionally assembled by the user

## 16.5 PDF sections

A formal PDF or handover package should support:

1. Cover / header
   - Record or package title
   - Project
   - Site
   - Customer
   - Asset/equipment
   - Work order
   - Date(s)
   - Prepared by

2. Summary
   - Scope/work performed
   - Status
   - Main findings
   - Outstanding actions

3. Technical results
   - Measurements
   - Calculations
   - Checklists
   - Test summaries
   - Findings

4. Evidence
   - Selected photos
   - Captions
   - Before/after indicators
   - Nameplate/test setup evidence where selected

5. Open actions
   - Punchlist items
   - CAPA items
   - RCA conclusion where applicable

6. Signoff
   - Signer names
   - Roles
   - Signatures
   - Signoff meanings
   - Dates/times

7. References
   - Resources used by the tool or included records

## 16.6 Draft PDF behavior

Allow the user to export an incomplete record only by deliberate choice.

Label incomplete PDF output clearly:

```txt
DRAFT - NOT FINAL
```

Also include:

- Export date/time
- Record ID
- Incomplete/open status
- Failed or action-required items where applicable

## 16.7 PDF options

When generating a PDF, allow:

- Include photos: Yes / No
- Include signatures: Yes / No
- Include references/resources: Yes / No
- Include open actions: Yes / No
- Include skipped/not-applicable workflow steps: Yes / No, workflow PDFs only

---

# 17. Completed Records and Future History

Although the sidebar is named **Drafts**, completed records must remain stored locally.

## Initial implementation

Use Drafts-page tabs:

```txt
In Progress
Completed
Exported
Imported
Archived
```

Do not delete a record when completed.

## Future expansion

If enough completed records accumulate later, add a dedicated sidebar item:

```txt
History / Records
```

Do not implement a separate History sidebar immediately unless it already fits the current app architecture.

Preserving completed records from the start allows future history features without data migration gaps.

---

# 18. Integration Rollout

## Phase 1: Drafts Foundation

Implement first:

- IndexedDB local database and services
- Saved-record model with standalone vs workflow context
- Drafts sidebar button and badge
- Drafts page and record filters
- Draft-creation rules
- Auto-save only for started formal records
- Explicit `Save Result` behavior for stateless tools where useful
- Resume/continue behavior
- Completion/archive/delete handling
- Existing export audit and preservation
- Initial formal tool integration

### Phase 1 priority tools

Start with:

1. RCA Template Builder
2. Customer Site Visit Report Generator
3. Daily Commissioning Progress Report
4. Commissioning Punchlist Builder
5. Corrective Action Tracker / CAPA Log
6. Insulation Resistance Test Form
7. Transformer Test & TTR Report
8. BESS Container & Rack Inspection
9. BESS Pre-Energization Checklist
10. LOTO Verification Checklist
11. Safety Pre-Task Plan / JHA Form

### Phase 1 optional workflow draft support

Support explicitly started workflow drafts initially for:

1. PV Commissioning Sequence
2. BESS Commissioning Sequence
3. MV Transformer & Protection Commissioning
4. BESS Fault-to-Parts Resolution
5. Commissioning Closeout & Handover

Workflow use must remain optional.

## Phase 2: Evidence Capture

Implement after Phase 1 is stable:

- Photo capture/upload
- Evidence tags and captions
- Thumbnail previews
- SignaturePad component
- Signature role and meaning
- Evidence persistence in IndexedDB
- Evidence included in saved records

## Phase 3: Device Transfer

Implement after record and evidence saving works correctly:

- Record package export
- Workflow package export
- Import Package action
- Schema validation
- Conflict handling
- Imported record continuation

## Phase 4: PDF Export

Implement after the saved-record architecture is stable:

- Formal individual record PDF
- Workflow summary PDF
- Combined handover package PDF
- Draft watermarking
- Photo/signature/reference inclusion options
- Export metadata/history

---

# 19. Acceptance Criteria

## 19.1 Draft behavior

Verify:

1. A `Drafts` button appears in the sidebar.
2. The Drafts badge counts only draft/in-progress records.
3. Opening any tool without entering or saving data creates no draft.
4. Opening a calculator and calculating a result creates no draft by default.
5. Opening the Soiling workspace and calculating ROI creates no draft unless the user intentionally saves or creates a report.
6. Starting meaningful work on an RCA allows a standalone saved RCA record.
7. A standalone RCA can be resumed and completed independently.
8. A standalone RCA does not show workflow-step warnings.
9. Formal record tools auto-save only after a record has been meaningfully started.
10. Saved records remain available offline.
11. Completed records remain available through the relevant filters.

## 19.2 Workflow behavior

Verify:

1. A workflow creates a record only when the user explicitly starts it.
2. A workflow may track progress and link child records once started.
3. Tools can always be used without starting a workflow.
4. Standalone records never inherit missing workflow validation.
5. Tools opened from a workflow store the correct parent-workflow relationship only when intentionally saved.

## 19.3 Export behavior

Verify:

1. Existing export buttons continue to function.
2. Quick exports do not require Drafts.
3. Saved record packages export and import correctly.
4. Imported records do not silently overwrite existing records.
5. Completed formal records can generate PDF reports.
6. Incomplete PDF reports are labeled `DRAFT - NOT FINAL`.

## 19.4 Evidence behavior

Verify:

1. Photo evidence attaches only to saved/formal records where applicable.
2. Signature capture works on mobile touch input.
3. Signatures record role, meaning and date/time.
4. Photos and signatures restore when a draft is reopened.
5. Evidence can be included in PDF exports.

## 19.5 Usability and safety

Verify:

1. The app remains usable offline.
2. Drafts does not become cluttered with quick unsaved tool usage.
3. Safety-critical forms preserve signoff and completion metadata.
4. Deleting a saved record requires confirmation.
5. Imported/exported record handling is transparent to the user.
6. No existing tool calculations or workflow definitions are broken.

---

# 20. Final Direction

The objective is not to turn Level3Support into a mandatory workflow system.

The objective is to add a lightweight, local-first records capability that supports field work when the user needs persistence, evidence and professional exports, while preserving fast independent use of every tool.

The intended behavior is:

```txt
Quick tool use
→ Calculate/check/analyze
→ Close without creating clutter

Formal record use
→ Start report/test/inspection/RCA
→ Save locally as draft
→ Resume later from Drafts
→ Attach evidence/signatures
→ Export final PDF or portable package

Optional workflow use
→ Explicitly start workflow
→ Link selected formal records
→ Track progress only inside that workflow
→ Export workflow/handover package when useful
```

Implement **Phase 1: Drafts Foundation** first. Keep saved-record persistence independent from workflows, preserve existing exports, and ensure the architecture supports photo evidence, signatures, device transfer and PDF output in subsequent phases.
