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
      <div class="hero-card">
        <div class="hero-card-img-wrapper">
          <img src="${hero.avatar}" alt="${hero.name}" loading="lazy" onerror="this.src='assets/heroes/oscar/avatar.webp'">
          <div class="hero-card-overlay"></div>
          <span class="rarity-badge ${hero.rarity}">${hero.rarity}</span>
          <span class="role-badge">❖ ${hero.role}</span>
        </div>
        <div class="hero-card-body">
          <h3 class="hero-card-title">${hero.name}</h3>
          <div class="hero-card-subtitle">${hero.title}</div>
          <p class="hero-card-desc">${hero.summary}</p>
          <div class="hero-tags">
            ${hero.tags.map(t => `<span class="hero-tag">#${t}</span>`).join('')}
          </div>
          <a href="hero.html?id=${hero.id}" class="btn-view-detail">Xem Chi Tiết Kỹ Năng ➔</a>
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
