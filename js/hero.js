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

  renderHeroProfilePanel(heroData);
  setupRadialMenuListeners();
  renderPanel2And3();

  function renderHeroProfilePanel(data) {
    panelHeroProfile.innerHTML = `
      <div class="panel-hero-avatar">
        <img src="${data.avatar}" alt="${data.name}" onerror="this.src='assets/heroes/oscar/avatar.webp'">
      </div>
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span class="rarity-badge ${data.rarity}">${data.rarity}</span>
        <span class="role-badge">❖ Hệ ${data.role}</span>
      </div>
      <h1 class="panel-hero-name">${data.name}</h1>
      <div class="panel-hero-title">${data.title || ''}</div>
      <div style="font-size: 0.88rem; color: var(--text-sub); margin-bottom: 0.75rem;">✨ Võ Hồn: <strong>${data.wusoul}</strong></div>
      <p class="panel-hero-bio" style="line-height: 1.7; font-size: 0.9rem;">${data.bio || ''}</p>
    `;
  }

  /**
   * Radial Navigation Menu Event Setup (100% Matching Game Screenshot)
   */
  function setupRadialMenuListeners() {
    if (!radialMenuWrapper) return;
    const radialNodes = radialMenuWrapper.querySelectorAll('.radial-node');
    
    // Set initial active state
    radialNodes.forEach(node => {
      if (node.getAttribute('data-group-id') === activeGroupId) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }

      node.addEventListener('click', () => {
        const groupId = node.getAttribute('data-group-id');
        if (groupId !== activeGroupId) {
          activeGroupId = groupId;
          activeSkillIndex = 0;
          radialNodes.forEach(n => n.classList.remove('active'));
          node.classList.add('active');
          renderPanel2And3();
        }
      });
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
      renderBranchToggle(heroData.branches);

      const branch = heroData.branches[activeBranchIndex] || heroData.branches[0];
      if (branch && branch.skills) {
        availableSkills = branch.skills.filter(s => !s.group || s.group === activeGroupId || activeGroupId === 'honky');
        if (availableSkills.length === 0) availableSkills = branch.skills;
      }
    } else {
      branchToggleContainer.style.display = 'none';

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
        renderSkillDisplay(availableSkills[activeSkillIndex]);
      });
    });

    renderSkillDisplay(availableSkills[activeSkillIndex]);
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

  function renderSkillDisplay(skill) {
    if (!skill) return;

    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };
    const hasRingUpgrades = groupRule.hasRingUpgrades;
    const parsedDesc = parseKeywordMarkup(skill.description);

    panelSkillDisplay.innerHTML = `
      <div class="skill-detail-header">
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

      <div class="skill-description-box">
        ${parsedDesc}
      </div>

      ${hasRingUpgrades && skill.ringUpgrades ? `
        <div class="ring-upgrades-section">
          <div class="ring-upgrades-title">
            <span>⭕ Hiệu Ứng Niên Hạn Hồn Hoàn & Yêu Cầu Mở Khóa</span>
          </div>
          <div class="ring-upgrades-list">
            ${(skill.ringUpgrades || []).map(upgrade => {
              const yearClass = getYearCssClass(upgrade.year);
              const parsedBonus = parseKeywordMarkup(upgrade.bonus);
              return `
                <div class="ring-upgrade-card" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
                    <span class="ring-year-tag ${yearClass}">${upgrade.year}</span>
                    <span class="ring-bonus-text">${parsedBonus}</span>
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
});
