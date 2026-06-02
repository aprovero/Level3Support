document.addEventListener('DOMContentLoaded', async () => {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm    = document.getElementById('login-form');
    const loginBtn     = document.getElementById('login-btn');
    const logoutBtn    = document.getElementById('logout-btn');
    const toolsTbody   = document.getElementById('tools-tbody');
    const loginError   = document.getElementById('login-error');

    // ── Helpers ──────────────────────────────────────────────
    function showAuth() {
        authSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }

    function showAdmin() {
        authSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        loadTools();
    }

    function showError(msg) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
    }

    // ── 1. Check if already logged in ────────────────────────
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showAdmin();
        } else {
            showAuth();
        }
    } catch (e) {
        console.error('[Admin] Session check failed:', e);
        showAuth();
    }

    // ── 2. Login form ─────────────────────────────────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                showError(error.message);
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                return;
            }

            if (data.session) {
                showAdmin();
            } else {
                showError('Login failed — no session returned.');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        } catch (err) {
            showError('Unexpected error: ' + err.message);
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    // ── 3. Logout ─────────────────────────────────────────────
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        showAuth();
    });

    // ── 4. Load Tools ─────────────────────────────────────────
    async function loadTools() {
        toolsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">Loading tools...</td></tr>';

        try {
            const { data, error } = await supabase
                .from('tools')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            toolsTbody.innerHTML = '';
            data.forEach(tool => {
                const statusColors = {
                    'Active':       { bg: '#dcfce7', color: '#15803d' },
                    'Under Review': { bg: '#fef3c7', color: '#92400e' },
                    'In Progress':  { bg: '#fef3c7', color: '#b45309' },
                    'Legacy':       { bg: '#e2e8f0', color: '#475569' },
                    'Archived':     { bg: '#e2e8f0', color: '#475569' },
                };
                const sc = statusColors[tool.status] || { bg: '#f1f5f9', color: '#64748b' };

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="color:#94a3b8; font-size:0.8rem;">${tool.id}</td>
                    <td class="tool-name">${tool.name}</td>
                    <td><span class="cat-badge">${tool.category}</span></td>
                    <td><span style="background:${sc.bg}; color:${sc.color}; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">${tool.status}</span></td>
                    <td class="center">
                        <label class="toggle toggle-featured">
                            <input type="checkbox" ${tool.featured ? 'checked' : ''} onchange="toggleField(${tool.id}, 'featured', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td class="center">
                        <label class="toggle">
                            <input type="checkbox" ${tool.new ? 'checked' : ''} onchange="toggleField(${tool.id}, 'new', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </td>
                `;
                toolsTbody.appendChild(tr);
            });
        } catch (err) {
            console.error('[Admin] Error loading tools:', err);
            toolsTbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626; text-align:center; padding:2rem;"><i class="fas fa-exclamation-circle"></i> Error: ${err.message}</td></tr>`;
        }
    }

    // ── 5. Toggle a field (featured / new) ───────────────────
    window.toggleField = async function(id, field, value) {
        const updateData = {};
        updateData[field] = value;

        const { error } = await supabase
            .from('tools')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('[Admin] Update failed:', error.message);
            alert('Update failed: ' + error.message);
        } else {
            console.log(`[Admin] Tool ${id}: ${field} = ${value}`);
        }
    };
});
