/**
 * Douluo Wiki Studio Engine V3.1 - 8-Module Dashboard (`edit.html`)
 * Features Module 1: Website Layout Builder (Section Visibility Checkboxes & Live Reordering),
 * Midnight Navy Palette (#0B1120), Interactive Live Canvas, and Direct Local Disk Access File Saver.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM References
  const heroSelect = document.getElementById('heroSelect');
  const btnAddHero = document.getElementById('btnAddHero');
  const btnCloneHero = document.getElementById('btnCloneHero');
  const btnDeleteHero = document.getElementById('btnDeleteHero');

  const viewDesktop = document.getElementById('viewDesktop');
  const viewTablet = document.getElementById('viewTablet');
  const viewPhone = document.getElementById('viewPhone');
  const editorPreviewContainer = document.getElementById('editorPreviewContainer');

  const btnConnectFolder = document.getElementById('btnConnectFolder');
  const btnSaveDirectToDisk = document.getElementById('btnSaveDirectToDisk');
  const folderStatusBadge = document.getElementById('folderStatusBadge');
  const btnExportZip = document.getElementById('btnExportZip');
  const btnResetDraft = document.getElementById('btnResetDraft');

  // Module Tabs
  const moduleTabBtns = document.querySelectorAll('.module-tab-btn');

  // Section Visibility Checkboxes (Module 1 Layout Builder)
  const chkShowAvatar = document.getElementById('chkShowAvatar');
  const chkShowBanner = document.getElementById('chkShowBanner');
  const chkShowTitle = document.getElementById('chkShowTitle');
  const chkShowBio = document.getElementById('chkShowBio');
  const chkShowRadial = document.getElementById('chkShowRadial');
  const chkShowRings = document.getElementById('chkShowRings');

  // Left Explorer Elements
  const btnAssetAvatar = document.getElementById('btnAssetAvatar');
  const btnAssetBanner = document.getElementById('btnAssetBanner');
  const btnRuleHonky = document.getElementById('btnRuleHonky');
  const btnRulePassive = document.getElementById('btnRulePassive');
  const btnRuleNormal = document.getElementById('btnRuleNormal');

  // Right Inspector Panel Form Fields
  const inspectorTargetName = document.getElementById('inspectorTargetName');
  const editSkillName = document.getElementById('editSkillName');
  const editSkillIcon = document.getElementById('editSkillIcon');
  const editSkillType = document.getElementById('editSkillType');
  const editSkillCost = document.getElementById('editSkillCost');
  const editSkillDesc = document.getElementById('editSkillDesc');
  const btnQuickInsertKw = document.getElementById('btnQuickInsertKw');

  const btnTemplateNormal = document.getElementById('btnTemplateNormal');
  const btnTemplatePassive = document.getElementById('btnTemplatePassive');
  const btnTemplateSoul = document.getElementById('btnTemplateSoul');

  const ringUpgradesEditSection = document.getElementById('ringUpgradesEditSection');
  const ringMilestonesContainer = document.getElementById('ringMilestonesContainer');
  const btnAddRingMilestone = document.getElementById('btnAddRingMilestone');

  // Bottom Console OCR Elements
  const btnToggleConsole = document.getElementById('btnToggleConsole');
  const consoleBodyContent = document.getElementById('consoleBodyContent');
  const ocrDropzone = document.getElementById('ocrDropzone');
  const ocrFileInput = document.getElementById('ocrFileInput');
  const imageAssistantBox = document.getElementById('imageAssistantBox');
  const cropIconPreview = document.getElementById('cropIconPreview');
  const btnApplyCropIcon = document.getElementById('btnApplyCropIcon');

  const ocrRichTextOutput = document.getElementById('ocrRichTextOutput');
  const btnCopyOcrText = document.getElementById('btnCopyOcrText');
  const btnConvertKeywords = document.getElementById('btnConvertKeywords');
  const btnAnalyzeKeywords = document.getElementById('btnAnalyzeKeywords');
  const keywordAnalyzerBox = document.getElementById('keywordAnalyzerBox');
  const existingKwList = document.getElementById('existingKwList');
  const missingKwList = document.getElementById('missingKwList');

  const editorLivePreviewFrame = document.getElementById('editorLivePreviewFrame');
  const toastContainer = document.getElementById('toastContainer');
  const globalKeywordPopup = document.getElementById('global-keyword-popup');

  // State Variables
  let heroesList = [];
  let currentHero = null;
  let keywordsDict = {};
  let websiteConfig = null;
  let activeGroupId = 'honky';
  let currentBranchIdx = 0;
  let currentSkillIdx = 0;
  let currentCroppedIconData = null;

  // Layout Visibility Config
  let layoutVisibility = {
    avatar: true,
    banner: true,
    title: true,
    bio: true,
    radial: true,
    rings: true
  };

  await initStudio();

  async function initStudio() {
    heroesList = await DataLayer.getHeroesList();
    keywordsDict = await DataLayer.getKeywords();
    websiteConfig = await DataLayer.getWebsiteConfig();

    populateHeroSelect();

    if (heroesList.length > 0) {
      await selectHero(heroesList[0].id);
    }

    setupEventListeners();
  }

  function populateHeroSelect() {
    heroSelect.innerHTML = heroesList.map(h => `
      <option value="${h.id}">${h.name} (${h.title || ''}) - ${h.rarity}</option>
    `).join('');
  }

  async function selectHero(id) {
    currentHero = await DataLayer.getHeroById(id);
    if (!currentHero) return;

    heroSelect.value = id;
    loadSkillToInspector();
    renderLivePreviewCanvas();
  }

  function loadSkillToInspector() {
    if (!currentHero) return;

    const skillGroupRules = websiteConfig.skillGroupRules || DataLayer.SKILL_GROUP_RULES;
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };

    if (groupRule.hasRingUpgrades) {
      ringUpgradesEditSection.style.display = 'block';
    } else {
      ringUpgradesEditSection.style.display = 'none';
    }

    let availableSkills = [];
    const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
    if (branch && branch.skills) availableSkills = branch.skills;

    if (currentSkillIdx >= availableSkills.length) currentSkillIdx = 0;
    const skill = availableSkills[currentSkillIdx] || availableSkills[0];

    if (skill) {
      inspectorTargetName.textContent = `Target: ${skill.name}`;
      editSkillName.value = skill.name || '';
      editSkillIcon.value = skill.icon || '';
      editSkillType.value = skill.type || 'Chủ động';
      editSkillCost.value = skill.cost || '2 Hồn Lực';
      editSkillDesc.value = skill.description || '';

      renderRingMilestonesForm(skill);
    }
  }

  function renderRingMilestonesForm(skill) {
    if (!skill || !ringMilestonesContainer) return;
    const upgrades = skill.ringUpgrades || [
      { year: '1,000 năm', bonus: '', requirements: [{ type: 'star', color: 'gold', count: 4 }] }
    ];

    ringMilestonesContainer.innerHTML = upgrades.map((u, mIdx) => `
      <div class="ring-milestone-card" style="background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 8px; padding: 0.75rem;" data-milestone-idx="${mIdx}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <input type="text" class="form-input milestone-year-input" value="${u.year}" style="width: 130px; font-weight: 700; font-size: 0.8rem; padding: 0.35rem;">
          <button class="btn-editor btn-editor-danger btn-delete-milestone" data-m-idx="${mIdx}" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;">- Xóa</button>
        </div>
        
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label class="form-label" style="font-size: 0.75rem; margin-bottom: 0.2rem;">Tác Dụng Nâng Cấp:</label>
          <input type="text" class="form-input milestone-bonus-input" value="${u.bonus || ''}" style="font-size: 0.82rem; padding: 0.35rem;">
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <label class="form-label" style="font-size: 0.72rem; margin-bottom: 0;">Typed Requirements:</label>
            <button class="btn-editor btn-editor-ghost btn-add-typed-req" data-m-idx="${mIdx}" style="padding: 0.1rem 0.35rem; font-size: 0.68rem;">+ Req</button>
          </div>
          <div class="req-tags-box" style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
            ${(u.requirements || []).map((reqObj, rIdx) => `
              <div style="display: flex; align-items: center; gap: 0.25rem; background: rgba(255,255,255,0.06); border: 1px solid var(--border-glass); padding: 0.15rem 0.4rem; border-radius: 6px;">
                ${DataLayer.renderRequirementHTML(reqObj)}
                <span class="btn-delete-req" data-m-idx="${mIdx}" data-r-idx="${rIdx}" style="cursor: pointer; color: var(--accent-red); font-weight: 700; margin-left: 0.2rem;">×</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    const yearInputs = ringMilestonesContainer.querySelectorAll('.milestone-year-input');
    const bonusInputs = ringMilestonesContainer.querySelectorAll('.milestone-bonus-input');

    yearInputs.forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        if (upgrades[idx]) upgrades[idx].year = e.target.value;
        syncInspectorToMemory();
      });
    });

    bonusInputs.forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        if (upgrades[idx]) upgrades[idx].bonus = e.target.value;
        syncInspectorToMemory();
      });
    });

    ringMilestonesContainer.querySelectorAll('.btn-delete-milestone').forEach(btn => {
      btn.addEventListener('click', () => {
        const mIdx = parseInt(btn.getAttribute('data-m-idx'), 10);
        upgrades.splice(mIdx, 1);
        skill.ringUpgrades = upgrades;
        renderRingMilestonesForm(skill);
        syncInspectorToMemory();
      });
    });

    ringMilestonesContainer.querySelectorAll('.btn-add-typed-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const mIdx = parseInt(btn.getAttribute('data-m-idx'), 10);
        const optionsText = [
          '1. 4 Sao Vàng ({ type: "star", color: "gold", count: 4 })',
          '2. 5 Sao Vàng ({ type: "star", color: "gold", count: 5 })',
          '3. 1 Sao Đỏ ({ type: "star", color: "red", count: 1 })',
          '4. 2 Sao Đỏ ({ type: "star", color: "red", count: 2 })',
          '5. 3 Sao Đỏ ({ type: "star", color: "red", count: 3 })',
          '6. 5 Sao Đỏ ({ type: "star", color: "red", count: 5 })',
          '7. Thức Tỉnh Lv.3 ({ type: "awakening", level: 3 })',
          '8. Hồn Cốt Bậc 2 ({ type: "soulbone", level: 2 })'
        ].join('\n');

        const choice = prompt(`Chọn loại Yêu Cầu (1-8):\n${optionsText}`, '1');
        let newReqObj = { type: 'star', color: 'gold', count: 4 };

        if (choice === '2') newReqObj = { type: 'star', color: 'gold', count: 5 };
        else if (choice === '3') newReqObj = { type: 'star', color: 'red', count: 1 };
        else if (choice === '4') newReqObj = { type: 'star', color: 'red', count: 2 };
        else if (choice === '5') newReqObj = { type: 'star', color: 'red', count: 3 };
        else if (choice === '6') newReqObj = { type: 'star', color: 'red', count: 5 };
        else if (choice === '7') newReqObj = { type: 'awakening', level: 3 };
        else if (choice === '8') newReqObj = { type: 'soulbone', level: 2 };

        if (!upgrades[mIdx].requirements) upgrades[mIdx].requirements = [];
        upgrades[mIdx].requirements.push(newReqObj);
        renderRingMilestonesForm(skill);
        syncInspectorToMemory();
      });
    });

    ringMilestonesContainer.querySelectorAll('.btn-delete-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const mIdx = parseInt(btn.getAttribute('data-m-idx'), 10);
        const rIdx = parseInt(btn.getAttribute('data-r-idx'), 10);
        if (upgrades[mIdx] && upgrades[mIdx].requirements) {
          upgrades[mIdx].requirements.splice(rIdx, 1);
          renderRingMilestonesForm(skill);
          syncInspectorToMemory();
        }
      });
    });
  }

  function syncInspectorToMemory() {
    if (!currentHero) return;

    const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
    if (branch && branch.skills) {
      const skill = branch.skills[currentSkillIdx];
      if (skill) {
        skill.name = editSkillName.value;
        skill.icon = editSkillIcon.value;
        skill.type = editSkillType.value;
        skill.cost = editSkillCost.value;
        skill.group = activeGroupId;
        skill.description = editSkillDesc.value;
      }
    }

    DataLayer.saveHeroDraft(currentHero);
    renderLivePreviewCanvas();
  }

  /**
   * Render Interactive Live Preview Canvas
   */
  function renderLivePreviewCanvas() {
    if (!currentHero) return;

    const skillGroupRules = websiteConfig.skillGroupRules || DataLayer.SKILL_GROUP_RULES;
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };

    let availableSkills = [];
    if (groupRule.hasBranch) {
      const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
      if (branch) availableSkills = branch.skills;
    } else {
      currentHero.branches.forEach(b => {
        const matching = b.skills.filter(s => s.group === activeGroupId);
        availableSkills.push(...matching);
      });
      if (availableSkills.length === 0 && currentHero.branches[0]) {
        availableSkills = [currentHero.branches[0].skills[0]];
      }
    }

    const skill = availableSkills[currentSkillIdx] || availableSkills[0];
    const parsedDesc = skill ? parseKeywordSyntax(skill.description) : '';

    editorLivePreviewFrame.innerHTML = `
      <!-- Hero Profile Block (Controlled by Layout Builder Visibility) -->
      <div style="background: var(--bg-surface); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-glass);">
        <div style="display: flex; gap: 1rem; align-items: center;">
          ${layoutVisibility.avatar ? `<img src="${currentHero.avatar}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;" onerror="this.src='assets/heroes/oscar/avatar.webp'">` : ''}
          <div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="rarity-badge ${currentHero.rarity}">${currentHero.rarity}</span>
              <span class="role-badge">❖ ${currentHero.role}</span>
            </div>
            <h2 style="color: #fff; font-family: var(--font-heading); margin-top: 0.2rem;">${currentHero.name}</h2>
            ${layoutVisibility.title ? `<div style="color: var(--accent-gold); font-size: 0.85rem;">${currentHero.title || ''} • Võ Hồn: ${currentHero.wusoul}</div>` : ''}
            ${layoutVisibility.bio ? `<p style="font-size: 0.8rem; color: var(--text-sub); margin-top: 0.3rem;">${currentHero.bio || ''}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- AAA Radial Navigation Menu Component Canvas (Controlled by Layout Builder) -->
      ${layoutVisibility.radial ? `
        <div class="radial-menu-wrapper" style="margin-bottom: 1.25rem;">
          <svg class="radial-orbital-svg" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="110" fill="none" stroke="rgba(6, 182, 212, 0.25)" stroke-width="1.5" stroke-dasharray="4,4" />
            <circle cx="160" cy="160" r="50" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" />
            <line x1="160" y1="160" x2="70" y2="70" stroke="rgba(6, 182, 212, 0.3)" stroke-width="1" />
            <line x1="160" y1="160" x2="250" y2="70" stroke="rgba(6, 182, 212, 0.3)" stroke-width="1" />
            <line x1="160" y1="160" x2="70" y2="250" stroke="rgba(6, 182, 212, 0.3)" stroke-width="1" />
            <line x1="160" y1="160" x2="250" y2="250" stroke="rgba(6, 182, 212, 0.3)" stroke-width="1" />
          </svg>

          <button class="radial-node radial-node-center ${activeGroupId === 'bithuat' ? 'active' : ''}" data-canvas-group="bithuat">
            <span class="node-icon">🔮</span>
            <span class="node-label">Bí Thuật</span>
          </button>

          <button class="radial-node radial-node-tl ${activeGroupId === 'honky' ? 'active' : ''}" data-canvas-group="honky">
            <span class="node-icon">🔥</span>
            <span class="node-label">Hồn Kỹ</span>
          </button>

          <button class="radial-node radial-node-tr ${activeGroupId === 'passive' ? 'active' : ''}" data-canvas-group="passive">
            <span class="node-icon">🛡️</span>
            <span class="node-label">Bị Động</span>
          </button>

          <button class="radial-node radial-node-bl ${activeGroupId === 'tienco' ? 'active' : ''}" data-canvas-group="tienco">
            <span class="node-icon">⚡</span>
            <span class="node-label">Tiên Cơ</span>
          </button>

          <button class="radial-node radial-node-br ${activeGroupId === 'normal' ? 'active' : ''}" data-canvas-group="normal">
            <span class="node-icon">⚔️</span>
            <span class="node-label">Đánh Thường</span>
          </button>
        </div>
      ` : ''}

      <!-- Level 2 Branch Toggle Canvas -->
      ${groupRule.hasBranch ? `
        <div class="branch-toggle-container" style="margin-bottom: 1rem;">
          ${currentHero.branches.map((b, idx) => `
            <div class="branch-toggle-btn ${idx === currentBranchIdx ? 'active' : ''}" data-canvas-branch="${idx}">
              ${b.branchName}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${skill ? `
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-glass);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <div style="width: 48px; height: 48px; background: rgba(59, 130, 246, 0.25); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${skill.icon && skill.icon.includes('/') ? `<img src="${skill.icon}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:1.8rem;">${skill.icon || '⚔️'}</span>`}
            </div>
            <div>
              <h3 style="color: #fff; font-size: 1.2rem;">${skill.name}</h3>
              <div style="font-size: 0.8rem; color: var(--accent-cyan);">${skill.type} • ${skill.cost}</div>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; font-size: 0.95rem; color: var(--text-sub); margin-bottom: 1rem; line-height: 1.7;">
            ${parsedDesc}
          </div>

          ${layoutVisibility.rings && groupRule.hasRingUpgrades && skill.ringUpgrades ? `
            <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">⭕ Niên Hạn Hồn Hoàn & Star Requirements:</div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${(skill.ringUpgrades || []).map(u => `
                <div style="font-size: 0.8rem; background: rgba(255,255,255,0.03); padding: 0.6rem 0.75rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.3rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="ring-year-tag ${getYearCssClass(u.year)}">${u.year}</span>
                    <span style="color: var(--text-sub);">${parseKeywordSyntax(u.bonus)}</span>
                  </div>
                  ${u.requirements && u.requirements.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.2rem;">
                      ${u.requirements.map(reqObj => DataLayer.renderRequirementHTML(reqObj)).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : '<div style="color: var(--text-muted);">Chưa có kỹ năng</div>'}
    `;

    attachLiveCanvasInteractivity();
    attachKeywordClickEvents();
  }

  function attachLiveCanvasInteractivity() {
    const radialCanvasNodes = editorLivePreviewFrame.querySelectorAll('[data-canvas-group]');
    radialCanvasNodes.forEach(node => {
      node.addEventListener('click', () => {
        activeGroupId = node.getAttribute('data-canvas-group');
        currentSkillIdx = 0;
        loadSkillToInspector();
        renderLivePreviewCanvas();
      });
    });

    const branchCanvasBtns = editorLivePreviewFrame.querySelectorAll('[data-canvas-branch]');
    branchCanvasBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentBranchIdx = parseInt(btn.getAttribute('data-canvas-branch'), 10);
        currentSkillIdx = 0;
        loadSkillToInspector();
        renderLivePreviewCanvas();
      });
    });
  }

  function parseKeywordSyntax(text) {
    if (!text) return '';
    return text.replace(/\{([^}]+)\}/g, (match, kwName) => {
      const info = keywordsDict[kwName];
      const icon = info ? info.icon : '✨';
      return `<span class="skill-keyword" data-kw="${kwName}">${icon} ${kwName}</span>`;
    });
  }

  function getYearCssClass(yearText) {
    if (yearText.includes('1,000')) return 'year-1k';
    if (yearText.includes('10,000') || yearText.includes('2.5 vạn')) return 'year-10k';
    if (yearText.includes('50,000') || yearText.includes('5 vạn')) return 'year-50k';
    if (yearText.includes('100,000') || yearText.includes('10 vạn')) return 'year-100k';
    return 'year-1k';
  }

  function setupEventListeners() {
    heroSelect.addEventListener('change', (e) => selectHero(e.target.value));

    // Module Nav Tabs
    moduleTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moduleTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Đã chuyển sang ${btn.textContent.trim()}`, 'info');
      });
    });

    // Module 1: Section Visibility Checkboxes
    chkShowAvatar.addEventListener('change', (e) => { layoutVisibility.avatar = e.target.checked; renderLivePreviewCanvas(); });
    chkShowBanner.addEventListener('change', (e) => { layoutVisibility.banner = e.target.checked; renderLivePreviewCanvas(); });
    chkShowTitle.addEventListener('change', (e) => { layoutVisibility.title = e.target.checked; renderLivePreviewCanvas(); });
    chkShowBio.addEventListener('change', (e) => { layoutVisibility.bio = e.target.checked; renderLivePreviewCanvas(); });
    chkShowRadial.addEventListener('change', (e) => { layoutVisibility.radial = e.target.checked; renderLivePreviewCanvas(); });
    chkShowRings.addEventListener('change', (e) => { layoutVisibility.rings = e.target.checked; renderLivePreviewCanvas(); });

    // Viewport Simulator
    viewDesktop.addEventListener('click', () => {
      viewDesktop.classList.add('active'); viewTablet.classList.remove('active'); viewPhone.classList.remove('active');
      editorPreviewContainer.className = 'studio-center-canvas';
    });
    viewTablet.addEventListener('click', () => {
      viewTablet.classList.add('active'); viewDesktop.classList.remove('active'); viewPhone.classList.remove('active');
      editorPreviewContainer.className = 'studio-center-canvas viewport-tablet';
    });
    viewPhone.addEventListener('click', () => {
      viewPhone.classList.add('active'); viewDesktop.classList.remove('active'); viewTablet.classList.remove('active');
      editorPreviewContainer.className = 'studio-center-canvas viewport-phone';
    });

    // Inspector Reactive Inputs
    const inputsToTrack = [editSkillName, editSkillIcon, editSkillType, editSkillCost, editSkillDesc];
    inputsToTrack.forEach(input => {
      if (input) {
        input.addEventListener('input', syncInspectorToMemory);
        input.addEventListener('change', syncInspectorToMemory);
      }
    });

    // Skill Templates
    btnTemplateNormal.addEventListener('click', () => {
      activeGroupId = 'normal';
      editSkillName.value = 'Đánh Thường Cơ Bản';
      editSkillType.value = 'Chủ động';
      editSkillCost.value = '0 Hồn Lực';
      editSkillDesc.value = 'Gây sát thương cơ bản cho mục tiêu.';
      syncInspectorToMemory();
      showToast('Đã áp dụng Template Đánh Thường!', 'success');
    });

    btnTemplatePassive.addEventListener('click', () => {
      activeGroupId = 'passive';
      const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
      const skill = branch ? branch.skills[currentSkillIdx] : null;
      if (skill) {
        skill.ringUpgrades = JSON.parse(JSON.stringify(DataLayer.RING_PRESETS.PassiveSkill));
        loadSkillToInspector();
        syncInspectorToMemory();
        showToast('Đã nạp 5 mốc Niên Hạn Bị Động!', 'success');
      }
    });

    btnTemplateSoul.addEventListener('click', () => {
      activeGroupId = 'honky';
      const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
      const skill = branch ? branch.skills[currentSkillIdx] : null;
      if (skill) {
        skill.ringUpgrades = JSON.parse(JSON.stringify(DataLayer.RING_PRESETS.SoulSkill));
        loadSkillToInspector();
        syncInspectorToMemory();
        showToast('Đã áp dụng Preset Hồn Kỹ!', 'success');
      }
    });

    // Bottom Console Drawer Toggle
    btnToggleConsole.addEventListener('click', () => {
      if (consoleBodyContent.style.display === 'none') {
        consoleBodyContent.style.display = 'block';
        btnToggleConsole.textContent = '▼ Toggle Console Drawer';
      } else {
        consoleBodyContent.style.display = 'none';
        btnToggleConsole.textContent = '▲ Open Console Drawer';
      }
    });

    // Asset Explorer Actions
    btnAssetAvatar.addEventListener('click', () => {
      const newPath = prompt('Nhập URL ảnh hoặc dán ảnh vào Console:', currentHero?.avatar || '');
      if (newPath) {
        currentHero.avatar = newPath;
        DataLayer.saveHeroDraft(currentHero);
        renderLivePreviewCanvas();
        showToast('Đã cập nhật Avatar!', 'success');
      }
    });

    btnAssetBanner.addEventListener('click', () => {
      const newPath = prompt('Nhập URL banner:', currentHero?.banner || '');
      if (newPath) {
        currentHero.banner = newPath;
        DataLayer.saveHeroDraft(currentHero);
        renderLivePreviewCanvas();
        showToast('Đã cập nhật Banner!', 'success');
      }
    });

    // Rule Config Tree Triggers
    btnRuleHonky.addEventListener('click', () => { activeGroupId = 'honky'; loadSkillToInspector(); renderLivePreviewCanvas(); });
    btnRulePassive.addEventListener('click', () => { activeGroupId = 'passive'; loadSkillToInspector(); renderLivePreviewCanvas(); });
    btnRuleNormal.addEventListener('click', () => { activeGroupId = 'normal'; loadSkillToInspector(); renderLivePreviewCanvas(); });

    // OCR Events
    ocrDropzone.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) processOcrScreenshot(e.target.files[0]);
    });

    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) processOcrScreenshot(file);
        }
      }
    });

    async function processOcrScreenshot(file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = async () => {
          showToast('🔍 AI Assistant đang phân tích ảnh...', 'info');
          const result = await DataLayer.processImageRecognitionAssistant(img);

          imageAssistantBox.style.display = 'block';
          cropIconPreview.src = result.crops.icon;
          currentCroppedIconData = result.crops.icon;

          ocrRichTextOutput.value = result.rawOcrText;
          showToast('🎉 Đã trích xuất xong sang Rich Text Buffer Console!', 'success');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }

    btnApplyCropIcon.addEventListener('click', () => {
      if (currentCroppedIconData) {
        editSkillIcon.value = currentCroppedIconData;
        syncInspectorToMemory();
        showToast('Đã áp dụng Icon cho Kỹ Năng!', 'success');
      }
    });

    btnCopyOcrText.addEventListener('click', () => {
      ocrRichTextOutput.select();
      document.execCommand('copy');
      showToast('Đã copy text vào Clipboard!', 'success');
    });

    btnConvertKeywords.addEventListener('click', () => {
      const converted = DataLayer.convertKeywordSyntax(ocrRichTextOutput.value, keywordsDict);
      ocrRichTextOutput.value = converted;
      showToast('Đã convert [Name] ➔ {Name}!', 'success');
    });

    btnAnalyzeKeywords.addEventListener('click', () => {
      const analysis = DataLayer.analyzeKeywordsInText(ocrRichTextOutput.value, keywordsDict);
      keywordAnalyzerBox.style.display = 'block';

      existingKwList.innerHTML = analysis.existing.map(item => `
        <span style="background: rgba(52, 211, 153, 0.2); border: 1px solid var(--accent-green); color: #a7f3d0; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.72rem;">✓ ${item.name}</span>
      `).join(' ') || 'Không có';

      missingKwList.innerHTML = analysis.missing.map(kw => `
        <button class="btn-editor btn-editor-gold btn-create-draft-kw" data-kw="${kw}" style="padding: 0.1rem 0.4rem; font-size: 0.72rem;">+ ${kw}</button>
      `).join(' ') || 'Không có';

      keywordAnalyzerBox.querySelectorAll('.btn-create-draft-kw').forEach(btn => {
        btn.addEventListener('click', () => {
          const kw = btn.getAttribute('data-kw');
          keywordsDict[kw] = { name: kw, type: 'Buff', category: 'Hỗ trợ', icon: '✨', description: `Hiệu ứng: ${kw}.` };
          DataLayer.saveKeywordsDraft(keywordsDict);
          renderLivePreviewCanvas();
          showToast(`Đã tạo Draft Keyword "{${kw}}"!`, 'success');
          btn.remove();
        });
      });
    });

    // Direct Disk Saving
    if (btnConnectFolder) {
      btnConnectFolder.addEventListener('click', async () => {
        try {
          await DataLayer.connectLocalProjectDirectory();
          folderStatusBadge.textContent = '🟢 Đã kết nối!';
          folderStatusBadge.style.color = '#34d399';
          folderStatusBadge.style.background = 'rgba(52, 211, 153, 0.2)';
          showToast('Đã kết nối thành công với thư mục project local!', 'success');
        } catch (err) {
          showToast(err.message, 'danger');
        }
      });
    }

    if (btnSaveDirectToDisk) {
      btnSaveDirectToDisk.addEventListener('click', async () => {
        try {
          showToast('Đang lưu trực tiếp vào đĩa...', 'info');
          syncInspectorToMemory();
          await DataLayer.saveAllDirectToDisk();
          showToast('🎉 ĐÃ LƯU TRỰC TIẾP VÀO DISK JSON THÀNH CÔNG!', 'success');
        } catch (err) {
          showToast(`Lỗi: ${err.message}`, 'danger');
        }
      });
    }

    btnAddHero.addEventListener('click', async () => {
      const name = prompt('Nhập tên Hồn Sư mới:', 'Hồn Sư Mới');
      if (!name) return;
      const slug = 'hero_' + Date.now().toString().slice(-4);
      const newHero = await DataLayer.createNewHero(slug, name);
      heroesList = await DataLayer.getHeroesList();
      populateHeroSelect();
      await selectHero(newHero.id);
      showToast(`Đã thêm Hồn Sư "${name}"!`, 'success');
    });

    btnCloneHero.addEventListener('click', async () => {
      if (!currentHero) return;
      const cloned = await DataLayer.cloneHero(currentHero.id);
      if (cloned) {
        heroesList = await DataLayer.getHeroesList();
        populateHeroSelect();
        await selectHero(cloned.id);
        showToast(`Đã nhân bản Hồn Sư!`, 'success');
      }
    });

    btnDeleteHero.addEventListener('click', async () => {
      if (!currentHero) return;
      if (confirm(`Xóa Hồn Sư "${currentHero.name}"?`)) {
        DataLayer.deleteHero(currentHero.id);
        heroesList = await DataLayer.getHeroesList();
        populateHeroSelect();
        if (heroesList.length > 0) await selectHero(heroesList[0].id);
        showToast('Đã xóa Hồn Sư.', 'danger');
      }
    });
  }

  function attachKeywordClickEvents() {
    const kwElements = editorLivePreviewFrame.querySelectorAll('.skill-keyword, .kw-badge');
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

    if (!kwData) kwData = { name: kwId, type: 'Tác dụng đặc biệt', icon: '✨', description: `Hiệu ứng: ${kwId}.` };

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

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : type === 'danger' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
