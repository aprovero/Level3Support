/**
 * Level3Support — soiling-customer-report.js
 * Soiling Customer Report Generator Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  document.getElementById('inspection-date').value = `${year}-${month}-${day}`;

  // Event Listeners
  document.getElementById('calculate-btn').addEventListener('click', generateReport);
  document.getElementById('reset-btn').addEventListener('click', resetForm);
  document.getElementById('copy-btn').addEventListener('click', copyReportText);
  document.getElementById('export-btn').addEventListener('click', exportJSON);
  document.getElementById('print-btn').addEventListener('click', () => window.print());
});

let generatedData = null;

function generateReport() {
  const errorDiv = document.getElementById('validation-error');
  const resultPanel = document.getElementById('result-panel');

  errorDiv.style.display = 'none';
  resultPanel.style.display = 'none';

  // Read Section 1
  const projectName = document.getElementById('project-name').value.trim();
  const customerName = document.getElementById('customer-name').value.trim();
  const locationStr = document.getElementById('location').value.trim();
  const inspectDate = document.getElementById('inspection-date').value;
  const preparedBy = document.getElementById('prepared-by').value.trim();
  const reportType = document.getElementById('report-type').value;

  // Read Section 2
  const areasInspected = document.getElementById('areas-inspected').value.trim();
  const equipmentInspected = document.getElementById('equipment-inspected').value.trim();
  const method = document.getElementById('inspection-method').value;
  const scopeLimits = document.getElementById('scope-limitations').value.trim();

  // Read Section 3
  const soilingType = document.getElementById('soiling-type').value;
  const severity = document.getElementById('severity').value;
  const affectedAreaPct = document.getElementById('affected-area-pct').value ? parseFloat(document.getElementById('affected-area-pct').value) : 100;
  const affectedCapPct = document.getElementById('affected-cap-pct').value ? parseFloat(document.getElementById('affected-cap-pct').value) : 100;
  const obsNotes = document.getElementById('observation-notes').value.trim();

  // Read Section 4
  const cleanVal = document.getElementById('clean-val').value ? parseFloat(document.getElementById('clean-val').value) : null;
  const soiledVal = document.getElementById('soiled-val').value ? parseFloat(document.getElementById('soiled-val').value) : null;
  const soilingLossPct = document.getElementById('soiling-loss-pct').value ? parseFloat(document.getElementById('soiling-loss-pct').value) : null;
  const expectedGen = document.getElementById('expected-gen').value ? parseFloat(document.getElementById('expected-gen').value) : null;
  const lostRev = document.getElementById('lost-revenue').value ? parseFloat(document.getElementById('lost-revenue').value) : null;

  // Read Section 5
  const photoRefId = document.getElementById('photo-ref-id').value.trim();
  const photoLocation = document.getElementById('photo-location').value.trim();
  const photoDesc = document.getElementById('photo-desc').value.trim();

  // Read Section 6
  const recAction = document.getElementById('rec-action').value;
  const recPriority = document.getElementById('rec-priority').value;
  const nextStep = document.getElementById('rec-next-step').value.trim();
  const safetyNotes = document.getElementById('rec-safety').value.trim();

  // Read Section 7
  const assumptionsText = document.getElementById('report-assumptions').value.trim();

  // Validations
  if (!projectName) {
    showError('Site / Project Name is required.');
    return;
  }
  if (!customerName) {
    showError('Customer Name is required.');
    return;
  }
  if (!preparedBy) {
    showError('Prepared By is required.');
    return;
  }

  // Set calculations if possible
  let calculatedLoss = soilingLossPct;
  if (calculatedLoss === null && cleanVal !== null && soiledVal !== null && cleanVal > 0) {
    calculatedLoss = (1 - (soiledVal / cleanVal)) * 100;
  }

  let calculatedLostEnergy = null;
  if (calculatedLoss !== null && expectedGen !== null) {
    calculatedLostEnergy = expectedGen * (affectedCapPct / 100) * (calculatedLoss / 100);
  }

  // Compile Report Content JSON
  generatedData = {
    header: {
      projectName,
      customerName,
      location: locationStr || 'N/A',
      inspectDate,
      preparedBy,
      reportType
    },
    scope: {
      areasInspected: areasInspected || 'All standard module fields',
      equipmentInspected: equipmentInspected || 'Inverter blocks',
      method,
      scopeLimits: scopeLimits || 'Visual/SCADA logging bounds'
    },
    conditions: {
      soilingType,
      severity,
      affectedAreaPct,
      affectedCapPct,
      notes: obsNotes || 'None'
    },
    metrics: {
      cleanVal,
      soiledVal,
      soilingLossPct: calculatedLoss,
      expectedGen,
      lostEnergy: calculatedLostEnergy,
      lostRevenue: lostRev
    },
    evidence: photoRefId ? { photoRefId, photoLocation, photoDesc } : null,
    recommendation: {
      action: recAction,
      priority: recPriority,
      nextStep: nextStep || 'Consult technical leads.',
      safetyNotes: safetyNotes || 'Follow LOTO and array electrical safety rules.'
    },
    assumptions: assumptionsText
  };

  // Render HTML inside the view panel
  const viewPanel = document.getElementById('generated-report-view');
  viewPanel.innerHTML = buildReportHTML(generatedData);

  resultPanel.style.display = 'block';
}

function buildReportHTML(data) {
  let lossText = 'N/A';
  if (data.metrics.soilingLossPct !== null) {
    lossText = `${data.metrics.soilingLossPct.toFixed(2)}%`;
  }

  let energyText = 'N/A';
  if (data.metrics.lostEnergy !== null) {
    energyText = `${data.metrics.lostEnergy.toFixed(2)} MWh`;
  }

  let revenueText = '';
  if (data.metrics.lostRevenue !== null) {
    revenueText = `<div class="result-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
      <span style="font-weight:600;">Estimated Revenue Impact:</span>
      <span style="color:var(--error-color); font-weight:700;">$${data.metrics.lostRevenue.toFixed(2)}</span>
    </div>`;
  }

  let evidenceSection = '';
  if (data.evidence) {
    evidenceSection = `
      <div style="margin-top:20px; border-top:1px solid #e2e8f0; padding-top:16px;">
        <h4 style="font-family:'Outfit'; color:#1e293b; margin-bottom:8px;">Visual Evidence & Photographic References</h4>
        <div style="background:#f1f5f9; padding:12px; border-radius:6px; display:grid; grid-template-columns:1fr 2fr; gap:12px; font-size:0.85rem;">
          <div><strong>Photo ID:</strong> ${data.evidence.photoRefId}</div>
          <div><strong>Location:</strong> ${data.evidence.photoLocation || 'N/A'}</div>
          <div style="grid-column: 1 / -1; margin-top:4px;"><strong>Description:</strong> ${data.evidence.photoDesc}</div>
        </div>
      </div>
    `;
  }

  return `
    <div style="border-bottom:2px solid var(--primary-color); padding-bottom:12px; margin-bottom:16px; text-align:center;">
      <h2 style="font-family:'Outfit'; font-size:1.4rem; color:var(--primary-color); margin:0; text-transform:uppercase;">Level3Support Field Investigation Report</h2>
      <div style="font-size:0.85rem; color:#64748b; font-weight:600; margin-top:4px;">Category: ${data.header.reportType.toUpperCase()}</div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:0.9rem; border-bottom:1px dashed #cbd5e1; padding-bottom:16px;">
      <div>
        <p style="margin-bottom:6px;"><strong>Project / Site Name:</strong> ${data.header.projectName}</p>
        <p style="margin-bottom:6px;"><strong>Customer:</strong> ${data.header.customerName}</p>
        <p style="margin-bottom:6px;"><strong>Location:</strong> ${data.header.location}</p>
      </div>
      <div>
        <p style="margin-bottom:6px;"><strong>Date of Inspection:</strong> ${data.header.inspectDate}</p>
        <p style="margin-bottom:6px;"><strong>Prepared By:</strong> ${data.header.preparedBy}</p>
      </div>
    </div>

    <div>
      <h3 style="font-family:'Outfit'; font-size:1.1rem; color:#1e293b; margin-bottom:10px;">Executive Summary</h3>
      <p style="margin-bottom:14px; font-size:0.9rem; text-align:left;">
        On ${data.header.inspectDate}, a field investigation was conducted at the ${data.header.projectName} solar facility. 
        Visual inspections and quantitative evaluation of power parameters indicates an observed <strong>${data.conditions.severity}</strong> 
        accumulation of <strong>${data.conditions.soilingType}</strong> affecting approximately <strong>${data.conditions.affectedAreaPct}%</strong> of the inspected panel fields.
      </p>
    </div>

    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:20px; font-size:0.9rem;">
      <h4 style="font-family:'Outfit'; margin-top:0; color:#475569; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:10px;">Analysis Summary & Quantitative Results</h4>
      <div class="result-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Assessed Inspection Method:</span>
        <span style="font-weight:600;">${data.scope.method}</span>
      </div>
      <div class="result-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Estimated Module Soiling Loss:</span>
        <span style="font-weight:700; color:var(--error-color);">${lossText}</span>
      </div>
      <div class="result-row" style="display:flex; justify-content:space-between; margin-bottom:6px;">
        <span>Estimated Period Lost Energy Impact:</span>
        <span style="font-weight:600;">${energyText}</span>
      </div>
      ${revenueText}
      <div class="result-row" style="display:flex; justify-content:space-between; margin-bottom:6px; border-top:1px dashed #e2e8f0; padding-top:6px; margin-top:6px;">
        <span>Scope Limitations:</span>
        <span style="font-style:italic; font-size:0.8rem; color:#64748b;">${data.scope.scopeLimits}</span>
      </div>
    </div>

    <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:8px; padding:16px; font-size:0.9rem; color:#92400e;">
      <h4 style="font-family:'Outfit'; margin-top:0; color:#b45309; border-bottom:1px solid #fcd34d; padding-bottom:6px; margin-bottom:10px;">O&M Recommendation Overview</h4>
      <p style="margin-bottom:8px;"><strong>Action Recommended:</strong> ${data.recommendation.action}</p>
      <p style="margin-bottom:8px;"><strong>Priority Level:</strong> <span style="font-weight:700; text-transform:uppercase;">${data.recommendation.priority}</span></p>
      <p style="margin-bottom:8px;"><strong>Next Immediate Action Step:</strong> ${data.recommendation.nextStep}</p>
      <p style="margin-bottom:0; font-size:0.85rem; font-style:italic;"><strong>Safety/Operation Notes:</strong> ${data.recommendation.safetyNotes}</p>
    </div>

    ${evidenceSection}

    <div style="margin-top:20px; border-top:1px solid #cbd5e1; padding-top:12px; font-size:0.78rem; color:#64748b; font-style:italic; line-height:1.4; text-align:left;">
      <strong>Standard Report Limitations:</strong> ${data.assumptions}
    </div>
  `;
}

function showError(msg) {
  const errorDiv = document.getElementById('validation-error');
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}

function resetForm() {
  document.getElementById('project-name').value = '';
  document.getElementById('customer-name').value = '';
  document.getElementById('location').value = '';
  document.getElementById('prepared-by').value = '';
  document.getElementById('areas-inspected').value = '';
  document.getElementById('equipment-inspected').value = '';
  document.getElementById('scope-limitations').value = '';
  document.getElementById('observation-notes').value = '';

  document.getElementById('clean-val').value = '';
  document.getElementById('soiled-val').value = '';
  document.getElementById('soiling-loss-pct').value = '';
  document.getElementById('expected-gen').value = '';
  document.getElementById('lost-revenue').value = '';

  document.getElementById('photo-ref-id').value = '';
  document.getElementById('photo-location').value = '';
  document.getElementById('photo-desc').value = '';

  document.getElementById('rec-next-step').value = '';
  document.getElementById('rec-safety').value = '';

  document.getElementById('validation-error').style.display = 'none';
  document.getElementById('result-panel').style.display = 'none';
  generatedData = null;
}

function copyReportText() {
  if (!generatedData) return;

  const summary = `[Level3Support Field Investigation Report Summary]
Project: ${generatedData.header.projectName}
Customer: ${generatedData.header.customerName}
Date: ${generatedData.header.inspectDate}
Prepared By: ${generatedData.header.preparedBy}
----------------------------------------
Observed Severity: ${generatedData.conditions.severity}
Soiling Type: ${generatedData.conditions.soilingType}
Affected Area/Cap: ${generatedData.conditions.affectedAreaPct}% / ${generatedData.conditions.affectedCapPct}%
----------------------------------------
Soiling Loss Percentage: ${generatedData.metrics.soilingLossPct !== null ? generatedData.metrics.soilingLossPct.toFixed(2) + '%' : 'N/A'}
Estimated Period Lost Energy: ${generatedData.metrics.lostEnergy !== null ? generatedData.metrics.lostEnergy.toFixed(2) + ' MWh' : 'N/A'}
----------------------------------------
O&M Recommendation: ${generatedData.recommendation.action}
Priority: ${generatedData.recommendation.priority.toUpperCase()}
Immediate Next Step: ${generatedData.recommendation.nextStep}
Safety Notes: ${generatedData.recommendation.safetyNotes}
----------------------------------------
Statement of Limitations:
${generatedData.assumptions}`;

  navigator.clipboard.writeText(summary)
    .then(() => alert('Report summary text copied to clipboard!'))
    .catch(err => console.error('Failed to copy report text', err));
}

function exportJSON() {
  if (!generatedData) return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `soiling_customer_report_${generatedData.header.projectName || 'export'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
