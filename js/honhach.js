/**
 * Honhach Module - Douluo MMO Wiki (Soul Core Viewer Page)
 * Manages rendering the Soul Core Cards Grid, Search Input, and 2-Role Group Filter.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const honhachGrid = document.getElementById('honhachGrid');
  const searchInput = document.getElementById('honhachSearchInput');
  const roleFilterBtns = document.querySelectorAll('#honhachRoleFilterGroup [data-role]');
  const honhachCount = document.getElementById('honhachCount');

  if (!honhachGrid) return; // Exit if not on honhach page

  let honhachList = await DataLayer.getHonhachList();
  let currentRoleFilter = 'ALL';
  let currentSearchQuery = '';

  /**
   * Render Soul Core Cards into grid
   */
  function renderHonhachGrid(list) {
    if (!list || list.length === 0) {
      honhachGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🦴</div>
          <h3>Không tìm thấy Bộ Hồn Hạch phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa hoặc hệ khác!</p>
        </div>
      `;
      if (honhachCount) honhachCount.textContent = '0 Bộ Hồn Hạch';
      return;
    }

    if (honhachCount) honhachCount.textContent = `${list.length} Bộ Hồn Hạch`;

    honhachGrid.innerHTML = list.map(item => {
      const rolesList = item.roles || ['cuong_cong', 'man_cong'];
      let rolesDisplay = 'Cường Công / Mẫn Công';
      if (rolesList.includes('phu_tro') || rolesList.includes('khong_che') || rolesList.includes('phong_thu')) {
        rolesDisplay = 'Phụ Trợ / Khống Chế / Phòng Thủ';
      }

      // Render Set 2 món (1 dòng duy nhất)
      let set2Html = '';
      if (item.set2) {
        const set2Text = typeof item.set2 === 'string' ? item.set2 : 'Tỷ Lệ Bạo+5,0%';
        set2Html = `
          <div class="set-box">
            <div class="set-box-title">
              <span>2件套 (Bộ 2 Món)</span>
              <span class="star-pill">2★</span>
            </div>
            <div style="font-size:0.9rem; color:#a5f3fc; font-weight:700; padding:0.4rem 0.6rem; background:rgba(6,182,212,0.05); border-radius:6px; margin-top:0.3rem;">
              ✨ ${set2Text}
            </div>
          </div>
        `;
      }

      // Render Set 4 món (Khung mô tả chung + mốc sao rút gọn)
      let set4Html = '';
      if (item.set4) {
        const starVals = item.set4.stats || [];
        const minVal = starVals.length > 0 ? starVals[0] : 7.5;
        const maxVal = starVals.length > 0 ? starVals[starVals.length - 1] : 15.0;
        const defaultStars = [4, 8, 12, 16, 20, 24];

        const templateDesc = (item.set4.desc || '').replace(/\{stat\}/g, `<strong style="color:#fef08a;">[${minVal}% ~ ${maxVal}%]</strong>`);

        const starPillsHtml = starVals.map((val, i) => `
          <span class="star-pill" style="background:rgba(245,158,11,0.15); border-color:var(--accent-gold); color:#fef08a; padding:0.15rem 0.4rem; font-size:0.75rem;">
            <strong>${defaultStars[i]}★</strong>: ${val}%
          </span>
        `).join(' ');

        const extra24Html = item.set4.extra24 ? `
          <div style="margin-top:0.5rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); padding:0.4rem 0.6rem; border-radius:6px; font-size:0.78rem; color:#fef08a;">
            ✨ <strong>Đột phá 24★:</strong> ${item.set4.extra24}
          </div>
        ` : '';

        set4Html = `
          <div class="set-box" style="border-color: rgba(245,158,11,0.3);">
            <div class="set-box-title" style="color:var(--accent-gold);">
              <span>4件套 (Bộ 4 Món)</span>
              <span class="star-pill" style="background:rgba(245,158,11,0.2); color:#fef08a;">Mốc 4 - 24★</span>
            </div>

            <div style="font-size:0.84rem; color:var(--text-sub); line-height:1.5; margin-bottom:0.6rem;">
              ${templateDesc}
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
              ${starPillsHtml}
            </div>

            ${extra24Html}
          </div>
        `;
      }

      return `
        <div class="honhach-card">
          <div class="honhach-header">
            <div class="honhach-icon-box">
              <img src="${item.icon || 'assets/icons/star_gold.svg'}" onerror="this.src='assets/icons/star_gold.svg'">
            </div>
            <div class="honhach-title-block">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="honhach-name-vi">${item.nameVi}</h3>
                <span class="rarity-badge ${item.rarity || 'SSR'}">${item.rarity || 'SSR'}</span>
              </div>
              <div style="margin-top:0.4rem;">
                <span class="role-badge-tag">❖ ${rolesDisplay}</span>
              </div>
            </div>
          </div>
          <p style="font-size:0.84rem; color:var(--text-sub); line-height:1.5;">${item.description || ''}</p>
          ${set2Html}
          ${set4Html}
        </div>
      `;
    }).join('');
  }

  /**
   * Filter logic for 2 role groups
   */
  function filterAndRender() {
    let filtered = honhachList.filter(item => {
      // Role filter (2 groups)
      let matchesRole = true;
      const roles = item.roles || [];
      if (currentRoleFilter === 'attack') {
        matchesRole = roles.includes('cuong_cong') || roles.includes('man_cong');
      } else if (currentRoleFilter === 'support_def') {
        matchesRole = roles.includes('phu_tro') || roles.includes('khong_che') || roles.includes('phong_thu');
      }

      // Search filter
      const query = currentSearchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        item.nameVi.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (typeof item.set2 === 'string' && item.set2.toLowerCase().includes(query)) ||
        (item.set4 && item.set4.desc && item.set4.desc.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });

    renderHonhachGrid(filtered);
  }

  // Event Listeners
  roleFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoleFilter = btn.getAttribute('data-role');
      filterAndRender();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      filterAndRender();
    });
  }

  // Initial render
  renderHonhachGrid(honhachList);
});
