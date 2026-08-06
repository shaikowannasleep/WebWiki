/**
 * App Module - Douluo MMO Wiki (Home Page Logic)
 * Manages rendering the Hero Grid, Search Input, and Multi-Criteria Filters.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const heroGrid = document.getElementById('heroGrid');
  const searchInput = document.getElementById('searchInput');
  const roleFilterBtns = document.querySelectorAll('.filter-pills [data-role]');
  const resultsCount = document.getElementById('resultsCount');

  if (!heroGrid) return; // Exit if not on home page

  let heroes = await DataLayer.getHeroesList();
  let currentRoleFilter = 'ALL';
  let currentSearchQuery = '';

  /**
   * Render Hero Cards into the grid container
   */
  function renderHeroes(list) {
    if (!list || list.length === 0) {
      heroGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>Không tìm thấy Hồn Sư phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa hoặc bộ lọc khác!</p>
        </div>
      `;
      if (resultsCount) resultsCount.textContent = '0 Hồn Sư';
      return;
    }

    if (resultsCount) resultsCount.textContent = `${list.length} Hồn Sư`;

    heroGrid.innerHTML = list.map(hero => `
      <div class="hero-card" onclick="window.location.href='hero.html?id=${hero.id}'" style="cursor: pointer;">
        <div class="hero-card-img-wrapper">
          <img src="${hero.avatar}" alt="${hero.name}" loading="lazy" onerror="this.src='assets/heroes/oscar/avatar.webp'">
          <div class="hero-card-overlay"></div>
          <span class="rarity-badge ${hero.rarity}">${hero.rarity}</span>
          <span class="role-badge" style="position: absolute; bottom: 0.75rem; left: 0.75rem;">❖ ${hero.role}</span>
        </div>
        <div class="hero-card-body" style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
          <h3 class="hero-card-title" style="font-family: var(--font-heading); font-size: 1.25rem; color: #fff; margin-bottom: 0.2rem;">${hero.name}</h3>
          <div class="hero-card-subtitle" style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 0.5rem;">${hero.title || 'Hồn Sư Đối Quyết'}</div>
          <p class="hero-card-desc" style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.5; margin-bottom: 1rem; flex: 1;">${hero.summary || 'Chi tiết kỹ năng & 2 nhánh Hồn Hoàn...'}</p>
          <div class="hero-tags" style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem;">
            ${(hero.tags || [hero.role, hero.rarity]).map(t => `<span class="hero-tag" style="font-size: 0.72rem; padding: 0.15rem 0.4rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); border-radius: 4px; color: var(--text-sub);">#${t}</span>`).join('')}
          </div>
          <div class="btn-view-detail" style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
            <span>Xem Chi Tiết Kỹ Năng</span>
            <span style="font-size: 1rem;">➔</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Filter logic
   */
  function filterAndRender() {
    let filtered = heroes.filter(hero => {
      // Role filter
      const matchesRole = (currentRoleFilter === 'ALL') || (hero.role === currentRoleFilter);
      
      // Search filter
      const query = currentSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        hero.name.toLowerCase().includes(query) ||
        hero.title.toLowerCase().includes(query) ||
        hero.wusoul.toLowerCase().includes(query) ||
        hero.role.toLowerCase().includes(query) ||
        hero.tags.some(t => t.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });

    renderHeroes(filtered);
  }

  // Event Listeners for Filters
  roleFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-role');
      filterAndRender();
    });
  });

  // Event Listener for Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      filterAndRender();
    });
  }

  // Initial render
  renderHeroes(heroes);
});
