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
  const viewPhone = document.getElementById('viewPhone');
  const editorPreviewContainer = document.getElementById('editorPreviewContainer');

  const btnConnectFolder = document.getElementById('btnConnectFolder');
  const btnSaveDirectToDisk = document.getElementById('btnSaveDirectToDisk');
  const folderStatusBadge = document.getElementById('folderStatusBadge');
  const btnResetDraft = document.getElementById('btnResetDraft');

  // Hero info form
  const editHeroName   = document.getElementById('editHeroName');
  const editHeroWusoul = document.getElementById('editHeroWusoul');
  const editHeroRole   = document.getElementById('editHeroRole');
  const editHeroTitle  = document.getElementById('editHeroTitle');
  const editHeroRarity = document.getElementById('editHeroRarity');
  const editHeroBio    = document.getElementById('editHeroBio');

  // Asset paste zone
  const assetPasteZone   = document.getElementById('assetPasteZone');
  const assetFileInput   = document.getElementById('assetFileInput');
  const assetPreviewBox  = document.getElementById('assetPreviewBox');
  const assetPreviewImg  = document.getElementById('assetPreviewImg');
  const assetPreviewLabel= document.getElementById('assetPreviewLabel');
  const assetPasteTarget = document.getElementById('assetPasteTarget');
  const btnApplyAsset    = document.getElementById('btnApplyAsset');
  const btnCancelAsset   = document.getElementById('btnCancelAsset');
  let currentAssetTarget = 'avatar'; // 'avatar' | 'banner' | 'icon'
  let pendingAssetDataUrl = null;

  // Left Group Buttons
  const btnRuleHonky = document.getElementById('btnRuleHonky');
  const btnRulePassive = document.getElementById('btnRulePassive');
  const btnRuleNormal = document.getElementById('btnRuleNormal');
  const btnRuleTienco = document.getElementById('btnRuleTienco');
  const btnRuleBithuat = document.getElementById('btnRuleBithuat');
  const skillTypeCostRow = document.getElementById('skillTypeCostRow');

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

    // Populate hero info form
    if (editHeroName)   editHeroName.value   = currentHero.name   || '';
    if (editHeroWusoul) editHeroWusoul.value = currentHero.wusoul || '';
    if (editHeroRole)   editHeroRole.value   = currentHero.role   || 'Hỗ Trợ';
    if (editHeroTitle)  editHeroTitle.value  = currentHero.title  || '';
    if (editHeroRarity) editHeroRarity.value = currentHero.rarity || 'SR';
    if (editHeroBio)    editHeroBio.value    = currentHero.bio    || '';

    loadSkillToInspector();
    renderLivePreviewCanvas();
  }

  function loadSkillToInspector() {
    if (!currentHero) return;

    const skillGroupRules = websiteConfig.skillGroupRules || DataLayer.SKILL_GROUP_RULES;
    const groupRule = skillGroupRules[activeGroupId] || { hasBranch: false, hasRingUpgrades: false };

    // Show/hide Niên Hạn section
    if (groupRule.hasRingUpgrades) {
      ringUpgradesEditSection.style.display = 'block';
    } else {
      ringUpgradesEditSection.style.display = 'none';
    }

    // Show/hide Loại kỹ năng & Tiêu Hao rows for Tiên Cơ and Đánh Thường
    const hideTypeCost = (activeGroupId === 'tienco' || activeGroupId === 'normal');
    if (skillTypeCostRow) skillTypeCostRow.style.display = hideTypeCost ? 'none' : 'grid';

    // Highlight active group button
    document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active-group'));
    const activeBtn = document.getElementById('btnRule' + activeGroupId.charAt(0).toUpperCase() + activeGroupId.slice(1));
    if (activeBtn) activeBtn.classList.add('active-group');

    // Get skills filtered by current group from the appropriate branch
    let availableSkills = [];
    const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
    if (branch && branch.skills) {
      availableSkills = branch.skills.filter(s => s.group === activeGroupId);
    }
    // Fallback: search all branches if not found in current branch (for non-branched groups)
    if (availableSkills.length === 0) {
      currentHero.branches.forEach(b => {
        const found = (b.skills || []).filter(s => s.group === activeGroupId);
        availableSkills.push(...found);
      });
    }

    if (currentSkillIdx >= availableSkills.length) currentSkillIdx = 0;
    const skill = availableSkills[currentSkillIdx] || availableSkills[0];

    if (skill) {
      // Update inspector target label
      const groupNames = { normal: 'Đánh Thường', tienco: 'Tiên Cơ', passive: 'Bị Động', honky: 'Hồn Kỹ', bithuat: 'Bí Thuật' };
      const inspectorTargetName = document.getElementById('inspectorTargetName');
      if (inspectorTargetName) inspectorTargetName.textContent = `${groupNames[activeGroupId] || activeGroupId} — ${skill.name}`;

      editSkillName.value = skill.name || '';
      editSkillIcon.value = skill.icon || '';
      editSkillType.value = skill.type || 'Chủ động';
      editSkillCost.value = skill.cost || '2 Hồn Lực';
      editSkillDesc.value = skill.description || '';

      renderRingMilestonesForm(skill);
    } else {
      const inspectorTargetName = document.getElementById('inspectorTargetName');
      if (inspectorTargetName) inspectorTargetName.textContent = 'Không tìm thấy kỹ năng';
      editSkillName.value = '';
      editSkillIcon.value = '';
      editSkillDesc.value = '';
    }
  }

  function renderRingMilestonesForm(skill) {
    if (!skill || !ringMilestonesContainer) return;
    const upgrades = skill.ringUpgrades || [
      { year: '10,000 năm', bonus: '', requirements: [{ type: 'star', color: 'gold', count: 4 }] }
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

    // Sync hero info fields
    if (editHeroName   && editHeroName.value)   currentHero.name   = editHeroName.value;
    if (editHeroWusoul && editHeroWusoul.value) currentHero.wusoul = editHeroWusoul.value;
    if (editHeroRole)   currentHero.role   = editHeroRole.value;
    if (editHeroTitle)  currentHero.title  = editHeroTitle.value;
    if (editHeroRarity) currentHero.rarity = editHeroRarity.value;
    if (editHeroBio)    currentHero.bio    = editHeroBio.value;

    // Sync skill fields: find skill by group in current branch
    const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
    if (branch && branch.skills) {
      let skill = branch.skills.find(s => s.group === activeGroupId);
      // Fallback: find in any branch (for non-branched groups)
      if (!skill) {
        for (const b of currentHero.branches) {
          skill = (b.skills || []).find(s => s.group === activeGroupId);
          if (skill) break;
        }
      }
      if (skill) {
        skill.name = editSkillName.value;
        skill.icon = editSkillIcon.value;
        skill.type = editSkillType?.value || skill.type;
        skill.cost = editSkillCost?.value || skill.cost;
        skill.group = activeGroupId;
        skill.description = editSkillDesc.value;
      }
    }

    // Update dropdown label
    populateHeroSelect();
    heroSelect.value = currentHero.id;

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
      // For branched groups: get skills from current branch, filtered by group
      const branch = currentHero.branches[currentBranchIdx] || currentHero.branches[0];
      if (branch) availableSkills = (branch.skills || []).filter(s => s.group === activeGroupId);
    } else {
      // For non-branched groups (normal, tienco): search all branches for matching group
      currentHero.branches.forEach(b => {
        const matching = (b.skills || []).filter(s => s.group === activeGroupId);
        availableSkills.push(...matching);
      });
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

    // Viewport Simulator (Desktop / Mobile only)
    viewDesktop.addEventListener('click', () => {
      viewDesktop.classList.add('active'); viewPhone.classList.remove('active');
      editorPreviewContainer.className = 'studio-center-canvas';
    });
    viewPhone.addEventListener('click', () => {
      viewPhone.classList.add('active'); viewDesktop.classList.remove('active');
      editorPreviewContainer.className = 'studio-center-canvas viewport-phone';
    });

    // Hero info form reactive
    const heroInfoFields = [editHeroName, editHeroWusoul, editHeroRole, editHeroTitle, editHeroRarity, editHeroBio];
    heroInfoFields.forEach(inp => { if (inp) inp.addEventListener('input', syncInspectorToMemory); inp?.addEventListener('change', syncInspectorToMemory); });

    // Asset target selector buttons
    const assetTargetLabels = { avatar: 'Avatar', banner: 'Banner', icon: 'Skill Icon' };
    document.querySelectorAll('.asset-target-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.asset-target-btn').forEach(b => b.classList.remove('active-group'));
        btn.classList.add('active-group');
        if (btn.id === 'assetTargetAvatar') currentAssetTarget = 'avatar';
        else if (btn.id === 'assetTargetBanner') currentAssetTarget = 'banner';
        else if (btn.id === 'assetTargetIcon') currentAssetTarget = 'icon';
        if (assetPasteTarget) assetPasteTarget.innerHTML = `→ Đang nhắm: <strong style="color:var(--accent-cyan);">${assetTargetLabels[currentAssetTarget]}</strong>`;
        // Reset preview
        if (assetPreviewBox) assetPreviewBox.style.display = 'none';
        pendingAssetDataUrl = null;
      });
    });

    // Asset paste zone file input
    if (assetFileInput) {
      assetFileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) showAssetPreview(e.target.files[0]);
      });
    }

    // Apply asset
    if (btnApplyAsset) {
      btnApplyAsset.addEventListener('click', () => {
        if (!pendingAssetDataUrl || !currentHero) return;
        if (currentAssetTarget === 'avatar') { currentHero.avatar = pendingAssetDataUrl; }
        else if (currentAssetTarget === 'banner') { currentHero.banner = pendingAssetDataUrl; }
        else if (currentAssetTarget === 'icon') { editSkillIcon.value = pendingAssetDataUrl; }
        DataLayer.saveHeroDraft(currentHero);
        renderLivePreviewCanvas();
        pendingAssetDataUrl = null;
        if (assetPreviewBox) assetPreviewBox.style.display = 'none';
        showToast(`Đã cập nhật ${assetTargetLabels[currentAssetTarget]}!`, 'success');
      });
    }
    if (btnCancelAsset) btnCancelAsset.addEventListener('click', () => { if (assetPreviewBox) assetPreviewBox.style.display = 'none'; pendingAssetDataUrl = null; });

    function showAssetPreview(file) {
      const reader = new FileReader();
      reader.onload = ev => {
        pendingAssetDataUrl = ev.target.result;
        if (assetPreviewImg) assetPreviewImg.src = pendingAssetDataUrl;
        const labels = { avatar: 'Avatar', banner: 'Banner', icon: 'Skill Icon' };
        if (assetPreviewLabel) assetPreviewLabel.textContent = `Sắp áp dụng: ${labels[currentAssetTarget]}`;
        if (assetPreviewBox) { assetPreviewBox.style.display = 'flex'; }
        // Hover feedback on paste zone
        if (assetPasteZone) { assetPasteZone.style.borderColor = 'var(--accent-cyan)'; setTimeout(() => assetPasteZone.style.borderColor = '', 1500); }
      };
      reader.readAsDataURL(file);
    }

    // Paste Skill Icon from Clipboard
    const btnPasteSkillIcon = document.getElementById('btnPasteSkillIcon');
    if (btnPasteSkillIcon) {
      btnPasteSkillIcon.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            editSkillIcon.value = text;
            syncInspectorToMemory();
            showToast('Đã dán URL icon từ Clipboard!', 'success');
          } else {
            showToast('Clipboard không có văn bản/URL!', 'info');
          }
        } catch (err) {
          showToast('Không thể đọc Clipboard: ' + err.message, 'danger');
        }
      });
    }

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

    // OCR Console Toggle is handled by inline toggleOcrDrawer() in HTML
    // (btnToggleConsole no longer exists as a DOM element, toggle is via onclick on header)

    // Asset Explorer — old prompt-based buttons are removed, now handled by asset paste zone
    // (btnAssetAvatar and btnAssetBanner no longer exist in DOM)

    // Rule Config Tree Triggers
    btnRuleNormal.addEventListener('click', () => { activeGroupId = 'normal'; currentSkillIdx = 0; loadSkillToInspector(); renderLivePreviewCanvas(); });
    btnRulePassive.addEventListener('click', () => { activeGroupId = 'passive'; currentSkillIdx = 0; loadSkillToInspector(); renderLivePreviewCanvas(); });
    btnRuleHonky.addEventListener('click', () => { activeGroupId = 'honky'; currentSkillIdx = 0; loadSkillToInspector(); renderLivePreviewCanvas(); });
    if (btnRuleTienco) btnRuleTienco.addEventListener('click', () => { activeGroupId = 'tienco'; currentSkillIdx = 0; loadSkillToInspector(); renderLivePreviewCanvas(); });
    if (btnRuleBithuat) btnRuleBithuat.addEventListener('click', () => { activeGroupId = 'bithuat'; currentSkillIdx = 0; loadSkillToInspector(); renderLivePreviewCanvas(); });

    // OCR Events
    ocrDropzone.addEventListener('click', () => ocrFileInput.click());
    ocrFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) processOcrScreenshot(e.target.files[0]);
    });

    // Global paste: route to asset zone if OCR is closed, else to OCR
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const ocrOpen = document.getElementById('consoleBodyContent')?.style.display !== 'none';
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          if (ocrOpen) {
            processOcrScreenshot(file); // paste into OCR
          } else {
            showAssetPreview(file); // paste into asset zone
            showToast('🖼️ Đã nhận ảnh → Kiểm tra khu vực "Thay Đổi Ảnh"', 'info');
          }
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
          if (folderStatusBadge) {
            folderStatusBadge.textContent = '🟢 Đã kết nối disk!';
            folderStatusBadge.style.color = '#34d399';
            folderStatusBadge.style.background = 'rgba(52, 211, 153, 0.15)';
          }
          showToast('📂 Đã kết nối thư mục project local! Bây giờ bạn có thể lưu JSON trực tiếp.', 'success');
        } catch (err) {
          if (err.name === 'AbortError') {
            showToast('Huỷ kết nối.', 'info');
          } else {
            showToast('⚠️ ' + err.message, 'danger');
          }
        }
      });
    }

    if (btnSaveDirectToDisk) {
      btnSaveDirectToDisk.addEventListener('click', async () => {
        if (!DataLayer.projectDirHandle) {
          showToast('⚠️ Chưa kết nối Local Disk! Bấm "📂 Kết Nối" trước.', 'danger');
          return;
        }
        try {
          showToast('⏳ Đang lưu vào đĩa...', 'info');
          syncInspectorToMemory();
          await DataLayer.saveAllDirectToDisk();
          showToast('🎉 Lưu đĩa JSON thành công!', 'success');
        } catch (err) {
          showToast(`Lỗi lưu đĩa: ${err.message}`, 'danger');
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
      if (!currentHero) { showToast('Chưa chọn Hồn Sư nào!', 'danger'); return; }

      // Nâng cao: Nếu chưa kết nối thư mục Local Disk, tự động hỏi người dùng kết nối ngay để xóa sạch file JSON dưới đĩa
      if (!DataLayer.projectDirHandle) {
        if (confirm(`Bạn chưa kết nối Thư Mục Local Disk!\nĐể xóa triệt để file JSON của "${currentHero.name}" dưới đĩa cứng local, bạn có muốn bấm kết nối thư mục ngay bây giờ không?`)) {
          try {
            await DataLayer.connectLocalProjectDirectory();
            if (folderStatusBadge) {
              folderStatusBadge.textContent = '🟢 Đã kết nối disk!';
              folderStatusBadge.style.color = '#34d399';
              folderStatusBadge.style.background = 'rgba(52, 211, 153, 0.15)';
            }
          } catch (e) {
            console.warn('User canceled or error connecting directory:', e);
          }
        }
      }

      if (confirm(`Xác nhận xóa Hồn Sư "${currentHero.name}"?

• Draft trong trình duyệt (localStorage) sẽ bị xóa ngay.
${DataLayer.projectDirHandle ? '• File data/heroes/' + currentHero.id + '.json và dữ liệu trong data/heroes.json sẽ bị XÓA VĨNH VIỄN khỏi đĩa cứng.' : '• Cảnh báo: Chưa kết nối Local Disk nên file JSON dưới ổ cứng chưa bị xóa.'}

Thao tác này không thể hoàn tác.`)) {
        const deletedId = currentHero.id;

        // 1. Xóa file {heroId}.json trên disk nếu đã kết nối
        if (DataLayer.projectDirHandle) {
          try {
            await DataLayer.deleteHeroFromDisk(deletedId);
            showToast(`🗑️ Đã xóa file data/heroes/${deletedId}.json khỏi đĩa cứng!`, 'danger');
          } catch (e) {
            showToast(`⚠️ Không xóa được file JSON: ${e.message}`, 'danger');
          }
        }

        // 2. Xóa khỏi localStorage và cache trong bộ nhớ
        DataLayer.deleteHero(deletedId);
        heroesList = heroesList.filter(h => h.id !== deletedId);
        try {
          localStorage.setItem(DataLayer.STORAGE_KEYS.HEROES_INDEX, JSON.stringify(heroesList, null, 2));
        } catch (e) {
          console.warn('localStorage Quota error:', e);
        }
        currentHero = null;

        // 3. Cập nhật lại file danh sách tổng data/heroes.json trên disk
        if (DataLayer.projectDirHandle) {
          try {
            await DataLayer.writeDirectToLocalDisk('data/heroes.json', JSON.stringify(heroesList, null, 2));
            showToast(`💾 Đã cập nhật lại file data/heroes.json trên đĩa cứng!`, 'success');
          } catch (e) {
            console.warn('Error updating heroes.json on disk:', e);
          }
        }

        populateHeroSelect();
        if (heroesList.length > 0) await selectHero(heroesList[0].id);
        else editorLivePreviewFrame.innerHTML = '<div style="color:var(--text-muted); padding:2rem; text-align:center;">👤 Chưa có Hồn Sư nào. Bấm "➕ Thêm Hồn Sư" để bắt đầu.</div>';
        showToast('Đã xóa Hồn Sư thành công.', 'danger');
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
