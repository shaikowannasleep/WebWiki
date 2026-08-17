/**
 * Team Builder Controller V6.5 - Douluo MMO Wiki
 * 6-Slot Formation Management, Real-time Role Synergy Balance Calculation,
 * Team Soul Core Strategy Recommendation, and High-Definition Image Export.
 */

/* =========================================================================
   1. DATA STRUCTURES & APPLICATION STATE
   ========================================================================= */

/**
 * @typedef {Object} TeamSlot
 * @property {number} slotIndex - Vị trí từ 0 đến 5
 * @property {string} positionName - 'Tiền Đài' hoặc 'Hậu Đài'
 * @property {Object|null} hero - Dữ liệu Hồn Sư đang chọn
 */

/** @type {(Object|null)[]} Đội hình 6 vị trí */
let currentTeam = [null, null, null, null, null, null];

let allHeroes = [];
let allHonhach = [];
let activeSlotIndex = 0;

/* =========================================================================
   2. LIFECYCLE & INITIALIZATION
   ========================================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  [allHeroes, allHonhach] = await Promise.all([
    DataLayer.getHeroesList(),
    DataLayer.getHonhachList()
  ]);

  // Pre-populate with first available heroes if available
  if (allHeroes && allHeroes.length >= 1) {
    currentTeam[0] = allHeroes[0];
    if (allHeroes.length >= 2) currentTeam[1] = allHeroes[1];
  }

  renderFormationGrid();
  updateSynergyAnalysis();
});

/* =========================================================================
   3. FORMATION RENDERING ENGINE
   ========================================================================= */

/**
 * Vẽ 6 vị trí chiến đấu lên sân khấu
 */
function renderFormationGrid() {
  const container = document.getElementById('formationGrid');
  if (!container) return;

  const slotLabels = [
    'Tiền Đài · Trái (Front Left)',
    'Tiền Đài · Giữa (Front Mid)',
    'Tiền Đài · Phải (Front Right)',
    'Hậu Đài · Trái (Back Left)',
    'Hậu Đài · Giữa (Back Mid)',
    'Hậu Đài · Phải (Back Right)'
  ];

  container.innerHTML = currentTeam.map((hero, idx) => {
    if (!hero) {
      return `
        <div class="tb-slot-card" onclick="openHeroPicker(${idx})">
          <span class="tb-slot-position-badge">${slotLabels[idx]}</span>
          <div style="font-size:2.5rem; color:var(--text-muted); margin-bottom:0.5rem;">➕</div>
          <div style="font-size:0.85rem; font-weight:800; color:var(--accent-cyan);">THÊM HỒN SƯ</div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.25rem;">Nhấp để chọn</div>
        </div>
      `;
    }

    return `
      <div class="tb-slot-card filled">
        <span class="tb-slot-position-badge" style="color:var(--accent-gold);">${slotLabels[idx]}</span>
        <button class="tb-slot-remove-btn" onclick="removeHeroFromSlot(${idx}, event)" title="Gỡ Hồn Sư">✕</button>
        
        <div class="tb-avatar-circle" onclick="openHeroPicker(${idx})">
          <img src="${hero.avatar || 'assets/heroes/default/avatar.webp'}" alt="${hero.name}">
        </div>

        <div style="font-family:var(--font-heading); font-size:1.15rem; font-weight:900; color:#fff; margin-bottom:0.15rem;">
          ${hero.name}
        </div>

        <div style="display:flex; gap:0.35rem; align-items:center;">
          <span class="rarity-badge ${hero.rarity || 'SSR'}" style="position:static; padding:0.15rem 0.5rem; font-size:0.7rem;">${hero.rarity || 'SSR'}</span>
          <span class="role-badge" style="font-size:0.72rem;">❖ ${hero.role}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================================
   4. REAL-TIME SYNERGY CALCULATION
   Thuật toán phân tích cân bằng 5 hệ phái & đề xuất chiến thuật
   ========================================================================= */

function updateSynergyAnalysis() {
  const barsContainer = document.getElementById('synergyBarsContainer');
  const evalText = document.getElementById('synergyEvaluationText');
  const rankBadge = document.getElementById('teamRankBadge');
  const honhachContainer = document.getElementById('teamRecommendedHonhach');

  if (!barsContainer) return;

  const roleCounts = {
    'Cường Công': 0,
    'Mẫn Công': 0,
    'Khống Chế': 0,
    'Phòng Ngự': 0,
    'Phụ Trợ': 0
  };

  let totalHeroes = 0;

  currentTeam.forEach(h => {
    if (h && h.role) {
      totalHeroes++;
      if (h.role.includes('Cường Công')) roleCounts['Cường Công']++;
      else if (h.role.includes('Mẫn Công')) roleCounts['Mẫn Công']++;
      else if (h.role.includes('Khống Chế')) roleCounts['Khống Chế']++;
      else if (h.role.includes('Phòng Ngự') || h.role.includes('Ngự')) roleCounts['Phòng Ngự']++;
      else if (h.role.includes('Phụ Trợ')) roleCounts['Phụ Trợ']++;
      else roleCounts['Cường Công']++;
    }
  });

  const roleColors = {
    'Cường Công': '#ef4444',
    'Mẫn Công': '#f59e0b',
    'Khống Chế': '#a855f7',
    'Phòng Ngự': '#10b981',
    'Phụ Trợ': '#06b6d4'
  };

  const roleIcons = {
    'Cường Công': '⚔️',
    'Mẫn Công': '⚡',
    'Khống Chế': '🌿',
    'Phòng Ngự': '🛡️',
    'Phụ Trợ': '🧪'
  };

  // Render Bars
  barsContainer.innerHTML = Object.keys(roleCounts).map(role => {
    const count = roleCounts[role];
    const pct = Math.min(100, (count / 3) * 100);
    const color = roleColors[role];

    return `
      <div class="synergy-bar-item">
        <div class="synergy-bar-header">
          <span style="color:#fff;">${roleIcons[role]} ${role}</span>
          <span style="color:${color};">${count > 0 ? `${count} Tướng (${pct.toFixed(0)}%)` : 'Thiếu'}</span>
        </div>
        <div class="synergy-progress-track">
          <div class="synergy-progress-fill" style="width:${pct}%; background:${color}; box-shadow:0 0 10px ${color};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Tactical Evaluation
  let evaluation = '';
  let rank = 'HẠNG A';

  if (totalHeroes < 6) {
    evaluation = `Đội hình hiện mới có <strong>${totalHeroes}/6</strong> thành viên. Hãy bổ sung đủ 6 Hồn Sư để hoàn thiện chuỗi combo chiến thuật!`;
    rank = 'CHƯA ĐỦ ĐỘI';
  } else {
    const hasDPS = roleCounts['Cường Công'] > 0 || roleCounts['Mẫn Công'] > 0;
    const hasControl = roleCounts['Khống Chế'] > 0;
    const hasSupport = roleCounts['Phụ Trợ'] > 0;
    const hasTank = roleCounts['Phòng Ngự'] > 0;

    if (hasDPS && hasControl && hasSupport && hasTank) {
      evaluation = `🔥 <strong>Đội Hình Hoàn Hảo (Tam Giác Vàng):</strong> Có đầy đủ Sát Thương Chủ Lực, Khống Chế diện rộng, Hồi Năng Lượng liên tục và Khiên Bảo Hộ. Tỷ lệ thắng cực cao trong cả PvE và PvP!`;
      rank = 'HẠNG SSS';
    } else if (hasDPS && hasSupport) {
      evaluation = `⚡ <strong>Đội Hình Tốc Chiến Công Thủ:</strong> Khả năng dồn sát thương kết liễu cực nhanh nhờ Hồn Lực dồi dào, cần chú ý né tránh các hiệu ứng phong tỏa của đối thủ.`;
      rank = 'HẠNG SS';
    } else {
      evaluation = `⚠️ <strong>Đội Hình Lệch Hệ:</strong> Đang thiên lệch về sát thương hoặc hỗ trợ. Cần bổ sung thêm Khống Chế hoặc Phụ Trợ để bảo đảm xoay tua kỹ năng mượt mà.`;
      rank = 'HẠNG S';
    }
  }

  if (evalText) evalText.innerHTML = evaluation;
  if (rankBadge) rankBadge.textContent = rank;

  // Recommended Soul Cores
  if (honhachContainer) {
    const recommended = allHonhach.slice(0, 3);
    honhachContainer.innerHTML = recommended.map(core => `
      <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:8px; padding:0.75rem 1rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:800; color:#fff; font-size:0.95rem;">🦴 ${core.nameVi}</div>
          <div style="font-size:0.78rem; color:var(--accent-gold);">${core.set2 || 'Tăng sát thương đội hình'}</div>
        </div>
        <span class="rarity-badge ${core.rarity || 'SSR'}" style="position:static;">${core.rarity || 'SSR'}</span>
      </div>
    `).join('');
  }
}

/* =========================================================================
   5. MODALS & TEAM ACTIONS
   ========================================================================= */

function openHeroPicker(slotIdx) {
  activeSlotIndex = slotIdx;
  const listContainer = document.getElementById('heroPickerList');
  if (!listContainer) return;

  listContainer.innerHTML = allHeroes.map(h => `
    <div class="bone-list-item" onclick="selectHeroForSlot('${h.id}')">
      <img src="${h.avatar || 'assets/heroes/default/avatar.webp'}" class="bone-list-icon" style="border-radius:50%;" alt="${h.name}">
      <div style="flex:1;">
        <div style="font-weight:800; color:#fff; font-size:1rem;">${h.name}</div>
        <div style="font-size:0.75rem; color:var(--accent-cyan); font-weight:700;">❖ ${h.role} · ${h.rarity || 'SSR'}</div>
      </div>
    </div>
  `).join('');

  document.getElementById('heroPickerModal').classList.add('active');
}

function selectHeroForSlot(heroId) {
  const found = allHeroes.find(h => h.id === heroId);
  if (found) {
    currentTeam[activeSlotIndex] = found;
    renderFormationGrid();
    updateSynergyAnalysis();
  }
  closeModal('heroPickerModal');
}

function removeHeroFromSlot(slotIdx, event) {
  if (event) event.stopPropagation();
  currentTeam[slotIdx] = null;
  renderFormationGrid();
  updateSynergyAnalysis();
}

function clearTeam() {
  if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ đội hình?')) return;
  currentTeam = [null, null, null, null, null, null];
  renderFormationGrid();
  updateSynergyAnalysis();
}

function exportTeamImage() {
  const stage = document.getElementById('teamCaptureArea');
  if (!stage) return;

  html2canvas(stage, {
    backgroundColor: '#060913',
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Douluo_Team_Formation_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function closeModal(modalId, event) {
  if (event) event.stopPropagation();
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}
