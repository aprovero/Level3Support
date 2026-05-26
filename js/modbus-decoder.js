/**
 * MODBUS Register Decoder Logic
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const inputFormatSelect = document.getElementById('input-format');
  const dataTypeSelect = document.getElementById('data-type');
  const registerVal1Input = document.getElementById('register-val-1');
  const registerVal2Input = document.getElementById('register-val-2');
  const registerVal2Group = document.getElementById('register-val-2-group');
  const wordOrderRow = document.getElementById('word-order-row');
  
  const wordOrderSelect = document.getElementById('word-order');
  const byteOrderSelect = document.getElementById('byte-order');
  const scaleFactorInput = document.getElementById('scale-factor');
  const offsetFactorInput = document.getElementById('offset-factor');
  const unitLabelInput = document.getElementById('unit-label');
  const registerAddressInput = document.getElementById('register-address');
  
  const calculateBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  
  const resultPanel = document.getElementById('result-panel');
  const resAddress = document.getElementById('res-address');
  const resRawVal = document.getElementById('res-raw-val');
  const resScaledVal = document.getElementById('res-scaled-val');
  const resHex = document.getElementById('res-hex');
  const bitDisplayContainer1 = document.getElementById('bit-display-container-1');
  const bitDisplayContainer2 = document.getElementById('bit-display-container-2');
  const validationError = document.getElementById('validation-error');

  let calculationResults = null;

  // Toggle high register word visibility
  dataTypeSelect.addEventListener('change', () => {
    const is32Bit = dataTypeSelect.value.includes('32') || dataTypeSelect.value.includes('float');
    if (is32Bit) {
      registerVal2Group.style.display = 'block';
      wordOrderRow.style.display = 'grid';
      registerVal2Input.setAttribute('required', 'true');
    } else {
      registerVal2Group.style.display = 'none';
      wordOrderRow.style.display = 'none';
      registerVal2Input.removeAttribute('required');
      registerVal2Input.value = '';
    }
  });

  // Pre-fill Sample Float value: 16560 and 0 represents 3.0 (IEEE-754 float32)
  function loadSampleData() {
    inputFormatSelect.value = 'Decimal';
    dataTypeSelect.value = 'float32';
    registerVal1Input.value = '16560'; // 0x40B0
    registerVal2Input.value = '0';
    registerVal2Group.style.display = 'block';
    wordOrderRow.style.display = 'grid';
    scaleFactorInput.value = '1';
    offsetFactorInput.value = '0';
    unitLabelInput.value = 'Bar';
    registerAddressInput.value = '40051';
  }

  loadSampleData();

  // Reset Button
  resetBtn.addEventListener('click', () => {
    inputFormatSelect.value = 'Decimal';
    dataTypeSelect.value = 'uint16';
    registerVal1Input.value = '';
    registerVal2Input.value = '';
    registerVal2Group.style.display = 'none';
    wordOrderRow.style.display = 'none';
    scaleFactorInput.value = '1';
    offsetFactorInput.value = '0';
    unitLabelInput.value = '';
    registerAddressInput.value = '';
    validationError.style.display = 'none';
    resultPanel.style.display = 'none';
    calculationResults = null;
  });

  // Decode Register calculation
  calculateBtn.addEventListener('click', () => {
    validationError.style.display = 'none';

    const isHexInput = inputFormatSelect.value === 'Hex';
    const dataType = dataTypeSelect.value;
    const is32Bit = dataType.includes('32') || dataType.includes('float');
    
    // Parse value 1
    const rawVal1Str = registerVal1Input.value.trim();
    if (!rawVal1Str) {
      showError('Please enter the First Register Value.');
      return;
    }
    
    let w1 = parseWord(rawVal1Str, isHexInput);
    if (w1 === null || w1 < 0 || w1 > 65535) {
      showError('First Register must be a valid 16-bit word (0 to 65535 or 0000 to FFFF).');
      return;
    }

    // Parse value 2
    let w2 = 0;
    if (is32Bit) {
      const rawVal2Str = registerVal2Input.value.trim();
      if (!rawVal2Str) {
        showError('Please enter the Second Register Value for 32-bit representations.');
        return;
      }
      w2 = parseWord(rawVal2Str, isHexInput);
      if (w2 === null || w2 < 0 || w2 > 65535) {
        showError('Second Register must be a valid 16-bit word (0 to 65535 or 0000 to FFFF).');
        return;
      }
    }

    // Apply Byte Swaps on each 16-bit word if Little Endian Byte Order selected
    if (byteOrderSelect.value === 'Little') {
      w1 = swapBytes(w1);
      if (is32Bit) w2 = swapBytes(w2);
    }

    // Combine registers to 32-bit double word
    let combinedVal = 0;
    let decodedRaw = 0;
    
    if (is32Bit) {
      const isBigWord = wordOrderSelect.value === 'ABCD';
      const highWord = isBigWord ? w1 : w2;
      const lowWord = isBigWord ? w2 : w1;
      
      combinedVal = (highWord << 16) | lowWord;
      
      if (dataType === 'uint32') {
        decodedRaw = combinedVal >>> 0;
      } else if (dataType === 'int32') {
        decodedRaw = combinedVal | 0;
      } else if (dataType === 'float32') {
        decodedRaw = intBitsToFloat(combinedVal);
      }
    } else {
      if (dataType === 'uint16') {
        decodedRaw = w1 >>> 0;
      } else if (dataType === 'int16') {
        decodedRaw = (w1 << 16) >> 16;
      }
    }

    if (isNaN(decodedRaw)) {
      showError('Resulting calculation is Not-A-Number (NaN) under float32 parsing.');
      return;
    }

    // Scale and Offset
    const scale = parseFloat(scaleFactorInput.value) || 1;
    const offset = parseFloat(offsetFactorInput.value) || 0;
    const scaledVal = decodedRaw * scale + offset;
    const unit = unitLabelInput.value.trim();

    // Prepare Results Data
    calculationResults = {
      address: registerAddressInput.value.trim() || 'N/A',
      dataType: dataType,
      rawInputs: is32Bit ? `Reg1: ${w1.toString(16).toUpperCase()}, Reg2: ${w2.toString(16).toUpperCase()}` : `Reg: ${w1.toString(16).toUpperCase()}`,
      decodedRaw: typeof decodedRaw === 'number' ? decodedRaw.toFixed(5).replace(/\.?0+$/, '') : decodedRaw,
      scaledVal: `${scaledVal.toFixed(4).replace(/\.?0+$/, '')} ${unit}`.trim(),
      hex: is32Bit ? `0x${(combinedVal >>> 0).toString(16).toUpperCase().padStart(8, '0')}` : `0x${w1.toString(16).toUpperCase().padStart(4, '0')}`
    };

    // Render text outputs
    resAddress.textContent = calculationResults.address;
    resRawVal.textContent = calculationResults.decodedRaw;
    resScaledVal.textContent = calculationResults.scaledVal;
    resHex.textContent = calculationResults.hex;

    // Render Bit display
    renderBitDisplay(bitDisplayContainer1, w1);
    if (is32Bit) {
      bitDisplayContainer2.style.display = 'grid';
      renderBitDisplay(bitDisplayContainer2, w2);
    } else {
      bitDisplayContainer2.style.display = 'none';
    }

    resultPanel.style.display = 'block';
    resultPanel.scrollIntoView({ behavior: 'smooth' });
  });

  // Byte swapper (uint16)
  function swapBytes(val) {
    return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
  }

  // Parse strings into integer values
  function parseWord(str, isHex) {
    if (isHex) {
      const cleanHex = str.replace(/^0x/i, '');
      const parsed = parseInt(cleanHex, 16);
      return isNaN(parsed) ? null : parsed;
    }
    const parsed = parseInt(str, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // Float conversion logic (IEEE-754 single-precision float)
  function intBitsToFloat(val) {
    const sign = (val & 0x80000000) ? -1 : 1;
    const exponent = ((val >> 23) & 0xFF) - 127;
    const mantissa = (val & 0x7FFFFF) / 0x800000 + 1;
    
    if (exponent === 128) {
      return mantissa === 1 ? sign * Infinity : NaN;
    }
    if (exponent === -127) {
      return sign * (mantissa - 1) * Math.pow(2, -126); // subnormal
    }
    return sign * mantissa * Math.pow(2, exponent);
  }

  // Render visual bits in binary bitmask grid
  function renderBitDisplay(container, word) {
    container.innerHTML = '';
    for (let i = 15; i >= 0; i--) {
      const bit = (word >> i) & 1;
      const box = document.createElement('div');
      box.className = 'bit-box';
      box.innerHTML = `
        <span class="bit-val" style="color: ${bit === 1 ? 'var(--success-color)' : 'var(--text-light)'};">${bit}</span>
        <span class="bit-idx">${i}</span>
      `;
      container.appendChild(box);
    }
  }

  // Copy results to clipboard
  copyBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const text = `Level3Support MODBUS Decoding Result
-------------------------------------------
Register Address: ${calculationResults.address}
Data Type: ${calculationResults.dataType}
Raw Input Words: ${calculationResults.rawInputs}
Decoded Raw Decimal: ${calculationResults.decodedRaw}
Hexadecimal Combined: ${calculationResults.hex}
Scaled Engineering Value: ${calculationResults.scaledVal}
-------------------------------------------
Assists field diagnostics but does not replace manufacturer register maps.`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => copyBtn.innerHTML = origText, 2000);
    });
  });

  // Export JSON file
  exportBtn.addEventListener('click', () => {
    if (!calculationResults) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(calculationResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `modbus_decoded_reg_${calculationResults.address}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }
});
