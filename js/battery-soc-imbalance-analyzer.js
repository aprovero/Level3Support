/**
 * Battery SOC Imbalance Analyzer JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const containerIdInput = document.getElementById('container-id');
  const thresholdInput = document.getElementById('threshold');
  const rackIdInput = document.getElementById('rack-id');
  const rackSocInput = document.getElementById('rack-soc');
  const rackVoltageInput = document.getElementById('rack-voltage');
  const balancingActiveSelect = document.getElementById('balancing-active');

  const addBtn = document.getElementById('add-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const rackTbody = document.getElementById('rack-tbody');
  const resultPanel = document.getElementById('result-panel');
  const diagnosticStatusBadge = document.getElementById('diagnostic-status');
  const resAvgSoc = document.getElementById('res-avg-soc');
  const resMaxMin = document.getElementById('res-max-min');
  const resSpread = document.getElementById('res-spread');
  const resStatus = document.getElementById('res-status');
  const validationError = document.getElementById('validation-error');

  let loggedRacks = [];

  // Load saved racks
  function loadRacks() {
    const saved = localStorage.getItem('l3s_bess_racks');
    if (saved) {
      loggedRacks = JSON.parse(saved);
    } else {
      // Sample data
      loggedRacks = [
        { id: "RACK-01", soc: 96.5, voltage: 980, balancing: "No" },
        { id: "RACK-02", soc: 95.0, voltage: 978, balancing: "No" },
        { id: "RACK-03", soc: 91.2, voltage: 970, balancing: "Yes" },
        { id: "RACK-04", soc: 96.8, voltage: 982, balancing: "No" }
      ];
      saveRacks();
    }
    renderRacks();
    recalculateSpread();
  }

  function saveRacks() {
    localStorage.setItem('l3s_bess_racks', JSON.stringify(loggedRacks));
  }

  addBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const id = rackIdInput.value.trim();
    const soc = parseFloat(rackSocInput.value);
    const voltage = parseFloat(rackVoltageInput.value || 0);
    const balancing = balancingActiveSelect.value;

    if (!id) {
      showError('Please enter a Rack/Cluster ID.');
      return;
    }
    if (isNaN(soc) || soc < 0 || soc > 100) {
      showError('SOC must be between 0% and 100%.');
      return;
    }

    const newRack = { id, soc, voltage, balancing };
    loggedRacks.push(newRack);
    saveRacks();
    renderRacks();
    recalculateSpread();

    // Reset rack input only
    rackIdInput.value = `RACK-${(loggedRacks.length + 1).toString().padStart(2, '0')}`;
    rackSocInput.value = "";
    rackVoltageInput.value = "";
  });

  function renderRacks() {
    rackTbody.innerHTML = '';
    const threshold = parseFloat(thresholdInput.value || 5.0);

    loggedRacks.forEach((rack, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${rack.id}</td>
        <td>${rack.soc.toFixed(1)}%</td>
        <td>${rack.voltage > 0 ? rack.voltage + ' V dc' : 'N/A'}</td>
        <td><span class="status-badge-inline ${rack.balancing === 'Yes' ? 'status-warning' : 'status-normal'}">${rack.balancing}</span></td>
        <td>
          <button onclick="deleteRack(${idx})" class="btn-danger" style="margin-top: 0; min-height: auto; width: 28px; height: 28px; padding: 0;"><i class="fas fa-trash" style="font-size: 0.8rem;"></i></button>
        </td>
      `;

      rackTbody.appendChild(tr);
    });
  }

  window.deleteRack = (idx) => {
    if (confirm("Delete this rack entry?")) {
      loggedRacks.splice(idx, 1);
      saveRacks();
      renderRacks();
      recalculateSpread();
    }
  };

  thresholdInput.addEventListener('input', recalculateSpread);

  function recalculateSpread() {
    if (loggedRacks.length === 0) {
      resultPanel.style.display = 'none';
      return;
    }

    const threshold = parseFloat(thresholdInput.value || 5.0);

    let totalSoc = 0;
    let minSoc = 100;
    let maxSoc = 0;
    let minId = "";
    let maxId = "";

    loggedRacks.forEach(r => {
      totalSoc += r.soc;
      if (r.soc < minSoc) { minSoc = r.soc; minId = r.id; }
      if (r.soc > maxSoc) { maxSoc = r.soc; maxId = r.id; }
    });

    const averageSoc = totalSoc / loggedRacks.length;
    const spread = maxSoc - minSoc;

    resAvgSoc.textContent = `${averageSoc.toFixed(2)}%`;
    resMaxMin.textContent = `Max: ${maxSoc.toFixed(1)}% (${maxId}) / Min: ${minSoc.toFixed(1)}% (${minId})`;
    resSpread.textContent = `${spread.toFixed(1)}%`;

    let condition = "Normal";
    let badgeClass = "status-normal";

    if (spread >= threshold) {
      condition = "Investigate / High Imbalance";
      badgeClass = "status-critical";
    } else if (spread >= threshold * 0.7) {
      condition = "Watch / Elevated Spread";
      badgeClass = "status-warning";
    }

    resStatus.textContent = condition;
    resStatus.style.color = badgeClass === "status-normal" ? "var(--success-color)" : "var(--error-color)";
    diagnosticStatusBadge.textContent = condition.toUpperCase();
    diagnosticStatusBadge.className = `status-badge-inline ${badgeClass}`;

    resultPanel.style.display = 'block';
  }

  copyBtn.addEventListener('click', () => {
    if (loggedRacks.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const text = `Level3Support BESS SOC Imbalance Report
------------------------------------------------------------
Container ID: ${containerIdInput.value || 'N/A'}
Date: ${today}
Average SOC: ${resAvgSoc.textContent}
Max/Min SOC: ${resMaxMin.textContent}
SOC Spread: ${resSpread.textContent}
Evaluation Status: ${diagnosticStatusBadge.textContent}
------------------------------------------------------------
Disclaimer: Assisted field screening tool. Review BMS balancing configurations.`;
    
    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  exportCsvBtn.addEventListener('click', () => {
    if (loggedRacks.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rack ID,SOC %,Voltage Vdc,Balancing Active\r\n";

    loggedRacks.forEach(r => {
      csvContent += `${r.id},${r.soc},${r.voltage || ''},${r.balancing}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bess_soc_imbalance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  loadRacks();
});
