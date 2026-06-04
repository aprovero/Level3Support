/**
 * Level3Support - Signature Capture Utility (v5.5.5)
 * Dynamically generated canvas signature pads and signoff modals.
 */
(function() {
    class SignaturePad {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.drawing = false;
            this.points = [];
            this.initCanvas();
        }

        initCanvas() {
            this.ctx.strokeStyle = '#0f172a'; // Slate-900 line color
            this.ctx.lineWidth = 2.5;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            // Event Listeners - Mouse
            this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
            this.canvas.addEventListener('mousemove', (e) => this.draw(e));
            window.addEventListener('mouseup', () => this.stopDrawing());

            // Event Listeners - Touch (Mobile)
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.startDrawing(e.touches[0]);
            }, { passive: false });
            this.canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                this.draw(e.touches[0]);
            }, { passive: false });
            window.addEventListener('touchend', () => this.stopDrawing());
        }

        getPos(e) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        startDrawing(e) {
            this.drawing = true;
            this.points = [];
            const pos = this.getPos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.points.push(pos);
        }

        draw(e) {
            if (!this.drawing) return;
            const pos = this.getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            this.points.push(pos);
        }

        stopDrawing() {
            this.drawing = false;
        }

        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.points = [];
        }

        isEmpty() {
            return this.points.length === 0;
        }

        toDataURL() {
            return this.canvas.toDataURL('image/png');
        }
    }

    // Modal Manager
    function showSignatureModal(onSaveCallback) {
        // Build modal layout
        let modal = document.getElementById('l3s-sig-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'l3s-sig-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(15, 23, 42, 0.6); display: flex; align-items: center;
                justify-content: center; z-index: 10000; font-family: 'Inter', sans-serif;
            `;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div style="background: #ffffff; width: 90%; max-width: 500px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); padding: 24px; box-sizing: border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="margin:0; font-family:'Outfit',sans-serif; font-size:1.3rem; color:#0f172a;">Capture Signature</h3>
                    <button id="l3s-sig-close" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fas fa-times"></i></button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
                    <div>
                        <label style="font-size:0.82rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">Signer Full Name</label>
                        <input type="text" id="l3s-sig-name" placeholder="e.g. John Doe" style="width:100%; height:36px; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; box-sizing:border-box;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="font-size:0.82rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">Signer Role</label>
                            <select id="l3s-sig-role" style="width:100%; height:36px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff;">
                                <option value="Technician">Technician</option>
                                <option value="Supervisor">Supervisor / Reviewer</option>
                                <option value="Customer Representative">Customer Rep</option>
                                <option value="Witness">Witness</option>
                                <option value="Approver">Approver</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.82rem; font-weight:600; color:#475569; display:block; margin-bottom:4px;">Signoff Meaning</label>
                            <select id="l3s-sig-meaning" style="width:100%; height:36px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; background:#ffffff;">
                                <option value="Completed by">Completed by</option>
                                <option value="Reviewed by">Reviewed by</option>
                                <option value="Witnessed by">Witnessed by</option>
                                <option value="Authorized for energization">Authorized</option>
                                <option value="Accepted">Accepted</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background:#f8fafc; margin-bottom:16px;">
                    <canvas id="l3s-sig-canvas" width="450" height="180" style="display:block; width:100%; height:180px; touch-action:none; cursor:crosshair;"></canvas>
                </div>

                <div style="display:flex; gap:12px;">
                    <button id="l3s-sig-clear" style="background:#f1f5f9; color:#475569; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem;">Clear Pad</button>
                    <button id="l3s-sig-save" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; font-size:0.85rem; margin-left:auto;">Save Signature</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        const canvas = document.getElementById('l3s-sig-canvas');
        const pad = new SignaturePad(canvas);

        // Adjust canvas internal width/height to display bounding rectangle client width
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        pad.clear();

        // Close event
        const closeModal = () => {
            modal.style.display = 'none';
        };
        document.getElementById('l3s-sig-close').addEventListener('click', closeModal);

        // Clear pad event
        document.getElementById('l3s-sig-clear').addEventListener('click', () => pad.clear());

        // Save event
        document.getElementById('l3s-sig-save').addEventListener('click', () => {
            const name = document.getElementById('l3s-sig-name').value.trim();
            const role = document.getElementById('l3s-sig-role').value;
            const meaning = document.getElementById('l3s-sig-meaning').value;

            if (!name) {
                alert('Please enter signer name.');
                return;
            }

            if (pad.isEmpty()) {
                alert('Please draw a signature.');
                return;
            }

            const dataUrl = pad.toDataURL();
            closeModal();

            if (typeof onSaveCallback === 'function') {
                onSaveCallback({
                    id: crypto.randomUUID(),
                    name: name,
                    role: role,
                    meaning: meaning,
                    dataUrl: dataUrl,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    window.L3Signatures = {
        SignaturePad,
        showSignatureModal
    };
})();
