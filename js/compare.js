/**
 * Compare Mode Module V6.0 - Douluo MMO Wiki
 * Enables side-by-side tactical comparisons for Heroes and Soul Cores (Honhach)
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabHonhach = document.getElementById('tabCompareHonhach');
  const tabHero = document.getElementById('tabCompareHero');
  const selectLeft = document.getElementById('compareSelectLeft');
  const selectRight = document.getElementById('compareSelectRight');
  const sideLeft = document.getElementById('compareSideLeft');
  const sideRight = document.getElementById('compareSideRight');
  const labelLeft = document.getElementById('labelLeftSelect');
  const labelRight = document.getElementById('labelRightSelect');

  if (!sideLeft || !sideRight) return;

  let currentMode = 'honhach'; // 'honhach' | 'hero'
  let [honhachList, heroesList] = await Promise.all([
    DataLayer.getHonhachList(),
    DataLayer.getHeroesList()
  ]);

  // Initial Setup
  initMode(currentMode);

  if (tabHonhach) {
    tabHonhach.addEventListener('click', () => {
      if (currentMode !== 'honhach') {
        currentMode = 'honhach';
        tabHonhach.classList.add('active');
        tabHero.classList.remove('active');
        initMode('honhach');
      }
    });
  }

  if (tabHero) {
    tabHero.addEventListener('click', () => {
      if (currentMode !== 'hero') {
        currentMode = 'hero';
        tabHero.classList.add('active');
        tabHonhach.classList.remove('active');
        initMode('hero');
      }
    });
  }

  if (selectLeft) selectLeft.addEventListener('change', renderComparison);
  if (selectRight) selectRight.addEventListener('change', renderComparison);

  function initMode(mode) {
    if (mode === 'honhach') {
      labelLeft.textContent = 'BỘ HỒN HẠCH THỨ 1 (TRÁI):';
      labelRight.textContent = 'BỘ HỒN HẠCH THỨ 2 (PHẢI):';
      
      const optionsHtml = honhachList.map(h => `<option value="${h.id}">🦴 ${h.nameVi || h.id} (${h.rarity || 'SSR'})</option>`).join('');
      selectLeft.innerHTML = optionsHtml;
      selectRight.innerHTML = optionsHtml;

      if (honhachList.length > 1) {
        selectLeft.selectedIndex = 0;
        selectRight.selectedIndex = 1;
      }
    } else {
      labelLeft.textContent = 'HỒN SƯ THỨ 1 (TRÁI):';
      labelRight.textContent = 'HỒN SƯ THỨ 2 (PHẢI):';

      const optionsHtml = heroesList.map(h => `<option value="${h.id}">👤 ${h.name} (${h.role || 'Hồn Sư'})</option>`).join('');
      selectLeft.innerHTML = optionsHtml;
      selectRight.innerHTML = optionsHtml;

      if (heroesList.length > 1) {
        selectLeft.selectedIndex = 0;
        selectRight.selectedIndex = 1;
      }
    }

    renderComparison();
  }

  async function renderComparison() {
    const idLeft = selectLeft.value;
    const idRight = selectRight.value;

    if (currentMode === 'honhach') {
      const core1 = DataLayer.getHonhachById(idLeft) || honhachList.find(h => h.id === idLeft);
      const core2 = DataLayer.getHonhachById(idRight) || honhachList.find(h => h.id === idRight);

      sideLeft.innerHTML = renderHonhachCard(core1, '#06B6D4');
      sideRight.innerHTML = renderHonhachCard(core2, '#FBBF24');
    } else {
      const hero1 = await DataLayer.getHeroById(idLeft);
      const hero2 = await DataLayer.getHeroById(idRight);

      sideLeft.innerHTML = renderHeroCard(hero1, '#06B6D4');
      sideRight.innerHTML = renderHeroCard(hero2, '#FBBF24');
    }
  }

  function renderHonhachCard(core, accentColor) {
    if (!core) return `<div style="text-align:center; color:var(--text-muted); padding:2rem;">Chưa có dữ liệu</div>`;

    const rolesList = core.roles || ['cuong_cong', 'man_cong'];
    const rolesText = rolesList.includes('phu_tro') || rolesList.includes('khong_che') ? 'Phụ Trợ / Khống Chế' : 'Cường Công / Mẫn Công';

    const starVals = (core.set4 && core.set4.stats) ? core.set4.stats : [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
    const curveSvg = window.CoreServices ? CoreServices.ScalingGraphRenderer.renderMiniCurve(starVals, { width: 320, height: 70, color: accentColor }) : '';

    return `
      <div style="display:flex; align-items:center; gap:1rem; border-bottom:1px solid var(--border-glass); padding-bottom:1rem;">
        <div style="width:64px; height:64px; background:rgba(255,255,255,0.05); border:1px solid ${accentColor}; border-radius:12px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
          <img src="${core.icon || 'assets/icons/star_gold.svg'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/icons/star_gold.svg'">
        </div>
        <div>
          <h2 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff; margin-bottom:0.25rem;">${core.nameVi || core.id}</h2>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <span class="rarity-badge ${core.rarity || 'SSR'}">${core.rarity || 'SSR'}</span>
            <span style="font-size:0.75rem; color:${accentColor}; font-weight:700;">❖ ${rolesText}</span>
          </div>
        </div>
      </div>

      <div class="compare-row-section">
        <div class="compare-row-title">⚡ HIỆU ỨNG BỘ 2 MÓN (SET 2):</div>
        <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); padding:0.6rem 0.8rem; border-radius:6px; font-weight:700; color:#a5f3fc; font-size:0.9rem;">
          ✨ ${core.set2 || 'Chưa thiết lập'}
        </div>
      </div>

      <div class="compare-row-section">
        <div class="compare-row-title">🔥 HIỆU ỨNG BỘ 4 MÓN (SET 4):</div>
        <p style="font-size:0.85rem; color:var(--text-sub); line-height:1.5; margin-bottom:0.75rem;">
          ${(core.set4 && core.set4.desc) ? core.set4.desc.replace(/\{stat\}/g, `<strong style="color:${accentColor};">[${starVals[0]}% ~ ${starVals[starVals.length - 1]}%]</strong>`) : 'Chưa có mô tả'}
        </p>

        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); margin-bottom:0.35rem;">ĐƯỜNG CONG TĂNG TIẾN (4★ - 24★):</div>
        <div style="background:rgba(11,17,32,0.6); padding:0.5rem; border-radius:8px; border:1px solid var(--border-glass);">
          ${curveSvg}
        </div>
      </div>

      ${core.set4 && core.set4.extra24 ? `
        <div class="compare-row-section" style="border-bottom:none;">
          <div class="compare-row-title" style="color:var(--accent-gold);">✨ ĐỘT PHÁ 24★ BONUS:</div>
          <div style="background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.3); padding:0.5rem 0.75rem; border-radius:6px; font-size:0.82rem; color:#fef08a;">
            ${core.set4.extra24}
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderHeroCard(hero, accentColor) {
    if (!hero) return `<div style="text-align:center; color:var(--text-muted); padding:2rem;">Chưa có dữ liệu</div>`;

    const branchCount = (hero.branches || []).length;
    let totalSkills = 0;
    (hero.branches || []).forEach(b => totalSkills += (b.skills || []).length);

    return `
      <div style="display:flex; align-items:center; gap:1rem; border-bottom:1px solid var(--border-glass); padding-bottom:1rem;">
        <div style="width:72px; height:72px; background:rgba(255,255,255,0.05); border:2px solid ${accentColor}; border-radius:50%; overflow:hidden;">
          <img src="${hero.avatar || 'assets/heroes/oscar/avatar.webp'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/heroes/oscar/avatar.webp'">
        </div>
        <div>
          <h2 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:0.2rem;">${hero.name}</h2>
          <div style="font-size:0.8rem; color:${accentColor}; font-weight:700; margin-bottom:0.35rem;">${hero.title || 'Hồn Sư'}</div>
          <div style="display:flex; gap:0.4rem;">
            <span class="rarity-badge ${hero.rarity || 'SSR'}">${hero.rarity || 'SSR'}</span>
            <span class="role-badge">❖ ${hero.role || 'Khống Chế'}</span>
          </div>
        </div>
      </div>

      <div class="compare-row-section">
        <div class="compare-row-title">🌿 VÕ HỒN & THÔNG SỐ:</div>
        <div style="font-size:0.88rem; color:#fff;">Võ Hồn: <strong>${hero.wusoul || 'Chưa rõ'}</strong></div>
        <div style="font-size:0.8rem; color:var(--text-sub); margin-top:0.3rem;">Số nhánh kỹ năng: <strong>${branchCount} Nhánh</strong> (${totalSkills} chiêu thức)</div>
      </div>

      <div class="compare-row-section">
        <div class="compare-row-title">📜 TIỂU SỬ NHÂN VẬT:</div>
        <p style="font-size:0.82rem; color:var(--text-sub); line-height:1.6;">
          ${hero.bio || 'Chưa cập nhật tiểu sử.'}
        </p>
      </div>

      <div class="compare-row-section" style="border-bottom:none;">
        <div class="compare-row-title">⚔️ DANH SÁCH NHÁNH KỸ NĂNG:</div>
        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          ${(hero.branches || []).map((b, i) => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); padding:0.45rem 0.65rem; border-radius:6px; font-size:0.8rem;">
              <strong style="color:${accentColor};">${b.branchName || `Nhánh ${i+1}`}</strong>: ${(b.skills || []).length} chiêu
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
});
