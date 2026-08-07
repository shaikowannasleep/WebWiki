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

  // Bottom Console Elements
  const editorLivePreviewFrame = document.getElementById('editorLivePreviewFrame');
  const toastContainer = document.getElementById('toastContainer');
  const globalKeywordPopup = document.getElementById('global-keyword-popup');  // Mode Switcher DOM refs
  const tabModeHero = document.getElementById('tabModeHero');
  const tabModeHonhach = document.getElementById('tabModeHonhach');
  const heroTopControls = document.getElementById('heroTopControls');
  const honhachTopControls = document.getElementById('honhachTopControls');
  const heroEditorSidebarContainer = document.getElementById('heroEditorSidebarContainer');
  const honhachEditorSidebarContainer = document.getElementById('honhachEditorSidebarContainer');
  const honhachPreviewContainer = document.getElementById('honhachPreviewContainer');
  const honhachLivePreviewFrame = document.getElementById('honhachLivePreviewFrame');

  // Honhach Controls DOM refs
  const honhachSelect = document.getElementById('honhachSelect');
  const btnAddHonhach = document.getElementById('btnAddHonhach');
  const btnCloneHonhach = document.getElementById('btnCloneHonhach');
  const btnDeleteHonhach = document.getElementById('btnDeleteHonhach');

  const editHonhachNameVi = document.getElementById('editHonhachNameVi');
  const editHonhachRole   = document.getElementById('editHonhachRole');
  const editHonhachRarity = document.getElementById('editHonhachRarity');
  const editHonhachIcon   = document.getElementById('editHonhachIcon');
  const btnPasteHonhachIcon = document.getElementById('btnPasteHonhachIcon');
  const editHonhachDesc   = document.getElementById('editHonhachDesc');

  const btnTplHonhachBoth = document.getElementById('btnTplHonhachBoth');
  const btnTplHonhach2    = document.getElementById('btnTplHonhach2');
  const btnTplHonhach4    = document.getElementById('btnTplHonhach4');

  const honhachSet2StatName = document.getElementById('honhachSet2StatName');
  const honhachSet2Template = document.getElementById('honhachSet2Template');
  const btnGenSet2Stars     = document.getElementById('btnGenSet2Stars');
  const honhachSet2StarRows = document.getElementById('honhachSet2StarRows');

  const honhachSet4Template = document.getElementById('honhachSet4Template');
  const honhachSet4Extra24  = document.getElementById('honhachSet4Extra24');
  const btnGenSet4Stars     = document.getElementById('btnGenSet4Stars');
  const honhachSet4StarRows = document.getElementById('honhachSet4StarRows');

  // State Variables
  let editorMode = 'hero'; // 'hero' | 'honhach'
  let heroesList = [];
  let honhachList = [];
  let currentHero = null;
  let currentHonhach = null;
  let keywordsDict = {};
  let websiteConfig = null;
  let activeGroupId = 'honky';
  let currentBranchIdx = 0;
  let currentSkillIdx = 0;
  let currentCroppedIconData = null;
  let livePreviewVisible = true;

  // Panel elements
  const studioLayout = document.getElementById('studioLayout');
  const heroEditorCanvasPanel = document.getElementById('heroEditorCanvasPanel');
  const honhachEditorCanvasPanel = document.getElementById('honhachEditorCanvasPanel');
  const btnToggleLivePreview = document.getElementById('btnToggleLivePreview');

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
    honhachList = await DataLayer.getHonhachList();

    populateHeroSelect();
    populateHonhachSelect();

    // Initialize CanvasEditor
    CanvasEditor.init({
      hero: null,
      onSave: (hero, meta) => {
        currentHero = hero;
        const fp = meta && meta.fieldPath ? meta.fieldPath : '';

        // ── Sync back to sidebar form fields ──
        if (editHeroName)   editHeroName.value   = hero.name   || '';
        if (editHeroWusoul) editHeroWusoul.value = hero.wusoul || '';
        if (editHeroRole)   editHeroRole.value   = hero.role   || '';
        if (editHeroTitle)  editHeroTitle.value  = hero.title  || '';
        if (editHeroBio)    editHeroBio.value    = hero.bio    || '';

        // Sync rarity dropdown in sidebar
        if (fp === 'rarity') {
          const rarityEl = document.getElementById('editHeroRarity');
          if (rarityEl) rarityEl.value = hero.rarity || 'SR';
        }

        // Reload skill inspector when any skill field changes
        if (fp.startsWith('skill') || fp.startsWith('branch')) {
          loadSkillToInspector();
          // Also update hero select label
          populateHeroSelect();
          heroSelect.value = hero.id;
        }

        // Handle branch switch from canvas (tab click)
        if (meta && meta.branchChanged) {
          currentBranchIdx = meta.branchIdx;
          loadSkillToInspector();
        }

        DataLayer.saveHeroDraft(hero);
        renderLivePreviewCanvas();
      },
      groupId: activeGroupId,
      branchIdx: currentBranchIdx
    });


    // Toggle Live Preview button
    if (btnToggleLivePreview) {
      btnToggleLivePreview.addEventListener('click', () => {
        livePreviewVisible = !livePreviewVisible;
        const livePanel = document.getElementById('editorPreviewContainer');
        if (livePanel) livePanel.classList.toggle('hidden', !livePreviewVisible);
        if (studioLayout) studioLayout.classList.toggle('preview-hidden', !livePreviewVisible);
        btnToggleLivePreview.textContent = livePreviewVisible ? '👁️ Preview' : '👁️ Hiện Preview';
        btnToggleLivePreview.style.color = livePreviewVisible ? '' : 'var(--accent-gold)';
      });
    }

    if (heroesList.length > 0) {
      await selectHero(heroesList[0].id);
    }
    if (honhachList.length > 0) {
      await selectHonhach(honhachList[0].id);
    }

    setupEventListeners();
    setupHonhachEventListeners();
  }

  function switchEditorMode(mode) {
    editorMode = mode;
    if (mode === 'hero') {
      tabModeHero.classList.add('active-group');
      tabModeHonhach.classList.remove('active-group');
      heroTopControls.style.display = 'flex';
      honhachTopControls.style.display = 'none';
      heroEditorSidebarContainer.style.display = 'flex';
      honhachEditorSidebarContainer.style.display = 'none';
      // Panel 2 switches
      if (heroEditorCanvasPanel) heroEditorCanvasPanel.style.display = 'flex';
      if (honhachEditorCanvasPanel) honhachEditorCanvasPanel.style.display = 'none';
      // Panel 3 switches
      editorPreviewContainer.style.display = 'block';
      honhachPreviewContainer.style.display = 'none';
      renderLivePreviewCanvas();
      renderEditorCanvas();
    } else {
      tabModeHonhach.classList.add('active-group');
      tabModeHero.classList.remove('active-group');
      heroTopControls.style.display = 'none';
      honhachTopControls.style.display = 'flex';
      heroEditorSidebarContainer.style.display = 'none';
      honhachEditorSidebarContainer.style.display = 'flex';
      // Panel 2 switches
      if (heroEditorCanvasPanel) heroEditorCanvasPanel.style.display = 'none';
      if (honhachEditorCanvasPanel) honhachEditorCanvasPanel.style.display = 'flex';
      // Panel 3 switches
      editorPreviewContainer.style.display = 'none';
      honhachPreviewContainer.style.display = 'block';
      loadHonhachToInspector();
      renderHonhachLivePreview();
      // For honhach, editor canvas mirrors the live preview
      const honhachCanvasFrame = document.getElementById('honhachEditorCanvasFrame');
      if (honhachCanvasFrame && honhachLivePreviewFrame) {
        honhachCanvasFrame.innerHTML = honhachLivePreviewFrame.innerHTML;
      }
    }
  }

  /** Render the inline Editor Canvas (Panel 2) for current hero */
  function renderEditorCanvas() {
    if (!currentHero) return;
    CanvasEditor.setHero(currentHero);
    CanvasEditor.setGroup(activeGroupId);
    CanvasEditor.setBranch(currentBranchIdx);
    CanvasEditor.render('heroEditorCanvasFrame');
  }

  function populateHonhachSelect() {
    if (!honhachSelect) return;
    honhachSelect.innerHTML = honhachList.map(item => `
      <option value="${item.id}">${item.nameVi} - ${item.rarity || 'SSR'}</option>
    `).join('');
  }

  async function selectHonhach(id) {
    if (!honhachList || honhachList.length === 0) return;
    currentHonhach = honhachList.find(h => h.id === id) || honhachList[0];
    if (!currentHonhach) return;

    honhachSelect.value = currentHonhach.id;

    loadHonhachToInspector();
    renderHonhachLivePreview();
  }

  function loadHonhachToInspector() {
    if (!currentHonhach) return;

    const editHonhachSet2Star   = document.getElementById('editHonhachSet2Star');
    const editHonhachSet2Effect = document.getElementById('editHonhachSet2Effect');

    if (editHonhachNameVi) editHonhachNameVi.value = currentHonhach.nameVi || '';
    if (editHonhachRole)   editHonhachRole.value   = (currentHonhach.roles || ['cuong_cong','man_cong']).join(',');
    if (editHonhachRarity) editHonhachRarity.value = currentHonhach.rarity || 'SSR';
    if (editHonhachIcon)   editHonhachIcon.value   = currentHonhach.icon || 'assets/icons/star_gold.svg';
    if (editHonhachDesc)   editHonhachDesc.value   = currentHonhach.description || '';

    // Set 2 fields (1-line description editor)
    if (editHonhachSet2Star)   editHonhachSet2Star.value   = 2; // Fixed at 2 stars for set 2
    if (editHonhachSet2Effect) editHonhachSet2Effect.value = typeof currentHonhach.set2 === 'string' ? currentHonhach.set2 : 'Tỷ Lệ Bạo+5,0%';

    // Set 4 fields
    if (currentHonhach.set4) {
      if (honhachSet4Template) honhachSet4Template.value = currentHonhach.set4.desc || '';
      if (honhachSet4Extra24)  honhachSet4Extra24.value  = currentHonhach.set4.extra24 || '';
    }

    renderHonhachStarRows();
  }

  function renderHonhachStarRows() {
    if (!currentHonhach) return;

    // Render Set 4 star inputs (6 star values)
    if (honhachSet4StarRows && currentHonhach.set4) {
      if (!currentHonhach.set4.stats || currentHonhach.set4.stats.length === 0) {
        currentHonhach.set4.stats = [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
      }

      const defaultStars = [4, 8, 12, 16, 20, 24];

      honhachSet4StarRows.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.5rem;">
          ${currentHonhach.set4.stats.map((val, idx) => `
            <div style="background:rgba(255,255,255,0.04); padding:0.4rem 0.5rem; border-radius:6px; border:1px solid var(--border-glass); display:flex; align-items:center; justify-content:space-between;">
              <span class="star-pill" style="background:rgba(245,158,11,0.2); border-color:var(--accent-gold); color:#fef08a; font-size:0.72rem;">${defaultStars[idx]}★</span>
              <input type="number" step="0.5" class="form-input set4-val-input" data-idx="${idx}" value="${val}" style="width:65px; padding:0.15rem 0.3rem; font-size:0.78rem; text-align:right;">
            </div>
          `).join('')}
        </div>
      `;

      honhachSet4StarRows.querySelectorAll('.set4-val-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'), 10);
          if (currentHonhach.set4.stats[idx] !== undefined) {
            currentHonhach.set4.stats[idx] = parseFloat(e.target.value) || 0;
            syncHonhachToMemory();
          }
        });
      });
    }
  }

  function syncHonhachToMemory() {
    if (!currentHonhach) return;

    const editHonhachSet2Star   = document.getElementById('editHonhachSet2Star');
    const editHonhachSet2Effect = document.getElementById('editHonhachSet2Effect');

    if (editHonhachNameVi) currentHonhach.nameVi = editHonhachNameVi.value;
    if (editHonhachRole)   currentHonhach.roles = editHonhachRole.value.split(',');
    if (editHonhachRarity) currentHonhach.rarity = editHonhachRarity.value;
    if (editHonhachIcon)   currentHonhach.icon = editHonhachIcon.value;
    if (editHonhachDesc)   currentHonhach.description = editHonhachDesc.value;

    if (editHonhachSet2Effect) {
      currentHonhach.set2 = editHonhachSet2Effect.value;
    }

    if (currentHonhach.set4) {
      if (honhachSet4Template) currentHonhach.set4.desc = honhachSet4Template.value;
      if (honhachSet4Extra24)  currentHonhach.set4.extra24 = honhachSet4Extra24.value;
    }

    populateHonhachSelect();
    honhachSelect.value = currentHonhach.id;

    DataLayer.saveHonhachDraft(currentHonhach);
    renderHonhachLivePreview();
  }

  function renderHonhachLivePreview() {
    if (!currentHonhach || !honhachLivePreviewFrame) return;

    const rolesList = currentHonhach.roles || ['cuong_cong', 'man_cong'];
    let rolesDisplay = 'Cường Công / Mẫn Công';
    if (rolesList.includes('phu_tro') || rolesList.includes('khong_che') || rolesList.includes('phong_thu')) {
      rolesDisplay = 'Phụ Trợ / Khống Chế / Phòng Thủ';
    }

    let set2CardHtml = '';
    if (currentHonhach.set2) {
      const set2Text = typeof currentHonhach.set2 === 'string' ? currentHonhach.set2 : 'Tỷ Lệ Bạo+5,0%';
      set2CardHtml = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 12px; padding: 1.25rem; flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--border-glass); padding-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.1rem; color:var(--accent-cyan);">🔷 2件套</span>
              <span style="font-size:0.8rem; background:rgba(6,182,212,0.2); color:#a5f3fc; padding:0.15rem 0.5rem; border-radius:12px; font-weight:700;">2★</span>
            </div>
            <span style="font-size:0.78rem; color:var(--text-sub);">Hiệu Quả 2 Món</span>
          </div>
          <div style="font-size:0.95rem; color:#a5f3fc; font-weight:700; line-height:1.5; padding:0.75rem 1rem; background:rgba(6,182,212,0.05); border-radius:8px; border:1px dashed rgba(6,182,212,0.3);">
            ✨ ${set2Text}
          </div>
        </div>
      `;
    }

    let set4CardHtml = '';
    if (currentHonhach.set4) {
      const starVals = currentHonhach.set4.stats || [];
      const minVal = starVals.length > 0 ? starVals[0] : 7.5;
      const maxVal = starVals.length > 0 ? starVals[starVals.length - 1] : 15.0;
      const defaultStars = [4, 8, 12, 16, 20, 24];

      const templateDesc = (currentHonhach.set4.desc || '').replace(/\{stat\}/g, `<span style="color:#fef08a; font-weight:800;">[${minVal}% ~ ${maxVal}%]</span>`);

      const starPillsHtml = starVals.map((val, i) => `
        <span class="star-pill" style="background:rgba(245,158,11,0.15); border-color:var(--accent-gold); color:#fef08a; padding:0.2rem 0.5rem; font-size:0.78rem;">
          <strong>${defaultStars[i]}★</strong>: ${val}%
        </span>
      `).join(' ');

      const extra24Html = currentHonhach.set4.extra24 ? `
        <div style="margin-top:0.75rem; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); padding:0.5rem 0.75rem; border-radius:8px; font-size:0.82rem; color:#fef08a;">
          ✨ <strong>Đột phá 24★:</strong> ${currentHonhach.set4.extra24}
        </div>
      ` : '';

      set4CardHtml = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-glass); border-radius: 12px; padding: 1.25rem; flex:1.2;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--border-glass); padding-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.1rem; color:var(--accent-gold);">🔶 4件套</span>
              <span style="font-size:0.8rem; background:rgba(245,158,11,0.2); color:#fef08a; padding:0.15rem 0.5rem; border-radius:12px; font-weight:700;">4/8/12/16/20/24★</span>
            </div>
            <span style="font-size:0.78rem; color:var(--text-sub);">Hiệu Quả 4 Món</span>
          </div>

          <!-- Unified Description Block -->
          <div style="font-size:0.88rem; color:#e2e8f0; line-height:1.6; margin-bottom:0.75rem;">
            ${templateDesc}
          </div>

          <!-- Compact Star Scaling Pills Row -->
          <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-top:0.5rem;">
            ${starPillsHtml}
          </div>

          ${extra24Html}
        </div>
      `;
    }

    honhachLivePreviewFrame.innerHTML = `
      <!-- Header Info Block -->
      <div style="background: var(--bg-surface); padding: 1rem 1.25rem; border-radius: 12px; margin-bottom: 1.25rem; border: 1px solid var(--border-glass); display: flex; gap: 1.25rem; align-items: center;">
        <div style="width: 64px; height: 64px; background: rgba(6,182,212,0.15); border: 1.5px solid var(--accent-cyan); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
          <img src="${currentHonhach.icon || 'assets/icons/star_gold.svg'}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/icons/star_gold.svg'">
        </div>
        <div style="flex:1;">
          <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.2rem;">
            <span class="rarity-badge ${currentHonhach.rarity || 'SSR'}">${currentHonhach.rarity || 'SSR'}</span>
            <span style="font-size:0.75rem; background:rgba(59,130,246,0.2); border:1px solid var(--primary); color:#93c5fd; padding:0.15rem 0.5rem; border-radius:4px; font-weight:600;">❖ ${rolesDisplay}</span>
          </div>
          <h2 style="color: #fff; font-family: var(--font-heading); margin-top: 0.1rem; font-size: 1.35rem;">${currentHonhach.nameVi}</h2>
          <p style="font-size: 0.82rem; color: var(--text-sub); margin-top: 0.2rem;">${currentHonhach.description || ''}</p>
        </div>
      </div>

      <!-- AAA Game Preview Cards Grid -->
      <div style="display: flex; gap: 1.25rem; margin-bottom: 1.25rem;">
        ${set2CardHtml}
        ${set4CardHtml}
      </div>

      <!-- JSON Inspector Terminal -->
      <div style="background: #07090e; border: 1px solid var(--border-glass); border-radius: 10px; padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.4rem;">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan); font-family: monospace;">CẤU TRÚC DỮ LIỆU (JSON FORMAT)</span>
          <button id="btnCopyHonhachJson" class="btn-editor btn-editor-ghost" style="font-size: 0.72rem; padding: 0.15rem 0.5rem;">📋 Copy JSON</button>
        </div>
        <pre style="font-family: monospace; font-size: 0.8rem; color: #fef08a; margin: 0; max-height: 200px; overflow-y: auto; white-space: pre-wrap;">${JSON.stringify(currentHonhach, null, 2)}</pre>
      </div>
    `;

    const btnCopyHonhachJson = document.getElementById('btnCopyHonhachJson');
    if (btnCopyHonhachJson) {
      btnCopyHonhachJson.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(currentHonhach, null, 2));
        showToast('Đã copy chuỗi JSON Hồn Hạch!', 'success');
      });
    }
  }

  function setupHonhachEventListeners() {
    if (tabModeHero)    tabModeHero.addEventListener('click', () => switchEditorMode('hero'));
    if (tabModeHonhach) tabModeHonhach.addEventListener('click', () => switchEditorMode('honhach'));

    if (honhachSelect) {
      honhachSelect.addEventListener('change', (e) => selectHonhach(e.target.value));
    }

    if (btnAddHonhach) {
      btnAddHonhach.addEventListener('click', async () => {
        const nameVi = prompt('Nhập tên Bộ Hồn Hạch mới:', 'Bộ Hồn Hạch Mới');
        if (!nameVi) return;
        const id = 'honhach_' + Date.now().toString().slice(-4);
        const newHonhach = await DataLayer.createNewHonhach(id, nameVi);
        honhachList = await DataLayer.getHonhachList();
        populateHonhachSelect();
        await selectHonhach(newHonhach.id);
        showToast(`Đã thêm Bộ Hồn Hạch "${nameVi}"!`, 'success');
      });
    }

    if (btnCloneHonhach) {
      btnCloneHonhach.addEventListener('click', async () => {
        if (!currentHonhach) return;
        const cloned = await DataLayer.cloneHonhach(currentHonhach.id);
        if (cloned) {
          honhachList = await DataLayer.getHonhachList();
          populateHonhachSelect();
          await selectHonhach(cloned.id);
          showToast('Đã nhân bản Bộ Hồn Hạch thành công!', 'success');
        }
      });
    }

    if (btnDeleteHonhach) {
      btnDeleteHonhach.addEventListener('click', async () => {
        if (!currentHonhach) return;
        if (confirm(`Xóa Bộ Hồn Hạch "${currentHonhach.nameVi}"? Thao tác không thể hoàn tác.`)) {
          DataLayer.deleteHonhach(currentHonhach.id);
          honhachList = await DataLayer.getHonhachList();
          populateHonhachSelect();
          if (honhachList.length > 0) await selectHonhach(honhachList[0].id);
          showToast('Đã xóa Bộ Hồn Hạch.', 'danger');
        }
      });
    }

    if (btnPasteHonhachIcon) {
      btnPasteHonhachIcon.addEventListener('click', async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && editHonhachIcon) {
            editHonhachIcon.value = text;
            syncHonhachToMemory();
            showToast('Đã dán Icon URL từ Clipboard!', 'success');
          }
        } catch (e) {
          showToast('Lỗi đọc Clipboard: ' + e.message, 'danger');
        }
      });
    }

    // Direct Image File Upload for Honhach Icon
    const honhachIconFileInput = document.getElementById('honhachIconFileInput');
    if (honhachIconFileInput) {
      honhachIconFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (editHonhachIcon) editHonhachIcon.value = evt.target.result;
            syncHonhachToMemory();
            showToast('Đã tải & cập nhật Icon Hồn Hạch từ file!', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Direct Clipboard Image Paste Listener for Honhach
    window.addEventListener('paste', (e) => {
      if (editorMode !== 'honhach') return;
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (editHonhachIcon) editHonhachIcon.value = evt.target.result;
            syncHonhachToMemory();
            showToast('📋 Đã dán ảnh từ Clipboard làm Icon Hồn Hạch!', 'success');
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    });

    // Reactive inputs for Honhach info
    const editHonhachSet2Star   = document.getElementById('editHonhachSet2Star');
    const editHonhachSet2Effect = document.getElementById('editHonhachSet2Effect');
    const honhachInputs = [editHonhachNameVi, editHonhachRole, editHonhachRarity, editHonhachIcon, editHonhachDesc, editHonhachSet2Star, editHonhachSet2Effect, honhachSet4Template, honhachSet4Extra24];
    honhachInputs.forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => syncHonhachToMemory());
      }
    });

    if (btnGenSet4Stars) {
      btnGenSet4Stars.addEventListener('click', () => {
        if (!currentHonhach || !currentHonhach.set4) return;
        currentHonhach.set4.stars = [
          { star: 4, value: 7.5, effect: '' },
          { star: 8, value: 9.0, effect: '' },
          { star: 12, value: 10.5, effect: '' },
          { star: 16, value: 12.0, effect: '' },
          { star: 20, value: 13.5, effect: '' },
          { star: 24, value: 15.0, effect: '' }
        ];
        rebuildSet4EffectsFromTemplate();
        syncHonhachToMemory();
        showToast('Đã tự động sinh mốc Bộ 4 (4★ - 24★)!', 'success');
      });
    }

    // Quick Template applicators
    if (btnTplHonhachBoth) {
      btnTplHonhachBoth.addEventListener('click', () => {
        if (!currentHonhach) return;
        currentHonhach.type = 'both';
        currentHonhach.set2 = {
          unlockStar: 2,
          effect: 'Hội tâm suất +5.0%'
        };
        currentHonhach.set4 = {
          template: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng {stat}% sát thương cuối trong 15s. Cooldown 30s.',
          extra24Star: 'Thời gian kéo dài pháp trận kéo dài lên 22.5s.',
          stars: [
            { star: 4, value: 7.5, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 7.5% sát thương cuối trong 15s. Cooldown 30s.' },
            { star: 8, value: 9.0, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 9.0% sát thương cuối trong 15s. Cooldown 30s.' },
            { star: 12, value: 10.5, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 10.5% sát thương cuối trong 15s. Cooldown 30s.' },
            { star: 16, value: 12.0, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 12.0% sát thương cuối trong 15s. Cooldown 30s.' },
            { star: 20, value: 13.5, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 13.5% sát thương cuối trong 15s. Cooldown 30s.' },
            { star: 24, value: 15.0, effect: 'Khi Hồn Sư từ tiền đài chuyển xuống hậu đài, ở vị trí cũ để lại pháp trận giúp tăng 15.0% sát thương cuối trong 15s. Cooldown 30s. ✨ Đột phá 24★: Thời gian kéo dài pháp trận kéo dài lên 22.5s.' }
          ]
        };
        loadHonhachToInspector();
        syncHonhachToMemory();
        showToast('Áp dụng Template 2+4 Tiêu Chuẩn!', 'success');
      });
    }

    if (btnTplHonhach2) {
      btnTplHonhach2.addEventListener('click', () => {
        if (!currentHonhach) return;
        currentHonhach.type = '2-piece';
        delete currentHonhach.set4;
        loadHonhachToInspector();
        syncHonhachToMemory();
        showToast('Áp dụng Template Chỉ Bộ 2 Món!', 'success');
      });
    }

    if (btnTplHonhach4) {
      btnTplHonhach4.addEventListener('click', () => {
        if (!currentHonhach) return;
        currentHonhach.type = '4-piece';
        delete currentHonhach.set2;
        loadHonhachToInspector();
        syncHonhachToMemory();
        showToast('Áp dụng Template Chỉ Bộ 4 Món!', 'success');
      });
    }
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
    renderEditorCanvas();
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
    renderEditorCanvas();
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
        renderEditorCanvas();
      });
    });

    const branchCanvasBtns = editorLivePreviewFrame.querySelectorAll('[data-canvas-branch]');
    branchCanvasBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        currentBranchIdx = parseInt(btn.getAttribute('data-canvas-branch'), 10);
        currentSkillIdx = 0;
        loadSkillToInspector();
        renderLivePreviewCanvas();
        renderEditorCanvas();
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
      editorPreviewContainer.className = 'studio-live-preview';
    });
    viewPhone.addEventListener('click', () => {
      viewPhone.classList.add('active'); viewDesktop.classList.remove('active');
      editorPreviewContainer.className = 'studio-live-preview viewport-phone';
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

    // Global paste: route image to asset zone
    window.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
      if (!items) return;
      for (let item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            showAssetPreview(file);
            showToast('🖼️ Đã nhận ảnh → Kiểm tra khu vực "Thay Đổi Ảnh"', 'info');
          }
          break; // only process the first image to avoid lag
        }
      }
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

  // Listen for i18n language change in editor
  window.addEventListener('languageChanged', () => {
    if (activeMode === 'hero') {
      renderLivePreview();
    } else if (activeMode === 'honhach') {
      renderHonhachPreview();
    }
  });
});

