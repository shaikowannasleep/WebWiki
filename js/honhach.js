/**
 * Honhach Module V6.5 - Douluo MMO Wiki (HSR Relic Presentation)
 * 2-Piece / 4-Piece Cards, 6-Star Scaling Curve Graph, 24★ Breakthrough Tag,
 * and Compatible Character Avatar Thumbnails.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const honhachGrid = document.getElementById('honhachGrid');
  const searchInput = document.getElementById('honhachSearchInput');
  const roleFilterBtns = document.querySelectorAll('#honhachRoleFilterGroup [data-role]');
  const honhachCount = document.getElementById('honhachCount');

  if (!honhachGrid) return;

  const [honhachList, heroesList] = await Promise.all([
    DataLayer.getHonhachList(),
    DataLayer.getHeroesList()
  ]);

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

      const nameDisplay = i18n.translateConcept(item.nameVi);
      const descDisplay = i18n.translateConcept(item.description);

      // Find compatible heroes for this soul core
      const compatibleHeroes = heroesList.filter(h => {
        const role = (h.role || '').toLowerCase();
        if (rolesList.includes('cuong_cong') && (role.includes('cường công') || role.includes('cuong_cong'))) return true;
        if (rolesList.includes('man_cong') && (role.includes('mẫn công') || role.includes('man_cong'))) return true;
        if (rolesList.includes('phu_tro') && (role.includes('phụ trợ') || role.includes('phu_tro'))) return true;
        if (rolesList.includes('khong_che') && (role.includes('khống chế') || role.includes('khong_che'))) return true;
        if (rolesList.includes('phong_thu') && (role.includes('phòng thủ') || role.includes('ngự') || role.includes('phong_thu'))) return true;
        return false;
      }).slice(0, 4);

      // Render Set 2 món
      let set2Html = '';
      if (item.set2) {
        const rawSet2 = typeof item.set2 === 'string' ? item.set2 : 'Tỷ Lệ Bạo+5,0%';
        const set2Text = i18n.translateConcept(rawSet2);
        set2Html = `
          <div class="set-box" style="background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.25); border-radius:8px; padding:0.85rem 1rem; margin-top:0.75rem;">
            <div class="set-box-title" style="color:var(--accent-gold); font-size:0.8rem; font-weight:800; display:flex; justify-content:space-between; align-items:center;">
              <span>⚡ HIỆU ỨNG 2 MÓN (SET 2):</span>
              <span class="star-pill">2★ KÍCH HOẠT</span>
            </div>
            <div style="font-size:0.92rem; color:#fff; font-weight:700; margin-top:0.35rem;">
              ✨ ${set2Text}
            </div>
          </div>
        `;
      }

      // Render Set 4 món (HSR Relic Scaling Card)
      let set4Html = '';
      if (item.set4) {
        const starVals = item.set4.stats || [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
        const minVal = starVals[0];
        const maxVal = starVals[starVals.length - 1];

        const rawDesc = item.set4.desc || '';
        const templateDesc = i18n.translateConcept(rawDesc).replace(/\{stat\}/g, `<strong style="color:#fef08a;">[${minVal}% ~ ${maxVal}%]</strong>`);

        const curveSvgHtml = (window.CoreServices && starVals.length > 0) ? `
          <div class="scaling-chart-container" style="margin-top:0.6rem; background:rgba(0,0,0,0.4); border-radius:6px; padding:0.5rem;">
            <div class="scaling-chart-title" style="font-size:0.72rem; color:var(--accent-cyan);">📈 ĐƯỜNG CONG TĂNG TIẾN 6 MỐC SAO (4★ ➔ 24★)</div>
            ${CoreServices.ScalingGraphRenderer.renderMiniCurve(starVals, { width: 310, height: 60, color: '#06B6D4' })}
          </div>
        ` : '';

        const extra24Html = item.set4.extra24 ? `
          <div style="margin-top:0.6rem; background:linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.15)); border:1px solid var(--accent-gold); padding:0.5rem 0.75rem; border-radius:6px; font-size:0.8rem; color:#fef08a;">
            ✦ <strong>Đột Phá 24★:</strong> ${i18n.translateConcept(item.set4.extra24)}
          </div>
        ` : '';

        set4Html = `
          <div class="set-box" style="background:rgba(6,182,212,0.06); border:1px solid rgba(6,182,212,0.25); border-radius:8px; padding:0.85rem 1rem; margin-top:0.75rem;">
            <div class="set-box-title" style="color:var(--accent-cyan); font-size:0.8rem; font-weight:800; display:flex; justify-content:space-between; align-items:center;">
              <span>🔥 HIỆU ỨNG 4 MÓN (SET 4):</span>
              <span class="star-pill" style="background:rgba(6,182,212,0.2); color:#a5f3fc; border-color:var(--accent-cyan);">MỐC 4★ - 24★</span>
            </div>

            <div style="font-size:0.88rem; color:#fff; line-height:1.5; margin-top:0.35rem;">
              ${templateDesc}
            </div>

            ${curveSvgHtml}
            ${extra24Html}
          </div>
        `;
      }

      // Compatible Heroes Pill Box
      let heroesHtml = '';
      if (compatibleHeroes.length > 0) {
        heroesHtml = `
          <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px dashed rgba(255,255,255,0.1);">
            <span style="font-size:0.72rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; display:block; margin-bottom:0.4rem;">HỒN SƯ TƯƠNG THÍCH ĐỀ XUẤT:</span>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              ${compatibleHeroes.map(h => `
                <a href="hero.html?id=${h.id}" title="${h.name} (${h.role})" style="position:relative;">
                  <img src="${h.avatar || 'assets/heroes/default/avatar.webp'}" style="width:36px; height:36px; border-radius:50%; border:1.5px solid var(--accent-gold); object-fit:cover; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                </a>
              `).join('')}
            </div>
          </div>
        `;
      }

      return `
        <div class="honhach-card" style="background:var(--bg-card); backdrop-filter:blur(20px); border:1px solid var(--border-glass-bright); border-radius:var(--radius-lg); padding:1.5rem; display:flex; flex-direction:column; box-shadow:0 15px 40px rgba(0,0,0,0.5);">
          <div class="honhach-header" style="display:flex; gap:1rem; align-items:center; border-bottom:1px solid var(--border-glass); padding-bottom:0.85rem;">
            <div class="honhach-icon-box" style="width:58px; height:58px; background:rgba(6,182,212,0.15); border:1.5px solid var(--accent-cyan); border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
              <img src="${item.icon || 'assets/icons/star_gold.svg'}" onerror="this.src='assets/icons/star_gold.svg'" style="width:80%; height:80%; object-fit:contain;">
            </div>
            <div class="honhach-title-block" style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3 class="honhach-name-vi" style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff; margin:0;">${nameDisplay}</h3>
                <span class="rarity-badge ${item.rarity || 'SSR'}">${item.rarity || 'SSR'}</span>
              </div>
              <div style="margin-top:0.35rem;">
                <span class="role-badge-tag" style="font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:6px; background:rgba(59,130,246,0.2); border:1px solid var(--primary); color:#93c5fd; font-weight:700;">❖ ${rolesDisplay}</span>
              </div>
            </div>
          </div>
          
          <p style="font-size:0.88rem; color:var(--text-sub); line-height:1.5; margin-top:0.75rem;">${descDisplay}</p>
          ${set2Html}
          ${set4Html}
          ${heroesHtml}
        </div>
      `;
    }).join('');
  }

  function filterAndRender() {
    let filtered = honhachList.filter(item => {
      let matchesRole = true;
      const roles = item.roles || [];
      if (currentRoleFilter === 'attack') {
        matchesRole = roles.includes('cuong_cong') || roles.includes('man_cong');
      } else if (currentRoleFilter === 'support_def') {
        matchesRole = roles.includes('phu_tro') || roles.includes('khong_che') || roles.includes('phong_thu');
      }

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

  renderHonhachGrid(honhachList);
});
