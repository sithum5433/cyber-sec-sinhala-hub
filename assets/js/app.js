/**
 * CYBER-SEC SINHALA & ENGLISH HUB
 * TryHackMe Knowledge Base & Pentesting Portal
 * Author: L.G Sithum Sanjana (Sithum404 / NoScope)
 */

const STATE = {
  modules: [],
  categories: [],
  walkthroughs: [],
  cheatsheets: [],
  report: null,
  mfaExploit: null,
  stats: null,
  newTopics: [],
  
  currentView: 'home',
  activeModuleId: null,
  activeWalkthroughId: null,
  activeCategory: 'all',
  activeDifficulty: 'all',
  searchQuery: '',
  langMode: localStorage.getItem('cyber_hub_lang') || 'dual', // 'dual', 'si', 'en'
  activeModuleTab: 'tasks', // 'tasks', 'defense', 'payloads', 'qa'
  
  bookmarks: new Set(JSON.parse(localStorage.getItem('cyber_hub_bookmarks') || '[]')),
  completed: new Set(JSON.parse(localStorage.getItem('cyber_hub_completed') || '[]'))
};

function icon(name, size = 16) {
  return `<i data-lucide="${name}" width="${size}" height="${size}" aria-hidden="true"></i>`;
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadData();
  handleRouting();
  window.addEventListener('hashchange', handleRouting);
});

// Load JSON datasets
async function loadData() {
  try {
    const [modsPart1, modsPart2, modsPart3, modsPart4, modsPart5, modsPart6, cats, walks, cheats, rep, mfa, sts, nextTopics] = await Promise.all([
      fetch('data/modules.public-1.json').then(r => r.json()),
      fetch('data/modules.public-2.json').then(r => r.json()),
      fetch('data/modules.public-3.json').then(r => r.json()),
      fetch('data/modules.public-4.json').then(r => r.json()),
      fetch('data/modules.public-5.json').then(r => r.json()),
      fetch('data/modules.public-6.json').then(r => r.json()),
      fetch('data/categories.json').then(r => r.json()),
      fetch('data/walkthroughs.json').then(r => r.json()),
      fetch('data/cheatsheets.json').then(r => r.json()),
      fetch('data/report.public.json').then(r => r.json()),
      fetch('data/mfa_exploit.json').then(r => r.json()),
      fetch('data/stats.json').then(r => r.json()),
      fetch('data/next_topics.json').then(r => r.ok ? r.json() : [])
    ]);

    STATE.newTopics = Array.isArray(nextTopics) ? nextTopics : [];
    STATE.modules = [...modsPart1, ...modsPart2, ...modsPart3, ...modsPart4, ...modsPart5, ...modsPart6, ...STATE.newTopics];
    STATE.categories = cats;
    STATE.walkthroughs = walks;
    STATE.cheatsheets = cheats;
    STATE.report = rep;
    STATE.mfaExploit = mfa;
    STATE.stats = sts;

    renderSidebarCategories();
    renderSidebarStats();
  } catch (err) {
    console.error('Error loading data:', err);
    showToast('Error loading database. Please check connection.', 'error');
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Global Search Input
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value.trim().toLowerCase();
      if (STATE.currentView !== 'home') {
        window.location.hash = '#/';
      } else {
        renderModulesGrid();
      }

      const focusSearch = () => {
        searchInput?.focus();
        searchInput?.select();
      };
      document.getElementById('focus-search-btn')?.addEventListener('click', focusSearch);
      document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          focusSearch();
        }
        if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
          event.preventDefault();
          focusSearch();
        }
      });

      const menuToggle = document.getElementById('mobile-menu-toggle');
      menuToggle?.addEventListener('click', () => {
        const expanded = document.body.classList.toggle('nav-open');
        menuToggle.setAttribute('aria-expanded', String(expanded));
      });
      document.querySelectorAll('.nav-link-btn').forEach(link => {
        link.addEventListener('click', () => {
          document.body.classList.remove('nav-open');
          menuToggle?.setAttribute('aria-expanded', 'false');
        });
      });
    });
  }

  // Language Mode Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.lang;
      setLanguageMode(mode);
    });
  });

  // Home Brand Click
  const brand = document.querySelector('.brand-section');
  if (brand) {
    brand.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }
}

// Set Language Mode
function setLanguageMode(mode) {
  STATE.langMode = mode;
  localStorage.setItem('cyber_hub_lang', mode);
  
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === mode);
  });

  if (STATE.currentView === 'module') {
    renderModuleDetail();
  } else {
    renderModulesGrid();
  }
}

// Hash Routing Handler
function handleRouting() {
  const hash = window.location.hash || '#/';
  
  // Close any active mobile menu
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (hash.startsWith('#/module/')) {
    const id = hash.replace('#/module/', '');
    STATE.currentView = 'module';
    STATE.activeModuleId = id;
    renderModuleDetail();
  } else if (hash.startsWith('#/walkthroughs') || hash.startsWith('#/walkthrough/')) {
    STATE.currentView = 'walkthroughs';
    const id = hash.startsWith('#/walkthrough/') ? hash.replace('#/walkthrough/', '') : null;
    STATE.activeWalkthroughId = id;
    renderWalkthroughsView();
  } else if (hash.startsWith('#/cheatsheets')) {
    STATE.currentView = 'cheatsheets';
    renderCheatsheetsView();
  } else if (hash.startsWith('#/report')) {
    STATE.currentView = 'report';
    renderReportView();
  } else if (hash.startsWith('#/mfa-exploit')) {
    STATE.currentView = 'mfa-exploit';
    renderMfaExploitView();
  } else {
    STATE.currentView = 'home';
    renderHomeView();
  }

  updateActiveNavLinks();
  refreshIcons();
}

function updateActiveNavLinks() {
  document.querySelectorAll('.nav-link-btn').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === window.location.hash);
  });
}

// Render Sidebar Stats
function renderSidebarStats() {
  if (!STATE.stats) return;
  const countModules = document.getElementById('stat-modules-count');
  const countTasks = document.getElementById('stat-tasks-count');
  const countCompleted = document.getElementById('stat-completed-count');

  if (countModules) countModules.textContent = STATE.modules.length;
  if (countTasks) countTasks.textContent = STATE.modules.reduce((total, module) => total + (module.tasks_count || module.tasks?.length || 0), 0);
  if (countCompleted) countCompleted.textContent = STATE.completed.size;
}

// Render Sidebar Categories
function renderSidebarCategories() {
  const container = document.getElementById('sidebar-categories');
  if (!container) return;

  let html = `
    <button class="category-item ${STATE.activeCategory === 'all' ? 'active' : ''}" onclick="setCategoryFilter('all')">
      <span><span class="cat-icon">${icon('layers')}</span> All Modules (සියල්ල)</span>
      <span class="cat-count">${STATE.modules.length}</span>
    </button>
  `;

  STATE.categories.forEach(cat => {
    const count = STATE.modules.filter(m => m.category === cat.id).length;
    const isActive = STATE.activeCategory === cat.id;
    html += `
      <button class="category-item ${isActive ? 'active' : ''}" onclick="setCategoryFilter('${cat.id}')">
        <span><span class="cat-icon">${icon(categoryIcon(cat.id))}</span> ${cat.name}</span>
        <span class="cat-count">${count}</span>
      </button>
    `;
  });

  container.innerHTML = html;
  refreshIcons();
}

function categoryIcon(category) {
  const icons = {
    'active-directory': 'network',
    'web-security': 'globe',
    'http-attacks': 'shuffle',
    'api-auth': 'key-round',
    'code-review': 'code-2',
    'linux-privesc': 'terminal',
    'network-shells': 'radar',
    'soc-defensive': 'activity',
    'red-team-emerging': 'bot',
    'machines-reports': 'trophy'
  };
  return icons[category] || 'folder-code';
}

function setCategoryFilter(catId) {
  STATE.activeCategory = catId;
  renderSidebarCategories();
  if (STATE.currentView !== 'home') {
    window.location.hash = '#/';
  } else {
    renderModulesGrid();
    refreshIcons();
  }
}

function setDifficultyFilter(diff) {
  STATE.activeDifficulty = diff;
  document.querySelectorAll('.filter-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.diff === diff);
  });
  renderModulesGrid();
}

// Render Home View
function renderHomeView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-tag">${icon('shield-check')} Sinhala & English Masterclass</div>
        <h2 class="hero-title">TryHackMe Pentesting <span>Knowledge Hub</span></h2>
        <p class="hero-desc">
          සම්පූර්ණ ප්‍රායෝගික විනිවිදීමේ පරීක්ෂණ (Penetration Testing) දැනුම් ගබඩාව. Active Directory, OWASP Top 10 Web Vulnerabilities, Linux Privilege Escalation, Metasploit, Request Smuggling සහ සත්‍ය Walkthroughs සිංහල සහ ඉංග්‍රීසි භාෂා දෙකෙන්ම ඉගෙන ගන්න.
        </p>
        <div class="hero-actions">
          <a href="#/cheatsheets" class="btn-primary">${icon('zap')} Quick Cheat Sheets</a>
          <a href="#/walkthroughs" class="btn-outline">${icon('trophy')} Machine Walkthroughs</a>
          <a href="#/report" class="btn-outline">${icon('clipboard-check')} Assessment Report</a>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Difficulty:</span>
        <button class="filter-pill ${STATE.activeDifficulty === 'all' ? 'active' : ''}" data-diff="all" onclick="setDifficultyFilter('all')">All</button>
        <button class="filter-pill ${STATE.activeDifficulty === 'Beginner' ? 'active' : ''}" data-diff="Beginner" onclick="setDifficultyFilter('Beginner')">Beginner</button>
        <button class="filter-pill ${STATE.activeDifficulty === 'Intermediate' ? 'active' : ''}" data-diff="Intermediate" onclick="setDifficultyFilter('Intermediate')">Intermediate</button>
        <button class="filter-pill ${STATE.activeDifficulty === 'Advanced' ? 'active' : ''}" data-diff="Advanced" onclick="setDifficultyFilter('Advanced')">Advanced</button>
      </div>
      <div class="results-count" id="results-count-text">Loading modules...</div>
    </div>

    <!-- Modules Grid -->
    <div class="modules-grid" id="modules-grid-container"></div>
  `;

  renderModulesGrid();
}

// Render Modules Grid
function renderModulesGrid() {
  const container = document.getElementById('modules-grid-container');
  const countText = document.getElementById('results-count-text');
  if (!container) return;

  // Filter modules
  let filtered = STATE.modules.filter(m => {
    // Category match
    if (STATE.activeCategory !== 'all' && m.category !== STATE.activeCategory) return false;
    // Difficulty match
    if (STATE.activeDifficulty !== 'all' && m.difficulty !== STATE.activeDifficulty) return false;
    // Search query match (in EN title, SI title, tags, mitre, tasks)
    if (STATE.searchQuery) {
      const q = STATE.searchQuery;
      const searchable = [
        m.title, m.title_si, m.mitre_attack, m.cwe,
        ...(m.tags || []), m.summary_si, m.summary_en,
        ...(m.tasks || []).flatMap(task => [task.task_title, task.sinhala_content, task.english_summary])
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  if (countText) {
    countText.textContent = `Showing ${filtered.length} of ${STATE.modules.length} modules`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 4rem 2rem; text-align: center; color: var(--text-muted); background: var(--bg-secondary); border-radius: 12px; border: 1px dashed var(--border-color);">
        <div class="empty-state-icon">${icon('search-x', 34)}</div>
        <h3 style="color:#fff; margin-bottom:0.5rem;">No matching modules found</h3>
        <p>Try refining your search query or switching filters.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(m => {
    const isBookmarked = STATE.bookmarks.has(m.id);
    const isCompleted = STATE.completed.has(m.id);
    const diffClass = m.difficulty.toLowerCase();
    
    // Choose title display based on language mode
    let titleHtml = '';
    if (STATE.langMode === 'si') {
      titleHtml = `<h3 class="module-title-en">${escapeHtml(m.title_si)}</h3><p class="module-title-si">${escapeHtml(m.title)}</p>`;
    } else if (STATE.langMode === 'en') {
      titleHtml = `<h3 class="module-title-en">${escapeHtml(m.title)}</h3>`;
    } else {
      titleHtml = `<h3 class="module-title-en">${escapeHtml(m.title)}</h3><p class="module-title-si">${escapeHtml(m.title_si)}</p>`;
    }

    // Snippet preview
    const descText = (STATE.langMode === 'en' && m.summary_en) ? m.summary_en : m.summary_si;

    html += `
      <div class="module-card ${isCompleted ? 'completed-card' : ''}" onclick="openModule('${m.id}')">
        <div>
          <div class="card-top">
            <div class="card-badges">
              <span class="badge badge-cat">${escapeHtml(m.category.replaceAll('-', ' '))}</span>
              <span class="badge badge-difficulty ${diffClass}">${escapeHtml(m.difficulty)}</span>
              ${m.curated ? '<span class="badge badge-curated">✦ Curated</span>' : ''}
              ${isCompleted ? `<span class="badge badge-done">${icon('check', 12)} Done</span>` : ''}
            </div>
            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark(event, '${m.id}')" title="Bookmark">
              ${isBookmarked ? icon('bookmark-check', 18) : icon('bookmark', 18)}
            </button>
          </div>

          ${titleHtml}

          <p class="module-desc">${escapeHtml(descText || 'Explore practical walkthrough, theory, payloads, and defense rules.')}</p>
        </div>

        <div class="card-footer">
          <div class="card-tasks-count">
            ${icon('list-check', 15)} ${m.tasks_count || m.tasks?.length || 0} Tasks
          </div>
          <div class="card-mitre">${escapeHtml(m.mitre_attack.split(' ')[0])}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  refreshIcons();
}

function openModule(moduleId) {
  window.location.hash = `#/module/${moduleId}`;
}

function toggleBookmark(event, moduleId) {
  event.stopPropagation();
  if (STATE.bookmarks.has(moduleId)) {
    STATE.bookmarks.delete(moduleId);
    showToast('Removed from bookmarks');
  } else {
    STATE.bookmarks.add(moduleId);
    showToast('Added to bookmarks ★');
  }
  localStorage.setItem('cyber_hub_bookmarks', JSON.stringify(Array.from(STATE.bookmarks)));
  renderModulesGrid();
}

function toggleCompleted(moduleId) {
  if (STATE.completed.has(moduleId)) {
    STATE.completed.delete(moduleId);
    showToast('Marked as in-progress');
  } else {
    STATE.completed.add(moduleId);
    showToast('Module marked as Completed! ✓');
  }
  localStorage.setItem('cyber_hub_completed', JSON.stringify(Array.from(STATE.completed)));
  renderSidebarStats();
  if (STATE.currentView === 'module') {
    renderModuleDetail();
  }
}

// Render Detailed Module View
function renderModuleDetail() {
  const container = document.getElementById('main-content');
  const module = STATE.modules.find(m => m.id === STATE.activeModuleId);

  if (!module) {
    container.innerHTML = `
      <div style="padding: 4rem; text-align: center;">
        <h2>Module Not Found</h2>
        <a href="#/" class="btn-primary" style="margin-top:1rem;">Back to Catalog</a>
      </div>
    `;
    return;
  }

  const isCompleted = STATE.completed.has(module.id);
  const isBookmarked = STATE.bookmarks.has(module.id);

  let html = `
    <div class="detail-view">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <a href="#/" class="detail-nav-back">← Back to Modules Catalog</a>
        <div style="display:flex; gap:0.75rem;">
          <button class="nav-link-btn" onclick="toggleCompleted('${module.id}')">
            ${isCompleted ? `${icon('check-circle')} Completed` : `${icon('circle-check')} Mark as Completed`}
          </button>
          <button class="nav-link-btn" onclick="toggleBookmark(event, '${module.id}')">
            ${isBookmarked ? `${icon('bookmark-check')} Bookmarked` : `${icon('bookmark')} Bookmark`}
          </button>
        </div>
      </div>

      <div class="detail-header">
        <div class="detail-header-top">
          <div class="card-badges">
            <span class="badge badge-cat">${escapeHtml(module.category)}</span>
            <span class="badge badge-difficulty ${module.difficulty.toLowerCase()}">${escapeHtml(module.difficulty)}</span>
            <span class="badge" style="background:#1e293b; color:#94a3b8;">${module.tasks_count} Tasks</span>
          </div>
        </div>

        <h1 class="detail-title-en">${escapeHtml(module.title)}</h1>
        <h2 class="detail-title-si">${escapeHtml(module.title_si)}</h2>

        <div class="meta-tags-row">
          <span class="meta-pill"><strong>MITRE ATT&CK:</strong> ${escapeHtml(module.mitre_attack)}</span>
          <span class="meta-pill"><strong>CWE:</strong> ${escapeHtml(module.cwe)}</span>
          ${module.tags.map(t => `<span class="meta-pill">#${escapeHtml(t)}</span>`).join('')}
        </div>
        ${module.tools_and_technology?.length ? `
          <div class="module-toolkit">
            <div class="toolkit-label">${icon('wrench', 14)} Tools & Technology</div>
            <div class="toolkit-list">${module.tools_and_technology.map(tool => `<span class="toolkit-chip">${escapeHtml(tool)}</span>`).join('')}</div>
          </div>
        ` : ''}
        ${module.accuracy_note ? `<div class="accuracy-note">${icon('badge-check', 15)} <span>${escapeHtml(module.accuracy_note)}</span></div>` : ''}
      </div>

      <!-- Detail Tabs Navigation -->
      <div class="module-tabs">
        <button class="tab-btn ${STATE.activeModuleTab === 'tasks' ? 'active' : ''}" onclick="setModuleTab('tasks')">
          ${icon('list-check')} All Tasks & Walkthrough (${module.tasks_count})
        </button>
        <button class="tab-btn ${STATE.activeModuleTab === 'defense' ? 'active' : ''}" onclick="setModuleTab('defense')">
          ${icon('shield-check')} Blue Team Defense & Hardening
        </button>
        <button class="tab-btn ${STATE.activeModuleTab === 'payloads' ? 'active' : ''}" onclick="setModuleTab('payloads')">
          ${icon('code-2')} Practical Code & Payloads
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="tab-content" id="module-tab-content">
  `;

  if (STATE.activeModuleTab === 'tasks') {
    html += renderModuleTasksTab(module);
  } else if (STATE.activeModuleTab === 'defense') {
    html += renderModuleDefenseTab(module);
  } else if (STATE.activeModuleTab === 'payloads') {
    html += renderModulePayloadsTab(module);
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
  refreshIcons();
}

function setModuleTab(tab) {
  STATE.activeModuleTab = tab;
  renderModuleDetail();
}

// Render Tasks Tab (supports Dual View, Sinhala Only, English Only)
function renderModuleTasksTab(module) {
  if (!module.tasks || module.tasks.length === 0) {
    return `<p style="color:var(--text-muted); padding:2rem;">No individual tasks parsed for this module.</p>`;
  }

  let html = '';

  module.tasks.forEach((task, idx) => {
    html += `
      <div class="task-box">
        <div class="task-header">
          <h3>
            <span class="task-number">${icon('square-terminal', 15)} Task ${task.task_num}:</span>
            ${escapeHtml(task.task_title)}
          </h3>
          <span style="font-size:0.8rem; color:var(--text-muted);">Section ${idx+1}/${module.tasks.length}</span>
        </div>

        <div class="task-body">
    `;

    // Render content based on langMode
    if (STATE.langMode === 'dual') {
      html += `
        <div class="dual-pane">
          <!-- Sinhala Column -->
          <div class="pane pane-si">
            <div class="pane-header">
              <span class="pane-title">${icon('book-open')} සිංහල පැහැදිලි කිරීම (Detailed Theory & Concept)</span>
            </div>
            <div class="rich-text">${formatRichText(task.sinhala_content)}</div>
          </div>

          <!-- English Column -->
          <div class="pane pane-en">
            <div class="pane-header">
              <span class="pane-title">${icon('file-text')} English Master Note (Cheat Sheet & Key Points)</span>
            </div>
            <div class="rich-text">${formatRichText(task.english_summary || 'Key technical takeaway summary provided in practical commands section.')}</div>
          </div>
        </div>
      `;
    } else if (STATE.langMode === 'si') {
      html += `
        <div class="pane pane-si">
          <div class="pane-header">
            <span class="pane-title">${icon('book-open')} සිංහල සම්පූර්ණ විස්තරය</span>
          </div>
          <div class="rich-text">${formatRichText(task.sinhala_content)}</div>
        </div>
      `;
    } else {
      html += `
        <div class="pane pane-en">
          <div class="pane-header">
            <span class="pane-title">${icon('file-text')} English Master Theory & Technical Summary</span>
          </div>
          <div class="rich-text">${formatRichText(task.english_summary || task.sinhala_content)}</div>
        </div>
      `;
    }

    // Practical Code Blocks
    if (task.code_examples && task.code_examples.length > 0) {
      html += `
        <div style="margin-top:1rem;">
          <h4 style="color:var(--accent-green); font-size:0.95rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
            ${icon('terminal')} Practical Commands & Payloads
          </h4>
      `;
      task.code_examples.forEach((code, cIdx) => {
        html += renderCodeBlock(code, `Snippet #${cIdx+1}`);
      });
      html += `</div>`;
    }

    // TryHackMe Questions & Answers
    if (task.qa && task.qa.length > 0) {
      html += `
        <div style="margin-top:1.25rem;">
          <h4 style="color:var(--accent-cyan); font-size:0.95rem; margin-bottom:0.75rem;">
            ${icon('circle-help')} TryHackMe Challenge Questions
          </h4>
      `;
      task.qa.forEach((qaItem, qIdx) => {
        html += `
          <div class="qa-card">
            <div class="qa-question">
              <span>Q${qIdx+1}:</span> ${escapeHtml(qaItem.question)}
            </div>
            <button class="qa-reveal-btn" onclick="toggleAnswer(this)">Show Answer (පිළිතුර බලන්න)</button>
            <div class="qa-answer">${escapeHtml(qaItem.answer)}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    html += `
        </div>
      </div>
    `;
  });

  return html;
}

// Render Blue Team Defense Tab
function renderModuleDefenseTab(module) {
  const d = module.blue_team_defense;
  if (!d) return `<p style="padding:2rem;">No defense profile configured.</p>`;

  return `
    <div class="defense-container">
      <div class="defense-grid">
        <div class="defense-card">
          <h3 style="color:var(--accent-cyan);">${icon('shield-check')} Remediation & Prevention (ආරක්ෂා වීම)</h3>
          <p class="rich-text" style="font-size:0.95rem;">${escapeHtml(d.remediation)}</p>
        </div>

        <div class="defense-card">
          <h3 style="color:var(--accent-green);">${icon('radar')} Threat Detection & SIEM Rules (හඳුනාගැනීම)</h3>
          <p class="rich-text" style="font-size:0.95rem;">${escapeHtml(d.detection)}</p>
        </div>
      </div>

      <div class="defense-card">
        <h3 style="color:var(--accent-yellow);">${icon('list-check')} Security Hardening Checklist (ආරක්ෂණ පිරික්සුම් ලැයිස්තුව)</h3>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.75rem;">
          ${d.checklist.map((item, idx) => `
            <label class="checklist-item">
              <input type="checkbox" id="check-${idx}">
              <span style="font-size:0.9rem; color:#fff;">${escapeHtml(item)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Render Payloads Tab
function renderModulePayloadsTab(module) {
  let allCodes = [];
  module.tasks.forEach(t => {
    if (t.code_examples) allCodes.push(...t.code_examples);
  });

  if (allCodes.length === 0) {
    return `<div style="padding:3rem; text-align:center; color:var(--text-muted);">No dedicated payloads found in this module.</div>`;
  }

  return `
    <div style="display:flex; flex-direction:column; gap:1.25rem;">
      <p style="color:var(--text-secondary); font-size:0.9rem;">
        Click the copy button on any code block or command to instantly copy it to your clipboard.
      </p>
      ${allCodes.map((c, i) => renderCodeBlock(c, `Payload / Command #${i+1}`)).join('')}
    </div>
  `;
}

// Render Code Block with 1-Click Copy
function renderCodeBlock(code, title) {
  const safeCode = escapeHtml(code);
  return `
    <div class="code-block-wrapper">
      <div class="code-header">
        <span class="code-lang">${escapeHtml(title || 'TERMINAL / SCRIPT')}</span>
        <button class="copy-btn" onclick="copyToClipboard(this, \`${escapeJsString(code)}\`)">
          ${icon('copy', 14)} Copy
        </button>
      </div>
      <pre class="code-content"><code>${safeCode}</code></pre>
    </div>
  `;
}

function toggleAnswer(btn) {
  const answerBox = btn.nextElementSibling;
  if (answerBox.classList.contains('show')) {
    answerBox.classList.remove('show');
    btn.textContent = 'Show Answer (පිළිතුර බලන්න)';
  } else {
    answerBox.classList.add('show');
    btn.textContent = 'Hide Answer';
  }
}

// Render Walkthroughs View
function renderWalkthroughsView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  let html = `
    <div class="detail-view">
      <div class="detail-header">
        <h1 class="detail-title-en">${icon('trophy')} TryHackMe Machine Walkthroughs</h1>
        <h2 class="detail-title-si">සම්පූර්ණ ප්‍රායෝගික Machines විසඳුම් (Step-by-Step)</h2>
        <p style="color:var(--text-secondary); font-size:0.95rem; margin-top:0.5rem;">
          Orion, Abducted, Nexus සහ What's Your Name සඳහා මුල සිට අගට ප්‍රායෝගික Nmap, Foothold, Exploitation, සහ Root Privilege Escalation පියවරෙන් පියවර සටහන.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:2rem;">
  `;

  STATE.walkthroughs.forEach(w => {
    html += `
      <div class="task-box">
        <div class="task-header" style="background:rgba(255,193,7,0.06); border-bottom:1px solid rgba(255,193,7,0.3);">
          <div>
            <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.25rem;">
              <span class="badge" style="background:#ffc107; color:#000; font-weight:700;">${escapeHtml(w.difficulty)}</span>
              <span class="badge" style="background:rgba(0,243,255,0.15); color:var(--accent-cyan);">${escapeHtml(w.os)}</span>
              <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(w.date)}</span>
            </div>
            <h3 style="font-size:1.3rem; color:#fff;">${escapeHtml(w.title)}</h3>
            <h4 style="font-size:0.95rem; color:var(--accent-yellow); font-weight:500;">${escapeHtml(w.title_si)}</h4>
          </div>
        </div>

        <div class="task-body">
          <p class="rich-text" style="background:var(--bg-card); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
            ${escapeHtml(w.synopsis)}
          </p>
          <p class="rich-text" style="color:var(--accent-cyan); font-size:0.9rem;">
            <strong>සිංහල සාරාංශය:</strong> ${escapeHtml(w.synopsis_si)}
          </p>

          ${w.cves.length > 0 ? `
            <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
              <span style="font-size:0.8rem; color:var(--text-muted);">CVEs:</span>
              ${w.cves.map(c => `<span class="badge" style="background:rgba(255,0,85,0.2); color:var(--accent-red); border:1px solid var(--accent-red);">${escapeHtml(c)}</span>`).join('')}
            </div>
          ` : ''}

          <h4 style="color:#fff; font-size:1.05rem; margin-top:1rem;">${icon('swords')} Exploitation Phases:</h4>
          ${w.phases.map(p => `
            <div class="walkthrough-phase">
              <div class="phase-title">${escapeHtml(p.phase)}</div>
              <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.75rem;">${escapeHtml(p.description)}</p>
              ${p.commands.map(cmd => renderCodeBlock(cmd, 'COMMAND')).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Render Cheatsheets View
function renderCheatsheetsView() {
  const container = document.getElementById('main-content');
  if (!container) return;

  let html = `
    <div class="detail-view">
      <div class="detail-header">
        <h1 class="detail-title-en">${icon('zap')} Interactive CyberSec Cheat Sheets</h1>
        <h2 class="detail-title-si">ක්ෂණික ප්‍රහාරක සහ ආරක්ෂණ විධාන සහ Payloads</h2>
        <p style="color:var(--text-secondary); font-size:0.95rem; margin-top:0.5rem;">
          Reverse Shells, Active Directory (Impacket, BloodHound), Linux Privilege Escalation, සහ Web Payloads සඳහා ක්ෂණික පිටපත් කිරීමේ (1-Click Copy) පහසුකම.
        </p>
      </div>

      <div style="display:flex; flex-direction:column; gap:2rem;">
  `;

  STATE.cheatsheets.forEach(cat => {
    html += `
      <div class="task-box">
        <div class="task-header" style="background:rgba(0,255,136,0.06); border-bottom:1px solid rgba(0,255,136,0.3);">
          <h3>
            <span style="color:var(--accent-green);">🔥 ${escapeHtml(cat.category)}</span>
            <span style="font-size:0.9rem; color:var(--text-secondary); font-weight:400;">(${escapeHtml(cat.category_si)})</span>
          </h3>
        </div>

        <div class="task-body">
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(400px, 1fr)); gap:1.25rem;">
            ${cat.items.map(item => `
              <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:8px; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; gap:0.75rem;">
                <div>
                  <h4 style="color:#fff; font-size:1rem; margin-bottom:0.35rem;">${escapeHtml(item.title)}</h4>
                  <p style="font-size:0.8rem; color:var(--text-secondary);">${escapeHtml(item.desc)}</p>
                </div>
                ${renderCodeBlock(item.cmd, item.title)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Render Pentest Report View
function renderReportView() {
  const container = document.getElementById('main-content');
  if (!container || !STATE.report) return;

  const r = STATE.report;

  let html = `
    <div class="detail-view">
      <div class="report-header-banner">
        <span class="badge" style="background:var(--accent-cyan); color:#001018; font-weight:700; margin-bottom:0.75rem; display:inline-block;">PUBLIC DEMONSTRATION</span>
        <h1 class="detail-title-en" style="color:#fff;">${escapeHtml(r.title)}</h1>
        <h2 class="detail-title-si" style="color:var(--accent-cyan); font-weight:600;">${escapeHtml(r.title_si)}</h2>
        <div style="display:flex; gap:1.5rem; margin-top:1rem; font-size:0.85rem; color:var(--text-secondary); flex-wrap:wrap;">
          <span><strong>Lead Auditor:</strong> ${escapeHtml(r.author)}</span>
          <span><strong>Client:</strong> ${escapeHtml(r.client)}</span>
          <span><strong>Standard:</strong> ${escapeHtml(r.methodology)}</span>
        </div>
      </div>

      <div class="defense-card">
        <h3 style="color:#fff;">Executive Summary (විධායක සාරාංශය)</h3>
        <p class="rich-text" style="font-size:0.95rem; margin-bottom:1rem;">${escapeHtml(r.executive_summary)}</p>
        <p class="rich-text" style="font-size:0.95rem; color:var(--accent-cyan);">${escapeHtml(r.executive_summary_si)}</p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
        <div class="stat-box" style="border-top:3px solid var(--accent-red);">
          <div class="stat-number" style="color:var(--accent-red);">${r.severity_summary.critical}</div>
          <div class="stat-label">Critical Findings</div>
        </div>
        <div class="stat-box" style="border-top:3px solid var(--accent-orange);">
          <div class="stat-number" style="color:var(--accent-orange);">${r.severity_summary.high}</div>
          <div class="stat-label">High Findings</div>
        </div>
        <div class="stat-box" style="border-top:3px solid var(--accent-yellow);">
          <div class="stat-number" style="color:var(--accent-yellow);">${r.severity_summary.medium}</div>
          <div class="stat-label">Medium Findings</div>
        </div>
        <div class="stat-box" style="border-top:3px solid var(--accent-green);">
          <div class="stat-number" style="color:var(--accent-green);">${r.severity_summary.low}</div>
          <div class="stat-label">Low Findings</div>
        </div>
      </div>

      <h3 style="color:#fff; font-size:1.25rem; margin-top:1rem;">Detailed Vulnerability Findings</h3>
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        ${r.findings.map(f => `
          <div class="report-finding-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <div>
                <span class="badge" style="background:rgba(255,0,85,0.2); color:var(--accent-red); font-weight:700;">${f.severity} (CVSS ${f.cvss})</span>
                <span class="badge" style="background:#1e293b; color:#94a3b8; margin-left:0.4rem;">${f.id}</span>
                <h4 style="color:#fff; font-size:1.1rem; margin-top:0.4rem;">${escapeHtml(f.title)}</h4>
              </div>
              <span class="meta-pill">${f.cwe}</span>
            </div>

            <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.75rem;">${escapeHtml(f.description)}</p>

            <div style="background:var(--bg-terminal); padding:0.85rem; border-radius:6px; font-size:0.85rem; margin-bottom:0.75rem;">
              <strong style="color:var(--accent-red);">Impact:</strong> ${escapeHtml(f.impact)}
            </div>

            <div style="background:rgba(0,255,136,0.05); border:1px solid rgba(0,255,136,0.2); padding:0.85rem; border-radius:6px; font-size:0.85rem;">
              <strong style="color:var(--accent-green);">Remediation:</strong> ${escapeHtml(f.remediation)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Render MFA Exploit Tool View
function renderMfaExploitView() {
  const container = document.getElementById('main-content');
  if (!container || !STATE.mfaExploit) return;

  const mfa = STATE.mfaExploit;

  let html = `
    <div class="detail-view">
      <div class="detail-header">
        <h1 class="detail-title-en">${icon('square-terminal')} ${escapeHtml(mfa.title)}</h1>
        <h2 class="detail-title-si">${escapeHtml(mfa.title_si)}</h2>
        <div class="meta-tags-row">
          <span class="meta-pill"><strong>File:</strong> ${escapeHtml(mfa.filename)}</span>
          <span class="meta-pill"><strong>Target:</strong> ${escapeHtml(mfa.target)}</span>
          <span class="meta-pill"><strong>Author:</strong> ${escapeHtml(mfa.author)}</span>
        </div>
      </div>

      <div class="defense-card">
        <h3 style="color:var(--accent-cyan);">Exploit Architecture & Logic</h3>
        <p class="rich-text" style="font-size:0.95rem; margin-bottom:1rem;">${escapeHtml(mfa.description)}</p>
        <p class="rich-text" style="font-size:0.95rem; color:var(--accent-green);">${escapeHtml(mfa.description_si)}</p>

        <h4 style="color:#fff; font-size:1rem; margin:1rem 0 0.5rem;">Key Attack Mechanisms:</h4>
        <ul style="margin-left:1.5rem; color:var(--text-secondary); font-size:0.9rem;">
          ${mfa.key_mechanisms.map(k => `<li>${escapeHtml(k)}</li>`).join('')}
        </ul>
      </div>

      <div>
        <h3 style="color:#fff; font-size:1.15rem; margin-bottom:0.75rem;">Exploit Python Source Code (mfaexploit.py)</h3>
        ${renderCodeBlock(mfa.python_code, 'PYTHON 3 EXPLOIT SCRIPT')}
      </div>

      <div class="defense-card">
        <h3 style="color:var(--accent-green);">Defensive Hardening (ආරක්ෂා කරගන්නේ කෙසේද)</h3>
        <ul style="margin-left:1.5rem; color:var(--text-secondary); font-size:0.9rem; line-height:1.8;">
          ${mfa.remediation.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Utility: Copy to Clipboard
function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    button.classList.add('copied');
    const origHtml = button.innerHTML;
    button.innerHTML = '<span>✓</span> Copied!';
    showToast('Copied to clipboard!');
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = origHtml;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Utility: Toast Notification
function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon(type === 'error' ? 'triangle-alert' : 'zap')} ${escapeHtml(message)}`;
  refreshIcons();
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Helper: Format Rich Text
function formatRichText(raw) {
  if (!raw) return '';
  let str = escapeHtml(raw);
  
  // Format bold
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>');
  
  // Format inline code
  str = str.replace(/`([^`]+)`/g, '<code style="background:rgba(0,243,255,0.1); color:var(--accent-cyan); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:0.85em;">$1</code>');
  
  // Format headings (e.g. 1. Authentication ...)
  str = str.replace(/^(\d+\.\s+[^\n]+)/gm, '<h4 style="color:var(--accent-cyan); margin-top:1rem; font-weight:700;">$1</h4>');

  return str;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
