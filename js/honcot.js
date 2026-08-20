/**
 * Honcot Module - Douluo MMO Wiki (Compact Grid & Interactive Detail Modal)
 * Hỗ trợ:
 * - Xem toàn bộ kỹ năng ngay từ bên ngoài card
 * - Chiều cao các thẻ đồng đều theo item dài nhất (Grid stretch & Flex 1)
 * - Ẩn các mốc chi tiết ở ngoài thẻ, hiển thị cột 5 mốc niên đại
 * - Bấm vào thẻ để mở Popup xem chi tiết các mốc niên đại (1v -> 10v)
 * - Bấm ra ngoài vùng Popup hoặc nhấn ESC để đóng
 */

document.addEventListener('DOMContentLoaded', async () => {
  const honcotGrid = document.getElementById('honcotGrid');
  const searchInput = document.getElementById('honcotSearchInput');
  const slotFilterBtns = document.querySelectorAll('#honcotSlotFilterGroup [data-slot]');
  const honcotCount = document.getElementById('honcotCount');

  if (!honcotGrid) return;

  let honcotList = await DataLayer.getHoncotList();
  let currentSlotFilter = 'all';
  let currentSearchQuery = '';

  const slotMap = {
    'head': '👑 Xương Đầu',
    'body': '🛡️ Xương Thân',
    'left_arm': '🦾 Tay Trái',
    'right_arm': '🦾 Tay Phải',
    'left_leg': '🦵 Chân Trái',
    'right_leg': '🦵 Chân Phải',
    'all': 'Đa Vị Trí'
  };

  /**
   * Helper: Lọc chuỗi text sạch bỏ tag html thừa
   */
  function cleanSkillText(html) {
    if (!html) return '';
    let text = html;
    // Bỏ các thẻ div, span thừa
    text = text.replace(/<span style="color:#f59e0b;font-weight:bold;">Kỹ năng Hồn Cốt\s*\([^)]*\):?<\/span>/gi, '');
    text = text.replace(/Kỹ năng Hồn Cốt\s*\([^)]*\):?/gi, '');
    return text.trim();
  }

  /**
   * Render Soul Bone Cards into Grid (Đồng đều chiều cao & hiển thị full kỹ năng)
   */
  function renderHoncotGrid(list) {
    if (!list || list.length === 0) {
      honcotGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🦴</div>
          <h3 style="color:#fff; font-size:1.2rem;">Không tìm thấy Hồn Cốt phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa hoặc vị trí khác!</p>
        </div>
      `;
      if (honcotCount) honcotCount.textContent = '0 Hồn Cốt';
      return;
    }

    if (honcotCount) honcotCount.textContent = `${list.length} Hồn Cốt`;

    honcotGrid.className = 'honcot-compact-grid';
    honcotGrid.innerHTML = list.map(item => {
      const nameDisplay = i18n.translateConcept(item.nameVi || item.name);
      const slotDisplay = slotMap[item.slot] || item.slot;
      const iconPath = item.icon || 'assets/icons/honcot_head.png';

      const fullSkillHtml = cleanSkillText(item.enhanceStats);
      const effectsCount = (item.effects || []).length || 5;

      return `
        <div class="honcot-compact-card" data-id="${item.id}" onclick="window.openHoncotDetailModal('${item.id}')">
          <div>
            <div class="hc-card-header">
              <div class="hc-avatar-circle">
                <img src="${iconPath}" alt="${nameDisplay}" loading="lazy" onerror="this.src='assets/icons/honcot_head.png'">
              </div>
              <div class="hc-title-area">
                <div class="hc-name-text">${nameDisplay}</div>
                <span class="hc-slot-badge">${slotDisplay}</span>
              </div>
            </div>

            <!-- Khung kỹ năng hiển thị đầy đủ, không bị cắt dấu ... -->
            <div class="hc-skill-full-box">
              <div class="hc-skill-tag-header">
                <span>⚡ KỸ NĂNG HỒN CỐT (2000 NĂM)</span>
              </div>
              <div class="hc-skill-text-content">
                ${i18n.translateConcept(fullSkillHtml || 'Kích hoạt hiệu ứng Hồn Cốt tăng cường thuộc tính và sát thương.')}
              </div>
            </div>
          </div>

          <!-- Footer gọn gàng với chỉ báo 5 mốc niên đại và nút xem chi tiết -->
          <div class="hc-card-footer">
            <span class="hc-milestone-indicator">✦ ${effectsCount} Mốc Niên Đại (1v ➔ 10v)</span>
            <span class="hc-btn-expand">🔍 Xem Mốc Niên Đại ➔</span>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Modal Chi Tiết Hồn Cốt (Hiển thị đầy đủ kỹ năng & toàn bộ 5 mốc niên đại 1v - 10v)
   */
  window.openHoncotDetailModal = function(id) {
    const item = honcotList.find(h => h.id === id);
    if (!item) return;

    let modalBackdrop = document.getElementById('honcotDetailModal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'honcotDetailModal';
      modalBackdrop.className = 'global-modal-backdrop';
      document.body.appendChild(modalBackdrop);
    }

    const nameDisplay = i18n.translateConcept(item.nameVi || item.name);
    const nameOrigin = item.name ? item.name : '';
    const slotDisplay = slotMap[item.slot] || item.slot;
    const iconPath = item.icon || 'assets/icons/honcot_head.png';

    // Effects detailed list
    let effectsHtml = '';
    if (item.effects && item.effects.length > 0) {
      effectsHtml = item.effects.map((eff, idx) => {
        const starVal = eff.star ? eff.star : (idx + 2);
        return `
          <div style="display:flex; align-items:flex-start; gap:0.85rem; padding:0.75rem 0; border-bottom:1px dashed rgba(255,255,255,0.09);">
            <div style="display:flex; flex-direction:column; gap:0.25rem; min-width:95px; flex-shrink:0;">
              <div style="color:var(--accent-cyan); font-weight:800; font-size:0.92rem;">${eff.year}</div>
              <div style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.35); padding:0.12rem 0.45rem; border-radius:12px; font-size:0.75rem; color:#fef08a; font-weight:800; width:fit-content;">
                ⭐ ${starVal}★ Kích Hoạt
              </div>
            </div>
            <div style="color:#e2e8f0; font-size:0.9rem; line-height:1.6; flex:1;">
              ${i18n.translateConcept(eff.desc)}
            </div>
          </div>
        `;
      }).join('');
    } else {
      effectsHtml = '<div style="color:var(--text-muted); padding:0.5rem 0;">Chưa có thông tin mốc niên đại</div>';
    }

    modalBackdrop.innerHTML = `
      <div class="global-modal-content" onclick="event.stopPropagation();">
        <button class="global-modal-close" onclick="window.closeHoncotDetailModal()">✕</button>
        
        <!-- Header -->
        <div style="padding:1.5rem 1.5rem 1rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; gap:1.25rem; align-items:center;">
          <div class="hc-avatar-circle" style="width:76px; height:76px; border-width:3px;">
            <img src="${iconPath}" alt="${nameDisplay}">
          </div>
          <div style="flex:1;">
            <div style="font-size:0.8rem; color:var(--accent-gold); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">${nameOrigin}</div>
            <h2 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin:0.2rem 0 0.4rem;">${nameDisplay}</h2>
            <span class="hc-slot-badge" style="font-size:0.78rem; padding:0.2rem 0.65rem;">${slotDisplay}</span>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
          
          <!-- Kỹ Năng Hồn Cốt Gốc -->
          <div style="background:rgba(9,14,23,0.7); border:1px solid rgba(251,191,36,0.25); border-radius:10px; padding:1rem 1.25rem;">
            <div style="font-size:0.82rem; font-weight:800; color:var(--accent-gold); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
              <span>⚡ KỸ NĂNG HỒN CỐT (2000 NĂM GỐC)</span>
            </div>
            <div style="font-size:0.92rem; line-height:1.65; color:#f1f5f9;">
              ${i18n.translateConcept(item.enhanceStats || 'Kích hoạt hiệu ứng Hồn Cốt.')}
            </div>
          </div>

          <!-- Mốc Niên Đại (1v -> 10v) -->
          <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(6,182,212,0.25); border-radius:10px; padding:1rem 1.25rem;">
            <div style="font-size:0.82rem; font-weight:800; color:var(--accent-cyan); margin-bottom:0.5rem; display:flex; align-items:center; justify-content:space-between;">
              <span>🔥 ĐỘT PHÁ MỐC NIÊN ĐẠI (1 VẠN ➔ 10 VẠN NĂM)</span>
              <span style="font-size:0.75rem; color:#94a3b8;">5 Cấp Sao</span>
            </div>
            <div style="display:flex; flex-direction:column;">
              ${effectsHtml}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding:0.9rem 1.5rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25);">
          <span style="font-size:0.75rem; color:#64748b;">Nhấn ESC hoặc click ra ngoài để đóng</span>
          <div style="display:flex; gap:0.5rem;">
            <a href="honcot-builder.html" class="btn-tool" style="font-size:0.78rem; text-decoration:none; background:rgba(6,182,212,0.15); border-color:var(--accent-cyan); color:#a5f3fc;">⚡ Thử Trong Setup Builder</a>
            <button class="btn-tool btn-primary" onclick="window.closeHoncotDetailModal()" style="font-size:0.78rem; padding:0.35rem 0.85rem;">Đóng</button>
          </div>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Click outside backdrop to close
    modalBackdrop.onclick = function(e) {
      if (e.target === modalBackdrop) {
        window.closeHoncotDetailModal();
      }
    };
  };

  window.closeHoncotDetailModal = function() {
    const modalBackdrop = document.getElementById('honcotDetailModal');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
  };

  // Global ESC Key Listener to Close Modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeHoncotDetailModal();
      if (window.closeHonhachDetailModal) window.closeHonhachDetailModal();
    }
  });

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
      btn.addEventListener('click', () => {
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
