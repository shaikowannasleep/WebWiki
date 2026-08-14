/**
 * Hero Detail Module V2.2 - Douluo MMO Wiki
 * Features Radial Navigation Menu (Center: Bí Thuật, 10h: Hồn Kỹ, 2h: Bị Động, 8h: Tiên Cơ, 4h: Đánh Thường),
 * Rule Engine Driven Skill Groups & Typed Requirement Objects Renderer with Star Assets.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const panelHeroProfile = document.getElementById('panelHeroProfile');
  const radialMenuWrapper = document.getElementById('radialMenuWrapper');
  const branchToggleContainer = document.getElementById('branchToggleContainer');
  const skillItemsContainer = document.getElementById('skillItemsContainer');
  const panelSkillDisplay = document.getElementById('panelSkillDisplay');
  const globalKeywordPopup = document.getElementById('global-keyword-popup');
  const btnCompareToggle = document.getElementById('btnCompareToggle');

  if (!panelHeroProfile) return;

  const urlParams = new URLSearchParams(window.location.search);
  let heroId = urlParams.get('id');

  let [heroData, keywordsDict, websiteConfig] = await Promise.all([
    heroId ? DataLayer.getHeroById(heroId) : null,
    DataLayer.getKeywords(),
    DataLayer.getWebsiteConfig()
  ]);

  // Fallback: If specified heroId is invalid or missing, load the first available hero from heroes index
  if (!heroData) {
    const heroesList = await DataLayer.getHeroesList();
    if (heroesList && heroesList.length > 0) {
      heroId = heroesList[0].id;
      heroData = await DataLayer.getHeroById(heroId);
    }
  }

  if (!heroData) {
    panelHeroProfile.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-sub);">
        <h2>⚠️ Không tìm thấy Hồn Sư</h2>
        <p>Hiện chưa có dữ liệu Hồn Sư nào trong hệ thống.</p>
        <a href="index.html" class="btn-view-detail" style="margin-top:1rem;"> Quay về Trang Chủ</a>
      </div>
    `;
    return;
  }

  document.title = `${heroData.name} (${heroData.title || ''}) - Douluo MMO Wiki`;

  const skillGroupRules = websiteConfig.skillGroupRules || DataLayer.SKILL_GROUP_RULES;
  let activeGroupId = 'honky'; // Default: Hồn Kỹ
  let activeBranchIndex = 0;
  let activeSkillIndex = 0;
  let isCompareMode = false;

  renderHeroProfilePanel(heroData);
  setupRadialMenuListeners();
  setupCompareToggle();
  renderPanel2And3();

  function renderHeroProfilePanel(data) {
    const heroName = i18n.translateConcept(data.name);
    const heroRole = i18n.translateConcept(data.role);
    const heroTitle = data.title ? i18n.translateConcept(data.title) : '';
    const heroWusoul = i18n.translateConcept(data.wusoul);
    const rarityClass = data.rarity === 'SP' ? 'rarity-sp' : (data.rarity === 'SSR' ? 'rarity-ssr' : '');

    panelHeroProfile.innerHTML = `
      <div class="panel-hero-avatar ${rarityClass}">
        <img src="${data.avatar}" alt="${heroName}" onerror="this.src='assets/heroes/oscar/avatar.webp'">
      </div>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span class="rarity-badge ${data.rarity}">${data.rarity}</span>
        <span class="role-badge">❖ ${heroRole}</span>
      </div>
      <h1 class="panel-hero-name">${heroName}</h1>
      <div class="panel-hero-title">${heroTitle}</div>
      <div style="font-size: 0.88rem; color: var(--text-sub); margin-bottom: 0.75rem;">${i18n.t('wusoul_label')} <strong>${heroWusoul}</strong></div>
      <p class="panel-hero-bio" style="line-height: 1.7; font-size: 0.9rem;">${data.bio ? i18n.translateConcept(data.bio) : ''}</p>
    `;
  }

  /**
   * Radial Navigation Menu Event Setup (100% Matching Game Screenshot)
   */
  function setupRadialMenuListeners() {
    const radialNodes = radialMenuWrapper ? radialMenuWrapper.querySelectorAll('.radial-node') : [];
    const mobileChips = document.querySelectorAll('#mobileSkillGroupBar .mobile-group-chip');

    function syncActiveGroup(groupId) {
      activeGroupId = groupId;
      activeSkillIndex = 0;

      radialNodes.forEach(n => {
        n.classList.toggle('active', n.getAttribute('data-group-id') === groupId);
      });
      mobileChips.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-group-id') === groupId);
      });
      renderPanel2And3();
    }

    // Set initial active state
    radialNodes.forEach(node => {
      node.classList.toggle('active', node.getAttribute('data-group-id') === activeGroupId);
      node.addEventListener('click', () => {
        const groupId = node.getAttribute('data-group-id');
        if (groupId !== activeGroupId) syncActiveGroup(groupId);
      });
    });

    mobileChips.forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-group-id') === activeGroupId);
      chip.addEventListener('click', () => {
        const groupId = chip.getAttribute('data-group-id');
        if (groupId !== activeGroupId) syncActiveGroup(groupId);
      });
    });
  }

  function setupCompareToggle() {
    if (!btnCompareToggle) return;
    const gridContainer = document.querySelector('.hero-3panel-grid');
    
    btnCompareToggle.addEventListener('click', () => {
      isCompareMode = !isCompareMode;
      if (isCompareMode) {
        btnCompareToggle.classList.add('active');
        btnCompareToggle.style.background = 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))';
        btnCompareToggle.style.borderColor = 'var(--accent-cyan)';
        btnCompareToggle.style.color = '#a5f3fc';
        if (gridContainer) gridContainer.classList.add('compare-active');
      } else {
        btnCompareToggle.classList.remove('active');
        btnCompareToggle.style.background = '';
        btnCompareToggle.style.borderColor = '';
        btnCompareToggle.style.color = '';
        if (gridContainer) gridContainer.classList.remove('compare-active');
      }
      renderSkillDisplay();
    });
  }

  /**
   * Rule Engine Driven Panel 2 & 3 Rendering
   */
  function renderPanel2And3() {
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };
    const hasBranch = groupRule.hasBranch;

    let availableSkills = [];

    if (hasBranch) {
      branchToggleContainer.style.display = 'flex';
      if (btnCompareToggle && heroData.branches.length >= 2) {
        btnCompareToggle.style.display = 'inline-flex';
      } else if (btnCompareToggle) {
        btnCompareToggle.style.display = 'none';
      }
      renderBranchToggle(heroData.branches);

      const branch = heroData.branches[activeBranchIndex] || heroData.branches[0];
      if (branch && branch.skills) {
        availableSkills = branch.skills.filter(s => !s.group || s.group === activeGroupId || activeGroupId === 'honky');
        if (availableSkills.length === 0) availableSkills = branch.skills;
      }
    } else {
      branchToggleContainer.style.display = 'none';
      if (btnCompareToggle) btnCompareToggle.style.display = 'none';
      isCompareMode = false;
      if (btnCompareToggle) {
        btnCompareToggle.classList.remove('active');
        btnCompareToggle.style.background = '';
        btnCompareToggle.style.borderColor = '';
        btnCompareToggle.style.color = '';
      }
      const gridContainer = document.querySelector('.hero-3panel-grid');
      if (gridContainer) gridContainer.classList.remove('compare-active');

      heroData.branches.forEach(b => {
        const matching = b.skills.filter(s => s.group === activeGroupId);
        availableSkills.push(...matching);
      });

      if (availableSkills.length === 0 && heroData.branches[0]) {
        const idxMap = { normal: 0, tienco: 1 };
        const idx = idxMap[activeGroupId] !== undefined ? idxMap[activeGroupId] : 0;
        if (heroData.branches[0].skills[idx]) {
          availableSkills = [heroData.branches[0].skills[idx]];
        }
      }
    }

    if (availableSkills.length === 0) {
      skillItemsContainer.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem; padding: 1.5rem; text-align: center;">
          Không có kỹ năng thuộc nhóm này.
        </div>
      `;
      panelSkillDisplay.innerHTML = `<div style="color: var(--text-muted);">Vui lòng chọn nhóm kỹ năng khác.</div>`;
      return;
    }

    if (activeSkillIndex >= availableSkills.length) activeSkillIndex = 0;

    skillItemsContainer.innerHTML = availableSkills.map((s, idx) => `
      <div class="skill-list-item ${idx === activeSkillIndex ? 'active' : ''}" data-skill-idx="${idx}">
        <div class="skill-item-icon" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
          ${s.icon && s.icon.includes('/') ? `<img src="${s.icon}" style="width:100%; height:100%; object-fit:cover;">` : (s.icon || '⚔️')}
        </div>
        <div class="skill-item-info">
          <div class="skill-item-name">${s.name}</div>
          <div class="skill-item-meta">
            <span>${s.type}</span> • <span>${s.cost}</span>
          </div>
        </div>
      </div>
    `).join('');

    const items = skillItemsContainer.querySelectorAll('.skill-list-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-skill-idx'), 10);
        activeSkillIndex = idx;
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        renderSkillDisplay();
      });
    });

    renderSkillDisplay();
  }

  function renderBranchToggle(branches) {
    if (!branchToggleContainer) return;
    branchToggleContainer.innerHTML = branches.map((b, idx) => `
      <button class="branch-toggle-btn ${idx === activeBranchIndex ? 'active' : ''}" data-branch-idx="${idx}">
        ${b.branchName}
      </button>
    `).join('');

    const btns = branchToggleContainer.querySelectorAll('.branch-toggle-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-branch-idx'), 10);
        if (idx !== activeBranchIndex) {
          activeBranchIndex = idx;
          activeSkillIndex = 0;
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderPanel2And3();
        }
      });
    });
  }

  function getSkillForBranch(bIdx, sIdx) {
    const b = heroData.branches[bIdx];
    if (!b || !b.skills) return null;
    let filteredSkills = b.skills.filter(s => !s.group || s.group === activeGroupId || activeGroupId === 'honky');
    if (filteredSkills.length === 0) filteredSkills = b.skills;
    return filteredSkills[sIdx] || null;
  }

  function renderSingleSkillHTML(skill, branchName = '') {
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };
    const hasRingUpgrades = groupRule.hasRingUpgrades;
    const parsedDesc = parseKeywordMarkup(skill.description);

    // Extract unique keywords mentioned in description
    const kwMatches = (skill.description || '').match(/\{([a-zA-Z0-9_\u00C0-\u1EF9]+)\}/g) || [];
    const uniqueKws = [...new Set(kwMatches.map(k => k.replace(/[{}]/g, '')))].filter(k => k !== 'stat');

    const kwPillsHTML = uniqueKws.map(k => {
      const kwObj = (keywordsDict && keywordsDict[k]) || { name: k, icon: '✨', type: 'Hiệu ứng' };
      return `<span class="combat-kw-tag keyword-item" data-keyword="${k}"><span>${kwObj.icon || '✨'}</span> ${kwObj.name || k}</span>`;
    }).join('');

    return `
      ${branchName ? `<div class="skill-branch-label" style="font-size: 0.85rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.75rem; border-bottom: 1px solid rgba(251, 191, 36, 0.3); padding-bottom: 0.35rem; display: inline-block;">${branchName}</div>` : ''}
      <div class="skill-detail-header" style="${branchName ? 'margin-bottom: 0.75rem; padding-bottom: 0.5rem;' : ''}">
        <div class="skill-detail-large-icon" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
          ${skill.icon && skill.icon.includes('/') ? `<img src="${skill.icon}" style="width:100%; height:100%; object-fit:cover;">` : (skill.icon || '⚔️')}
        </div>
        <div class="skill-detail-title-box">
          <h3>${skill.name}</h3>
          <div class="skill-stats-pills">
            <span class="skill-pill">Loại: ${skill.type}</span>
            <span class="skill-pill">Tiêu hao: ${skill.cost}</span>
            <span class="skill-pill">Hồi chiêu: ${skill.cooldown}</span>
          </div>
        </div>
      </div>

      <!-- Tactical Combat Summary Box -->
      <div class="combat-summary-card">
        <div class="combat-summary-header">
          <span class="combat-summary-title">⚡ COMBAT SUMMARY</span>
          <span style="font-size: 0.68rem; color: var(--text-muted);">Quick Tactical Scan</span>
        </div>
        <div class="combat-stats-grid">
          <div class="combat-stat-cell">
            <span class="combat-stat-label">Tiêu Hao</span>
            <span class="combat-stat-value" style="color:var(--accent-gold);">${skill.cost || '0 Hồn Lực'}</span>
          </div>
          <div class="combat-stat-cell">
            <span class="combat-stat-label">Hồi Chiêu</span>
            <span class="combat-stat-value" style="color:var(--accent-cyan);">${skill.cooldown || '0 lượt'}</span>
          </div>
          <div class="combat-stat-cell">
            <span class="combat-stat-label">Cơ Chế</span>
            <span class="combat-stat-value">${skill.type || 'Chủ động'}</span>
          </div>
        </div>
        ${uniqueKws.length > 0 ? `
          <div class="combat-keywords-row">
            <span style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-right:0.25rem;">Hiệu Ứng:</span>
            ${kwPillsHTML}
          </div>
        ` : ''}
      </div>

      <div class="skill-description-box" style="${branchName ? 'font-size: 0.88rem; padding: 1rem;' : ''}">
        <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.4rem; letter-spacing:0.5px;">MÔ TẢ CHI TIẾT</div>
        ${parsedDesc}
      </div>

      ${hasRingUpgrades && skill.ringUpgrades ? `
        <div class="ring-upgrades-section">
          <div class="ring-upgrades-title">
            <span>⭕ Hiệu Ứng Niên Hạn</span>
          </div>
          <div class="ring-upgrades-list">
            ${(skill.ringUpgrades || []).map(upgrade => {
              const yearClass = getYearCssClass(upgrade.year);
              const parsedBonus = parseKeywordMarkup(upgrade.bonus);
              return `
                <div class="ring-upgrade-card" style="flex-direction: column; align-items: flex-start; gap: 0.5rem; ${branchName ? 'padding: 0.6rem 0.85rem;' : ''}">
                  <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
                    <span class="ring-year-tag ${yearClass}" style="${branchName ? 'padding: 0.15rem 0.5rem; font-size: 0.72rem;' : ''}">${upgrade.year}</span>
                    <span class="ring-bonus-text" style="${branchName ? 'font-size: 0.82rem;' : ''}">${parsedBonus}</span>
                  </div>
                  ${upgrade.requirements && upgrade.requirements.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem;">
                      ${upgrade.requirements.map(reqObj => DataLayer.renderRequirementHTML(reqObj)).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderSkillDisplay() {
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };
    
    if (isCompareMode && groupRule.hasBranch && heroData.branches.length >= 2) {
      const skill1 = getSkillForBranch(0, activeSkillIndex);
      const skill2 = getSkillForBranch(1, activeSkillIndex);
      
      if (skill1 && skill2) {
        panelSkillDisplay.innerHTML = `
          <div class="skill-compare-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start;">
            <div class="compare-col" style="border-right: 1px solid var(--border-glass); padding-right: 1.5rem;">
              ${renderSingleSkillHTML(skill1, heroData.branches[0].branchName)}
            </div>
            <div class="compare-col">
              ${renderSingleSkillHTML(skill2, heroData.branches[1].branchName)}
            </div>
          </div>
        `;
        attachKeywordClickEvents();
        return;
      }
    }

    // Default Single View
    let skill = null;
    if (groupRule.hasBranch) {
       skill = getSkillForBranch(activeBranchIndex, activeSkillIndex);
    } else {
       // Single pool
       let allSkills = [];
       heroData.branches.forEach(b => {
         allSkills.push(...b.skills.filter(s => s.group === activeGroupId));
       });
       if (allSkills.length === 0 && heroData.branches[0]) {
         const idxMap = { normal: 0, tienco: 1 };
         const idx = idxMap[activeGroupId] !== undefined ? idxMap[activeGroupId] : 0;
         allSkills = [heroData.branches[0].skills[idx]];
       }
       skill = allSkills[activeSkillIndex];
    }

    if (!skill) {
      panelSkillDisplay.innerHTML = `<div style="color: var(--text-muted);">Không tìm thấy thông tin kỹ năng.</div>`;
      return;
    }

    panelSkillDisplay.innerHTML = renderSingleSkillHTML(skill);
    panelSkillDisplay.classList.remove('fade-in-skill');
    void panelSkillDisplay.offsetWidth; // trigger reflow for animation restart
    panelSkillDisplay.classList.add('fade-in-skill');
    attachKeywordClickEvents();
  }

  function parseKeywordMarkup(text) {
    if (!text) return '';
    return text.replace(/\{([^}]+)\}/g, (match, kwName) => {
      let foundKey = Object.keys(keywordsDict).find(k => k === kwName || keywordsDict[k].name === kwName);
      const kwObj = foundKey ? keywordsDict[foundKey] : null;
      const icon = kwObj ? kwObj.icon : '✨';
      const keyId = foundKey || kwName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return `<span class="skill-keyword" data-keyword-id="${keyId}">${icon} ${kwName}</span>`;
    });
  }

  function getYearCssClass(yearText) {
    if (yearText.includes('1,000')) return 'year-1k';
    if (yearText.includes('10,000')) return 'year-10k';
    if (yearText.includes('25,000') || yearText.includes('2.5 vạn')) return 'year-10k';
    if (yearText.includes('50,000') || yearText.includes('5 vạn')) return 'year-50k';
    if (yearText.includes('100,000') || yearText.includes('10 vạn')) return 'year-100k';
    return 'year-1k';
  }

  function attachKeywordClickEvents() {
    const kwElements = document.querySelectorAll('.skill-keyword, .kw-badge');
    kwElements.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const kwId = el.getAttribute('data-keyword-id') || el.getAttribute('data-kw');
        showFloatingKeywordPopup(kwId, e.pageX, e.pageY, el);
      });
    });
  }

  function showFloatingKeywordPopup(kwId, mouseX, mouseY, targetEl) {
    if (!globalKeywordPopup) return;

    let kwData = keywordsDict[kwId];
    if (!kwData) {
      const key = Object.keys(keywordsDict).find(k => keywordsDict[k].name === kwId || k === kwId);
      if (key) kwData = keywordsDict[key];
    }

    if (!kwData) {
      kwData = { name: kwId, type: 'Tác dụng đặc biệt', icon: '✨', description: `Hiệu ứng: ${kwId}.` };
    }

    document.getElementById('popKwIcon').textContent = kwData.icon || '✨';
    document.getElementById('popKwTitle').textContent = kwData.name || kwId;
    document.getElementById('popKwType').textContent = `${kwData.type || 'Buff'} • ${kwData.category || 'Hiệu ứng'}`;
    document.getElementById('popKwDesc').textContent = kwData.description;

    const rect = targetEl.getBoundingClientRect();
    const popupWidth = 320;
    let left = window.scrollX + rect.left + rect.width / 2 - popupWidth / 2;
    let top = window.scrollY + rect.bottom + 8;

    if (left < 10) left = 10;
    if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;

    globalKeywordPopup.style.left = `${left}px`;
    globalKeywordPopup.style.top = `${top}px`;
    globalKeywordPopup.style.display = 'block';
  }

  document.addEventListener('click', (e) => {
    if (globalKeywordPopup && !globalKeywordPopup.contains(e.target)) {
      globalKeywordPopup.style.display = 'none';
    }
  });

  window.addEventListener('languageChanged', () => {
    renderHeroProfilePanel(heroData);
    renderPanel2And3();
  });
});
