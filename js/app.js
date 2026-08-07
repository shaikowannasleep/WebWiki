/**
 * App Module - Douluo MMO Wiki (Home Page Logic V3.1)
 * Manages rendering the Hero Grid, Search Input, Multi-Criteria Filters, Rarity Filter, Sorting, and i18n Language Switching.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const heroGrid = document.getElementById('heroGrid');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const roleFilterBtns = document.querySelectorAll('.filter-pills [data-role]');
  const rarityFilterBtns = document.querySelectorAll('.rarity-pills [data-rarity]');
  const sortSelect = document.getElementById('sortSelect');
  const resultsCount = document.getElementById('resultsCount');
  const statHeroCount = document.getElementById('statHeroCount');

  if (!heroGrid) return; // Exit if not on home page

  let heroes = await DataLayer.getHeroesList();
  let currentRoleFilter = 'ALL';
  let currentRarityFilter = 'ALL';
  let currentSearchQuery = '';
  let currentSort = 'default';

  function updatePageUI() {
    if (searchInput) searchInput.placeholder = i18n.t('search_placeholder');
    if (statHeroCount && heroes) {
      statHeroCount.textContent = `${heroes.length} ${i18n.t('nav_heroes')}`;
    }
  }

  /**
   * Render Hero Cards into the grid container
   */
  function renderHeroes(list) {
    if (!list || list.length === 0) {
      heroGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.7;">🔍</div>
          <h3 style="color: #fff; font-size: 1.25rem; margin-bottom: 0.5rem;">${i18n.t('no_results_title')}</h3>
          <p style="font-size: 0.9rem;">${i18n.t('no_results_desc')}</p>
        </div>
      `;
      if (resultsCount) resultsCount.textContent = `0 ${i18n.t('nav_heroes')}`;
      return;
    }

    if (resultsCount) resultsCount.textContent = `${list.length} ${i18n.t('nav_heroes')}`;

    heroGrid.innerHTML = list.map(hero => {
      const heroName = i18n.translateConcept(hero.name);
      const heroRole = i18n.translateConcept(hero.role);
      const heroTitle = hero.title ? i18n.translateConcept(hero.title) : (i18n.getLanguage() === 'en' ? 'Soul Master Showdown' : 'Hồn Sư Đối Quyết');

      return `
        <div class="hero-card ${hero.rarity || ''}" onclick="window.location.href='hero.html?id=${hero.id}'" style="cursor: pointer;">
          <div class="hero-card-img-wrapper">
            <img src="${hero.avatar}" alt="${heroName}" loading="lazy" onerror="this.src='assets/heroes/oscar/avatar.webp'">
            <div class="hero-card-overlay"></div>
            <span class="rarity-badge ${hero.rarity}">${hero.rarity}</span>
            <span class="role-badge" style="position: absolute; bottom: 0.75rem; left: 0.75rem;">❖ ${heroRole}</span>
          </div>
          <div class="hero-card-body" style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
            <h3 class="hero-card-title" style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 0.2rem;">${heroName}</h3>
            <div class="hero-card-subtitle" style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 0.5rem;">${heroTitle}</div>
            <p class="hero-card-desc" style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.5; margin-bottom: 1rem; flex: 1;">${hero.summary ? i18n.translateConcept(hero.summary) : (i18n.getLanguage() === 'en' ? 'Skill details & 2 Soul Ring Branches...' : 'Chi tiết kỹ năng & 2 nhánh Hồn Hoàn...')}</p>
            <div class="hero-tags" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem;">
              ${(hero.tags || [hero.role, hero.rarity]).map(t => `<span class="hero-tag" style="font-size: 0.72rem; padding: 0.15rem 0.4rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); border-radius: 4px; color: var(--text-sub);">#${i18n.translateConcept(t)}</span>`).join('')}
            </div>
            <div class="btn-view-detail" style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
              <span>${i18n.t('view_detail')}</span>
              <span style="font-size: 1rem; transition: transform 0.2s;">➔</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Filter and Sort logic
   */
  function filterAndRender() {
    let filtered = heroes.filter(hero => {
      // Role filter
      const matchesRole = (currentRoleFilter === 'ALL') || (hero.role === currentRoleFilter);

      // Rarity filter
      const matchesRarity = (currentRarityFilter === 'ALL') || (hero.rarity === currentRarityFilter);
      
      // Search filter
      const query = currentSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        hero.name.toLowerCase().includes(query) ||
        (hero.title && hero.title.toLowerCase().includes(query)) ||
        (hero.wusoul && hero.wusoul.toLowerCase().includes(query)) ||
        hero.role.toLowerCase().includes(query) ||
        (hero.tags && hero.tags.some(t => t.toLowerCase().includes(query)));

      return matchesRole && matchesRarity && matchesSearch;
    });

    // Sorting logic
    if (currentSort === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (currentSort === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (currentSort === 'rarity-desc') {
      const rarityRank = { 'SP': 4, 'SSR': 3, 'SR': 2, 'R': 1 };
      filtered.sort((a, b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
    }

    renderHeroes(filtered);
  }

  // Listen for language changes
  window.addEventListener('languageChanged', () => {
    updatePageUI();
    filterAndRender();
  });

  // Event Listeners for Role Filters
  roleFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-role');
      filterAndRender();
    });
  });

  // Event Listeners for Rarity Filters
  rarityFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rarityFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRarityFilter = btn.getAttribute('data-rarity');
      filterAndRender();
    });
  });

  // Event Listener for Sort Select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      filterAndRender();
    });
  }

  // Event Listener for Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearchQuery ? 'inline-block' : 'none';
      }
      filterAndRender();
    });
  }

  // Clear Search Button
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearchQuery = '';
      searchClearBtn.style.display = 'none';
      filterAndRender();
    });
  }

  // Initial render
  updatePageUI();
  renderHeroes(heroes);
});


