document.addEventListener('DOMContentLoaded', async () => {
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const toolsTbody = document.getElementById('tools-tbody');
    const loginError = document.getElementById('login-error');

    // 1. Check Auth Status
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showAdmin();
    } else {
        showAuth();
    }

    // 2. Auth Listeners
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') showAdmin();
        if (event === 'SIGNED_OUT') showAuth();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    // 3. UI Helpers
    function showAuth() {
        authSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }

    function showAdmin() {
        authSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        loadTools();
    }

    // 4. Load Tools from Supabase
    async function loadTools() {
        toolsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading tools...</td></tr>';
        
        const { data, error } = await supabase
            .from('tools')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching tools:', error);
            toolsTbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">Error loading tools: ${error.message}</td></tr>`;
            return;
        }

        toolsTbody.innerHTML = '';
        data.forEach(tool => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tool.id}</td>
                <td style="font-weight:600; color:#0f172a;">${tool.name}</td>
                <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${tool.category}</span></td>
                <td style="text-align:center;">
                    <label class="toggle-switch">
                        <input type="checkbox" ${tool.featured ? 'checked' : ''} onchange="toggleTag(${tool.id}, 'featured', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td style="text-align:center;">
                    <label class="toggle-switch">
                        <input type="checkbox" ${tool.new ? 'checked' : ''} onchange="toggleTag(${tool.id}, 'new', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
            `;
            toolsTbody.appendChild(tr);
        });
    }

    // 5. Update Tag
    window.toggleTag = async function(id, field, value) {
        const updateData = {};
        updateData[field] = value;

        const { error } = await supabase
            .from('tools')
            .update(updateData)
            .eq('id', id);

        if (error) {
            alert('Failed to update: ' + error.message);
        } else {
            console.log(`Tool ${id} updated ${field} to ${value}`);
        }
    };
});
