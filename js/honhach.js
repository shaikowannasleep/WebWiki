/**
 * Honhach Module V7.0 - Douluo MMO Wiki (Compact Card Grid & Interactive Detail Modal)
 * Hỗ trợ:
 * - Hiển thị cùng lúc nhiều Bộ Hồn Hạch dạng lưới gọn gàng
 * - Click vào mở Popup chi tiết (Modal 2-Piece / 4-Piece / Đường cong 6 sao / Đột phá 24★)
 * - Bấm ra ngoài vùng Popup hoặc nhấn ESC để đóng
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
   * Render Soul Core Compact Grid
   */
  function renderHonhachGrid(list) {
    if (!list || list.length === 0) {
      honhachGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🦴</div>
          <h3 style="color:#fff; font-size:1.2rem;">Không tìm thấy Bộ Hồn Hạch phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa hoặc hệ khác!</p>
        </div>
      `;
      if (honhachCount) honhachCount.textContent = '0 Bộ Hồn Hạch';
      return;
    }

    if (honhachCount) honhachCount.textContent = `${list.length} Bộ Hồn Hạch`;

    honhachGrid.className = 'honcot-compact-grid';
    honhachGrid.innerHTML = list.map(item => {
      const rolesList = item.roles || ['cuong_cong', 'man_cong'];
      let rolesDisplay = '⚔️ Cường Công / Mẫn Công';
      if (rolesList.includes('phu_tro') || rolesList.includes('khong_che') || rolesList.includes('phong_thu')) {
        rolesDisplay = '🛡️ Phụ Trợ / Khống Chế / Phòng Thủ';
      }

      const nameDisplay = i18n.translateConcept(item.nameVi);
      const descDisplay = i18n.translateConcept(item.description);

      // Set 2 snippet
      let set2Snippet = '';
      if (item.set2) {
        const rawSet2 = typeof item.set2 === 'string' ? item.set2 : 'Tỷ Lệ Bạo+5,0%';
        set2Snippet = i18n.translateConcept(rawSet2);
      }

      return `
        <div class="honcot-compact-card" style="border-color:rgba(6,182,212,0.25);" onclick="window.openHonhachDetailModal('${item.id}')">
          <div>
            <div class="hc-card-header">
              <div class="hc-avatar-circle" style="background:radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(15,23,42,0.8) 100%); border-color:var(--accent-cyan); box-shadow:0 0 15px rgba(6,182,212,0.3);">
                <img src="${item.icon || 'assets/icons/star_gold.svg'}" alt="${nameDisplay}" style="width:75%; height:75%; object-fit:contain;">
              </div>
              <div class="hc-title-area">
                <div class="hc-name-text">${nameDisplay}</div>
                <span class="hc-slot-badge" style="background:rgba(6,182,212,0.15); border-color:var(--accent-cyan); color:#a5f3fc;">${rolesDisplay}</span>
              </div>
            </div>

            <div class="hc-skill-preview" style="margin-top:0.75rem;">
              <span style="color:var(--accent-gold); font-weight:700;">[2 Món]:</span> ${set2Snippet || descDisplay}
            </div>
          </div>

          <div>
            <div class="hc-years-mini-row" style="margin-bottom:0.65rem;">
              <span class="hc-year-pill-mini">Set 2 Món</span>
              <span class="hc-year-pill-mini">Set 4 Món (4★ ➔ 24★)</span>
              ${item.set4 && item.set4.extra24 ? '<span class="hc-year-pill-mini" style="border-color:var(--accent-gold); color:#fef08a;">✦ Đột Phá 24★</span>' : ''}
            </div>
            <div class="hc-card-footer">
              <span style="font-size:0.72rem; color:var(--text-muted);">Bộ Hồn Hạch</span>
              <span class="hc-btn-expand" style="color:var(--accent-cyan);">🔍 Xem Hiệu Ứng ➔</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Modal Chi Tiết Bộ Hồn Hạch
   */
  window.openHonhachDetailModal = function(id) {
    const item = honhachList.find(h => h.id === id);
    if (!item) return;

    let modalBackdrop = document.getElementById('honhachDetailModal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'honhachDetailModal';
      modalBackdrop.className = 'global-modal-backdrop';
      document.body.appendChild(modalBackdrop);
    }

    const rolesList = item.roles || ['cuong_cong', 'man_cong'];
    let rolesDisplay = '⚔️ Cường Công / Mẫn Công';
    if (rolesList.includes('phu_tro') || rolesList.includes('khong_che') || rolesList.includes('phong_thu')) {
      rolesDisplay = '🛡️ Phụ Trợ / Khống Chế / Phòng Thủ';
    }

    const nameDisplay = i18n.translateConcept(item.nameVi);
    const descDisplay = i18n.translateConcept(item.description);

    // Set 2 Html
    let set2Html = '';
    if (item.set2) {
      const rawSet2 = typeof item.set2 === 'string' ? item.set2 : 'Tỷ Lệ Bạo+5,0%';
      set2Html = `
        <div style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.3); border-radius:10px; padding:1rem 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:0.82rem; font-weight:800; color:var(--accent-gold);">⚡ HIỆU ỨNG 2 MÓN (SET 2):</span>
            <span style="font-size:0.72rem; font-weight:800; background:rgba(251,191,36,0.2); border:1px solid var(--accent-gold); color:#fef08a; padding:0.1rem 0.4rem; border-radius:12px;">2★ KÍCH HOẠT</span>
          </div>
          <div style="font-size:0.95rem; color:#fff; font-weight:700;">
            ✨ ${i18n.translateConcept(rawSet2)}
          </div>
        </div>
      `;
    }

    // Set 4 Html
    let set4Html = '';
    if (item.set4) {
      const starVals = item.set4.stats || [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
      const minVal = starVals[0];
      const maxVal = starVals[starVals.length - 1];

      const rawDesc = item.set4.desc || '';
      const templateDesc = i18n.translateConcept(rawDesc).replace(/\{stat\}/g, `<strong style="color:#fef08a;">[${minVal}% ~ ${maxVal}%]</strong>`);

      const curveSvgHtml = (window.CoreServices && starVals.length > 0) ? `
        <div style="margin-top:0.75rem; background:rgba(0,0,0,0.4); border-radius:8px; padding:0.6rem 0.85rem;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--accent-cyan); margin-bottom:0.3rem;">📈 ĐƯỜNG CONG TĂNG TIẾN 6 MỐC SAO (4★ ➔ 24★)</div>
          ${CoreServices.ScalingGraphRenderer.renderMiniCurve(starVals, { width: 340, height: 60, color: '#06B6D4' })}
        </div>
      ` : '';

      const extra24Html = item.set4.extra24 ? `
        <div style="margin-top:0.75rem; background:linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.15)); border:1px solid var(--accent-gold); padding:0.6rem 0.85rem; border-radius:8px; font-size:0.85rem; color:#fef08a;">
          ✦ <strong>Đột Phá 24★:</strong> ${i18n.translateConcept(item.set4.extra24)}
        </div>
      ` : '';

      set4Html = `
        <div style="background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.3); border-radius:10px; padding:1rem 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:0.82rem; font-weight:800; color:var(--accent-cyan);">🔥 HIỆU ỨNG 4 MÓN (SET 4):</span>
            <span style="font-size:0.72rem; font-weight:800; background:rgba(6,182,212,0.2); border:1px solid var(--accent-cyan); color:#a5f3fc; padding:0.1rem 0.4rem; border-radius:12px;">MỐC 4★ ➔ 24★</span>
          </div>
          <div style="font-size:0.9rem; color:#fff; line-height:1.55;">
            ${templateDesc}
          </div>
          ${curveSvgHtml}
          ${extra24Html}
        </div>
      `;
    }

    // Find compatible heroes
    const compatibleHeroes = heroesList.filter(h => {
      const role = (h.role || '').toLowerCase();
      if (rolesList.includes('cuong_cong') && (role.includes('cường công') || role.includes('cuong_cong'))) return true;
      if (rolesList.includes('man_cong') && (role.includes('mẫn công') || role.includes('man_cong'))) return true;
      if (rolesList.includes('phu_tro') && (role.includes('phụ trợ') || role.includes('phu_tro'))) return true;
      if (rolesList.includes('khong_che') && (role.includes('khống chế') || role.includes('khong_che'))) return true;
      if (rolesList.includes('phong_thu') && (role.includes('phòng thủ') || role.includes('ngự') || role.includes('phong_thu'))) return true;
      return false;
    }).slice(0, 6);

    let heroesHtml = '';
    if (compatibleHeroes.length > 0) {
      heroesHtml = `
        <div style="padding-top:0.75rem; border-top:1px dashed rgba(255,255,255,0.1);">
          <span style="font-size:0.75rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; display:block; margin-bottom:0.5rem;">HỒN SƯ TƯƠNG THÍCH ĐỀ XUẤT:</span>
          <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
            ${compatibleHeroes.map(h => `
              <a href="hero.html?id=${h.id}" title="${h.name} (${h.role})" style="display:flex; align-items:center; gap:0.35rem; background:rgba(255,255,255,0.06); padding:0.25rem 0.5rem; border-radius:20px; text-decoration:none; border:1px solid rgba(255,255,255,0.1);">
                <img src="${h.avatar || 'assets/heroes/default/avatar.webp'}" style="width:28px; height:28px; border-radius:50%; border:1px solid var(--accent-gold); object-fit:cover;">
                <span style="font-size:0.78rem; color:#fff; font-weight:600;">${h.name}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    modalBackdrop.innerHTML = `
      <div class="global-modal-content" onclick="event.stopPropagation();">
        <button class="global-modal-close" onclick="window.closeHonhachDetailModal()">✕</button>
        
        <!-- Header -->
        <div style="padding:1.5rem 1.5rem 1rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:1.25rem; align-items:center;">
          <div class="hc-avatar-circle" style="width:72px; height:72px; border-color:var(--accent-cyan); background:radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(15,23,42,0.8) 100%);">
            <img src="${item.icon || 'assets/icons/star_gold.svg'}" style="width:80%; height:80%; object-fit:contain;">
          </div>
          <div style="flex:1;">
            <div style="font-size:0.8rem; color:var(--accent-gold); font-weight:700; text-transform:uppercase;">${item.name || ''}</div>
            <h2 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin:0.2rem 0 0.4rem;">${nameDisplay}</h2>
            <span class="hc-slot-badge" style="background:rgba(6,182,212,0.15); border-color:var(--accent-cyan); color:#a5f3fc;">${rolesDisplay}</span>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1.15rem;">
          <p style="font-size:0.9rem; color:var(--text-sub); margin:0; line-height:1.5;">${descDisplay}</p>
          ${set2Html}
          ${set4Html}
          ${heroesHtml}
        </div>

        <!-- Footer -->
        <div style="padding:0.9rem 1.5rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25);">
          <span style="font-size:0.75rem; color:#64748b;">Nhấn ESC hoặc click ra ngoài để đóng</span>
          <button class="btn-tool btn-primary" onclick="window.closeHonhachDetailModal()" style="font-size:0.78rem; padding:0.35rem 0.85rem;">Đóng</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Click outside backdrop to close
    modalBackdrop.onclick = function(e) {
      if (e.target === modalBackdrop) {
        window.closeHonhachDetailModal();
      }
    };
  };

  window.closeHonhachDetailModal = function() {
    const modalBackdrop = document.getElementById('honhachDetailModal');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
  };

  /**
   * Filter and search logic
   */
  function filterAndRender() {
    let filtered = honhachList;

    if (currentRoleFilter !== 'ALL') {
      filtered = filtered.filter(h => {
        const roles = h.roles || [];
        if (currentRoleFilter === 'attack') {
          return roles.includes('cuong_cong') || roles.includes('man_cong');
        }
        if (currentRoleFilter === 'support_def') {
          return roles.includes('phu_tro') || roles.includes('khong_che') || roles.includes('phong_thu');
        }
        return true;
      });
    }

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(h => {
        const nameMatch = (h.nameVi && h.nameVi.toLowerCase().includes(q)) || (h.name && h.name.toLowerCase().includes(q));
        const descMatch = h.description && h.description.toLowerCase().includes(q);
        const set4Match = h.set4 && h.set4.desc && h.set4.desc.toLowerCase().includes(q);
        return nameMatch || descMatch || set4Match;
      });
    }

    renderHonhachGrid(filtered);
  }

  // --- Event Listeners ---

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      filterAndRender();
    });
  }

  if (roleFilterBtns) {
    roleFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRoleFilter = btn.getAttribute('data-role');
        filterAndRender();
      });
    });
  }

  window.addEventListener('languageChanged', () => {
    filterAndRender();
  });

  // Initial Render
  filterAndRender();
});
