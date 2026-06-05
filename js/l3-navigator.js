/**
 * L3 Navigator Assistant
 * Offline guided search for the Level3Support Tool Hub.
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const l3NavFab = document.getElementById('l3-nav-fab');
    const l3NavOverlay = document.getElementById('l3-nav-overlay');
    const l3NavCloseBtn = document.getElementById('l3-nav-close');
    const l3NavInput = document.getElementById('l3-nav-input');
    const l3NavResultsContainer = document.getElementById('l3-nav-results');
    const l3NavEmptyState = document.getElementById('l3-nav-empty');
    const l3NavExamplesContainer = document.getElementById('l3-nav-examples-container');
    const l3NavResultsTitle = document.getElementById('l3-nav-results-title');

    let registryData = [];

    // Initialize Navigator
    function initL3Navigator() {
        if (!l3NavFab) return; // Make sure elements exist

        // Event Listeners for Drawer
        l3NavFab.addEventListener('click', openDrawer);
        l3NavCloseBtn.addEventListener('click', closeDrawer);
        l3NavOverlay.addEventListener('click', (e) => {
            if (e.target === l3NavOverlay) closeDrawer();
        });

        // Event Listener for Input
        l3NavInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            if (query.trim().length > 1) {
                performSearch(query);
            } else {
                clearResults();
            }
        }, 300));

        // Event Listeners for Example Chips
        document.querySelectorAll('.l3-nav-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const query = e.target.textContent;
                l3NavInput.value = query;
                performSearch(query);
            });
        });

        // Fetch the registry data
        fetch('./l3-navigator-registry.json')
            .then(res => res.json())
            .then(data => {
                registryData = data.tools || [];
                console.log(`L3 Navigator loaded ${registryData.length} tools.`);
            })
            .catch(err => console.error('Failed to load L3 Navigator registry:', err));
    }

    function openDrawer() {
        l3NavOverlay.classList.add('open');
        setTimeout(() => l3NavInput.focus(), 300); // Focus input after drawer slide
    }

    function closeDrawer() {
        l3NavOverlay.classList.remove('open');
    }

    function clearResults() {
        l3NavResultsContainer.innerHTML = '';
        l3NavEmptyState.style.display = 'none';
        l3NavResultsTitle.style.display = 'none';
        l3NavExamplesContainer.style.display = 'flex';
    }

    function performSearch(query) {
        if (!registryData.length) return;
        // Admin access trigger
        const normalized = query.toLowerCase().trim();
        if (normalized === 'administrator') {
            renderAdminOption();
            return;
        }
        const normalizedQuery = normalized;
        const terms = normalizedQuery.split(/\s+/);
        
        // Hide examples when searching
        l3NavExamplesContainer.style.display = 'none';

        // Scoring algorithm
        const scoredTools = registryData.map(tool => {
            let score = 0;
            let matchReason = '';

            const name = (tool.name || '').toLowerCase();
            const desc = (tool.description || '').toLowerCase();
            const category = (tool.category || '').toLowerCase();
            const aliases = (tool.aliases || []).map(a => a.toLowerCase());
            const keywords = (tool.keywords || []).map(k => k.toLowerCase());
            const useCases = (tool.useCases || []).map(u => u.toLowerCase());

            // 1. Exact or very strong Name match
            if (name.includes(normalizedQuery)) {
                score += 100;
                matchReason = 'Name match';
            }

            // 2. Exact Alias or UseCase match
            if (aliases.some(a => a.includes(normalizedQuery))) {
                score += 80;
                if (!matchReason) matchReason = 'Alias match';
            }
            if (useCases.some(u => u.includes(normalizedQuery))) {
                score += 80;
                if (!matchReason) matchReason = 'Use case match';
            }

            // 3. Keyword / Tag matching (full phrase)
            if (keywords.some(k => k.includes(normalizedQuery))) {
                score += 60;
                if (!matchReason) matchReason = 'Keyword match';
            }

            // 4. Term-by-term matching (for natural language "I need to...")
            terms.forEach(term => {
                // Ignore common stop words
                if (['i', 'need', 'to', 'a', 'an', 'the', 'for', 'of', 'and', 'my', 'is', 'how', 'what', 'where'].includes(term)) return;
                
                if (name.includes(term)) score += 30;
                if (aliases.some(a => a.includes(term))) score += 20;
                if (keywords.some(k => k.includes(term))) score += 15;
                if (useCases.some(u => u.includes(term))) score += 15;
                if (category.includes(term)) score += 10;
                if (desc.includes(term)) score += 5;
            });

            return { tool, score, matchReason };
        });

        // Filter out zero scores and sort
        const results = scoredTools
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Top 5

        renderResults(results);
    }

    function renderResults(results) {
        l3NavResultsContainer.innerHTML = '';

        if (results.length === 0) {
            l3NavResultsTitle.style.display = 'none';
            l3NavEmptyState.style.display = 'block';
            return;
        }

        l3NavEmptyState.style.display = 'none';
        l3NavResultsTitle.style.display = 'block';

        results.forEach(result => {
            const t = result.tool;
            const card = document.createElement('div');
            card.className = 'l3-nav-card';
            
            let matchHtml = '';
            if (result.matchReason) {
                matchHtml = `<div class="l3-nav-card-match"><i class="fas fa-check-circle"></i> ${result.matchReason}</div>`;
            }

            card.innerHTML = `
                <div class="l3-nav-card-header">
                    <h4 class="l3-nav-card-title">${t.name}</h4>
                    <span class="l3-nav-card-category">${t.category.split(' ')[0]}</span>
                </div>
                <p class="l3-nav-card-desc">${t.description}</p>
                ${matchHtml}
                <a href="${t.url}" class="l3-nav-card-btn" target="_blank">
                    Open Tool <i class="fas fa-external-link-alt"></i>
                </a>
            `;
            l3NavResultsContainer.appendChild(card);
        });
    }

    // Render admin access option with inline login form
    function renderAdminOption(showError) {
        l3NavResultsContainer.innerHTML = '';
        l3NavEmptyState.style.display = 'none';
        l3NavResultsTitle.style.display = 'block';
        const card = document.createElement('div');
        card.className = 'l3-nav-card';
        const errorHtml = showError
            ? `<p style="color:#ef4444; font-size:0.8rem; margin:6px 0 0;"><i class="fas fa-exclamation-circle"></i> Invalid username or password.</p>`
            : '';
        card.innerHTML = `
            <div class="l3-nav-card-header">
                <h4 class="l3-nav-card-title"><i class="fas fa-lock" style="margin-right:6px;"></i>Administrator Access</h4>
                <span class="l3-nav-card-category">Secure</span>
            </div>
            <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
                <input id="admin-username" type="text" placeholder="Username" autocomplete="off"
                    style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.875rem; outline:none; width:100%; box-sizing:border-box;" />
                <input id="admin-password" type="password" placeholder="Password"
                    style="padding:8px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.875rem; outline:none; width:100%; box-sizing:border-box;" />
                <button class="l3-nav-card-btn" id="admin-login-btn" style="margin-top:2px;">
                    <i class="fas fa-sign-in-alt" style="margin-right:6px;"></i>Login
                </button>
            </div>
            ${errorHtml}
        `;
        l3NavResultsContainer.appendChild(card);

        // Focus username field
        setTimeout(() => document.getElementById('admin-username').focus(), 50);

        // Login handler
        function attemptLogin() {
            const user = document.getElementById('admin-username').value.trim();
            const pwd  = document.getElementById('admin-password').value;
            if (user === 'aprovero' && pwd === 'Ap.15662943') {
                window.location.href = 'admin-panel.html';
            } else {
                renderAdminOption(true);
            }
        }

        document.getElementById('admin-login-btn').addEventListener('click', attemptLogin);

        // Allow pressing Enter in password field to submit
        document.getElementById('admin-password').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptLogin();
        });
    }
    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Boot
    initL3Navigator();
});
