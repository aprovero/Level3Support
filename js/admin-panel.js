document.addEventListener('DOMContentLoaded', async () => {
    const authSection  = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm    = document.getElementById('login-form');
    const loginBtn     = document.getElementById('login-btn');
    const logoutBtn    = document.getElementById('logout-btn');
    const toolsTbody   = document.getElementById('tools-tbody');
    const loginError   = document.getElementById('login-error');
    const resultsCount = document.getElementById('results-count');

    // ── State ──────────────────────────────────────────────────
    let allTools   = [];
    let sortCol    = 'id';
    let sortDir    = 'asc'; // 'asc' | 'desc'

    // ── Helpers ────────────────────────────────────────────────
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

    // ── 1. Session check ───────────────────────────────────────
    try {
        const { data: { session } } = await supabase.auth.getSession();
        session ? showAdmin() : showAuth();
    } catch (e) {
        console.error('[Admin] Session check failed:', e);
        showAuth();
    }

    // ── 2. Login ───────────────────────────────────────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { showError(error.message); return; }
            if (data.session) { showAdmin(); }
            else { showError('Login failed — no session returned.'); }
        } catch (err) {
            showError('Unexpected error: ' + err.message);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    // ── 3. Logout ──────────────────────────────────────────────
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        showAuth();
    });

    // ── 4. Load tools from Supabase ────────────────────────────
    async function loadTools() {
        toolsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">Loading tools...</td></tr>';
        try {
            const { data, error } = await supabase.from('tools').select('*').order('id', { ascending: true });
            if (error) throw error;
            allTools = data;
            populateCategoryFilter();
            bindFiltersAndSort();
            renderTable();
        } catch (err) {
            toolsTbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626; text-align:center; padding:2rem;">Error: ${err.message}</td></tr>`;
        }
    }

    // ── 5. Populate category dropdown dynamically ──────────────
    function populateCategoryFilter() {
        const select = document.getElementById('filter-category');
        const cats = [...new Set(allTools.map(t => t.category))].sort();
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });
    }

    // ── 6. Bind sort headers & filter inputs ───────────────────
    function bindFiltersAndSort() {
        // Sort: click headers
        document.querySelectorAll('#sort-row th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                if (sortCol === col) {
                    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    sortCol = col;
                    sortDir = 'asc';
                }
                // Update header classes
                document.querySelectorAll('#sort-row th').forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                th.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
                renderTable();
            });
        });

        // Filters: any change re-renders
        ['filter-name', 'filter-category', 'filter-status', 'filter-featured', 'filter-new'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderTable);
        });
    }

    // ── 7. Apply filters + sort, then render rows ──────────────
    function renderTable() {
        const nameQ     = (document.getElementById('filter-name')?.value || '').toLowerCase();
        const catQ      = document.getElementById('filter-category')?.value || '';
        const statusQ   = document.getElementById('filter-status')?.value || '';
        const featQ     = document.getElementById('filter-featured')?.value || '';
        const newQ      = document.getElementById('filter-new')?.value || '';

        let filtered = allTools.filter(t => {
            if (nameQ   && !t.name.toLowerCase().includes(nameQ))      return false;
            if (catQ    && t.category !== catQ)                         return false;
            if (statusQ && t.status   !== statusQ)                      return false;
            if (featQ   && String(!!t.featured) !== featQ)              return false;
            if (newQ    && String(!!t.new)       !== newQ)              return false;
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let av = a[sortCol], bv = b[sortCol];
            // booleans: true first when asc
            if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
            if (av == null) av = '';
            if (bv == null) bv = '';
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });

        // Update count
        resultsCount.textContent = `Showing ${filtered.length} of ${allTools.length} tools`;

        const statusColors = {
            'Active':       { bg: '#dcfce7', color: '#15803d' },
            'Under Review': { bg: '#fef3c7', color: '#92400e' },
            'In Progress':  { bg: '#fef3c7', color: '#b45309' },
            'Legacy':       { bg: '#e2e8f0', color: '#475569' },
            'Archived':     { bg: '#e2e8f0', color: '#475569' },
        };

        if (filtered.length === 0) {
            toolsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">No tools match your filters.</td></tr>';
            return;
        }

        toolsTbody.innerHTML = '';
        filtered.forEach(tool => {
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
    }

    // ── 8. Toggle a field in Supabase ─────────────────────────
    window.toggleField = async function(id, field, value) {
        // Optimistically update local state
        const tool = allTools.find(t => t.id === id);
        if (tool) tool[field] = value;

        const updateData = {};
        updateData[field] = value;
        const { error } = await supabase.from('tools').update(updateData).eq('id', id);

        if (error) {
            console.error('[Admin] Update failed:', error.message);
            alert('Update failed: ' + error.message);
            if (tool) tool[field] = !value; // revert
            renderTable();
        }
    };
});
