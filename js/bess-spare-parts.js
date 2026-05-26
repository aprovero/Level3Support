/**
 * BESS Spare Parts Cross-Reference — Controller Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sample inventory database seeds
  const defaultInventory = [
    {
      partNum: 'BMS-M-CTRL-V2',
      description: 'BMS Master Controller System Board (Sample)',
      type: 'BMS Controller',
      manufacturer: 'CATL',
      compatModel: 'EnerOne 372kWh Pack',
      altPartNum: 'BMS-V2.1-CATL',
      criticality: 'Critical',
      minStock: 2,
      supplier: 'CATL Power Logistics',
      leadTime: 6,
      notes: 'Must flash firmware version 3.1.2.B4 before inserting into active communication ring.'
    },
    {
      partNum: 'FUSE-DC-1000A-1.5kV',
      description: 'DC High-Speed Main Power Fuse 1000A (Sample)',
      type: 'Fuses',
      manufacturer: 'Bussmann',
      compatModel: 'Utility Rack 1500VDC',
      altPartNum: 'BUS-1000-1.5',
      criticality: 'Critical',
      minStock: 6,
      supplier: 'Eaton Fuse Distributors',
      leadTime: 2,
      notes: 'Standard protective fuse for main DC busbar rack disconnect switches.'
    },
    {
      partNum: 'HVAC-COMP-R410A-5kW',
      description: 'HVAC Hermetic Compressor unit 5kW (Sample)',
      type: 'HVAC',
      manufacturer: 'Daikin',
      compatModel: 'BESS-Cool-50 Climate Enclosure',
      altPartNum: 'DK-COMP-5K',
      criticality: 'High',
      minStock: 1,
      supplier: 'Daikin Climate Systems',
      leadTime: 8,
      notes: 'Requires certified HVAC technician for vacuuming, refrigerant charging, and brazing.'
    },
    {
      partNum: 'FSP-SMK-DET-P1',
      description: 'Photoelectric Smoke & Fire detector (Sample)',
      type: 'Fire Suppression',
      manufacturer: 'Kidde',
      compatModel: 'BESS-Safe Enclosure v3',
      altPartNum: 'KD-SMK-01',
      criticality: 'High',
      minStock: 4,
      supplier: 'Kidde Fire Safety Corp',
      leadTime: 3,
      notes: 'NFPA 855 requirement. Verify alarm interface contact relays function on dry closure loop.'
    },
    {
      partNum: 'CAB-DC-150-2M',
      description: 'Orange Flexible Copper DC Cable 150mm2 2m (Sample)',
      type: 'Cable/Connector',
      manufacturer: 'Amphenol',
      compatModel: 'Radsert 8mm High Power Terminal',
      altPartNum: 'DC-CAB-150-AMP',
      criticality: 'Low',
      minStock: 10,
      supplier: 'Amphenol Connector Hub',
      leadTime: 1,
      notes: 'Verify minimum bending radius (7.5x OD) is respected inside cabinet routing tray.'
    }
  ];

  // Database State
  let partsInventory = [];

  // Load Inventory from localStorage or seed defaults
  function loadDatabase() {
    const rawData = localStorage.getItem('bess_spare_parts');
    if (rawData) {
      try {
        partsInventory = JSON.parse(rawData);
      } catch (e) {
        console.error('Error parsing localStorage parts inventory. Resetting to defaults.', e);
        partsInventory = [...defaultInventory];
        saveDatabase();
      }
    } else {
      partsInventory = [...defaultInventory];
      saveDatabase();
    }
  }

  function saveDatabase() {
    localStorage.setItem('bess_spare_parts', JSON.stringify(partsInventory));
  }

  // DOM elements cache
  const desktopTbody = document.getElementById('desktop-parts-tbody');
  const mobileCardsContainer = document.getElementById('mobile-parts-cards');
  const partsEmpty = document.getElementById('parts-empty');
  
  const searchInput = document.getElementById('search-parts');
  const filterType = document.getElementById('filter-type');
  const filterCriticality = document.getElementById('filter-criticality');
  
  const addPartBtn = document.getElementById('add-part-btn');
  const csvExportBtn = document.getElementById('csv-export-btn');
  const csvImportFile = document.getElementById('csv-import-file');
  
  // Modal DOM Elements
  const partModal = document.getElementById('part-modal');
  const modalTitle = document.getElementById('modal-title');
  const formEditIndex = document.getElementById('form-edit-index');
  const formPartNum = document.getElementById('form-part-num');
  const formDesc = document.getElementById('form-desc');
  const formType = document.getElementById('form-type');
  const formManufacturer = document.getElementById('form-manufacturer');
  const formCompatModel = document.getElementById('form-compat-model');
  const formAltPart = document.getElementById('form-alt-part');
  const formCriticality = document.getElementById('form-criticality');
  const formMinStock = document.getElementById('form-min-stock');
  const formSupplier = document.getElementById('form-supplier');
  const formLeadTime = document.getElementById('form-lead-time');
  const formNotes = document.getElementById('form-notes');
  
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalSaveBtn = document.getElementById('modal-save-btn');
  const modalValidationError = document.getElementById('modal-validation-error');

  // Render Parts Grid (Switchable Tables & Cards)
  function renderParts() {
    const searchVal = searchInput.value.toLowerCase().trim();
    const typeVal = filterType.value;
    const critVal = filterCriticality.value;

    // Filter logic
    const filtered = partsInventory.filter(part => {
      const matchesSearch = searchVal === '' || 
        part.partNum.toLowerCase().includes(searchVal) ||
        part.description.toLowerCase().includes(searchVal) ||
        part.manufacturer.toLowerCase().includes(searchVal) ||
        part.compatModel.toLowerCase().includes(searchVal);
      
      const matchesType = typeVal === 'ALL' || part.type === typeVal;
      const matchesCrit = critVal === 'ALL' || part.criticality === critVal;

      return matchesSearch && matchesType && matchesCrit;
    });

    // Clear panels
    desktopTbody.innerHTML = '';
    mobileCardsContainer.innerHTML = '';

    if (filtered.length === 0) {
      partsEmpty.style.display = 'block';
      document.getElementById('parts-display-container').style.display = 'none';
      return;
    }

    partsEmpty.style.display = 'none';
    document.getElementById('parts-display-container').style.display = 'block';

    filtered.forEach((part, index) => {
      // Find actual index in global partsInventory array
      const globalIndex = partsInventory.findIndex(p => p.partNum === part.partNum);
      
      // Determine Criticality Class
      const critClass = `crit-${part.criticality.toLowerCase()}`;
      
      // 1. Desktop Row Insertion
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--primary-color);">${escapeHTML(part.partNum)}</td>
        <td>${escapeHTML(part.description)}</td>
        <td style="font-size:0.85rem;"><span style="padding: 2px 6px; background:#f1f5f9; border-radius:4px; font-weight:600; color:#475569;">${escapeHTML(part.type)}</span></td>
        <td>${escapeHTML(part.manufacturer)}</td>
        <td>${escapeHTML(part.compatModel)}</td>
        <td style="font-weight:600;">${part.minStock}</td>
        <td><span class="criticality-badge ${critClass}">${part.criticality}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="button-secondary btn-action-edit" data-index="${globalIndex}" style="margin:0; padding:4px 8px; font-size:0.75rem; min-height:auto;" title="Edit Part"><i class="fas fa-edit"></i></button>
            <button class="button-secondary btn-action-delete" data-index="${globalIndex}" style="margin:0; padding:4px 8px; font-size:0.75rem; min-height:auto; color:#ef4444; border-color:#fee2e2;" title="Delete Part"><i class="fas fa-trash-alt"></i></button>
          </div>
        </td>
      `;
      desktopTbody.appendChild(tr);

      // 2. Mobile Card Insertion
      const card = document.createElement('div');
      card.className = 'part-card';
      card.innerHTML = `
        <div class="part-card-title">${escapeHTML(part.partNum)}</div>
        <div class="part-card-detail"><strong>Description:</strong> ${escapeHTML(part.description)}</div>
        <div class="part-card-detail"><strong>Equipment Type:</strong> ${escapeHTML(part.type)}</div>
        <div class="part-card-detail"><strong>Manufacturer:</strong> ${escapeHTML(part.manufacturer)}</div>
        <div class="part-card-detail"><strong>Compatible Model:</strong> ${escapeHTML(part.compatModel)}</div>
        <div class="part-card-detail"><strong>Alt Part #:</strong> ${escapeHTML(part.altPartNum || 'None')}</div>
        <div class="part-card-detail"><strong>Recommended Stock:</strong> ${part.minStock} units</div>
        <div class="part-card-detail"><strong>Criticality:</strong> <span class="criticality-badge ${critClass}">${part.criticality}</span></div>
        <div class="part-card-detail"><strong>Supplier:</strong> ${escapeHTML(part.supplier || 'N/A')} (Lead Time: ${part.leadTime || 'N/A'} wks)</div>
        <div class="part-card-detail" style="font-style:italic;"><strong>Notes:</strong> ${escapeHTML(part.notes || 'None.')}</div>
        
        <div class="part-actions">
          <button class="button-secondary btn-action-edit" data-index="${globalIndex}" style="margin:0; padding:6px 12px; font-size:0.75rem; min-height:auto;"><i class="fas fa-edit"></i> Edit</button>
          <button class="button-secondary btn-action-delete" data-index="${globalIndex}" style="margin:0; padding:6px 12px; font-size:0.75rem; min-height:auto; color:#ef4444; border-color:#fee2e2;"><i class="fas fa-trash-alt"></i> Delete</button>
        </div>
      `;
      mobileCardsContainer.appendChild(card);
    });

    // Wire action buttons
    const editBtns = document.querySelectorAll('.btn-action-edit');
    editBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        openPartModal(index);
      });
    });

    const deleteBtns = document.querySelectorAll('.btn-action-delete');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const index = parseInt(this.getAttribute('data-index'));
        deletePart(index);
      });
    });
  }

  // Open Add/Edit Modal
  function openPartModal(index = null) {
    modalValidationError.style.display = 'none';
    
    if (index !== null) {
      // Edit Mode
      modalTitle.innerHTML = `<i class="fas fa-edit" style="color:var(--primary-color);"></i> Edit Spare Part`;
      const part = partsInventory[index];
      
      formEditIndex.value = index;
      formPartNum.value = part.partNum;
      formPartNum.disabled = true; // Block editing part key, or replace it on merge
      formDesc.value = part.description;
      formType.value = part.type;
      formManufacturer.value = part.manufacturer;
      formCompatModel.value = part.compatModel;
      formAltPart.value = part.altPartNum || '';
      formCriticality.value = part.criticality;
      formMinStock.value = part.minStock;
      formSupplier.value = part.supplier || '';
      formLeadTime.value = part.leadTime || '';
      formNotes.value = part.notes || '';
    } else {
      // Add Mode
      modalTitle.innerHTML = `<i class="fas fa-plus" style="color:var(--primary-color);"></i> Add Spare Part`;
      formEditIndex.value = '';
      formPartNum.value = '';
      formPartNum.disabled = false;
      formDesc.value = '';
      formType.value = 'Battery Module';
      formManufacturer.value = '';
      formCompatModel.value = '';
      formAltPart.value = '';
      formCriticality.value = 'Medium';
      formMinStock.value = '';
      formSupplier.value = '';
      formLeadTime.value = '';
      formNotes.value = '';
    }
    
    partModal.classList.remove('hidden');
  }

  function closePartModal() {
    partModal.classList.add('hidden');
  }

  // Delete part handler
  function deletePart(index) {
    const part = partsInventory[index];
    if (confirm(`Are you sure you want to delete spare part "${part.partNum}"?`)) {
      partsInventory.splice(index, 1);
      saveDatabase();
      renderParts();
    }
  }

  // Save Modal Part Handler
  modalSaveBtn.addEventListener('click', () => {
    modalValidationError.style.display = 'none';

    // Read values
    const partNum = formPartNum.value.trim().toUpperCase();
    const desc = formDesc.value.trim();
    const type = formType.value;
    const manufacturer = formManufacturer.value.trim();
    const compatModel = formCompatModel.value.trim();
    const altPartNum = formAltPart.value.trim();
    const criticality = formCriticality.value;
    const minStock = parseInt(formMinStock.value);
    const supplier = formSupplier.value.trim();
    const leadTime = parseInt(formLeadTime.value);
    const notes = formNotes.value.trim();

    // Validations
    if (!partNum || !desc || !manufacturer || !compatModel || isNaN(minStock)) {
      showModalError('Please populate all fields marked with an asterisk (*).');
      return;
    }

    const indexStr = formEditIndex.value;
    
    if (indexStr === '') {
      // Create new part - check unique part key
      const duplicate = partsInventory.some(p => p.partNum === partNum);
      if (duplicate) {
        showModalError(`Part number "${partNum}" already exists. Edit the existing record or use a unique key.`);
        return;
      }

      partsInventory.push({
        partNum, description: desc, type, manufacturer, compatModel,
        altPartNum, criticality, minStock, supplier, 
        leadTime: isNaN(leadTime) ? '' : leadTime, notes
      });
    } else {
      // Update existing part
      const index = parseInt(indexStr);
      partsInventory[index] = {
        partNum, description: desc, type, manufacturer, compatModel,
        altPartNum, criticality, minStock, supplier, 
        leadTime: isNaN(leadTime) ? '' : leadTime, notes
      };
    }

    saveDatabase();
    closePartModal();
    renderParts();
  });

  modalCancelBtn.addEventListener('click', closePartModal);

  // Hook filters
  searchInput.addEventListener('input', renderParts);
  filterType.addEventListener('change', renderParts);
  filterCriticality.addEventListener('change', renderParts);
  addPartBtn.addEventListener('click', () => openPartModal());

  // CSV Export Action
  csvExportBtn.addEventListener('click', () => {
    if (partsInventory.length === 0) return;
    
    // Convert array to CSV string
    const csvContent = Papa.unparse(partsInventory);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `bess_spare_parts_inventory_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // CSV Import Action
  csvImportFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Use PapaParse to parse local CSV file uploads
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        console.log('CSV Raw Import Results:', results);
        
        if (results.errors && results.errors.length > 0) {
          alert('Error parsing CSV file. Please confirm file syntax matches BESS parts formatting.');
          return;
        }

        const data = results.data;
        let importedCount = 0;
        let mergedCount = 0;

        data.forEach(row => {
          const partNum = (row.partNum || '').trim().toUpperCase();
          const desc = (row.description || '').trim();
          
          if (!partNum || !desc) return; // skip row if key headers empty

          const newRecord = {
            partNum: partNum,
            description: desc,
            type: row.type || 'Other',
            manufacturer: row.manufacturer || 'N/A',
            compatModel: row.compatModel || 'N/A',
            altPartNum: row.altPartNum || '',
            criticality: row.criticality || 'Medium',
            minStock: parseInt(row.minStock) || 0,
            supplier: row.supplier || '',
            leadTime: parseInt(row.leadTime) || '',
            notes: row.notes || ''
          };

          // Check if record exists
          const existingIndex = partsInventory.findIndex(p => p.partNum === partNum);
          if (existingIndex !== -1) {
            // Merge record by replacement
            partsInventory[existingIndex] = newRecord;
            mergedCount++;
          } else {
            // Append record
            partsInventory.push(newRecord);
            importedCount++;
          }
        });

        saveDatabase();
        renderParts();
        alert(`CSV Import Completed successfully!\nAdded new records: ${importedCount}\nMerged existing records: ${mergedCount}`);
        csvImportFile.value = ''; // clear select input
      }
    });
  });

  // Utility helpers
  function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showModalError(msg) {
    modalValidationError.textContent = msg;
    modalValidationError.style.display = 'block';
  }

  // Load database on start
  loadDatabase();
  renderParts();
});
