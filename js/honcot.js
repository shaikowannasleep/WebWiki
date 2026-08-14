/**
 * Honcot Module - Douluo MMO Wiki (Soul Bone Viewer Page)
 * Manages rendering the Soul Bone Cards Grid, Search Input, and Slot Filter.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const honcotGrid = document.getElementById('honcotGrid');
  const searchInput = document.getElementById('honcotSearchInput');
  const slotFilterBtns = document.querySelectorAll('#honcotSlotFilterGroup [data-slot]');
  const honcotCount = document.getElementById('honcotCount');

  if (!honcotGrid) return; // Exit if not on honcot page

  let honcotList = await DataLayer.getHoncotList();
  let currentSlotFilter = 'all';
  let currentSearchQuery = '';

  /**
   * Render Soul Bone Cards into grid
   */
  function renderHoncotGrid(list) {
    if (!list || list.length === 0) {
      honcotGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🦴</div>
          <h3>Không tìm thấy Hồn Cốt phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa hoặc vị trí khác!</p>
        </div>
      `;
      if (honcotCount) honcotCount.textContent = '0 Hồn Cốt';
      return;
    }

    if (honcotCount) honcotCount.textContent = `${list.length} Hồn Cốt`;

    honcotGrid.innerHTML = list.map(item => {
      const nameDisplay = i18n.translateConcept(item.nameVi || item.name);
      
      const slotMap = {
        'head': 'Xương Đầu',
        'body': 'Xương Thân',
        'left_arm': 'Tay Trái',
        'right_arm': 'Tay Phải',
        'left_leg': 'Chân Trái',
        'right_leg': 'Chân Phải',
        'all': 'Đa Vị Trí'
      };
      const slotDisplay = slotMap[item.slot] || item.slot;

      let effectsHtml = '';
      if (item.effects && item.effects.length > 0) {
        effectsHtml = `<div class="effects-list">` + item.effects.map((eff, idx) => {
          const starVal = eff.star ? eff.star : (idx + 1);
          return `
            <div class="effect-item" style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.6rem 0; border-bottom:1px dotted rgba(255,255,255,0.08);">
              <div style="display:flex; flex-direction:column; gap:0.25rem; min-width:85px; flex-shrink:0;">
                <div class="effect-year" style="color:var(--accent-cyan); font-weight:800; font-size:0.9rem;">${eff.year}</div>
                <div class="hc-star-badge" style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.35); padding:0.1rem 0.4rem; border-radius:12px; font-size:0.75rem; color:#fef08a; font-weight:800; width:fit-content;">
                  <img src="assets/icons/star_gold.svg" style="width:13px; height:13px; filter:drop-shadow(0 0 3px rgba(245,158,11,0.5));" alt="star">
                  ${starVal}★
                </div>
              </div>
              <div class="effect-desc" style="color:#e2e8f0; font-size:0.88rem; line-height:1.55; flex:1;">${i18n.translateConcept(eff.desc)}</div>
            </div>
          `;
        }).join('') + `</div>`;
      } else {
        effectsHtml = `<div style="color:var(--text-muted); font-size:0.85rem; padding: 0.5rem 0;">Không có hiệu ứng vạn năm</div>`;
      }

      const iconPath = item.icon || 'assets/icons/honcot_head.png';

      return `
        <div class="honcot-card">
          <div class="honcot-header">
            <div class="honcot-icon-box">
              <img src="${iconPath}" alt="${nameDisplay}" loading="lazy" onerror="this.src='assets/icons/honcot_head.png'">
            </div>
            <div class="honcot-title-block">
              <div class="honcot-name-vi">${nameDisplay}</div>
              <div style="margin-top: 0.3rem;">
                <span class="honcot-slot-tag">${slotDisplay}</span>
                <span class="honcot-wusoul-tag">Hệ: ${item.wusoulType || 'Tất Cả'}</span>
              </div>
            </div>
          </div>

          <div class="honcot-stats">
            <div class="section-title">✨ Cường Hóa & Thuộc Tính Cơ Bản</div>
            ${i18n.translateConcept(item.enhanceStats || 'Không có mô tả')}
          </div>

          <div class="honcot-stats" style="border-color: rgba(6,182,212,0.3);">
            <div class="section-title" style="color: var(--accent-cyan);">🔥 Hiệu Ứng Vạn Năm</div>
            ${effectsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Filter and search logic
   */
  function filterAndRender() {
    let filtered = honcotList;

    if (currentSlotFilter !== 'all') {
      filtered = filtered.filter(h => h.slot === currentSlotFilter);
    }

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(h => {
        const nameMatch = (h.nameVi && h.nameVi.toLowerCase().includes(q)) || (h.name && h.name.toLowerCase().includes(q));
        const statsMatch = h.enhanceStats && h.enhanceStats.toLowerCase().includes(q);
        const effMatch = h.effects && h.effects.some(eff => eff.desc && eff.desc.toLowerCase().includes(q));
        return nameMatch || statsMatch || effMatch;
      });
    }

    renderHoncotGrid(filtered);
  }

  // --- Event Listeners ---

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      filterAndRender();
    });
  }

  if (slotFilterBtns) {
    slotFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        slotFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSlotFilter = btn.getAttribute('data-slot');
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
