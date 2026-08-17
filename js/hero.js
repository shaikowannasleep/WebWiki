/**
 * Hero Detail Module V6.6 - Douluo MMO Wiki
 * 3-Panel Radial HUD Architecture:
 * - Panel 1: Hero Profile & Core Combat Summary
 * - Panel 2: Holographic 5-Node Radial Wheel HUD + Branch 1/2 Switcher + Skill Selector
 * - Panel 3: Combat Summary Card + In-Game Skill Description + Soul Ring Progression Tiers
 */

document.addEventListener('DOMContentLoaded', async () => {
  const panelHeroProfile = document.getElementById('panelHeroProfile');
  const radialMenuWrapper = document.getElementById('radialMenuWrapper');
  const branchToggleContainer = document.getElementById('branchToggleContainer');
  const skillItemsContainer = document.getElementById('skillItemsContainer');
  const panelSkillDisplay = document.getElementById('panelSkillDisplay');

  if (!panelHeroProfile) return;

  const urlParams = new URLSearchParams(window.location.search);
  let heroId = urlParams.get('id');

  let [heroData, keywordsDict, websiteConfig, heroesList] = await Promise.all([
    heroId ? DataLayer.getHeroById(heroId) : null,
    DataLayer.getKeywords(),
    DataLayer.getWebsiteConfig(),
    DataLayer.getHeroesList()
  ]);

  // Fallback to first hero if ID is missing or invalid
  if (!heroData && heroesList && heroesList.length > 0) {
    heroId = heroesList[0].id;
    heroData = await DataLayer.getHeroById(heroId);
  }

  if (!heroData) {
    panelHeroProfile.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-sub);">
        <h2>⚠️ Không tìm thấy Hồn Sư</h2>
        <a href="index.html" class="btn-studio btn-studio-primary" style="margin-top:1rem; display:inline-block;">Quay về Trang Chủ</a>
      </div>
    `;
    return;
  }

  document.title = `${heroData.name} (${heroData.wusoul || heroData.role}) — Douluo MMO Wiki`;

  let activeGroupId = 'honky'; // 'honky' | 'passive' | 'tienco' | 'bithuat' | 'normal'
  let activeBranchIdx = 0;
  let activeSkillIdx = 0;

  // 1. Initial Render
  renderHeroProfile(heroData, keywordsDict);
  setupRadialMenuListeners();
  renderPanel2And3();

  /* =========================================================================
     1. PANEL 1: HERO PROFILE & QUICK STATS
     ========================================================================= */

  function renderHeroProfile(hero, keywords) {
    const rarityClass = hero.rarity === 'SP' ? 'rarity-sp' : (hero.rarity === 'SSR' ? 'rarity-ssr' : '');
    
    // Extract core mechanics from skills
    const usedKeywords = new Set();
    if (Array.isArray(hero.branches)) {
      hero.branches.forEach(b => {
        if (Array.isArray(b.skills)) {
          b.skills.forEach(sk => {
            if (sk.description) {
              const matches = sk.description.match(/\{([a-zA-Z0-9_\u00C0-\u1EF9]+)\}/g);
              if (matches) {
                matches.forEach(m => usedKeywords.add(m.replace(/[{}]/g, '')));
              }
            }
          });
        }
      });
    }

    let kwPillsHtml = '';
    if (usedKeywords.size > 0) {
      kwPillsHtml = Array.from(usedKeywords).slice(0, 4).map(kKey => {
        const kw = keywords[kKey];
        return `<span class="combat-kw-tag" data-keyword="${kKey}"><span>${kw ? kw.icon : '✨'}</span> ${kw ? kw.name : kKey}</span>`;
      }).join(' ');
    }

    panelHeroProfile.innerHTML = `
      <div class="panel-hero-avatar ${rarityClass}">
        <img src="${hero.avatar || 'assets/heroes/default/avatar.webp'}" alt="${hero.name}" onerror="this.src='assets/heroes/oscar/avatar.webp'">
      </div>
      
      <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
        <span class="rarity-badge ${hero.rarity || 'SSR'}">${hero.rarity || 'SSR'}</span>
        <span class="role-badge">❖ ${hero.role}</span>
      </div>

      <h1 class="panel-hero-name">${hero.name}</h1>
      <div class="panel-hero-title">${hero.title || ''}</div>
      <div style="font-size:0.88rem; color:var(--text-sub); margin-bottom:0.75rem;">
        Võ Hồn: <strong style="color:#fff;">${hero.wusoul || 'Chưa cập nhật'}</strong>
      </div>

      <p class="panel-hero-bio" style="line-height:1.6; font-size:0.88rem; margin-bottom:1rem;">${hero.bio || ''}</p>

      ${kwPillsHtml ? `
        <div style="border-top:1px solid var(--border-glass); padding-top:0.75rem;">
          <div style="font-size:0.72rem; color:var(--text-muted); font-weight:800; text-transform:uppercase; margin-bottom:0.4rem;">CƠ CHẾ CỐT LÕI:</div>
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem;">
            ${kwPillsHtml}
          </div>
        </div>
      ` : ''}
    `;
  }

  /* =========================================================================
     2. PANEL 2: 5-NODE RADIAL MENU & BRANCH SWITCHER
     ========================================================================= */

  function setupRadialMenuListeners() {
    const radialNodes = radialMenuWrapper ? radialMenuWrapper.querySelectorAll('.radial-node') : [];
    const mobileChips = document.querySelectorAll('#mobileSkillGroupBar .mobile-group-chip');

    function syncGroup(groupId) {
      activeGroupId = groupId;
      activeSkillIdx = 0; // Reset skill selection to first in group

      radialNodes.forEach(n => n.classList.toggle('active', n.getAttribute('data-group-id') === groupId));
      mobileChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-group-id') === groupId));

      renderPanel2And3();
    }

    radialNodes.forEach(node => {
      node.addEventListener('click', () => {
        const gid = node.getAttribute('data-group-id');
        if (gid) syncGroup(gid);
      });
    });

    mobileChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const gid = chip.getAttribute('data-group-id');
        if (gid) syncGroup(gid);
      });
    });
  }

  function renderPanel2And3() {
    const branches = heroData.branches || [];

    // 1. Render Branch Switcher Buttons
    branchToggleContainer.innerHTML = '';
    if (branches.length > 0) {
      branches.forEach((b, idx) => {
        const btn = document.createElement('button');
        btn.className = `branch-toggle-btn ${idx === activeBranchIdx ? 'active' : ''}`;
        btn.textContent = b.branchName || `Nhánh ${idx + 1}`;
        btn.onclick = () => {
          activeBranchIdx = idx;
          activeSkillIdx = 0;
          renderPanel2And3();
        };
        branchToggleContainer.appendChild(btn);
      });
    }

    const currentBranch = branches[activeBranchIdx] || branches[0] || { skills: [] };
    const allSkillsInBranch = currentBranch.skills || [];

    // 2. Filter skills matching activeGroupId
    const matchingSkills = allSkillsInBranch.filter(sk => {
      if (!sk.groupId && activeGroupId === 'honky') return true; // Default fallback
      return sk.groupId === activeGroupId;
    });

    const displayList = matchingSkills.length > 0 ? matchingSkills : allSkillsInBranch;

    // 3. Render Skill List underneath Radial
    skillItemsContainer.innerHTML = '';
    if (displayList.length === 0) {
      skillItemsContainer.innerHTML = `
        <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem; background:rgba(0,0,0,0.2); border-radius:8px;">
          Chưa có chiêu thức trong nhóm này.
        </div>
      `;
    } else {
      displayList.forEach((sk, idx) => {
        const item = document.createElement('div');
        item.className = `skill-list-item ${idx === activeSkillIdx ? 'active' : ''}`;
        item.innerHTML = `
          <div class="skill-item-icon">${sk.icon && sk.icon.includes('/') ? `<img src="${sk.icon}" style="width:100%; height:100%; border-radius:8px; object-fit:cover;">` : (sk.icon || '🔥')}</div>
          <div style="flex:1; min-width:0;">
            <div class="skill-item-name">${sk.name || 'Chưa đặt tên'}</div>
            <div class="skill-item-meta">${sk.type || 'Kỹ Năng'} · ${sk.cost || '0 Hồn Lực'}</div>
          </div>
        `;
        item.onclick = () => {
          activeSkillIdx = idx;
          renderPanel2And3();
        };
        skillItemsContainer.appendChild(item);
      });
    }

    // 4. Render Panel 3 Display
    const selectedSkill = displayList[activeSkillIdx] || displayList[0];
    renderSkillDisplay(selectedSkill, currentBranch);
  }

  /* =========================================================================
     3. PANEL 3: COMBAT SUMMARY & SOUL RING PROGRESSION DISPLAY
     ========================================================================= */

  function renderSkillDisplay(sk, branch) {
    if (!panelSkillDisplay) return;

    if (!sk) {
      panelSkillDisplay.innerHTML = `
        <div style="text-align:center; padding:4rem 1rem; color:var(--text-muted);">
          <div style="font-size:3rem; margin-bottom:1rem;">⚔️</div>
          <h3>Chọn một chiêu thức để xem chi tiết</h3>
        </div>
      `;
      return;
    }

    // Keyword markup replacement
    let formattedDesc = sk.description || 'Chưa có mô tả';
    formattedDesc = formattedDesc.replace(/\{([a-zA-Z0-9_\u00C0-\u1EF9]+)\}/g, (match, p1) => {
      const kw = keywordsDict[p1];
      const kwName = kw ? kw.name : p1;
      const kwIcon = kw ? kw.icon : '✨';
      return `<span class="skill-keyword" data-keyword="${p1}"><span>${kwIcon}</span> ${kwName}</span>`;
    });

    // Soul Ring Milestones
    let ringsHtml = '';
    if (Array.isArray(sk.ringUpgrades) && sk.ringUpgrades.length > 0) {
      ringsHtml = `
        <div class="ring-upgrades-section">
          <div class="ring-upgrades-title">⭕ MỐC ĐỘT PHÁ NIÊN HẠN HỒN HOÀN:</div>
          <div class="ring-upgrades-list">
            ${sk.ringUpgrades.map(ring => {
              const yearClass = (ring.year || '').includes('100,000') || (ring.year || '').includes('100k') ? 'year-100k' :
                                ((ring.year || '').includes('50,000') || (ring.year || '').includes('50k') || (ring.year || '').includes('25,000') ? 'year-50k' :
                                ((ring.year || '').includes('10,000') || (ring.year || '').includes('10k') ? 'year-10k' : 'year-1k'));
              
              let reqHtml = '';
              if (Array.isArray(ring.requirements)) {
                reqHtml = ring.requirements.map(req => `
                  <span style="font-size:0.75rem; color:var(--accent-gold); margin-left:auto; display:inline-flex; align-items:center; gap:0.25rem;">
                    ★ ${req.count || 1} Sao (${req.color === 'red' ? 'Đỏ' : 'Vàng'})
                  </span>
                `).join('');
              }

              let bonusText = ring.bonus || '';
              bonusText = bonusText.replace(/\{([a-zA-Z0-9_\u00C0-\u1EF9]+)\}/g, (match, p1) => {
                const kw = keywordsDict[p1];
                return `<span class="skill-keyword" data-keyword="${p1}"><span>${kw ? kw.icon : '✨'}</span> ${kw ? kw.name : p1}</span>`;
              });

              return `
                <div class="ring-upgrade-card">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="ring-year-tag ${yearClass}">● ${ring.year}</span>
                    ${reqHtml}
                  </div>
                  <div style="font-size:0.88rem; color:#fff; line-height:1.5; margin-top:0.25rem;">${bonusText}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    panelSkillDisplay.innerHTML = `
      <!-- Combat Summary HUD Card -->
      <div class="combat-summary-card">
        <div class="combat-summary-header">
          <div class="combat-summary-title">
            <span>⚡ THÔNG SỐ TÁC CHIẾN</span>
          </div>
          <span style="font-size:0.75rem; font-weight:800; color:var(--accent-gold);">${sk.type || 'Chủ Động'}</span>
        </div>

        <div class="combat-stats-grid">
          <div class="combat-stat-cell">
            <span class="combat-stat-label">TIÊU HAO</span>
            <span class="combat-stat-value" style="color:var(--accent-cyan);">${sk.cost || '0 Hồn Lực'}</span>
          </div>
          <div class="combat-stat-cell">
            <span class="combat-stat-label">HỒI CHIÊU (CD)</span>
            <span class="combat-stat-value" style="color:var(--accent-gold);">${sk.cooldown || '0 lượt'}</span>
          </div>
          <div class="combat-stat-cell">
            <span class="combat-stat-label">MỤC TIÊU</span>
            <span class="combat-stat-value">${sk.target || 'Toàn Thể'}</span>
          </div>
          <div class="combat-stat-cell">
            <span class="combat-stat-label">PHÂN LOẠI</span>
            <span class="combat-stat-value" style="color:#fca5a5;">${sk.groupId ? sk.groupId.toUpperCase() : 'HONKY'}</span>
          </div>
        </div>
      </div>

      <!-- Skill Header Title & Large Icon -->
      <div class="skill-detail-header">
        <div class="skill-detail-large-icon">${sk.icon && sk.icon.includes('/') ? `<img src="${sk.icon}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">` : (sk.icon || '🔥')}</div>
        <div class="skill-detail-title-box">
          <h3>${sk.name || 'Chưa đặt tên'}</h3>
          <div class="skill-stats-pills">
            <span class="skill-pill">❖ Nhánh: ${branch.branchName || 'Nhánh 1'}</span>
            <span class="skill-pill">⚡ ${sk.type || 'Kỹ Năng'}</span>
          </div>
        </div>
      </div>

      <!-- Skill Description -->
      <div class="skill-description-box">
        ${formattedDesc}
      </div>

      <!-- Soul Ring Progression -->
      ${ringsHtml}
    `;
  }
});
