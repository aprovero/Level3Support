/**
 * Number Base Converter JS
 * Level3Support
 */

document.addEventListener('DOMContentLoaded', () => {
  const inputValField = document.getElementById('input-val');
  const inputBaseSelect = document.getElementById('input-base');
  const bitWidthSelect = document.getElementById('bit-width');
  const signedTypeSelect = document.getElementById('signed-type');
  const byteOrderSelect = document.getElementById('byte-order');
  const wordOrderSelect = document.getElementById('word-order');

  const resetBtn = document.getElementById('reset-btn');
  const validationError = document.getElementById('validation-error');

  const resDec = document.getElementById('res-dec');
  const resHex = document.getElementById('res-hex');
  const resBin = document.getElementById('res-bin');
  const resOct = document.getElementById('res-oct');
  const bitTbody = document.getElementById('bit-tbody');

  // Keep a map of bit descriptions in memory
  let bitMeanings = {};

  const inputsToWatch = [
    inputValField, inputBaseSelect, bitWidthSelect,
    signedTypeSelect, byteOrderSelect, wordOrderSelect
  ];

  inputsToWatch.forEach(input => {
    input.addEventListener('input', runConversion);
    input.addEventListener('change', runConversion);
  });

  resetBtn.addEventListener('click', () => {
    inputValField.value = "5";
    inputBaseSelect.value = "10";
    bitWidthSelect.value = "16";
    signedTypeSelect.value = "unsigned";
    byteOrderSelect.value = "big";
    wordOrderSelect.value = "abcd";
    bitMeanings = {};

    runConversion();
  });

  function runConversion() {
    validationError.style.display = 'none';
    const rawVal = inputValField.value.trim();
    const base = parseInt(inputBaseSelect.value);
    const bitWidth = parseInt(bitWidthSelect.value);
    const isSigned = signedTypeSelect.value === 'signed';
    const byteOrder = byteOrderSelect.value;
    const wordSwap = wordOrderSelect.value === 'cdab';

    if (!rawVal) return;

    // Validate characters based on selected base
    let isValid = true;
    if (base === 2) isValid = /^[01]+$/.test(rawVal);
    else if (base === 8) isValid = /^[0-7]+$/.test(rawVal);
    else if (base === 10) isValid = /^-?[0-9]+$/.test(rawVal);
    else if (base === 16) isValid = /^[0-9a-fA-F]+$/.test(rawVal.replace(/^0x/, ''));

    if (!isValid) {
      showError(`Invalid characters for base ${base} representation.`);
      return;
    }

    try {
      // Parse using BigInt to support up to 64-bit safely
      let valueBig = 0n;
      if (base === 16) {
        valueBig = BigInt("0x" + rawVal.replace(/^0x/, ''));
      } else {
        valueBig = BigInt(rawVal);
      }

      // Max boundaries check
      let maxValUnsigned = (1n << BigInt(bitWidth)) - 1n;
      let maxValSigned = (1n << BigInt(bitWidth - 1)) - 1n;
      let minValSigned = -(1n << BigInt(bitWidth - 1));

      // Handle signed conversion / twos complement
      let unsignedVal = valueBig;
      if (isSigned && valueBig < 0n) {
        unsignedVal = (1n << BigInt(bitWidth)) + valueBig;
      }

      // Mask value to bit width
      unsignedVal = unsignedVal & maxValUnsigned;

      // Swap bytes / words
      let swappedVal = swapBytesAndWords(unsignedVal, bitWidth, byteOrder, wordSwap);

      // Render Outputs
      resDec.textContent = isSigned ? getSignedVal(swappedVal, bitWidth).toString() : swappedVal.toString();
      resHex.textContent = "0x" + swappedVal.toString(16).toUpperCase().padStart(bitWidth / 4, '0');
      
      const rawBin = swappedVal.toString(2).padStart(bitWidth, '0');
      // Group in nibbles for readability
      resBin.textContent = rawBin.match(/.{1,4}/g).join(' ');
      resOct.textContent = swappedVal.toString(8);

      renderBitTable(rawBin, bitWidth);
    } catch (e) {
      showError("Conversion error. Value might be out of range for safe BigInt parsing.");
    }
  }

  function swapBytesAndWords(val, width, byteOrder, wordSwap) {
    if (width === 8) return val;
    
    // Convert to byte array
    let bytes = [];
    for (let i = 0n; i < BigInt(width / 8); i++) {
      bytes.push(Number((val >> (i * 8n)) & 0xFFn));
    }
    // Big Endian is standard, little swaps them
    if (byteOrder === 'little') {
      bytes.reverse();
    }

    // Swapping 32-bit word order
    if (width === 32 && wordSwap) {
      // swap AB CD to CD AB
      let temp = bytes[0];
      bytes[0] = bytes[2];
      bytes[2] = temp;
      temp = bytes[1];
      bytes[1] = bytes[3];
      bytes[3] = temp;
    }

    // Reconstruct
    let result = 0n;
    for (let i = 0; i < bytes.length; i++) {
      result |= BigInt(bytes[i]) << BigInt(i * 8);
    }
    return result;
  }

  function getSignedVal(val, width) {
    const mask = 1n << BigInt(width - 1);
    if ((val & mask) !== 0n) {
      return val - (1n << BigInt(width));
    }
    return val;
  }

  function renderBitTable(binaryString, width) {
    bitTbody.innerHTML = '';
    // Binary string is MSB at index 0, LSB at end. We display index LSB (0) to MSB (width-1) or reverse.
    // SCADA registers usually refer to LSB as Bit 0. Let's list from Bit 0 upwards.
    const reversedBin = binaryString.split('').reverse().join('');

    for (let i = 0; i < width; i++) {
      const bitVal = reversedBin[i];
      const tr = document.createElement('tr');
      if (bitVal === '1') {
        tr.className = 'bit-active';
      }

      const desc = bitMeanings[i] || '';

      tr.innerHTML = `
        <td>Bit ${i}</td>
        <td>${bitVal}</td>
        <td>
          <input type="text" value="${desc}" placeholder="Enter bit definition (e.g. Alarm status)..." 
            style="margin: 0; padding: 4px; height: 28px; width: 100%; border: none; background: transparent;"
            onchange="saveBitMeaning(${i}, this.value)">
        </td>
      `;
      bitTbody.appendChild(tr);
    }
  }

  window.saveBitMeaning = (index, value) => {
    bitMeanings[index] = value;
  };

  function showError(msg) {
    validationError.textContent = msg;
    validationError.style.display = 'block';
  }

  runConversion();
});
