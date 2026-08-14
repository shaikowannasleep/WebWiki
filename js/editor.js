/**
 * Douluo Master Studio V4.0 — Unified Controller
 * 100% Universal Editability across Inspector, Live Canvas, Raw JSON, and Local Disk DB.
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', async () => {
  // ─── STATE ───────────────────────────────────────────────────────────────
  let activeMode = 'hero'; // 'hero' | 'honhach' | 'honcot' | 'rawjson'
  let heroesList = [];
  let honhachList = [];
  let honcotList = [];
  let keywordsDict = {};

  let currentHero = null;
  let currentHonhach = null;
  let currentHoncot = null;

  let activeGroupId = 'honky';
  let currentBranchIdx = 0;
  let currentSkillIdx = 0;

  // ─── DOM REFERENCES ──────────────────────────────────────────────────────
  // Mode Tabs
  const studioModeTabs = document.querySelectorAll('.studio-mode-tab, .mode-pill-tab');
  const heroTopControls = document.getElementById('heroTopControls');
  const honhachTopControls = document.getElementById('honhachTopControls');
  const honcotTopControls = document.getElementById('honcotTopControls');

  // Selectors
  const heroSelect = document.getElementById('heroSelect');
  const honhachSelect = document.getElementById('honhachSelect');
  const honcotSelect = document.getElementById('honcotSelect');

  // Top Action Buttons
  const btnGlobalUndo = document.getElementById('btnGlobalUndo');
  const btnGlobalRedo = document.getElementById('btnGlobalRedo');
  const btnConnectFolder = document.getElementById('btnConnectFolder');
  const btnPullFromDisk = document.getElementById('btnPullFromDisk');
  const btnSaveDirectToDisk = document.getElementById('btnSaveDirectToDisk');
  const btnImportDBBundle = document.getElementById('btnImportDBBundle');
  const dbBundleFileInput = document.getElementById('dbBundleFileInput');
  const btnExportDBBundle = document.getElementById('btnExportDBBundle');
  const folderStatusBadge = document.getElementById('folderStatusBadge');
  const unsavedBadge = document.getElementById('unsavedBadge');

  let isDirty = false;
  function setDirtyState(dirty) {
    isDirty = dirty;
    if (!unsavedBadge) return;
    if (dirty) {
      unsavedBadge.className = 'unsaved-badge dirty';
      unsavedBadge.textContent = '● Có thay đổi chưa lưu (Nhấn Lưu Đĩa)';
    } else {
      unsavedBadge.className = 'unsaved-badge synced';
      unsavedBadge.textContent = '● Đã đồng bộ Disk';
    }
  }

  // Hero CRUD Buttons
  const btnAddHero = document.getElementById('btnAddHero');
  const btnCloneHero = document.getElementById('btnCloneHero');
  const btnDeleteHero = document.getElementById('btnDeleteHero');

  // Honhach CRUD Buttons
  const btnAddHonhach = document.getElementById('btnAddHonhach');
  const btnCloneHonhach = document.getElementById('btnCloneHonhach');
  const btnDeleteHonhach = document.getElementById('btnDeleteHonhach');

  // Honcot CRUD Buttons
  const btnAddHoncot = document.getElementById('btnAddHoncot');
  const btnCloneHoncot = document.getElementById('btnCloneHoncot');
  const btnDeleteHoncot = document.getElementById('btnDeleteHoncot');

  // Inspector Containers
  const heroInspectorContainer = document.getElementById('heroInspectorContainer');
  const honhachInspectorContainer = document.getElementById('honhachInspectorContainer');
  const honcotInspectorContainer = document.getElementById('honcotInspectorContainer');

  // Master Canvas & JSON View
  const studioInspector = document.getElementById('studioInspector');
  const studioResizer = document.getElementById('studioResizer');
  const studioCanvasPanel = document.getElementById('studioCanvasPanel');
  const masterCanvasFrame = document.getElementById('masterCanvasFrame');
  const canvasModeTitle = document.getElementById('canvasModeTitle');

  const studioJsonView = document.getElementById('studioJsonView');
  const jsonViewTitle = document.getElementById('jsonViewTitle');
  const jsonViewTextarea = document.getElementById('jsonViewTextarea');
  const jsonViewAlert = document.getElementById('jsonViewAlert');
  const btnFormatJsonView = document.getElementById('btnFormatJsonView');
  const btnCopyJsonView = document.getElementById('btnCopyJsonView');
  const btnReloadJsonView = document.getElementById('btnReloadJsonView');
  const btnApplyJsonView = document.getElementById('btnApplyJsonView');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // ─── TOAST HELPER ────────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'ℹ️';
    if (type === 'success') { icon = '🎉'; toast.style.borderColor = 'var(--accent-green)'; }
    if (type === 'danger') { icon = '⚠️'; toast.style.borderColor = 'var(--accent-red)'; }
    if (type === 'gold') { icon = '✨'; toast.style.borderColor = 'var(--accent-gold)'; }
    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ─── INITIALIZATION ──────────────────────────────────────────────────────

  async function initStudio() {
    try {
      heroesList = await DataLayer.getHeroesList();
      keywordsDict = await DataLayer.getKeywords();
      honhachList = await DataLayer.getHonhachList();
      honcotList = await DataLayer.getHoncotList();

      populateHeroSelect();
      populateHonhachSelect();
      populateHoncotSelect();

      // Try auto-reconnect Local Directory Handle
      try {
        const restoredHandle = await DataLayer.restoreProjectDirectory();
        if (restoredHandle && folderStatusBadge) {
          folderStatusBadge.textContent = '🟢 Đã kết nối Disk';
          folderStatusBadge.style.color = '#34d399';
          folderStatusBadge.style.borderColor = 'var(--accent-green)';
        }
      } catch (e) {}

      // Initialize CanvasEditor
      CanvasEditor.init({
        hero: null,
        onSave: (hero, meta) => {
          currentHero = hero;
          loadHeroToInspector();
          DataLayer.saveHeroDraft(hero);
          persistSession();
          setDirtyState(true);
        },
        groupId: activeGroupId,
        branchIdx: currentBranchIdx
      });

      // Restore session or select first items
      const saved = DataLayer.getSessionState();
      let initMode = 'hero';
      let targetHeroId = heroesList.length > 0 ? heroesList[0].id : null;
      let targetHonhachId = honhachList.length > 0 ? honhachList[0].id : null;
      let targetHoncotId = honcotList.length > 0 ? honcotList[0].id : null;

      if (saved) {
        if (saved.editorMode && saved.editorMode !== 'rawjson') initMode = saved.editorMode;
        if (saved.activeGroupId) activeGroupId = saved.activeGroupId;
        if (saved.currentBranchIdx !== undefined) currentBranchIdx = saved.currentBranchIdx;
        if (saved.currentSkillIdx !== undefined) currentSkillIdx = saved.currentSkillIdx;
        if (saved.heroId && heroesList.some(h => h.id === saved.heroId)) targetHeroId = saved.heroId;
        if (saved.honhachId && honhachList.some(h => h.id === saved.honhachId)) targetHonhachId = saved.honhachId;
        if (saved.honcotId && honcotList.some(h => h.id === saved.honcotId)) targetHoncotId = saved.honcotId;
      }

      if (targetHeroId) await selectHero(targetHeroId);
      if (targetHonhachId) await selectHonhach(targetHonhachId);
      if (targetHoncotId) await selectHoncot(targetHoncotId);

      switchMode(initMode);
      setupEventListeners();
      setupResizer();
      setupHistorySync();
    } catch (err) {
      console.error('Studio init failed:', err);
    }
  }

  function persistSession() {
    DataLayer.saveSessionState({
      editorMode: activeMode,
      activeGroupId: activeGroupId,
      currentBranchIdx: currentBranchIdx,
      currentSkillIdx: currentSkillIdx,
      heroId: currentHero ? currentHero.id : null,
      honhachId: currentHonhach ? currentHonhach.id : null,
      honcotId: currentHoncot ? currentHoncot.id : null
    });
  }

  // ─── MODE SWITCHER ───────────────────────────────────────────────────────
  function switchMode(mode) {
    activeMode = mode;
    persistSession();

    // Update Mode Tab styles
    studioModeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    if (mode === 'rawjson') {
      // Show Raw JSON View, hide 2-panel workspace
      if (studioInspector) studioInspector.style.display = 'none';
      if (studioResizer) studioResizer.style.display = 'none';
      if (studioCanvasPanel) studioCanvasPanel.style.display = 'none';
      if (studioJsonView) {
        studioJsonView.classList.add('active');
        studioJsonView.style.display = 'flex';
      }
      populateJsonView();
      return;
    }

    // Normal 2-Panel Mode
    if (studioInspector) studioInspector.style.display = 'flex';
    if (studioResizer) studioResizer.style.display = 'flex';
    if (studioCanvasPanel) studioCanvasPanel.style.display = 'flex';
    if (studioJsonView) {
      studioJsonView.classList.remove('active');
      studioJsonView.style.display = 'none';
    }

    // Toggle Sub-toolbars
    if (heroTopControls) heroTopControls.style.display = (mode === 'hero') ? 'flex' : 'none';
    if (honhachTopControls) honhachTopControls.style.display = (mode === 'honhach') ? 'flex' : 'none';
    if (honcotTopControls) honcotTopControls.style.display = (mode === 'honcot') ? 'flex' : 'none';

    // Toggle Inspector Panels
    if (heroInspectorContainer) heroInspectorContainer.style.display = (mode === 'hero') ? 'flex' : 'none';
    if (honhachInspectorContainer) honhachInspectorContainer.style.display = (mode === 'honhach') ? 'flex' : 'none';
    if (honcotInspectorContainer) honcotInspectorContainer.style.display = (mode === 'honcot') ? 'flex' : 'none';

    // Re-render Master Canvas
    if (mode === 'hero') {
      if (canvasModeTitle) canvasModeTitle.innerHTML = '👤 HỒN SƯ CANVAS';
      if (currentHero) {
        CanvasEditor.setHero(currentHero);
        CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
        CanvasEditor.render('masterCanvasFrame');
      }
    } else if (mode === 'honhach') {
      if (canvasModeTitle) canvasModeTitle.innerHTML = '🦴 HỒN HẠCH CANVAS';
      renderHonhachCanvas();
    } else if (mode === 'honcot') {
      if (canvasModeTitle) canvasModeTitle.innerHTML = '🦴 HỒN CỐT CANVAS';
      renderHoncotCanvas();
    }
  }

  // ─── POPULATE SELECT DROPDOWNS ───────────────────────────────────────────
  function populateHeroSelect() {
    if (!heroSelect) return;
    heroSelect.innerHTML = '';
    heroesList.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = `${h.name} [${h.rarity || 'SR'}]`;
      heroSelect.appendChild(opt);
    });
    if (currentHero) heroSelect.value = currentHero.id;
  }

  function populateHonhachSelect() {
    if (!honhachSelect) return;
    honhachSelect.innerHTML = '';
    honhachList.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.nameVi || item.name} [${item.rarity || 'SSR'}]`;
      honhachSelect.appendChild(opt);
    });
    if (currentHonhach) honhachSelect.value = currentHonhach.id;
  }

  function populateHoncotSelect() {
    if (!honcotSelect) return;
    honcotSelect.innerHTML = '';
    honcotList.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.nameVi || item.name} [${item.slot || 'head'}]`;
      honcotSelect.appendChild(opt);
    });
    if (currentHoncot) honcotSelect.value = currentHoncot.id;
  }

  // ─── SELECT ENTITY FUNCTIONS ─────────────────────────────────────────────
  async function selectHero(heroId) {
    const hero = await DataLayer.getHeroById(heroId);
    if (!hero) return;
    currentHero = hero;
    if (heroSelect) heroSelect.value = heroId;
    loadHeroToInspector();
    CanvasEditor.setHero(currentHero);
    CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
    if (activeMode === 'hero') CanvasEditor.render('masterCanvasFrame');
    if (typeof HistoryManager !== 'undefined') HistoryManager.pushState(currentHero);
  }

  async function selectHonhach(honhachId) {
    const hh = await DataLayer.getHonhachById(honhachId);
    if (!hh) return;
    currentHonhach = hh;
    if (honhachSelect) honhachSelect.value = honhachId;
    loadHonhachToInspector();
    if (activeMode === 'honhach') renderHonhachCanvas();
  }

  async function selectHoncot(honcotId) {
    const hc = await DataLayer.getHoncotById(honcotId);
    if (!hc) return;
    currentHoncot = hc;
    if (honcotSelect) honcotSelect.value = honcotId;
    loadHoncotToInspector();
    if (activeMode === 'honcot') renderHoncotCanvas();
  }

  // ─── HERO INSPECTOR BINDINGS ─────────────────────────────────────────────
  const editHeroName = document.getElementById('editHeroName');
  const editHeroWusoul = document.getElementById('editHeroWusoul');
  const editHeroRole = document.getElementById('editHeroRole');
  const editHeroRarity = document.getElementById('editHeroRarity');
  const editHeroTitle = document.getElementById('editHeroTitle');
  const editHeroBio = document.getElementById('editHeroBio');
  const editHeroAvatar = document.getElementById('editHeroAvatar');
  const editHeroBanner = document.getElementById('editHeroBanner');

  const inspBranchTabsList = document.getElementById('inspBranchTabsList');
  const inspBtnAddBranch = document.getElementById('inspBtnAddBranch');

  const editSkillName = document.getElementById('editSkillName');
  const editSkillType = document.getElementById('editSkillType');
  const editSkillCost = document.getElementById('editSkillCost');
  const editSkillGroup = document.getElementById('editSkillGroup');
  const editSkillIcon = document.getElementById('editSkillIcon');
  const editSkillDesc = document.getElementById('editSkillDesc');
  const ringMilestonesContainer = document.getElementById('ringMilestonesContainer');
  const btnAddRingMilestone = document.getElementById('btnAddRingMilestone');
  const inspCustomBlocksList = document.getElementById('inspCustomBlocksList');
  const inspBtnAddCustomBlock = document.getElementById('inspBtnAddCustomBlock');

  function loadHeroToInspector() {
    if (!currentHero) return;

    if (editHeroName) editHeroName.value = currentHero.name || '';
    if (editHeroWusoul) editHeroWusoul.value = currentHero.wusoul || '';
    if (editHeroRole) editHeroRole.value = currentHero.role || '';
    if (editHeroRarity) editHeroRarity.value = currentHero.rarity || 'SR';
    if (editHeroTitle) editHeroTitle.value = currentHero.title || '';
    if (editHeroBio) editHeroBio.value = currentHero.bio || '';
    if (editHeroAvatar) editHeroAvatar.value = currentHero.avatar || '';
    if (editHeroBanner) editHeroBanner.value = currentHero.banner || '';

    // Render Branches
    renderInspectorBranches();

    // Render Active Skill
    loadActiveSkillToInspector();

    // Render Custom Blocks
    renderInspectorCustomBlocks();
  }

  function renderInspectorBranches() {
    if (!inspBranchTabsList || !currentHero || !currentHero.branches) return;
    inspBranchTabsList.innerHTML = '';

    currentHero.branches.forEach((b, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; gap:0.4rem; background:rgba(255,255,255,0.03); padding:0.4rem 0.6rem; border-radius:6px; border:1px solid var(--border-glass);';
      if (idx === currentBranchIdx) row.style.borderColor = 'var(--accent-cyan)';

      row.innerHTML = `
        <button class="btn-studio" style="padding:0.2rem 0.5rem; font-size:0.75rem; font-weight:800; ${idx === currentBranchIdx ? 'background:var(--accent-cyan); color:#000;' : ''}">
          ${idx + 1}
        </button>
        <input type="text" class="form-input insp-branch-name" value="${b.name || ('Nhánh ' + (idx + 1))}" data-idx="${idx}" style="flex:1; padding:0.25rem 0.5rem; font-size:0.8rem; font-weight:700;">
        ${currentHero.branches.length > 1 ? `<button class="btn-studio btn-studio-danger insp-btn-del-branch" data-idx="${idx}" style="padding:0.2rem 0.45rem; font-size:0.75rem;">✕</button>` : ''}
      `;

      // Branch select
      row.querySelector('button').addEventListener('click', () => {
        currentBranchIdx = idx;
        loadHeroToInspector();
        CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
        CanvasEditor.render('masterCanvasFrame');
      });

      // Branch name edit
      const nameInp = row.querySelector('.insp-branch-name');
      nameInp.addEventListener('input', (e) => {
        b.name = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });

      // Branch delete
      const delBtn = row.querySelector('.insp-btn-del-branch');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm(`Xác nhận xóa nhánh "${b.name}"?`)) {
            currentHero.branches.splice(idx, 1);
            if (currentBranchIdx >= currentHero.branches.length) currentBranchIdx = 0;
            loadHeroToInspector();
            DataLayer.saveHeroDraft(currentHero);
            CanvasEditor.setHero(currentHero);
            CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
            CanvasEditor.render('masterCanvasFrame');
          }
        });
      }

      inspBranchTabsList.appendChild(row);
    });
  }

  function getActiveSkill() {
    if (!currentHero || !currentHero.branches || !currentHero.branches[currentBranchIdx]) return null;
    const branch = currentHero.branches[currentBranchIdx];
    if (!branch.skills || branch.skills.length === 0) return null;

    const groupSkills = branch.skills.filter(s => (s.group || s.groupId || 'honky') === activeGroupId);
    if (groupSkills.length > 0) {
      if (currentSkillIdx >= groupSkills.length) currentSkillIdx = 0;
      return groupSkills[currentSkillIdx];
    }
    return branch.skills[0];
  }

  function loadActiveSkillToInspector() {
    const skill = getActiveSkill();
    if (!skill) return;

    if (editSkillName) editSkillName.value = skill.name || '';
    if (editSkillType) editSkillType.value = skill.type || '';
    if (editSkillCost) editSkillCost.value = skill.cost || '';
    if (editSkillGroup) editSkillGroup.value = skill.group || skill.groupId || 'honky';
    if (editSkillIcon) editSkillIcon.value = skill.icon || '';
    if (editSkillDesc) editSkillDesc.value = skill.description || skill.desc || '';

    // Render Ring Milestones
    renderInspectorMilestones(skill);
  }

  function renderInspectorMilestones(skill) {
    if (!ringMilestonesContainer) return;
    ringMilestonesContainer.innerHTML = '';
    const milestones = skill.ringUpgrades || skill.milestones || [];

    milestones.forEach((m, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:flex-start; gap:0.4rem; background:rgba(0,0,0,0.3); padding:0.45rem; border-radius:6px; border:1px solid var(--border-glass); position:relative;';

      row.innerHTML = `
        <input type="text" class="form-input insp-ring-years" value="${m.years || m.year || ''}" placeholder="1 Vạn" data-idx="${idx}" style="width:75px; font-weight:800; color:var(--accent-purple); padding:0.25rem 0.45rem; font-size:0.75rem;">
        <textarea class="form-textarea insp-ring-desc" rows="2" placeholder="Mô tả mốc..." data-idx="${idx}" style="flex:1; padding:0.25rem 0.45rem; font-size:0.75rem;">${m.desc || m.description || ''}</textarea>
        <button class="btn-studio btn-studio-danger insp-btn-del-ring" data-idx="${idx}" style="padding:0.2rem 0.4rem; font-size:0.75rem;" title="Xóa mốc">✕</button>
      `;

      row.querySelector('.insp-ring-years').addEventListener('input', (e) => {
        m.years = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });

      row.querySelector('.insp-ring-desc').addEventListener('input', (e) => {
        m.desc = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });

      row.querySelector('.insp-btn-del-ring').addEventListener('click', () => {
        milestones.splice(idx, 1);
        renderInspectorMilestones(skill);
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });

      ringMilestonesContainer.appendChild(row);
    });
  }

  function renderInspectorCustomBlocks() {
    if (!inspCustomBlocksList || !currentHero) return;
    inspCustomBlocksList.innerHTML = '';
    const customBlocks = currentHero.customBlocks || [];

    customBlocks.forEach((cb, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid rgba(6,182,212,0.3); border-radius:8px; padding:0.6rem;';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <input type="text" class="form-input insp-cb-title" value="${cb.title || ''}" placeholder="Tiêu đề khối" data-idx="${idx}" style="font-weight:800; color:var(--accent-cyan); font-size:0.8rem; width:60%;">
          <input type="text" class="form-input insp-cb-tag" value="${cb.tag || ''}" placeholder="Tag (e.g. Combo)" data-idx="${idx}" style="font-size:0.72rem; width:30%;">
          <button class="btn-studio btn-studio-danger insp-btn-del-cb" data-idx="${idx}" style="padding:0.2rem 0.4rem; font-size:0.75rem;">✕</button>
        </div>
        <textarea class="form-textarea insp-cb-content" rows="2" placeholder="Nội dung mô tả..." data-idx="${idx}" style="font-size:0.78rem;">${cb.content || ''}</textarea>
      `;

      card.querySelector('.insp-cb-title').addEventListener('input', (e) => {
        cb.title = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });
      card.querySelector('.insp-cb-tag').addEventListener('input', (e) => {
        cb.tag = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        CanvasEditor.render('masterCanvasFrame');
      });
      card.querySelector('.insp-cb-content').addEventListener('input', (e) => {
        cb.content = e.target.value;
        DataLayer.saveHeroDraft(currentHero);
        setDirtyState(true);
        CanvasEditor.render('masterCanvasFrame');
      });
      card.querySelector('.insp-btn-del-cb').addEventListener('click', () => {
        customBlocks.splice(idx, 1);
        renderInspectorCustomBlocks();
        DataLayer.saveHeroDraft(currentHero);
        setDirtyState(true);
        CanvasEditor.render('masterCanvasFrame');
      });

      inspCustomBlocksList.appendChild(card);
    });
  }

  function syncHeroBasicFields() {
    if (!currentHero) return;
    currentHero.name = editHeroName ? editHeroName.value : currentHero.name;
    currentHero.wusoul = editHeroWusoul ? editHeroWusoul.value : currentHero.wusoul;
    currentHero.role = editHeroRole ? editHeroRole.value : currentHero.role;
    currentHero.rarity = editHeroRarity ? editHeroRarity.value : currentHero.rarity;
    currentHero.title = editHeroTitle ? editHeroTitle.value : currentHero.title;
    currentHero.bio = editHeroBio ? editHeroBio.value : currentHero.bio;
    currentHero.avatar = editHeroAvatar ? editHeroAvatar.value : currentHero.avatar;
    currentHero.banner = editHeroBanner ? editHeroBanner.value : currentHero.banner;

    DataLayer.saveHeroDraft(currentHero);
    const idx = heroesList.findIndex(h => h.id === currentHero.id);
    if (idx >= 0) heroesList[idx] = { id: currentHero.id, name: currentHero.name, role: currentHero.role, rarity: currentHero.rarity, avatar: currentHero.avatar };
    populateHeroSelect();
    CanvasEditor.setHero(currentHero);
    CanvasEditor.render('masterCanvasFrame');
  }

  function syncSkillFields() {
    const skill = getActiveSkill();
    if (!skill) return;
    skill.name = editSkillName ? editSkillName.value : skill.name;
    skill.type = editSkillType ? editSkillType.value : skill.type;
    skill.cost = editSkillCost ? editSkillCost.value : skill.cost;
    skill.group = editSkillGroup ? editSkillGroup.value : skill.group;
    skill.groupId = skill.group;
    skill.icon = editSkillIcon ? editSkillIcon.value : skill.icon;
    skill.description = editSkillDesc ? editSkillDesc.value : skill.description;
    skill.desc = skill.description;

    DataLayer.saveHeroDraft(currentHero);
    CanvasEditor.setHero(currentHero);
    CanvasEditor.render('masterCanvasFrame');
  }

  // Bind Hero input events
  [editHeroName, editHeroWusoul, editHeroRole, editHeroRarity, editHeroTitle, editHeroBio, editHeroAvatar, editHeroBanner].forEach(el => {
    if (el) el.addEventListener('input', syncHeroBasicFields);
  });
  [editSkillName, editSkillType, editSkillCost, editSkillGroup, editSkillIcon, editSkillDesc].forEach(el => {
    if (el) el.addEventListener('input', syncSkillFields);
  });

  // Group selector buttons in Inspector
  ['btnRuleHonky', 'btnRulePassive', 'btnRuleNormal', 'btnRuleTienco', 'btnRuleBithuat'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-group]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeGroupId = btn.getAttribute('data-group');
        currentSkillIdx = 0;
        loadActiveSkillToInspector();
        CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
        CanvasEditor.render('masterCanvasFrame');
      });
    }
  });

  // Add Branch in Inspector
  if (inspBtnAddBranch) {
    inspBtnAddBranch.addEventListener('click', () => {
      if (!currentHero) return;
      if (!currentHero.branches) currentHero.branches = [];
      const num = currentHero.branches.length + 1;
      currentHero.branches.push({
        id: `branch_${num}`,
        name: `Nhánh ${num}`,
        skills: JSON.parse(JSON.stringify(DataLayer.SKILL_TEMPLATE || []))
      });
      currentBranchIdx = currentHero.branches.length - 1;
      loadHeroToInspector();
      DataLayer.saveHeroDraft(currentHero);
      CanvasEditor.setHero(currentHero);
      CanvasEditor.setGroupAndBranch(activeGroupId, currentBranchIdx);
      CanvasEditor.render('masterCanvasFrame');
      showToast('Đã thêm nhánh mới!', 'success');
    });
  }

  // Add Ring Milestone in Inspector
  if (btnAddRingMilestone) {
    btnAddRingMilestone.addEventListener('click', () => {
      const skill = getActiveSkill();
      if (!skill) return;
      if (!skill.ringUpgrades) skill.ringUpgrades = [];
      skill.ringUpgrades.push({ years: '1 Vạn', desc: '' });
      renderInspectorMilestones(skill);
      DataLayer.saveHeroDraft(currentHero);
      CanvasEditor.render('masterCanvasFrame');
    });
  }

  // Add Custom Block in Inspector
  if (inspBtnAddCustomBlock) {
    inspBtnAddCustomBlock.addEventListener('click', () => {
      if (!currentHero) return;
      if (!currentHero.customBlocks) currentHero.customBlocks = [];
      currentHero.customBlocks.push({ title: 'Khối Tính Năng Mới', tag: 'Đề xuất', content: '' });
      renderInspectorCustomBlocks();
      DataLayer.saveHeroDraft(currentHero);
      CanvasEditor.render('masterCanvasFrame');
    });
  }

  // ─── HONHACH INSPECTOR & CANVAS ───────────────────────────────────────────
  const editHonhachNameVi = document.getElementById('editHonhachNameVi');
  const editHonhachRarity = document.getElementById('editHonhachRarity');
  const editHonhachIcon = document.getElementById('editHonhachIcon');
  const honhachRolesToggleContainer = document.getElementById('honhachRolesToggleContainer');
  const editHonhachDesc = document.getElementById('editHonhachDesc');
  const honhachSet2Input = document.getElementById('honhachSet2Input');
  const honhachSet4DescInput = document.getElementById('honhachSet4DescInput');
  const honhachSet4Extra24Input = document.getElementById('honhachSet4Extra24Input');
  const honhachStarStatsGrid = document.getElementById('honhachStarStatsGrid');

  const ALL_ROLES = ['Cường Công', 'Mẫn Công', 'Khống Chế', 'Phụ Trợ', 'Phòng Ngự'];

  function loadHonhachToInspector() {
    if (!currentHonhach) return;
    if (editHonhachNameVi) editHonhachNameVi.value = currentHonhach.nameVi || currentHonhach.name || '';
    if (editHonhachRarity) editHonhachRarity.value = currentHonhach.rarity || 'SSR';
    if (editHonhachIcon) editHonhachIcon.value = currentHonhach.icon || '';
    if (editHonhachDesc) editHonhachDesc.value = currentHonhach.description || '';

    // Roles toggle
    if (honhachRolesToggleContainer) {
      honhachRolesToggleContainer.innerHTML = '';
      const currentRoles = currentHonhach.roles || [currentHonhach.role || 'Cường Công'];
      ALL_ROLES.forEach(r => {
        const isSel = currentRoles.includes(r);
        const btn = document.createElement('button');
        btn.className = `btn-studio ${isSel ? 'btn-studio-gold' : ''}`;
        btn.textContent = r;
        btn.style.fontSize = '0.72rem';
        btn.addEventListener('click', () => {
          let updated = [...currentRoles];
          if (updated.includes(r)) {
            updated = updated.filter(x => x !== r);
          } else {
            updated.push(r);
          }
          currentHonhach.roles = updated;
          loadHonhachToInspector();
          syncHonhachToMemory();
        });
        honhachRolesToggleContainer.appendChild(btn);
      });
    }

    // Set 2
    if (honhachSet2Input) {
      honhachSet2Input.value = (currentHonhach.set2 && currentHonhach.set2.stat) ? currentHonhach.set2.stat : '';
    }

    // Set 4
    if (currentHonhach.set4) {
      if (honhachSet4DescInput) honhachSet4DescInput.value = currentHonhach.set4.descTemplate || currentHonhach.set4.desc || '';
      if (honhachSet4Extra24Input) honhachSet4Extra24Input.value = currentHonhach.set4.extra24 || '';

      // 6 Stars Grid
      if (honhachStarStatsGrid) {
        honhachStarStatsGrid.innerHTML = '';
        const stars = [4, 8, 12, 16, 20, 24];
        stars.forEach(s => {
          const val = (currentHonhach.set4.starStats && currentHonhach.set4.starStats[s]) || '';
          const wrap = document.createElement('div');
          wrap.innerHTML = `
            <span style="font-size:0.7rem; color:var(--accent-gold); font-weight:800;">${s}★</span>
            <input type="text" class="form-input hh-star-val" data-star="${s}" value="${val}" style="padding:0.25rem 0.45rem; font-size:0.75rem;">
          `;
          wrap.querySelector('.hh-star-val').addEventListener('input', (e) => {
            if (!currentHonhach.set4.starStats) currentHonhach.set4.starStats = {};
            currentHonhach.set4.starStats[s] = e.target.value;
            syncHonhachToMemory();
          });
          honhachStarStatsGrid.appendChild(wrap);
        });
      }
    }
  }

  function syncHonhachToMemory() {
    if (!currentHonhach) return;
    currentHonhach.nameVi = editHonhachNameVi ? editHonhachNameVi.value : currentHonhach.nameVi;
    currentHonhach.name = currentHonhach.nameVi;
    currentHonhach.rarity = editHonhachRarity ? editHonhachRarity.value : currentHonhach.rarity;
    currentHonhach.icon = editHonhachIcon ? editHonhachIcon.value : currentHonhach.icon;
    currentHonhach.description = editHonhachDesc ? editHonhachDesc.value : currentHonhach.description;

    if (!currentHonhach.set2) currentHonhach.set2 = {};
    currentHonhach.set2.stat = honhachSet2Input ? honhachSet2Input.value : currentHonhach.set2.stat;

    if (!currentHonhach.set4) currentHonhach.set4 = {};
    currentHonhach.set4.descTemplate = honhachSet4DescInput ? honhachSet4DescInput.value : currentHonhach.set4.descTemplate;
    currentHonhach.set4.extra24 = honhachSet4Extra24Input ? honhachSet4Extra24Input.value : currentHonhach.set4.extra24;

    DataLayer.saveHonhachDraft(currentHonhach);
    const idx = honhachList.findIndex(h => h.id === currentHonhach.id);
    if (idx >= 0) honhachList[idx] = currentHonhach;
    populateHonhachSelect();
    renderHonhachCanvas();
    setDirtyState(true);
  }

  [editHonhachNameVi, editHonhachRarity, editHonhachIcon, editHonhachDesc, honhachSet2Input, honhachSet4DescInput, honhachSet4Extra24Input].forEach(el => {
    if (el) el.addEventListener('input', syncHonhachToMemory);
  });

  function renderHonhachCanvas() {
    if (!masterCanvasFrame || !currentHonhach) return;
    CanvasEditor.renderHonhachCanvas('masterCanvasFrame', currentHonhach, (hh, meta) => {
      currentHonhach = hh;
      loadHonhachToInspector();
      DataLayer.saveHonhachDraft(hh);
      const idx = honhachList.findIndex(h => h.id === currentHonhach.id);
      if (idx >= 0) honhachList[idx] = currentHonhach;
      populateHonhachSelect();
      persistSession();
    });
  }

  // ─── HONCOT INSPECTOR & CANVAS ────────────────────────────────────────────
  const editHoncotName = document.getElementById('editHoncotName');
  const editHoncotSlot = document.getElementById('editHoncotSlot');
  const editHoncotWusoulType = document.getElementById('editHoncotWusoulType');
  const editHoncotIcon = document.getElementById('editHoncotIcon');
  const editHoncotEnhanceStats = document.getElementById('editHoncotEnhanceStats');
  const honcotEffectsList = document.getElementById('honcotEffectsList');
  const btnAddHoncotEffect = document.getElementById('btnAddHoncotEffect');

  function loadHoncotToInspector() {
    if (!currentHoncot) return;
    if (editHoncotName) editHoncotName.value = currentHoncot.nameVi || currentHoncot.name || '';
    if (editHoncotSlot) editHoncotSlot.value = currentHoncot.slot || 'head';
    if (editHoncotWusoulType) editHoncotWusoulType.value = currentHoncot.wusoulType || 'all';
    if (editHoncotIcon) editHoncotIcon.value = currentHoncot.icon || '';
    if (editHoncotEnhanceStats) editHoncotEnhanceStats.value = currentHoncot.enhanceStats || '';

    // Render Effects
    renderHoncotInspectorEffects();
  }

  function renderHoncotInspectorEffects() {
    if (!honcotEffectsList || !currentHoncot) return;
    honcotEffectsList.innerHTML = '';
    const effects = currentHoncot.effects || [];

    effects.forEach((eff, idx) => {
      const starVal = parseInt(eff.star, 10) || (idx + 1);
      const row = document.createElement('div');
      row.style.cssText = 'background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); border-radius:8px; padding:0.6rem; position:relative;';

      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.45rem; margin-bottom:0.4rem;">
          <input type="text" class="form-input hc-eff-year" value="${eff.year || ''}" placeholder="1 Vạn" data-idx="${idx}" style="width:85px; font-weight:800; color:var(--accent-cyan); padding:0.25rem 0.45rem; font-size:0.75rem;">
          <div style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.35); padding:0.15rem 0.5rem; border-radius:12px;">
            <img src="assets/icons/star_gold.svg" style="width:12px; height:12px;" alt="star">
            <select class="form-select hc-eff-star" data-idx="${idx}" style="background:transparent; border:none; color:#fef08a; font-size:0.75rem; font-weight:800; padding:0; cursor:pointer;">
              ${[1, 2, 3, 4, 5, 6].map(s => `<option value="${s}" ${starVal === s ? 'selected' : ''} style="background:#1e293b; color:#fff;">${s}★</option>`).join('')}
            </select>
          </div>
          <button class="btn-studio btn-studio-danger hc-btn-del-eff" data-idx="${idx}" style="margin-left:auto; padding:0.2rem 0.45rem; font-size:0.75rem;">✕</button>
        </div>
        <textarea class="form-textarea hc-eff-desc" rows="2" placeholder="Mô tả hiệu ứng vạn năm..." data-idx="${idx}" style="font-size:0.78rem;">${eff.desc || ''}</textarea>
      `;

      row.querySelector('.hc-eff-year').addEventListener('input', (e) => {
        eff.year = e.target.value;
        syncHoncotToMemory();
      });
      row.querySelector('.hc-eff-star').addEventListener('change', (e) => {
        eff.star = parseInt(e.target.value, 10) || 1;
        syncHoncotToMemory();
      });
      row.querySelector('.hc-eff-desc').addEventListener('input', (e) => {
        eff.desc = e.target.value;
        syncHoncotToMemory();
      });
      row.querySelector('.hc-btn-del-eff').addEventListener('click', () => {
        effects.splice(idx, 1);
        renderHoncotInspectorEffects();
        syncHoncotToMemory();
      });

      honcotEffectsList.appendChild(row);
    });
  }

  function syncHoncotToMemory() {
    if (!currentHoncot) return;
    currentHoncot.nameVi = editHoncotName ? editHoncotName.value : currentHoncot.nameVi;
    currentHoncot.name = currentHoncot.nameVi;
    currentHoncot.slot = editHoncotSlot ? editHoncotSlot.value : currentHoncot.slot;
    currentHoncot.wusoulType = editHoncotWusoulType ? editHoncotWusoulType.value : currentHoncot.wusoulType;
    currentHoncot.icon = editHoncotIcon ? editHoncotIcon.value : currentHoncot.icon;
    currentHoncot.enhanceStats = editHoncotEnhanceStats ? editHoncotEnhanceStats.value : currentHoncot.enhanceStats;

    DataLayer.saveHoncotDraft(currentHoncot);
    const idx = honcotList.findIndex(h => h.id === currentHoncot.id);
    if (idx >= 0) honcotList[idx] = currentHoncot;
    populateHoncotSelect();
    renderHoncotCanvas();
    setDirtyState(true);
  }

  [editHoncotName, editHoncotSlot, editHoncotWusoulType, editHoncotIcon, editHoncotEnhanceStats].forEach(el => {
    if (el) el.addEventListener('input', syncHoncotToMemory);
  });

  if (btnAddHoncotEffect) {
    btnAddHoncotEffect.addEventListener('click', () => {
      if (!currentHoncot) return;
      if (!currentHoncot.effects) currentHoncot.effects = [];
      const num = currentHoncot.effects.length + 1;
      currentHoncot.effects.push({ year: `${num * 2} Vạn`, star: Math.min(num, 6), desc: '' });
      renderHoncotInspectorEffects();
      syncHoncotToMemory();
    });
  }

  function renderHoncotCanvas() {
    if (!masterCanvasFrame || !currentHoncot) return;
    CanvasEditor.renderHoncotCanvas('masterCanvasFrame', currentHoncot, (hc, meta) => {
      currentHoncot = hc;
      loadHoncotToInspector();
      DataLayer.saveHoncotDraft(hc);
      const idx = honcotList.findIndex(h => h.id === currentHoncot.id);
      if (idx >= 0) honcotList[idx] = currentHoncot;
      populateHoncotSelect();
      persistSession();
    });
  }

  // ─── RAW JSON FULL-VIEW EDITOR ───────────────────────────────────────────
  function getActiveRawObject() {
    if (activeMode === 'honhach') return { type: 'honhach', obj: currentHonhach, name: currentHonhach ? (currentHonhach.nameVi || currentHonhach.name) : 'Hồn Hạch' };
    if (activeMode === 'honcot') return { type: 'honcot', obj: currentHoncot, name: currentHoncot ? (currentHoncot.nameVi || currentHoncot.name) : 'Hồn Cốt' };
    return { type: 'hero', obj: currentHero, name: currentHero ? currentHero.name : 'Hồn Sư' };
  }

  function populateJsonView() {
    if (!jsonViewTextarea) return;
    const active = getActiveRawObject();
    if (jsonViewTitle) jsonViewTitle.textContent = `📜 JSON Gốc: ${active.name} [${active.type.toUpperCase()}]`;
    jsonViewTextarea.value = active.obj ? JSON.stringify(active.obj, null, 2) : '{}';
    if (jsonViewAlert) jsonViewAlert.style.display = 'none';
  }

  if (btnFormatJsonView) {
    btnFormatJsonView.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(jsonViewTextarea.value);
        jsonViewTextarea.value = JSON.stringify(parsed, null, 2);
        if (jsonViewAlert) {
          jsonViewAlert.style.display = 'block';
          jsonViewAlert.style.background = 'rgba(52, 211, 153, 0.15)';
          jsonViewAlert.style.color = '#6ee7b7';
          jsonViewAlert.textContent = '✅ Đã định dạng JSON chuẩn!';
        }
      } catch (e) {
        if (jsonViewAlert) {
          jsonViewAlert.style.display = 'block';
          jsonViewAlert.style.background = 'rgba(239, 68, 68, 0.15)';
          jsonViewAlert.style.color = '#fca5a5';
          jsonViewAlert.textContent = `❌ Lỗi JSON: ${e.message}`;
        }
      }
    });
  }

  if (btnCopyJsonView) {
    btnCopyJsonView.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(jsonViewTextarea.value);
        showToast('📋 Đã copy JSON vào Clipboard!', 'success');
      } catch (e) {
        jsonViewTextarea.select();
        document.execCommand('copy');
        showToast('📋 Đã copy JSON vào Clipboard!', 'success');
      }
    });
  }

  if (btnReloadJsonView) {
    btnReloadJsonView.addEventListener('click', () => {
      populateJsonView();
      showToast('🔄 Đã nạp lại JSON từ bộ nhớ RAM!', 'info');
    });
  }

  if (btnApplyJsonView) {
    btnApplyJsonView.addEventListener('click', () => {
      let parsed;
      try {
        parsed = JSON.parse(jsonViewTextarea.value);
      } catch (e) {
        if (jsonViewAlert) {
          jsonViewAlert.style.display = 'block';
          jsonViewAlert.style.background = 'rgba(239, 68, 68, 0.15)';
          jsonViewAlert.style.color = '#fca5a5';
          jsonViewAlert.textContent = `❌ Lỗi cú pháp JSON: ${e.message}`;
        }
        return;
      }

      const active = getActiveRawObject();
      if (active.type === 'hero') {
        currentHero = parsed;
        DataLayer.saveHeroDraft(currentHero);
        const idx = heroesList.findIndex(h => h.id === currentHero.id);
        if (idx >= 0) heroesList[idx] = { id: currentHero.id, name: currentHero.name, role: currentHero.role, rarity: currentHero.rarity, avatar: currentHero.avatar };
        populateHeroSelect();
        loadHeroToInspector();
      } else if (active.type === 'honhach') {
        currentHonhach = parsed;
        DataLayer.saveHonhachDraft(currentHonhach);
        const idx = honhachList.findIndex(h => h.id === currentHonhach.id);
        if (idx >= 0) honhachList[idx] = currentHonhach;
        populateHonhachSelect();
        loadHonhachToInspector();
      } else if (active.type === 'honcot') {
        currentHoncot = parsed;
        DataLayer.saveHoncotDraft(currentHoncot);
        const idx = honcotList.findIndex(h => h.id === currentHoncot.id);
        if (idx >= 0) honcotList[idx] = currentHoncot;
        populateHoncotSelect();
        loadHoncotToInspector();
      }

      if (typeof HistoryManager !== 'undefined') HistoryManager.pushState(parsed);
      persistSession();

      if (jsonViewAlert) {
        jsonViewAlert.style.display = 'block';
        jsonViewAlert.style.background = 'rgba(52, 211, 153, 0.15)';
        jsonViewAlert.style.color = '#6ee7b7';
        jsonViewAlert.textContent = '⚡ Đã áp dụng các thay đổi từ JSON gốc thành công!';
      }
      showToast('⚡ Áp dụng JSON thành công!', 'success');
    });
  }

  // ─── RESIZER (KÉO CO GIÃN ĐỘ RỘNG) ────────────────────────────────────────
  function setupResizer() {
    if (!studioResizer) return;
    const saved = localStorage.getItem('douluo_studio_left_width');
    if (saved) document.documentElement.style.setProperty('--left-col-width', `${saved}px`);

    let isResizing = false;

    studioResizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      studioResizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(340, Math.min(750, e.clientX));
      document.documentElement.style.setProperty('--left-col-width', `${newWidth}px`);
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        studioResizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        const widthVal = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--left-col-width')) || 460;
        localStorage.setItem('douluo_studio_left_width', widthVal);
      }
    });
  }

  // ─── UNDO / REDO & SHORTCUTS ─────────────────────────────────────────────
  function setupHistorySync() {
    if (typeof HistoryManager !== 'undefined') {
      HistoryManager.onChange(({ canUndo, canRedo }) => {
        if (btnGlobalUndo) {
          btnGlobalUndo.disabled = !canUndo;
          btnGlobalUndo.style.opacity = canUndo ? '1' : '0.4';
          btnGlobalUndo.style.cursor = canUndo ? 'pointer' : 'not-allowed';
        }
        if (btnGlobalRedo) {
          btnGlobalRedo.disabled = !canRedo;
          btnGlobalRedo.style.opacity = canRedo ? '1' : '0.4';
          btnGlobalRedo.style.cursor = canRedo ? 'pointer' : 'not-allowed';
        }
      });
    }

    if (btnGlobalUndo) {
      btnGlobalUndo.addEventListener('click', () => {
        if (typeof HistoryManager === 'undefined' || !HistoryManager.canUndo()) return;
        const prev = HistoryManager.undo();
        if (prev && activeMode === 'hero') {
          currentHero = prev;
          loadHeroToInspector();
          CanvasEditor.setHero(currentHero);
          CanvasEditor.render('masterCanvasFrame');
          DataLayer.saveHeroDraft(currentHero);
          showToast('↩️ Hoàn tác (Undo)', 'info');
        }
      });
    }

    if (btnGlobalRedo) {
      btnGlobalRedo.addEventListener('click', () => {
        if (typeof HistoryManager === 'undefined' || !HistoryManager.canRedo()) return;
        const next = HistoryManager.redo();
        if (next && activeMode === 'hero') {
          currentHero = next;
          loadHeroToInspector();
          CanvasEditor.setHero(currentHero);
          CanvasEditor.render('masterCanvasFrame');
          DataLayer.saveHeroDraft(currentHero);
          showToast('↪️ Làm lại (Redo)', 'info');
        }
      });
    }

    // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
    window.addEventListener('keydown', (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (typeof HistoryManager !== 'undefined' && HistoryManager.canUndo()) {
          e.preventDefault();
          if (btnGlobalUndo) btnGlobalUndo.click();
        }
      } else if (isMod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        if (typeof HistoryManager !== 'undefined' && HistoryManager.canRedo()) {
          e.preventDefault();
          if (btnGlobalRedo) btnGlobalRedo.click();
        }
      }
    });
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────────────────────
  function setupEventListeners() {
    // Mode Switcher Tabs
    studioModeTabs.forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    // Select Dropdowns
    if (heroSelect) heroSelect.addEventListener('change', (e) => selectHero(e.target.value));
    if (honhachSelect) honhachSelect.addEventListener('change', (e) => selectHonhach(e.target.value));
    if (honcotSelect) honcotSelect.addEventListener('change', (e) => selectHoncot(e.target.value));

    // Hero Top Buttons
    const templatePickerModal = document.getElementById('templatePickerModal');
    const tplHeroName = document.getElementById('tplHeroName');
    const btnConfirmCreateFromTemplate = document.getElementById('btnConfirmCreateFromTemplate');

    if (btnAddHero) {
      btnAddHero.addEventListener('click', () => {
        if (templatePickerModal) {
          if (tplHeroName) tplHeroName.value = 'Hồn Sư Mới';
          templatePickerModal.classList.add('active');
        } else {
          const name = prompt('Nhập tên Hồn Sư mới:', 'Hồn Sư Mới');
          if (!name) return;
          const slug = 'hero_' + Date.now().toString().slice(-4);
          DataLayer.createNewHero(slug, name).then(newHero => {
            DataLayer.getHeroesList().then(list => {
              heroesList = list;
              populateHeroSelect();
              selectHero(newHero.id);
              showToast(`Đã tạo Hồn Sư "${name}"!`, 'success');
              setDirtyState(true);
            });
          });
        }
      });
    }

    // Archetype Card Selection in Modal
    if (templatePickerModal) {
      templatePickerModal.querySelectorAll('.archetype-card').forEach(card => {
        card.addEventListener('click', () => {
          templatePickerModal.querySelectorAll('.archetype-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        });
      });
    }

    // Confirm Create from Template
    if (btnConfirmCreateFromTemplate) {
      btnConfirmCreateFromTemplate.addEventListener('click', async () => {
        const name = (tplHeroName ? tplHeroName.value.trim() : '') || 'Hồn Sư Mới';
        const selectedCard = templatePickerModal ? templatePickerModal.querySelector('.archetype-card.selected') : null;
        const archetype = selectedCard ? selectedCard.getAttribute('data-archetype') : 'cuong_cong';
        const slug = 'hero_' + Date.now().toString().slice(-4);

        const newHero = await DataLayer.createNewHero(slug, name, archetype, 'SSR');
        heroesList = await DataLayer.getHeroesList();
        populateHeroSelect();
        if (templatePickerModal) templatePickerModal.classList.remove('active');
        await selectHero(newHero.id);
        setDirtyState(true);
        showToast(`🎉 Đã tạo Hồn Sư "${name}" theo hệ ${newHero.role}!`, 'success');
      });
    }

    if (btnCloneHero) {
      btnCloneHero.addEventListener('click', async () => {
        if (!currentHero) return;
        const cloned = await DataLayer.cloneHero(currentHero.id);
        if (cloned) {
          heroesList = await DataLayer.getHeroesList();
          populateHeroSelect();
          await selectHero(cloned.id);
          showToast('Đã nhân bản Hồn Sư!', 'success');
        }
      });
    }

    if (btnDeleteHero) {
      btnDeleteHero.addEventListener('click', async () => {
        if (!currentHero) return;
        if (confirm(`Xác nhận xóa Hồn Sư "${currentHero.name}"?`)) {
          DataLayer.deleteHero(currentHero.id);
          heroesList = await DataLayer.getHeroesList();
          populateHeroSelect();
          if (heroesList.length > 0) await selectHero(heroesList[0].id);
          showToast('Đã xóa Hồn Sư.', 'danger');
        }
      });
    }

    // Honhach Top Buttons
    if (btnAddHonhach) {
      btnAddHonhach.addEventListener('click', async () => {
        const nameVi = prompt('Nhập tên Bộ Hồn Hạch mới:', 'Bộ Hồn Hạch Mới');
        if (!nameVi) return;
        const slug = 'honhach_' + Date.now().toString().slice(-4);
        const newHonhach = await DataLayer.createNewHonhach(slug, nameVi);
        honhachList = await DataLayer.getHonhachList();
        populateHonhachSelect();
        await selectHonhach(newHonhach.id);
        showToast(`Đã thêm Bộ "${nameVi}"!`, 'success');
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
          showToast('Đã nhân bản Bộ Hồn Hạch!', 'success');
        }
      });
    }

    if (btnDeleteHonhach) {
      btnDeleteHonhach.addEventListener('click', async () => {
        if (!currentHonhach) return;
        if (confirm(`Xóa Bộ "${currentHonhach.nameVi || currentHonhach.name}"?`)) {
          DataLayer.deleteHonhach(currentHonhach.id);
          honhachList = await DataLayer.getHonhachList();
          populateHonhachSelect();
          if (honhachList.length > 0) await selectHonhach(honhachList[0].id);
          showToast('Đã xóa Bộ Hồn Hạch.', 'danger');
        }
      });
    }

    // Honcot Top Buttons
    if (btnAddHoncot) {
      btnAddHoncot.addEventListener('click', async () => {
        const nameVi = prompt('Nhập tên Hồn Cốt mới:', 'Xương Đầu Mới');
        if (!nameVi) return;
        const newHoncot = await DataLayer.createNewHoncot(null, nameVi, 'head');
        honcotList = await DataLayer.getHoncotList();
        populateHoncotSelect();
        await selectHoncot(newHoncot.id);
        showToast(`Đã thêm Hồn Cốt "${nameVi}"!`, 'success');
      });
    }

    if (btnCloneHoncot) {
      btnCloneHoncot.addEventListener('click', async () => {
        if (!currentHoncot) return;
        const cloned = await DataLayer.cloneHoncot(currentHoncot.id);
        if (cloned) {
          honcotList = await DataLayer.getHoncotList();
          populateHoncotSelect();
          await selectHoncot(cloned.id);
          showToast('Đã nhân bản Hồn Cốt!', 'success');
        }
      });
    }

    if (btnDeleteHoncot) {
      btnDeleteHoncot.addEventListener('click', async () => {
        if (!currentHoncot) return;
        if (confirm(`Xóa Hồn Cốt "${currentHoncot.nameVi || currentHoncot.name}"?`)) {
          DataLayer.deleteHoncot(currentHoncot.id);
          honcotList = await DataLayer.getHoncotList();
          populateHoncotSelect();
          if (honcotList.length > 0) await selectHoncot(honcotList[0].id);
          showToast('Đã xóa Hồn Cốt.', 'danger');
        }
      });
    }

    // ─── DISK & DATABASE BUTTONS ───────────────────────────────────────────
    if (btnConnectFolder) {
      btnConnectFolder.addEventListener('click', async () => {
        try {
          await DataLayer.connectLocalProjectDirectory();
          if (folderStatusBadge) {
            folderStatusBadge.textContent = '🟢 Đã kết nối Disk';
            folderStatusBadge.style.color = '#34d399';
          }
          showToast('📂 Kết nối thư mục local thành công!', 'success');
        } catch (err) {
          if (err.name !== 'AbortError') showToast(`⚠️ ${err.message}`, 'danger');
        }
      });
    }

    if (btnPullFromDisk) {
      btnPullFromDisk.addEventListener('click', async () => {
        try {
          showToast('⏳ Đang nạp toàn bộ DB từ máy...', 'info');
          const res = await DataLayer.pullAllFromLocalDisk();
          heroesList = await DataLayer.getHeroesList();
          honhachList = await DataLayer.getHonhachList();
          honcotList = await DataLayer.getHoncotList();
          keywordsDict = await DataLayer.getKeywords();

          populateHeroSelect();
          populateHonhachSelect();
          populateHoncotSelect();

          if (activeMode === 'hero' && currentHero) await selectHero(currentHero.id);
          else if (activeMode === 'honhach' && currentHonhach) await selectHonhach(currentHonhach.id);
          else if (activeMode === 'honcot' && currentHoncot) await selectHoncot(currentHoncot.id);

          showToast(`🎉 Đã nạp ${res.heroesCount} Hồn Sư, ${res.honhachCount} Hồn Hạch, ${res.honcotCount} Hồn Cốt từ máy!`, 'success');
        } catch (err) {
          showToast(`⚠️ Lỗi nạp DB: ${err.message}`, 'danger');
        }
      });
    }

    if (btnSaveDirectToDisk) {
      btnSaveDirectToDisk.addEventListener('click', async () => {
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }

        try {
          showToast('⏳ Đang lưu vào đĩa...', 'info');
          await DataLayer.saveAllDirectToDisk();
          setDirtyState(false);
          showToast('🎉 Đã ghi lưu toàn bộ JSON vào đĩa cứng máy tính!', 'success');
        } catch (err) {
          showToast(`⚠️ Lỗi lưu đĩa: ${err.message}`, 'danger');
        }
      });
    }

    if (btnImportDBBundle && dbBundleFileInput) {
      btnImportDBBundle.addEventListener('click', () => dbBundleFileInput.click());
      dbBundleFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const bundle = JSON.parse(ev.target.result);
            DataLayer.importDatabaseBundle(bundle);
            heroesList = await DataLayer.getHeroesList();
            honhachList = await DataLayer.getHonhachList();
            honcotList = await DataLayer.getHoncotList();
            keywordsDict = await DataLayer.getKeywords();

            populateHeroSelect();
            populateHonhachSelect();
            populateHoncotSelect();

            if (heroesList.length > 0) await selectHero(heroesList[0].id);
            showToast('📦 Đã import gói Database thành công!', 'success');
          } catch (err) {
            showToast(`⚠️ Lỗi import: ${err.message}`, 'danger');
          }
        };
        reader.readAsText(file);
      });
    }

    if (btnExportDBBundle) {
      btnExportDBBundle.addEventListener('click', () => {
        const bundle = DataLayer.exportDatabaseBundle();
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `douluo_database_bundle_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('📦 Đã xuất file Database bundle về máy!', 'success');
      });
    }

    // ─── V6.0 NEW FEATURES: COMMAND PALETTE, HEALTH, DIFF, EFFECT BUILDER ──

    // 1. UNIVERSAL COMMAND PALETTE (⌘K / Ctrl+K)
    const btnOpenCmdPalette = document.getElementById('btnOpenCmdPalette');
    const cmdPaletteBackdrop = document.getElementById('cmdPaletteBackdrop');
    const cmdPaletteInput = document.getElementById('cmdPaletteInput');
    const cmdResultsList = document.getElementById('cmdResultsList');
    let cmdSelectedIndex = 0;
    let currentCmdResults = [];

    function openCommandPalette() {
      if (!cmdPaletteBackdrop) return;
      if (window.CoreServices && CoreServices.CommandPaletteService) {
        CoreServices.CommandPaletteService.init([
          { id: 'mode_hero', label: 'Chuyển sang Quản Trị Hồn Sư', icon: '👤', category: 'Chế Độ' },
          { id: 'mode_honhach', label: 'Chuyển sang Quản Trị Hồn Hạch', icon: '🦴', category: 'Chế Độ' },
          { id: 'mode_honcot', label: 'Chuyển sang Quản Trị Hồn Cốt', icon: '🦴', category: 'Chế Độ' },
          { id: 'mode_rawjson', label: 'Chuyển sang Trình Soạn Thảo Raw JSON', icon: '📜', category: 'Chế Độ' }
        ]);
      }
      cmdPaletteBackdrop.classList.add('active');
      cmdPaletteInput.value = '';
      renderCommandResults('');
      setTimeout(() => cmdPaletteInput.focus(), 50);
    }

    function closeCommandPalette() {
      if (!cmdPaletteBackdrop) return;
      cmdPaletteBackdrop.classList.remove('active');
    }

    function renderCommandResults(query) {
      if (!cmdResultsList || !window.CoreServices) return;
      currentCmdResults = CoreServices.CommandPaletteService.search(query);
      cmdSelectedIndex = 0;

      if (currentCmdResults.length === 0) {
        cmdResultsList.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Không tìm thấy kết quả phù hợp cho "${escapeHtml(query)}"</div>`;
        return;
      }

      cmdResultsList.innerHTML = currentCmdResults.map((item, idx) => `
        <div class="cmd-item ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
          <span class="cmd-item-icon">${item.icon || '⚡'}</span>
          <div class="cmd-item-info">
            <div class="cmd-item-title">${escapeHtml(item.label)}</div>
            <div class="cmd-item-category">${escapeHtml(item.category || '')}</div>
          </div>
          ${item.badge ? `<span class="cmd-item-badge">${escapeHtml(item.badge)}</span>` : ''}
          ${item.shortcut ? `<span class="cmd-shortcut-badge">⌘${escapeHtml(item.shortcut)}</span>` : ''}
        </div>
      `).join('');

      // Add click listener
      cmdResultsList.querySelectorAll('.cmd-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.index);
          executeCommand(currentCmdResults[idx]);
        });
      });
    }

    async function executeCommand(item) {
      if (!item) return;
      closeCommandPalette();

      if (item.type === 'action') {
        switch(item.id) {
          case 'create_hero':
            if (templatePickerModal) templatePickerModal.classList.add('active');
            break;
          case 'create_honhach':
            if (btnAddHonhach) btnAddHonhach.click();
            break;
          case 'create_honcot':
            if (btnAddHoncot) btnAddHoncot.click();
            break;
          case 'open_health':
            openDataHealthModal();
            break;
          case 'open_diff':
            openDiffModal();
            break;
          case 'connect_disk':
            if (btnConnectFolder) btnConnectFolder.click();
            break;
          case 'save_disk':
            if (btnSaveDirectToDisk) btnSaveDirectToDisk.click();
            break;
          case 'export_json':
            if (btnExportDBBundle) btnExportDBBundle.click();
            break;
          case 'open_effect_builder':
            openEffectBuilderModal();
            break;
          case 'goto_viewer':
            window.open('index.html', '_blank');
            break;
          case 'goto_compare':
            window.open('compare.html', '_blank');
            break;
          case 'mode_hero':
            switchMode('hero');
            break;
          case 'mode_honhach':
            switchMode('honhach');
            break;
          case 'mode_honcot':
            switchMode('honcot');
            break;
          case 'mode_rawjson':
            switchMode('rawjson');
            break;
        }
      } else if (item.type === 'entity_hero') {
        await switchMode('hero');
        await selectHero(item.entityId);
      } else if (item.type === 'entity_honhach') {
        await switchMode('honhach');
        await selectHonhach(item.entityId);
      } else if (item.type === 'entity_keyword') {
        showToast(`Từ khóa [${item.label}] đang được áp dụng trong từ điển.`, 'info');
      }
    }

    if (btnOpenCmdPalette) {
      btnOpenCmdPalette.addEventListener('click', openCommandPalette);
    }

    if (cmdPaletteBackdrop) {
      cmdPaletteBackdrop.addEventListener('click', (e) => {
        if (e.target === cmdPaletteBackdrop) closeCommandPalette();
      });
    }

    if (cmdPaletteInput) {
      cmdPaletteInput.addEventListener('input', (e) => {
        renderCommandResults(e.target.value);
      });

      cmdPaletteInput.addEventListener('keydown', (e) => {
        const items = cmdResultsList.querySelectorAll('.cmd-item');
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          cmdSelectedIndex = (cmdSelectedIndex + 1) % items.length;
          updateCmdSelection(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          cmdSelectedIndex = (cmdSelectedIndex - 1 + items.length) % items.length;
          updateCmdSelection(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentCmdResults[cmdSelectedIndex]) {
            executeCommand(currentCmdResults[cmdSelectedIndex]);
          }
        } else if (e.key === 'Escape') {
          closeCommandPalette();
        }
      });
    }

    function updateCmdSelection(items) {
      items.forEach((it, i) => {
        if (i === cmdSelectedIndex) {
          it.classList.add('selected');
          it.scrollIntoView({ block: 'nearest' });
        } else {
          it.classList.remove('selected');
        }
      });
    }

    // Global Shortcut Listener (⌘K / Ctrl+K)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
    });

    // 2. DATA HEALTH DIAGNOSTIC
    const btnOpenDataHealth = document.getElementById('btnOpenDataHealth');
    const dataHealthModal = document.getElementById('dataHealthModal');
    const btnRerunHealthCheck = document.getElementById('btnRerunHealthCheck');

    function openDataHealthModal() {
      if (!dataHealthModal || !window.CoreServices) return;
      dataHealthModal.classList.add('active');
      runDataHealthDiagnostics();
    }

    function runDataHealthDiagnostics() {
      const res = CoreServices.DataHealthEngine.runDiagnostics();
      const scoreRing = document.getElementById('healthScoreRing');
      const scoreVal = document.getElementById('healthScoreVal');
      const statsGrid = document.getElementById('healthSummaryStats');
      const issuesList = document.getElementById('healthIssuesList');
      const countEl = document.getElementById('healthIssuesCount');

      if (scoreRing && scoreVal) {
        scoreRing.style.setProperty('--health-score', res.score);
        scoreVal.textContent = res.score;
        if (res.score >= 90) scoreVal.style.color = '#6ee7b7';
        else if (res.score >= 70) scoreVal.style.color = '#fde047';
        else scoreVal.style.color = '#fca5a5';
      }

      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="health-stat-pill"><span>👤 Hồn Sư:</span> <strong>${res.summary.heroesCount}</strong></div>
          <div class="health-stat-pill"><span>🦴 Hồn Hạch:</span> <strong>${res.summary.soulCoresCount}</strong></div>
          <div class="health-stat-pill"><span>🦴 Hồn Cốt:</span> <strong>${res.summary.soulBonesCount}</strong></div>
          <div class="health-stat-pill"><span>✨ Từ Khóa:</span> <strong>${res.summary.keywordsCount}</strong></div>
        `;
      }

      if (countEl) {
        countEl.textContent = `${res.errors.length} lỗi, ${res.warnings.length} cảnh báo`;
      }

      if (issuesList) {
        if (res.allIssues.length === 0) {
          issuesList.innerHTML = `<div style="text-align:center; padding:2rem; color:#6ee7b7;">🎉 Dữ liệu đạt độ toàn vẹn 100%! Không có lỗi nào.</div>`;
        } else {
          issuesList.innerHTML = res.allIssues.map(issue => `
            <div class="health-issue-item ${issue.type}" data-entity-type="${issue.entityType}" data-entity-id="${issue.entityId}">
              <span style="font-size:1.1rem;">${issue.type === 'error' ? '❌' : '⚠️'}</span>
              <div style="flex:1;">
                <div style="font-weight:700; color:#fff; display:flex; justify-content:space-between;">
                  <span>${escapeHtml(issue.entityName)}</span>
                  <span style="font-size:0.7rem; color:var(--text-muted);">${issue.entityType.toUpperCase()}</span>
                </div>
                <div style="color:${issue.type === 'error' ? '#fca5a5' : '#fef08a'}; font-size:0.75rem; margin-top:2px;">
                  ${escapeHtml(issue.message)}
                </div>
              </div>
            </div>
          `).join('');

          issuesList.querySelectorAll('.health-issue-item').forEach(el => {
            el.addEventListener('click', async () => {
              const eType = el.dataset.entityType;
              const eId = el.dataset.entityId;
              dataHealthModal.classList.remove('active');
              if (eType === 'hero') {
                await switchMode('hero');
                await selectHero(eId);
              } else if (eType === 'honhach') {
                await switchMode('honhach');
                await selectHonhach(eId);
              }
              showToast(`Đã mở [${eId}] để khắc phục.`, 'info');
            });
          });
        }
      }
    }

    if (btnOpenDataHealth) btnOpenDataHealth.addEventListener('click', openDataHealthModal);
    if (btnRerunHealthCheck) btnRerunHealthCheck.addEventListener('click', runDataHealthDiagnostics);

    // 3. DIFF VIEWER MODAL
    const btnOpenDiffViewer = document.getElementById('btnOpenDiffViewer');
    const diffViewerModal = document.getElementById('diffViewerModal');
    const btnDiffSaveToDisk = document.getElementById('btnDiffSaveToDisk');

    function openDiffModal() {
      if (!diffViewerModal || !window.CoreServices) return;
      diffViewerModal.classList.add('active');

      let currentData = null;
      let title = '';
      if (activeMode === 'hero' && currentHero) {
        currentData = currentHero;
        title = `Hồn Sư: ${currentHero.name}`;
      } else if (activeMode === 'honhach' && currentHonhach) {
        currentData = currentHonhach;
        title = `Bộ Hồn Hạch: ${currentHonhach.nameVi || currentHonhach.id}`;
      } else if (activeMode === 'honcot' && currentHoncot) {
        currentData = currentHoncot;
        title = `Hồn Cốt: ${currentHoncot.nameVi || currentHoncot.id}`;
      } else {
        currentData = DataLayer.exportDatabaseBundle();
        title = 'Toàn Bộ Database';
      }

      // Read clean base JSON or compare against localStorage
      const cached = localStorage.getItem('douluo_studio_db');
      const baseline = cached ? JSON.parse(cached) : {};
      
      const diffRes = CoreServices.DiffEngine.computeDiff(baseline[currentData.id] || {}, currentData);
      
      const statsEl = document.getElementById('diffViewerStats');
      const contentEl = document.getElementById('diffViewerContent');

      if (statsEl) {
        statsEl.innerHTML = `
          <span style="font-weight:700; color:#fff;">${title}</span>
          <span style="color:#86efac;">+${diffRes.addedCount} dòng mới</span>
          <span style="color:#fca5a5;">-${diffRes.removedCount} dòng xóa</span>
        `;
      }

      if (contentEl) {
        contentEl.innerHTML = CoreServices.DiffEngine.renderDiffHTML(diffRes);
      }
    }

    if (btnOpenDiffViewer) btnOpenDiffViewer.addEventListener('click', openDiffModal);
    if (btnDiffSaveToDisk) {
      btnDiffSaveToDisk.addEventListener('click', async () => {
        diffViewerModal.classList.remove('active');
        if (btnSaveDirectToDisk) btnSaveDirectToDisk.click();
      });
    }

    // 4. HONHACH EFFECT BUILDER MODAL
    const btnOpenEffectBuilder = document.getElementById('btnOpenEffectBuilder');
    const effectBuilderModal = document.getElementById('effectBuilderModal');
    const bldTriggerSelect = document.getElementById('bldTriggerSelect');
    const bldActionSelect = document.getElementById('bldActionSelect');
    const bldEffectSelect = document.getElementById('bldEffectSelect');
    const bldBaseVal = document.getElementById('bldBaseVal');
    const bldStepVal = document.getElementById('bldStepVal');
    const bldDuration = document.getElementById('bldDuration');
    const bldCooldown = document.getElementById('bldCooldown');
    const bldPreviewText = document.getElementById('bldPreviewText');
    const bldPreviewCurve = document.getElementById('bldPreviewCurve');
    const btnApplyEffectBuilder = document.getElementById('btnApplyEffectBuilder');

    function openEffectBuilderModal() {
      if (!effectBuilderModal || !window.CoreServices) return;
      const presets = CoreServices.EffectBuilderEngine.presets;

      if (bldTriggerSelect && bldTriggerSelect.options.length === 0) {
        bldTriggerSelect.innerHTML = presets.triggers.map(t => `<option value="${t.name}">${t.name}</option>`).join('');
      }
      if (bldActionSelect && bldActionSelect.options.length === 0) {
        bldActionSelect.innerHTML = presets.actions.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
      }
      if (bldEffectSelect && bldEffectSelect.options.length === 0) {
        bldEffectSelect.innerHTML = presets.effects.map(e => `<option value="${e.name}" data-base="${e.base}" data-step="${e.step}">${e.name}</option>`).join('');
      }

      effectBuilderModal.classList.add('active');
      updateEffectBuilderPreview();
    }

    function updateEffectBuilderPreview() {
      if (!window.CoreServices || !bldPreviewText) return;
      const trigger = bldTriggerSelect ? bldTriggerSelect.value : '';
      const action = bldActionSelect ? bldActionSelect.value : '';
      const effectName = bldEffectSelect ? bldEffectSelect.value : '';
      const duration = bldDuration ? bldDuration.value : 15;
      const cooldown = bldCooldown ? bldCooldown.value : 30;
      const base = bldBaseVal ? parseFloat(bldBaseVal.value) || 7.5 : 7.5;
      const step = bldStepVal ? parseFloat(bldStepVal.value) || 1.5 : 1.5;

      const desc = CoreServices.EffectBuilderEngine.buildDescription({ trigger, action, effectName, duration, cooldown });
      bldPreviewText.textContent = desc;

      const stats = CoreServices.EffectBuilderEngine.generateScalingValues(base, step);
      if (bldPreviewCurve) {
        bldPreviewCurve.innerHTML = CoreServices.ScalingGraphRenderer.renderMiniCurve(stats, { width: 320, height: 75, color: '#06B6D4' });
      }
    }

    [bldTriggerSelect, bldActionSelect, bldEffectSelect, bldBaseVal, bldStepVal, bldDuration, bldCooldown].forEach(el => {
      if (el) {
        el.addEventListener('change', () => {
          if (el === bldEffectSelect) {
            const opt = bldEffectSelect.options[bldEffectSelect.selectedIndex];
            if (opt && opt.dataset.base && bldBaseVal && bldStepVal) {
              bldBaseVal.value = opt.dataset.base;
              bldStepVal.value = opt.dataset.step;
            }
          }
          updateEffectBuilderPreview();
        });
        el.addEventListener('input', updateEffectBuilderPreview);
      }
    });

    if (btnOpenEffectBuilder) btnOpenEffectBuilder.addEventListener('click', openEffectBuilderModal);

    if (btnApplyEffectBuilder) {
      btnApplyEffectBuilder.addEventListener('click', () => {
        if (!currentHonhach) return;
        const trigger = bldTriggerSelect ? bldTriggerSelect.value : '';
        const action = bldActionSelect ? bldActionSelect.value : '';
        const effectName = bldEffectSelect ? bldEffectSelect.value : '';
        const duration = bldDuration ? bldDuration.value : 15;
        const cooldown = bldCooldown ? bldCooldown.value : 30;
        const base = bldBaseVal ? parseFloat(bldBaseVal.value) || 7.5 : 7.5;
        const step = bldStepVal ? parseFloat(bldStepVal.value) || 1.5 : 1.5;

        const desc = CoreServices.EffectBuilderEngine.buildDescription({ trigger, action, effectName, duration, cooldown });
        const stats = CoreServices.EffectBuilderEngine.generateScalingValues(base, step);
        const extra24 = CoreServices.EffectBuilderEngine.buildBreakthrough24(5, 5, effectName);

        if (honhachSet4DescInput) honhachSet4DescInput.value = desc;
        if (honhachSet4Extra24Input) honhachSet4Extra24Input.value = extra24;

        currentHonhach.set4 = {
          desc,
          extra24,
          stats
        };

        populateHonhachStarGrid();
        saveHonhachToMemory();
        effectBuilderModal.classList.remove('active');
        showToast('⚡ Đã áp dụng hiệu ứng và 6 mốc sao vào Hồn Hạch!', 'success');
      });
    }

    // 5. QUICK DUPLICATE MODAL
    const quickDuplicateModal = document.getElementById('quickDuplicateModal');
    const dupModalTitle = document.getElementById('dupModalTitle');
    const dupNewName = document.getElementById('dupNewName');
    const dupNewId = document.getElementById('dupNewId');
    const btnConfirmQuickDuplicate = document.getElementById('btnConfirmQuickDuplicate');
    let duplicateTargetType = 'hero';

    function openQuickDuplicateModal(type) {
      duplicateTargetType = type;
      if (!quickDuplicateModal) return;

      if (type === 'hero' && currentHero) {
        dupModalTitle.textContent = `📋 Nhân Bản Hồn Sư: ${currentHero.name}`;
        dupNewName.value = `${currentHero.name} (Bản sao)`;
        dupNewId.value = `${currentHero.id}_copy_${Date.now().toString().slice(-3)}`;
      } else if (type === 'honhach' && currentHonhach) {
        dupModalTitle.textContent = `📋 Nhân Bản Bộ Hồn Hạch: ${currentHonhach.nameVi || currentHonhach.id}`;
        dupNewName.value = `${currentHonhach.nameVi || currentHonhach.id} (Bản sao)`;
        dupNewId.value = `${currentHonhach.id}_copy_${Date.now().toString().slice(-3)}`;
      } else if (type === 'honcot' && currentHoncot) {
        dupModalTitle.textContent = `📋 Nhân Bản Hồn Cốt: ${currentHoncot.nameVi || currentHoncot.id}`;
        dupNewName.value = `${currentHoncot.nameVi || currentHoncot.id} (Bản sao)`;
        dupNewId.value = `${currentHoncot.id}_copy_${Date.now().toString().slice(-3)}`;
      }

      quickDuplicateModal.classList.add('active');
      setTimeout(() => dupNewName.focus(), 50);
    }

    if (btnCloneHero) {
      btnCloneHero.replaceWith(btnCloneHero.cloneNode(true));
      document.getElementById('btnCloneHero').addEventListener('click', () => openQuickDuplicateModal('hero'));
    }
    if (btnCloneHonhach) {
      btnCloneHonhach.replaceWith(btnCloneHonhach.cloneNode(true));
      document.getElementById('btnCloneHonhach').addEventListener('click', () => openQuickDuplicateModal('honhach'));
    }
    if (btnCloneHoncot) {
      btnCloneHoncot.replaceWith(btnCloneHoncot.cloneNode(true));
      document.getElementById('btnCloneHoncot').addEventListener('click', () => openQuickDuplicateModal('honcot'));
    }

    if (btnConfirmQuickDuplicate) {
      btnConfirmQuickDuplicate.addEventListener('click', async () => {
        const newName = dupNewName.value.trim();
        const newId = dupNewId.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (!newName || !newId) {
          showToast('Vui lòng nhập tên và ID mới!', 'warning');
          return;
        }

        quickDuplicateModal.classList.remove('active');

        if (duplicateTargetType === 'hero' && currentHero) {
          const cloned = await DataLayer.cloneHero(currentHero.id, newId, newName);
          heroesList = await DataLayer.getHeroesList();
          populateHeroSelect();
          await selectHero(cloned.id);
          showToast(`🚀 Đã nhân bản thành "${newName}"!`, 'success');
        } else if (duplicateTargetType === 'honhach' && currentHonhach) {
          const cloned = await DataLayer.cloneHonhach(currentHonhach.id, newId, newName);
          honhachList = await DataLayer.getHonhachList();
          populateHonhachSelect();
          await selectHonhach(cloned.id);
          showToast(`🚀 Đã nhân bản Bộ "${newName}"!`, 'success');
        } else if (duplicateTargetType === 'honcot' && currentHoncot) {
          const cloned = await DataLayer.cloneHoncot(currentHoncot.id, newId, newName);
          honcotList = await DataLayer.getHoncotList();
          populateHoncotSelect();
          await selectHoncot(cloned.id);
          showToast(`🚀 Đã nhân bản Hồn Cốt "${newName}"!`, 'success');
        }
      });
    }
  }

  // Khởi động Studio sau khi tất cả các DOM variables đã được khai báo
  await initStudio();
});

