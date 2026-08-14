/**
 * CanvasEditor Module V3.3 — Douluo Wiki Studio
 * Interactive Visual Inline Editor Canvas (Panel 2) for:
 * 1. Hero Mode (Quản lý Hồn Sư)
 * 2. Honhach Mode (Quản lý Hồn Hạch)
 * 3. Honcot Mode (Quản lý Hồn Cốt)
 * 
 * Features:
 * - Contenteditable live sync with floating toolbar & keyboard shortcuts
 * - Inline rarity/slot/role dropdowns & toggle badges
 * - Click-to-upload avatar & skill/item icons
 * - Two-way auto-synchronization with sidebar forms, DataLayer drafts, and live previews.
 */

const CanvasEditor = (() => {
  // ─── State ───────────────────────────────────────────────────────────────
  let _hero = null;
  let _onSave = null;
  let _activeGroupId = 'honky';
  let _activeBranchIdx = 0;
  let _activeSkillIdx = 0;
  let _toolbar = null;
  let _activeField = null;
  let _originalValue = '';

  // ─── Public API ───────────────────────────────────────────────────────────

  function init({ hero, onSave, groupId = 'honky', branchIdx = 0 }) {
    _hero = hero;
    _onSave = onSave;
    _activeGroupId = groupId;
    _activeBranchIdx = branchIdx;
    _activeSkillIdx = 0;
    _createToolbar();
  }

  function setGroup(groupId) {
    if (_activeGroupId !== groupId) _activeSkillIdx = 0;
    _activeGroupId = groupId;
  }
  function setBranch(idx)  { _activeBranchIdx = idx; }
  function setGroupAndBranch(groupId, branchIdx) {
    if (_activeGroupId !== groupId) _activeSkillIdx = 0;
    _activeGroupId = groupId;
    _activeBranchIdx = branchIdx;
  }
  function setHero(hero)   { _hero = hero; }

  /** Full render of Hero Canvas into target container by id */
  function render(containerId = 'heroEditorCanvasFrame') {
    const container = document.getElementById(containerId);
    if (!container || !_hero) return;
    container.innerHTML = _buildHeroCanvasHTML();
    _bindHeroEvents(container);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. HERO CANVAS BUILDERS & EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  function _buildHeroCanvasHTML() {
    if (!_hero) return `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Chưa có Hồn Sư được chọn.</p>`;

    const skills = _getSkillsForGroup();
    const skill  = skills[_activeSkillIdx] || skills[0] || null;

    return `
      <!-- ① HERO HEADER — fully editable -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:12px; padding:1rem; margin-bottom:1rem; box-shadow:0 8px 24px rgba(0,0,0,0.2);">
        <div style="display:flex; gap:1rem; align-items:flex-start;">

          <!-- Avatar -->
          <div class="ce-avatar-wrapper" id="ceAvatarWrapper" title="Click để đổi ảnh avatar" style="position:relative; cursor:pointer;">
            <img id="ceAvatarImg"
              src="${_hero.avatar || 'assets/heroes/oscar/avatar.webp'}"
              style="width:80px; height:80px; border-radius:10px; object-fit:cover; display:block; border:1.5px solid var(--border-glass);"
              onerror="this.src='assets/heroes/oscar/avatar.webp'">
            <div style="position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.7); border-radius:4px; padding:1px 4px; font-size:0.65rem; color:#fff;">📷</div>
            <input type="file" id="ceAvatarFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <!-- Rarity (inline select) + Role (editable) -->
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center; margin-bottom:0.4rem;">
              <!-- Rarity dropdown -->
              <select class="ce-rarity-select" data-ce-field="rarity"
                style="background:rgba(255,255,255,0.06); border:1px solid var(--border-glass); font-size:0.75rem; font-weight:800; color:${_rarityColor(_hero.rarity)}; cursor:pointer; padding:0.2rem 0.5rem; border-radius:6px; text-align:center;"
                title="Click để đổi độ hiếm">
                ${['N','R','SR','SSR','SP'].map(r => `<option value="${r}" ${_hero.rarity === r ? 'selected' : ''} style="background:#1e293b; color:#fff;">${r}</option>`).join('')}
              </select>
              <!-- Role -->
              <span class="ce-field role-badge"
                contenteditable="true"
                data-ce-field="role"
                style="padding:0.2rem 0.55rem; cursor:text;"
                title="Click để sửa Hệ / Vai Trò">❖ ${_hero.role || 'Hỗ Trợ'}</span>
            </div>

            <!-- Hero Name -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-field="name"
              style="font-family:var(--font-heading); font-size:1.4rem; font-weight:900; color:#fff; line-height:1.2; margin-bottom:0.3rem;"
              title="Click để sửa Tên Hồn Sư">${_hero.name || 'Tên Hồn Sư'}</div>

            <!-- Title + Wusoul row -->
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; align-items:center; margin-bottom:0.3rem;">
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="title"
                style="font-size:0.82rem; color:var(--accent-gold); font-weight:600;"
                title="Click để sửa Danh Hiệu">${_hero.title || '(Danh Hiệu)'}</span>
              <span style="color:var(--border-glass);">•</span>
              <span style="font-size:0.82rem; color:var(--text-sub);">Võ Hồn:</span>
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="wusoul"
                style="font-size:0.82rem; color:#a5f3fc; font-weight:700;"
                title="Click để sửa Võ Hồn">${_hero.wusoul || '(Võ Hồn)'}</span>
            </div>

            <!-- Bio -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-field="bio"
              style="font-size:0.82rem; color:var(--text-sub); line-height:1.5; min-height:1.5rem; padding:0.2rem 0;"
              title="Click để sửa Tiểu Sử">${_hero.bio || '(Tiểu Sử ngắn...)'}</div>
          </div>
        </div>
      </div>

      <!-- ② BRANCH TABS — Quản lý thêm/xóa/sửa tên nhánh trực tiếp -->
      ${_buildBranchTabs()}

      <!-- ③ SKILL NAVIGATOR — Quản lý Thêm/Nhân bản/Xóa & duyệt kỹ năng -->
      ${_buildSkillNavigator(skills, skill)}

      <!-- ④ RING MILESTONES — Thêm / Xóa / Sửa mốc niên hạn -->
      ${skill && skill.ringUpgrades ? _buildRingMilestones(skill) : ''}

      <!-- ⑤ CUSTOM FEATURE BLOCKS — Vẽ thêm khối tính năng / thuộc tính mở rộng -->
      ${_buildCustomFeatureBlocks()}

      <!-- ⑥ HINT -->
      <div style="margin-top:0.75rem; padding:0.4rem 0.75rem; background:rgba(251,191,36,0.05); border:1px dashed rgba(251,191,36,0.25); border-radius:8px; font-size:0.7rem; color:rgba(251,191,36,0.8); text-align:center;">
        ✏️ Canvas Editor toàn quyền: Nhấp để sửa chữ, bấm nút ➕/🗑️ để Thêm/Xóa Nhánh, Kỹ Năng, Mốc Niên Hạn và Vẽ thêm Khối Tính Năng
      </div>
    `;
  }

  function _rarityColor(rarity) {
    const map = { SP: '#ef4444', SSR: '#FBBF24', SR: '#c084fc', R: '#60a5fa', N: '#94a3b8' };
    return map[rarity] || '#fff';
  }

  function _buildBranchTabs() {
    const rule = _getGroupRule();
    if (!rule || !rule.hasBranch) return '';
    const branches = _hero.branches || [];

    return `
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.75rem; align-items:center; background:rgba(255,255,255,0.02); padding:0.4rem 0.6rem; border-radius:8px; border:1px solid var(--border-glass);">
        <span style="font-size:0.75rem; font-weight:800; color:var(--accent-gold); margin-right:0.25rem;">🌿 NHÁNH:</span>
        ${branches.map((b, idx) => `
          <div class="ce-branch-tab-wrap" style="display:inline-flex; align-items:center; gap:0; position:relative;">
            <button class="ce-branch-tab ${idx === _activeBranchIdx ? 'active' : ''}"
              data-ce-branch="${idx}"
              style="padding:0.25rem 0.6rem; position:relative; border-radius:6px; font-size:0.78rem; font-weight:700; border:1px solid ${idx === _activeBranchIdx ? 'var(--primary)' : 'var(--border-glass)'}; background:${idx === _activeBranchIdx ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)'}; color:#fff; cursor:pointer;">
              <span class="ce-field ce-branch-name"
                contenteditable="true"
                data-ce-field="branch.${idx}.branchName"
                title="Click để sửa tên nhánh"
                style="outline:none; pointer-events:auto;"
                >${b.branchName || `Nhánh ${idx + 1}`}</span>
            </button>
          </div>
        `).join('')}

        <!-- Branch CRUD Actions -->
        <button id="ceBtnAddBranch"
          style="padding:0.2rem 0.5rem; background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:#6ee7b7; border-radius:6px; font-size:0.72rem; font-weight:800; cursor:pointer;"
          title="Thêm nhánh hồn kỹ mới">➕ Thêm Nhánh</button>
        
        ${branches.length > 1 ? `
          <button id="ceBtnDeleteBranch"
            style="padding:0.2rem 0.5rem; background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer; margin-left:auto;"
            title="Xóa nhánh hiện tại">🗑️ Xóa Nhánh</button>
        ` : ''}
      </div>
    `;
  }

  function _buildSkillNavigator(skills, skill) {
    const total = skills.length;
    const idx   = _activeSkillIdx;

    const navBar = `
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem; flex-wrap:wrap;">
        <button class="ce-nav-btn" data-ce-skill-nav="-1" ${idx === 0 || total === 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
          style="padding:0.2rem 0.6rem; background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:6px; color:#fff; cursor:pointer; font-weight:700;">◀</button>
        <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Kỹ năng ${total > 0 ? idx + 1 : 0} / ${total}</span>
        <button class="ce-nav-btn" data-ce-skill-nav="1" ${idx >= total - 1 || total === 0 ? 'disabled style="opacity:0.35; cursor:not-allowed;"' : ''}
          style="padding:0.2rem 0.6rem; background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:6px; color:#fff; cursor:pointer; font-weight:700;">▶</button>
        
        <!-- Skill CRUD Actions -->
        <button id="ceBtnAddSkill"
          style="padding:0.2rem 0.55rem; background:rgba(59,130,246,0.15); border:1px solid var(--primary); color:#93c5fd; border-radius:6px; font-size:0.72rem; font-weight:800; cursor:pointer;"
          title="Thêm kỹ năng mới vào nhóm hiện tại">➕ Thêm Kỹ Năng</button>
        
        ${skill ? `
          <button id="ceBtnCloneSkill"
            style="padding:0.2rem 0.5rem; background:rgba(245,158,11,0.15); border:1px solid var(--accent-gold); color:#fef08a; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;"
            title="Nhân bản kỹ năng đang chọn">📋 Nhân Bản</button>
          
          <button id="ceBtnDeleteSkill"
            style="padding:0.2rem 0.5rem; background:rgba(239,68,68,0.15); border:1px solid var(--accent-red); color:#fca5a5; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer; margin-left:auto;"
            title="Xóa kỹ năng này">🗑️ Xóa</button>
        ` : ''}
      </div>
    `;

    if (!skill) {
      return `
        ${navBar}
        <div style="background:var(--bg-surface); border:1px dashed var(--border-glass); border-radius:12px; padding:2rem; text-align:center; color:var(--text-muted);">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">⚡</div>
          <div style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">Chưa có kỹ năng trong nhóm "${_activeGroupId}"</div>
          <p style="font-size:0.82rem; margin-bottom:1rem;">Nhấp vào nút bên dưới để tạo kỹ năng mới ngay trên Canvas!</p>
          <button id="ceBtnEmptyAddSkill" class="btn-editor btn-editor-primary" style="padding:0.45rem 1.2rem; font-size:0.85rem; font-weight:800;">➕ Tạo Kỹ Năng Mới Ngay</button>
        </div>
      `;
    }

    return `${navBar}${_buildSkillCard(skill, idx)}`;
  }

  function _buildSkillCard(skill, skillIdx) {
    return `
      <div class="ce-skill-card" style="margin-bottom:0.75rem; background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:12px; padding:1rem; box-shadow:0 6px 20px rgba(0,0,0,0.2);">
        <!-- Skill header -->
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.85rem;">

          <!-- Skill icon (click to change) -->
          <div class="ce-avatar-wrapper" id="ceSkillIconWrapper" title="Click để đổi Icon kỹ năng" style="width:48px; height:48px; flex-shrink:0; position:relative; cursor:pointer;">
            <img id="ceSkillIconImg"
              src="${skill.icon && skill.icon.includes('/') ? skill.icon : 'assets/icons/star_gold.svg'}"
              style="width:48px; height:48px; border-radius:10px; object-fit:cover; display:block; border:1px solid var(--border-glass); background:rgba(0,0,0,0.3);"
              onerror="this.src='assets/icons/star_gold.svg'">
            <input type="file" id="ceSkillIconFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <!-- Skill name -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-field="skill.name"
              style="font-weight:800; font-size:1.1rem; color:#fff; margin-bottom:0.25rem;"
              title="Click để sửa Tên Kỹ Năng">${skill.name || '(Tên Kỹ Năng)'}</div>

            <!-- Type + Cost tags (both editable) -->
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap; align-items:center;">
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="skill.type"
                style="font-size:0.72rem; padding:0.12rem 0.45rem; background:rgba(59,130,246,0.2); border:1px solid var(--primary); color:#93c5fd; border-radius:20px; font-weight:700;"
                title="Click để sửa Loại">${skill.type || 'Chủ động'}</span>
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="skill.cost"
                style="font-size:0.72rem; padding:0.12rem 0.45rem; background:rgba(251,191,36,0.1); border:1px solid var(--accent-gold); color:#fef08a; border-radius:20px; font-weight:700;"
                title="Click để sửa Tiêu Hao">${skill.cost || '2 Hồn Lực'}</span>
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="skill.group"
                style="font-size:0.68rem; padding:0.1rem 0.4rem; background:rgba(192,132,252,0.1); border:1px solid rgba(192,132,252,0.35); color:#c084fc; border-radius:20px; font-weight:600; font-family:monospace;"
                title="Click để sửa Group ID">${skill.group || _activeGroupId}</span>
            </div>
          </div>
        </div>

        <!-- Skill description -->
        <div class="ce-field"
          contenteditable="true"
          data-ce-field="skill.description"
          style="font-size:0.88rem; color:var(--text-sub); line-height:1.65; min-height:3rem; padding:0.6rem; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid rgba(255,255,255,0.05); white-space:pre-wrap;"
          title="Click để sửa Mô Tả kỹ năng">${skill.description || '(Nhập mô tả kỹ năng...)'}</div>
      </div>
    `;
  }

  function _buildRingMilestones(skill) {
    const upgrades = skill.ringUpgrades || [];
    return `
      <div style="background:rgba(192,132,252,0.06); border:1px solid rgba(192,132,252,0.2); border-radius:10px; padding:0.85rem; margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
          <div style="font-size:0.75rem; font-weight:800; color:#c084fc; letter-spacing:0.5px; text-transform:uppercase;">⭕ MỐC NIÊN HẠN HỒN HOÀN</div>
          <button id="ceBtnAddRingMilestone"
            style="padding:0.18rem 0.5rem; background:rgba(192,132,252,0.2); border:1px solid #c084fc; color:#e9d5ff; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;"
            title="Thêm mốc niên hạn mới">➕ Thêm Mốc</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.45rem;" id="ceRingMilestonesContainer">
          ${upgrades.length === 0 ? '<div style="color:var(--text-muted); font-size:0.78rem; text-align:center; padding:0.4rem;">Chưa có mốc niên hạn nào</div>' : ''}
          ${upgrades.map((u, mIdx) => `
            <div style="display:flex; gap:0.5rem; align-items:flex-start; padding:0.45rem 0.5rem; background:rgba(192,132,252,0.05); border-radius:6px; position:relative;">
              <div class="ce-field"
                contenteditable="true"
                data-ce-field="ring.${mIdx}.year"
                style="font-size:0.8rem; font-weight:700; color:#c084fc; min-width:100px; flex-shrink:0; background:rgba(0,0,0,0.25); padding:0.2rem 0.4rem; border-radius:4px;"
                title="Sửa niên hạn">${u.year || '10,000 năm'}</div>
              <div class="ce-field"
                contenteditable="true"
                data-ce-field="ring.${mIdx}.bonus"
                style="font-size:0.82rem; color:var(--text-sub); flex:1; white-space:pre-wrap; padding:0.2rem 0.4rem;"
                title="Sửa hiệu ứng mốc">${u.bonus || '(Tác dụng nâng cấp...)'}</div>
              <button class="ce-btn-del-ring" data-midx="${mIdx}"
                style="background:transparent; border:none; color:var(--accent-red); cursor:pointer; font-size:0.85rem; padding:0.2rem 0.3rem;"
                title="Xóa mốc này">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function _buildCustomFeatureBlocks() {
    const blocks = _hero.customBlocks || [];
    return `
      <!-- CUSTOM FEATURE BLOCKS -->
      <div style="background:rgba(6,182,212,0.04); border:1px solid rgba(6,182,212,0.2); border-radius:10px; padding:0.85rem; margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem; flex-wrap:wrap; gap:0.4rem;">
          <div style="font-size:0.78rem; font-weight:800; color:var(--accent-cyan); text-transform:uppercase; display:flex; align-items:center; gap:0.35rem;">
            <span>🎨</span> KHỐI TÍNH NĂNG & THUỘC TÍNH MỞ RỘNG (CUSTOM BLOCKS)
          </div>
          <button id="ceBtnAddCustomBlock"
            style="padding:0.2rem 0.55rem; background:rgba(6,182,212,0.15); border:1px solid var(--accent-cyan); color:#a5f3fc; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;"
            title="Thêm khối tính năng, thuộc tính hoặc ghi chú mới">
            ➕ Vẽ Thêm Tính Năng
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.55rem;" id="ceCustomBlocksContainer">
          ${blocks.length === 0 ? `
            <div style="color:var(--text-muted); font-size:0.78rem; text-align:center; padding:0.6rem 0.4rem; background:rgba(0,0,0,0.15); border-radius:6px; border:1px dashed rgba(255,255,255,0.08);">
              Chưa có khối mở rộng nào. Bấm <strong>"➕ Vẽ Thêm Tính Năng"</strong> để tự do thêm khối chỉ số, combo đội hình, hoặc ghi chú chiến thuật!
            </div>
          ` : ''}

          ${blocks.map((cb, cbIdx) => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:8px; padding:0.65rem 0.75rem; position:relative;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.35rem; gap:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.4rem; flex:1;">
                  <span class="ce-field"
                    contenteditable="true"
                    data-ce-cb-title="${cbIdx}"
                    style="font-size:0.85rem; font-weight:800; color:var(--accent-gold); outline:none;"
                    title="Click để sửa tiêu đề khối">${cb.title || 'Khối Tính Năng Mới'}</span>
                  <span class="ce-field"
                    contenteditable="true"
                    data-ce-cb-tag="${cbIdx}"
                    style="font-size:0.7rem; padding:0.1rem 0.4rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:#fef08a; border-radius:10px; font-weight:700;"
                    title="Click để sửa tag">${cb.tag || 'Mở Rộng'}</span>
                </div>
                <button class="ce-btn-del-cb" data-cbidx="${cbIdx}"
                  style="background:transparent; border:none; color:var(--accent-red); cursor:pointer; font-size:0.85rem; padding:0.1rem 0.3rem;"
                  title="Xóa khối tính năng này">✕</button>
              </div>
              <div class="ce-field"
                contenteditable="true"
                data-ce-cb-content="${cbIdx}"
                style="font-size:0.85rem; color:#e2e8f0; line-height:1.6; white-space:pre-wrap; padding:0.35rem 0.5rem; background:rgba(0,0,0,0.2); border-radius:6px;"
                title="Click để sửa nội dung">${cb.content || 'Nhập nội dung tính năng / chỉ số / combo đề xuất...'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function _bindHeroEvents(container) {
    // Avatar
    const avatarWrapper   = container.querySelector('#ceAvatarWrapper');
    const avatarFileInput = container.querySelector('#ceAvatarFileInput');
    if (avatarWrapper && avatarFileInput) {
      avatarWrapper.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('.ce-field')) return;
        avatarFileInput.click();
      });
      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          _hero.avatar = ev.target.result;
          const img = container.querySelector('#ceAvatarImg');
          if (img) img.src = ev.target.result;
          _save('avatar', ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    }

    // Skill icon
    const skillIconWrapper   = container.querySelector('#ceSkillIconWrapper');
    const skillIconFileInput = container.querySelector('#ceSkillIconFileInput');
    if (skillIconWrapper && skillIconFileInput) {
      skillIconWrapper.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('.ce-field')) return;
        skillIconFileInput.click();
      });
      skillIconFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const skills = _getSkillsForGroup();
          const skill  = skills[_activeSkillIdx] || skills[0];
          if (skill) {
            skill.icon = ev.target.result;
            const img = container.querySelector('#ceSkillIconImg');
            if (img) img.src = ev.target.result;
            _save('skill.icon', ev.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Rarity select
    const raritySelect = container.querySelector('.ce-rarity-select');
    if (raritySelect) {
      raritySelect.addEventListener('change', () => {
        _hero.rarity = raritySelect.value;
        raritySelect.style.color = _rarityColor(raritySelect.value);
        _save('rarity', raritySelect.value);
      });
    }

    // Skill navigation arrows
    container.querySelectorAll('[data-ce-skill-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const delta = parseInt(btn.getAttribute('data-ce-skill-nav'), 10);
        const skills = _getSkillsForGroup();
        _activeSkillIdx = Math.max(0, Math.min(skills.length - 1, _activeSkillIdx + delta));
        render(container.id);
      });
    });

    // Branch tabs
    container.querySelectorAll('[data-ce-branch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('ce-branch-name') || e.target.closest('.ce-branch-name')) return;
        _activeBranchIdx = parseInt(btn.getAttribute('data-ce-branch'), 10);
        _activeSkillIdx = 0;
        render(container.id);
        if (_onSave) _onSave(_hero, { branchChanged: true, branchIdx: _activeBranchIdx });
      });
    });

    // Branch Add button
    const btnAddBranch = container.querySelector('#ceBtnAddBranch');
    if (btnAddBranch) {
      btnAddBranch.addEventListener('click', () => {
        if (!_hero.branches) _hero.branches = [];
        const nextNum = _hero.branches.length + 1;
        const newBranch = {
          branchId: `branch_${nextNum}`,
          branchName: `Nhánh ${nextNum}`,
          skills: [
            {
              id: `${_hero.id}_skill_${nextNum}_1`,
              name: `Kỹ Năng Mới (${nextNum})`,
              type: 'Chủ động',
              cost: '2 Hồn Lực',
              group: _activeGroupId,
              icon: 'assets/icons/star_gold.svg',
              description: 'Mô tả kỹ năng mới...',
              ringUpgrades: [
                { year: '10,000 năm', bonus: 'Tăng 10% sát thương.' },
                { year: '50,000 năm', bonus: 'Tăng 20% sát thương.' }
              ]
            }
          ]
        };
        _hero.branches.push(newBranch);
        _activeBranchIdx = _hero.branches.length - 1;
        _activeSkillIdx = 0;
        render(container.id);
        _save('branches', _hero.branches);
      });
    }

    // Branch Delete button
    const btnDeleteBranch = container.querySelector('#ceBtnDeleteBranch');
    if (btnDeleteBranch) {
      btnDeleteBranch.addEventListener('click', () => {
        if (!_hero.branches || _hero.branches.length <= 1) {
          alert('Hồn Sư phải có ít nhất 1 nhánh kỹ năng!');
          return;
        }
        if (confirm(`Bạn có chắc chắn muốn xóa Nhánh "${_hero.branches[_activeBranchIdx]?.branchName || _activeBranchIdx + 1}" không?`)) {
          _hero.branches.splice(_activeBranchIdx, 1);
          _activeBranchIdx = Math.max(0, _activeBranchIdx - 1);
          _activeSkillIdx = 0;
          render(container.id);
          _save('branches', _hero.branches);
        }
      });
    }

    // Skill Add button (from toolbar or empty state)
    const handleAddSkill = () => {
      const branch = (_hero.branches || [])[_activeBranchIdx] || (_hero.branches || [])[0];
      if (!branch) return;
      if (!branch.skills) branch.skills = [];
      const newSkill = {
        id: `${_hero.id}_skill_${Date.now().toString().slice(-4)}`,
        name: 'Kỹ Năng Mới',
        type: 'Chủ động',
        cost: '2 Hồn Lực',
        group: _activeGroupId,
        icon: 'assets/icons/star_gold.svg',
        description: 'Mô tả hiệu ứng kỹ năng mới...',
        ringUpgrades: [
          { year: '10,000 năm', bonus: 'Hiệu ứng nâng cấp ban đầu.' }
        ]
      };
      branch.skills.push(newSkill);
      const skillsInGroup = branch.skills.filter(s => s.group === _activeGroupId);
      _activeSkillIdx = skillsInGroup.length - 1;
      render(container.id);
      _save('skills', branch.skills);
    };

    const btnAddSkill = container.querySelector('#ceBtnAddSkill');
    if (btnAddSkill) btnAddSkill.addEventListener('click', handleAddSkill);
    const btnEmptyAddSkill = container.querySelector('#ceBtnEmptyAddSkill');
    if (btnEmptyAddSkill) btnEmptyAddSkill.addEventListener('click', handleAddSkill);

    // Skill Clone button
    const btnCloneSkill = container.querySelector('#ceBtnCloneSkill');
    if (btnCloneSkill) {
      btnCloneSkill.addEventListener('click', () => {
        const skill = _getActiveSkill();
        const branch = (_hero.branches || [])[_activeBranchIdx] || (_hero.branches || [])[0];
        if (!skill || !branch) return;
        const cloned = JSON.parse(JSON.stringify(skill));
        cloned.id = `${_hero.id}_skill_clone_${Date.now().toString().slice(-4)}`;
        cloned.name = `${cloned.name} (Sao chép)`;
        branch.skills.push(cloned);
        const skillsInGroup = branch.skills.filter(s => s.group === _activeGroupId);
        _activeSkillIdx = skillsInGroup.length - 1;
        render(container.id);
        _save('skills', branch.skills);
      });
    }

    // Skill Delete button
    const btnDeleteSkill = container.querySelector('#ceBtnDeleteSkill');
    if (btnDeleteSkill) {
      btnDeleteSkill.addEventListener('click', () => {
        const skill = _getActiveSkill();
        const branch = (_hero.branches || [])[_activeBranchIdx] || (_hero.branches || [])[0];
        if (!skill || !branch) return;
        if (confirm(`Bạn có chắc chắn muốn xóa kỹ năng "${skill.name}" không?`)) {
          const sIdx = branch.skills.findIndex(s => s === skill || s.id === skill.id);
          if (sIdx >= 0) branch.skills.splice(sIdx, 1);
          _activeSkillIdx = Math.max(0, _activeSkillIdx - 1);
          render(container.id);
          _save('skills', branch.skills);
        }
      });
    }

    // Ring Milestone Add button
    const btnAddRing = container.querySelector('#ceBtnAddRingMilestone');
    if (btnAddRing) {
      btnAddRing.addEventListener('click', () => {
        const skill = _getActiveSkill();
        if (!skill) return;
        if (!skill.ringUpgrades) skill.ringUpgrades = [];
        skill.ringUpgrades.push({
          year: '100,000 năm',
          bonus: 'Tăng cường hiệu quả sát thương và thêm hiệu ứng khống chế.'
        });
        render(container.id);
        _save('ringUpgrades', skill.ringUpgrades);
      });
    }

    // Ring Milestone Delete buttons
    container.querySelectorAll('.ce-btn-del-ring').forEach(btn => {
      btn.addEventListener('click', () => {
        const mIdx = parseInt(btn.getAttribute('data-midx'), 10);
        const skill = _getActiveSkill();
        if (skill && skill.ringUpgrades && skill.ringUpgrades[mIdx] !== undefined) {
          skill.ringUpgrades.splice(mIdx, 1);
          render(container.id);
          _save('ringUpgrades', skill.ringUpgrades);
        }
      });
    });

    // Custom Blocks Add button
    const btnAddCustomBlock = container.querySelector('#ceBtnAddCustomBlock');
    if (btnAddCustomBlock) {
      btnAddCustomBlock.addEventListener('click', () => {
        if (!_hero.customBlocks) _hero.customBlocks = [];
        _hero.customBlocks.push({
          title: '⚡ THUỘC TÍNH CHIẾN THUẬT',
          tag: 'Đề Xuất',
          content: 'Đội hình tương thích: Đi kèm Hồn Sư Khống Chế và Phụ Trợ để tối ưu hóa sát thương.'
        });
        render(container.id);
        _save('customBlocks', _hero.customBlocks);
      });
    }

    // Custom Blocks Delete buttons
    container.querySelectorAll('.ce-btn-del-cb').forEach(btn => {
      btn.addEventListener('click', () => {
        const cbIdx = parseInt(btn.getAttribute('data-cbidx'), 10);
        if (_hero.customBlocks && _hero.customBlocks[cbIdx] !== undefined) {
          _hero.customBlocks.splice(cbIdx, 1);
          render(container.id);
          _save('customBlocks', _hero.customBlocks);
        }
      });
    });

    // Custom Blocks contenteditable bindings
    container.querySelectorAll('[data-ce-cb-title]').forEach(f => {
      f.addEventListener('blur', () => {
        const idx = parseInt(f.getAttribute('data-ce-cb-title'), 10);
        if (_hero.customBlocks && _hero.customBlocks[idx]) {
          _hero.customBlocks[idx].title = f.innerText.trim();
          _save('customBlocks', _hero.customBlocks);
        }
      });
    });

    container.querySelectorAll('[data-ce-cb-tag]').forEach(f => {
      f.addEventListener('blur', () => {
        const idx = parseInt(f.getAttribute('data-ce-cb-tag'), 10);
        if (_hero.customBlocks && _hero.customBlocks[idx]) {
          _hero.customBlocks[idx].tag = f.innerText.trim();
          _save('customBlocks', _hero.customBlocks);
        }
      });
    });

    container.querySelectorAll('[data-ce-cb-content]').forEach(f => {
      f.addEventListener('blur', () => {
        const idx = parseInt(f.getAttribute('data-ce-cb-content'), 10);
        if (_hero.customBlocks && _hero.customBlocks[idx]) {
          _hero.customBlocks[idx].content = f.innerText.trim();
          _save('customBlocks', _hero.customBlocks);
        }
      });
    });

    _bindContentEditable(container, (field, fieldPath, newValue) => {
      _applyFieldValue(fieldPath, newValue);
      _save(fieldPath, newValue);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. HONHACH (HỒN HẠCH) CANVAS RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  function renderHonhachCanvas(containerId = 'honhachEditorCanvasFrame', honhach, onSaveCallback) {
    const container = document.getElementById(containerId);
    if (!container || !honhach) return;

    const allRoles = [
      { id: 'cuong_cong', name: '⚔️ Cường Công' },
      { id: 'man_cong', name: '⚡ Mẫn Công' },
      { id: 'khong_che', name: '🌿 Khống Chế' },
      { id: 'phu_tro', name: '🧪 Phụ Trợ' },
      { id: 'phong_ngu', name: '🛡️ Phòng Ngự' }
    ];

    const currentRoles = honhach.roles || ['cuong_cong', 'man_cong'];
    const set2Desc = typeof honhach.set2 === 'string' ? honhach.set2 : (honhach.set2?.template || 'Tỷ Lệ Bạo+5,0%');
    const set4Desc = honhach.set4?.desc || honhach.set4?.template || 'Khi kích hoạt kỹ năng, tăng {stat}% sát thương gây ra trong 15s.';
    const set4Extra24 = honhach.set4?.extra24 || 'Kéo dài thời gian hiệu lực lên 22.5s.';
    const set4Stats = honhach.set4?.stats || [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
    const defaultStars = [4, 8, 12, 16, 20, 24];

    container.innerHTML = `
      <!-- HONHACH MAIN CARD -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:12px; padding:1.25rem; margin-bottom:1rem; box-shadow:0 8px 24px rgba(0,0,0,0.25);">
        
        <!-- Header: Icon, Name, Rarity, Roles -->
        <div style="display:flex; gap:1rem; align-items:flex-start; margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid var(--border-glass);">
          <div class="ce-avatar-wrapper" id="ceHonhachIconWrapper" title="Click để đổi Icon Hồn Hạch" style="width:72px; height:72px; flex-shrink:0; position:relative; cursor:pointer;">
            <img id="ceHonhachIconImg"
              src="${honhach.icon || 'assets/icons/star_gold.svg'}"
              style="width:72px; height:72px; border-radius:12px; object-fit:cover; display:block; border:1.5px solid var(--border-glass); background:rgba(0,0,0,0.3);"
              onerror="this.src='assets/icons/star_gold.svg'">
            <div style="position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.7); border-radius:4px; padding:1px 4px; font-size:0.65rem; color:#fff;">📷</div>
            <input type="file" id="ceHonhachIconFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
              <!-- Rarity Select -->
              <select id="ceHonhachRaritySelect"
                style="background:rgba(255,255,255,0.06); border:1px solid var(--border-glass); font-size:0.78rem; font-weight:800; color:${_rarityColor(honhach.rarity || 'SSR')}; cursor:pointer; padding:0.2rem 0.5rem; border-radius:6px;">
                ${['R','SR','SSR','SP'].map(r => `<option value="${r}" ${(honhach.rarity || 'SSR') === r ? 'selected' : ''} style="background:#1e293b; color:#fff;">${r}</option>`).join('')}
              </select>
              <span style="font-size:0.75rem; color:var(--text-muted);">ID: <strong style="font-family:monospace; color:var(--accent-cyan);">${honhach.id}</strong></span>
            </div>

            <!-- Name Vi -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-hh="nameVi"
              style="font-family:var(--font-heading); font-size:1.3rem; font-weight:900; color:#fff; line-height:1.2; margin-bottom:0.4rem;"
              title="Click để sửa tên Bộ Hồn Hạch">${honhach.nameVi || 'Bộ Hồn Hạch Mới'}</div>

            <!-- Role Badges (Interactive Click to Toggle) -->
            <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center;">
              <span style="font-size:0.72rem; color:var(--text-sub); margin-right:0.2rem;">Hệ:</span>
              ${allRoles.map(r => {
                const isActive = currentRoles.includes(r.id);
                return `
                  <button class="ce-role-toggle-btn ${isActive ? 'active' : ''}" data-role-id="${r.id}"
                    style="padding:0.15rem 0.45rem; border-radius:14px; font-size:0.72rem; font-weight:700; cursor:pointer; border:1px solid ${isActive ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)'}; background:${isActive ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.03)'}; color:${isActive ? '#a5f3fc' : 'var(--text-muted)'};">
                    ${r.name}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div style="margin-bottom:1rem;">
          <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:0.25rem;">📝 MÔ TẢ TỔNG QUAN:</div>
          <div class="ce-field"
            contenteditable="true"
            data-ce-hh="description"
            style="font-size:0.85rem; color:var(--text-sub); padding:0.5rem 0.65rem; background:rgba(255,255,255,0.02); border-radius:6px; border:1px solid rgba(255,255,255,0.05); min-height:2.2rem;"
            title="Click để sửa mô tả">${honhach.description || 'Bộ Hồn Hạch hỗ trợ thuộc tính và hiệu ứng chiến đấu.'}</div>
        </div>

        <!-- SET 2 BOX -->
        <div style="background:rgba(245,158,11,0.05); border:1px solid rgba(245,158,11,0.25); border-radius:10px; padding:0.85rem; margin-bottom:1rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <div style="font-weight:800; font-size:0.82rem; color:var(--accent-gold);">⚡ HIỆU ỨNG 2 MÓN (SET 2)</div>
            <span class="star-pill" style="background:rgba(245,158,11,0.2); border-color:var(--accent-gold); color:#fef08a; font-size:0.72rem; padding:0.1rem 0.4rem; border-radius:10px;">Yêu cầu: 2★</span>
          </div>
          <div class="ce-field"
            contenteditable="true"
            data-ce-hh="set2"
            style="font-size:0.85rem; color:#fef08a; font-weight:600; padding:0.4rem 0.5rem; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(245,158,11,0.2);"
            title="Click để sửa hiệu ứng Set 2">${set2Desc}</div>
        </div>

        <!-- SET 4 BOX -->
        <div style="background:rgba(6,182,212,0.05); border:1px solid rgba(6,182,212,0.25); border-radius:10px; padding:0.85rem; margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <div style="font-weight:800; font-size:0.82rem; color:var(--accent-cyan);">🔥 HIỆU ỨNG 4 MÓN (SET 4)</div>
            <span class="star-pill" style="background:rgba(6,182,212,0.2); border-color:var(--accent-cyan); color:#a5f3fc; font-size:0.72rem; padding:0.1rem 0.4rem; border-radius:10px;">Yêu cầu: 4★ - 24★</span>
          </div>

          <!-- Set 4 template -->
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.2rem;">Mẫu hiệu ứng:</div>
            <div class="ce-field"
              contenteditable="true"
              data-ce-hh="set4.desc"
              style="font-size:0.82rem; color:#e2e8f0; padding:0.4rem 0.5rem; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(6,182,212,0.2);"
              title="Click để sửa mẫu hiệu ứng Set 4">${set4Desc}</div>
          </div>

          <!-- Set 4 Extra 24 Star -->
          <div style="margin-bottom:0.6rem;">
            <div style="font-size:0.72rem; color:var(--accent-gold); margin-bottom:0.2rem;">✨ Đột phá 24★ (Bonus):</div>
            <div class="ce-field"
              contenteditable="true"
              data-ce-hh="set4.extra24"
              style="font-size:0.82rem; color:#fef08a; padding:0.4rem 0.5rem; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(245,158,11,0.2);"
              title="Click để sửa hiệu ứng đột phá 24★">${set4Extra24}</div>
          </div>

          <!-- 6 Star Milestones Grid -->
          <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.35rem;">Chỉ số 6 mốc Sao:</div>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.45rem;">
            ${set4Stats.map((val, idx) => `
              <div style="background:rgba(255,255,255,0.04); padding:0.35rem 0.5rem; border-radius:6px; border:1px solid var(--border-glass); display:flex; align-items:center; justify-content:space-between;">
                <span class="star-pill" style="background:rgba(245,158,11,0.2); border:1px solid var(--accent-gold); color:#fef08a; font-size:0.7rem; padding:0.1rem 0.35rem; border-radius:6px;">${defaultStars[idx]}★</span>
                <input type="number" step="0.5" class="form-input ce-hh-star-input" data-idx="${idx}" value="${val}"
                  style="width:65px; padding:0.15rem 0.3rem; font-size:0.78rem; text-align:right; background:rgba(0,0,0,0.3); border:1px solid var(--border-glass); color:#fff; border-radius:4px;">
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Hint -->
        <div style="padding:0.4rem 0.75rem; background:rgba(6,182,212,0.05); border:1px dashed rgba(6,182,212,0.25); border-radius:8px; font-size:0.7rem; color:rgba(6,182,212,0.8); text-align:center;">
          ✏️ Nhấp vào tên, độ hiếm, hệ hoặc mốc sao để chỉnh sửa trực tiếp trên Honhach Canvas
        </div>
      </div>
    `;

    // Bind Honhach events
    const iconWrapper = container.querySelector('#ceHonhachIconWrapper');
    const iconInput   = container.querySelector('#ceHonhachIconFileInput');
    if (iconWrapper && iconInput) {
      iconWrapper.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        iconInput.click();
      });
      iconInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          honhach.icon = ev.target.result;
          const img = container.querySelector('#ceHonhachIconImg');
          if (img) img.src = ev.target.result;
          if (onSaveCallback) onSaveCallback(honhach, { field: 'icon' });
        };
        reader.readAsDataURL(file);
      });
    }

    const raritySel = container.querySelector('#ceHonhachRaritySelect');
    if (raritySel) {
      raritySel.addEventListener('change', () => {
        honhach.rarity = raritySel.value;
        raritySel.style.color = _rarityColor(raritySel.value);
        if (onSaveCallback) onSaveCallback(honhach, { field: 'rarity' });
      });
    }

    container.querySelectorAll('.ce-role-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-role-id');
        let roles = honhach.roles || ['cuong_cong', 'man_cong'];
        if (roles.includes(rId)) {
          if (roles.length > 1) roles = roles.filter(r => r !== rId);
        } else {
          roles.push(rId);
        }
        honhach.roles = roles;
        renderHonhachCanvas(containerId, honhach, onSaveCallback);
        if (onSaveCallback) onSaveCallback(honhach, { field: 'roles' });
      });
    });

    container.querySelectorAll('.ce-hh-star-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (!honhach.set4) honhach.set4 = {};
        if (!honhach.set4.stats) honhach.set4.stats = [7.5, 9.0, 10.5, 12.0, 13.5, 15.0];
        honhach.set4.stats[idx] = parseFloat(e.target.value) || 0;
        if (onSaveCallback) onSaveCallback(honhach, { field: 'set4.stats' });
      });
    });

    _bindContentEditable(container, (field, fieldPath, newValue) => {
      if (fieldPath === 'nameVi') {
        honhach.nameVi = newValue;
        honhach.name = newValue;
      } else if (fieldPath === 'description') {
        honhach.description = newValue;
      } else if (fieldPath === 'set2') {
        honhach.set2 = newValue;
      } else if (fieldPath === 'set4.desc') {
        if (!honhach.set4) honhach.set4 = {};
        honhach.set4.desc = newValue;
        honhach.set4.template = newValue;
      } else if (fieldPath === 'set4.extra24') {
        if (!honhach.set4) honhach.set4 = {};
        honhach.set4.extra24 = newValue;
      }
      if (onSaveCallback) onSaveCallback(honhach, { field: fieldPath });
    }, 'data-ce-hh');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. HONCOT (HỒN CỐT) CANVAS RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  function renderHoncotCanvas(containerId = 'honcotEditorCanvasFrame', honcot, onSaveCallback) {
    const container = document.getElementById(containerId);
    if (!container || !honcot) return;

    const slots = [
      { id: 'head', name: 'Xương Đầu (Head)', icon: 'assets/icons/honcot_head.png' },
      { id: 'torso', name: 'Xương Thân (Torso)', icon: 'assets/icons/honcot_torso.png' },
      { id: 'left_arm', name: 'Tay Trái (Left Arm)', icon: 'assets/icons/honcot_arm_left.png' },
      { id: 'right_arm', name: 'Tay Phải (Right Arm)', icon: 'assets/icons/honcot_arm_right.png' },
      { id: 'left_leg', name: 'Chân Trái (Left Leg)', icon: 'assets/icons/honcot_leg_left.png' },
      { id: 'right_leg', name: 'Chân Phải (Right Leg)', icon: 'assets/icons/honcot_leg_right.png' }
    ];

    const currentSlot = honcot.slot || 'head';
    const effects = honcot.effects || [];

    container.innerHTML = `
      <!-- HONCOT MAIN CARD -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:12px; padding:1.25rem; margin-bottom:1rem; box-shadow:0 8px 24px rgba(0,0,0,0.25);">
        
        <!-- Header: Icon, Name, Slot, WusoulType -->
        <div style="display:flex; gap:1rem; align-items:flex-start; margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid var(--border-glass);">
          <div class="ce-avatar-wrapper" id="ceHoncotIconWrapper" title="Click để đổi Icon Hồn Cốt" style="width:72px; height:72px; flex-shrink:0; position:relative; cursor:pointer;">
            <img id="ceHoncotIconImg"
              src="${honcot.icon || 'assets/icons/honcot_head.png'}"
              style="width:72px; height:72px; border-radius:12px; object-fit:cover; display:block; border:1.5px solid var(--border-glass); background:rgba(0,0,0,0.3);"
              onerror="this.src='assets/icons/honcot_head.png'">
            <div style="position:absolute; bottom:2px; right:2px; background:rgba(0,0,0,0.7); border-radius:4px; padding:1px 4px; font-size:0.65rem; color:#fff;">📷</div>
            <input type="file" id="ceHoncotIconFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem; flex-wrap:wrap;">
              <!-- Slot Select -->
              <select id="ceHoncotSlotSelect"
                style="background:rgba(255,255,255,0.06); border:1px solid var(--accent-gold); font-size:0.75rem; font-weight:800; color:var(--accent-gold); cursor:pointer; padding:0.2rem 0.5rem; border-radius:6px;">
                ${slots.map(s => `<option value="${s.id}" ${currentSlot === s.id ? 'selected' : ''} style="background:#1e293b; color:#fff;">🦴 ${s.name}</option>`).join('')}
              </select>

              <!-- Wusoul Type -->
              <span class="ce-field"
                contenteditable="true"
                data-ce-hc="wusoulType"
                style="padding:0.18rem 0.45rem; background:rgba(6,182,212,0.15); border:1px solid var(--accent-cyan); color:#a5f3fc; border-radius:6px; font-size:0.75rem; font-weight:700;"
                title="Click để sửa Hệ Võ Hồn">Hệ: ${honcot.wusoulType || 'all'}</span>
            </div>

            <!-- Name Vi -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-hc="nameVi"
              style="font-family:var(--font-heading); font-size:1.3rem; font-weight:900; color:#fff; line-height:1.2; margin-bottom:0.25rem;"
              title="Click để sửa tên Hồn Cốt">${honcot.nameVi || honcot.name || 'Hồn Cốt Mới'}</div>
          </div>
        </div>

        <!-- Enhance Stats / Skill Description -->
        <div style="margin-bottom:1.1rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:8px; padding:0.75rem;">
          <div style="font-size:0.8rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; margin-bottom:0.35rem; display:flex; align-items:center; gap:0.35rem;">
            <span>✨</span> CƯỜNG HÓA & THUỘC TÍNH CƠ BẢN (MÔ TẢ KỸ NĂNG):
          </div>
          <div class="ce-field"
            contenteditable="true"
            data-ce-hc="enhanceStats"
            style="font-size:0.88rem; color:#e2e8f0; line-height:1.6; min-height:2.2rem; padding:0.45rem 0.6rem; background:rgba(0,0,0,0.25); border-radius:6px; border:1px solid rgba(245,158,11,0.15);"
            title="Click để sửa thuộc tính cường hóa / mô tả kỹ năng">${honcot.enhanceStats || 'Lực công kích +1500<br>Phòng thủ +800'}</div>
        </div>

        <!-- Effects List (Hiệu Ứng Vạn Năm & Mốc Sao) -->
        <div style="background:rgba(6,182,212,0.04); border:1px solid rgba(6,182,212,0.2); border-radius:10px; padding:0.85rem; margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.6rem;">
            <div style="font-size:0.82rem; font-weight:800; color:var(--accent-cyan); text-transform:uppercase; display:flex; align-items:center; gap:0.35rem;">
              <span>🔥</span> HIỆU ỨNG VẠN NĂM & MỐC SAO KÍCH HOẠT
            </div>
            <button id="ceBtnAddHoncotEffect"
              style="padding:0.2rem 0.55rem; background:rgba(6,182,212,0.15); border:1px solid var(--accent-cyan); color:#a5f3fc; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">
              ➕ Thêm Mốc
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem;" id="ceHoncotEffectsContainer">
            ${effects.length === 0 ? '<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:0.5rem;">Chưa có hiệu ứng vạn năm nào</div>' : ''}
            ${effects.map((eff, idx) => {
              const currentStar = parseInt(eff.star, 10) || (idx + 1);
              return `
                <div style="display:flex; gap:0.6rem; align-items:flex-start; padding:0.5rem 0.65rem; background:rgba(255,255,255,0.03); border:1px solid var(--border-glass); border-radius:8px; position:relative;">
                  <div style="display:flex; flex-direction:column; gap:0.3rem; min-width:88px; flex-shrink:0;">
                    <div class="ce-field"
                      contenteditable="true"
                      data-ce-hc-eff-year="${idx}"
                      style="font-size:0.85rem; font-weight:800; color:var(--accent-cyan); background:rgba(0,0,0,0.3); padding:0.2rem 0.4rem; border-radius:4px; text-align:center;"
                      title="Sửa niên hạn">${eff.year || '1 Vạn'}</div>
                    
                    <!-- Star selector with gold star icon -->
                    <div style="display:inline-flex; align-items:center; justify-content:center; gap:0.2rem; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.35); border-radius:12px; padding:0.1rem 0.4rem;">
                      <img src="assets/icons/star_gold.svg" style="width:13px; height:13px; filter:drop-shadow(0 0 3px rgba(245,158,11,0.5));" alt="star">
                      <select class="ce-hc-star-select" data-idx="${idx}"
                        style="background:transparent; border:none; color:#fef08a; font-size:0.75rem; font-weight:800; cursor:pointer; padding:0; outline:none;"
                        title="Chọn mốc sao kích hoạt">
                        ${[1, 2, 3, 4, 5, 6].map(s => `<option value="${s}" ${currentStar === s ? 'selected' : ''} style="background:#1e293b; color:#fff;">${s}★</option>`).join('')}
                      </select>
                    </div>
                  </div>

                  <div class="ce-field"
                    contenteditable="true"
                    data-ce-hc-eff-desc="${idx}"
                    style="font-size:0.85rem; color:#e2e8f0; flex:1; line-height:1.5; white-space:pre-wrap; padding:0.25rem 0.4rem; background:rgba(0,0,0,0.15); border-radius:4px;"
                    title="Sửa mô tả hiệu ứng">${eff.desc || 'Mô tả hiệu ứng...'}</div>
                  
                  <button class="ce-btn-del-hc-eff" data-idx="${idx}"
                    style="background:transparent; border:none; color:var(--accent-red); cursor:pointer; font-size:0.85rem; padding:0.2rem 0.3rem;"
                    title="Xóa mốc này">✕</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Hint -->
        <div style="padding:0.4rem 0.75rem; background:rgba(6,182,212,0.05); border:1px dashed rgba(6,182,212,0.25); border-radius:8px; font-size:0.7rem; color:rgba(6,182,212,0.8); text-align:center;">
          🦴 Click vào tên, vị trí, thuộc tính cường hóa hoặc mốc sao & niên hạn để chỉnh sửa trực tiếp trên Honcot Canvas
        </div>
      </div>
    `;

    // Bind Honcot events
    const iconWrapper = container.querySelector('#ceHoncotIconWrapper');
    const iconInput   = container.querySelector('#ceHoncotIconFileInput');
    if (iconWrapper && iconInput) {
      iconWrapper.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        iconInput.click();
      });
      iconInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          honcot.icon = ev.target.result;
          const img = container.querySelector('#ceHoncotIconImg');
          if (img) img.src = ev.target.result;
          if (onSaveCallback) onSaveCallback(honcot, { field: 'icon' });
        };
        reader.readAsDataURL(file);
      });
    }

    const slotSel = container.querySelector('#ceHoncotSlotSelect');
    if (slotSel) {
      slotSel.addEventListener('change', () => {
        honcot.slot = slotSel.value;
        const defaultIconMap = {
          head: 'assets/icons/honcot_head.png',
          torso: 'assets/icons/honcot_torso.png',
          left_arm: 'assets/icons/honcot_arm_left.png',
          right_arm: 'assets/icons/honcot_arm_right.png',
          left_leg: 'assets/icons/honcot_leg_left.png',
          right_leg: 'assets/icons/honcot_leg_right.png'
        };
        if (!honcot.icon || honcot.icon.includes('assets/icons/honcot_')) {
          honcot.icon = defaultIconMap[honcot.slot] || 'assets/icons/honcot_head.png';
          const img = container.querySelector('#ceHoncotIconImg');
          if (img) img.src = honcot.icon;
        }
        if (onSaveCallback) onSaveCallback(honcot, { field: 'slot' });
      });
    }

    const btnAddEff = container.querySelector('#ceBtnAddHoncotEffect');
    if (btnAddEff) {
      btnAddEff.addEventListener('click', () => {
        if (!honcot.effects) honcot.effects = [];
        const nextStar = Math.min(6, honcot.effects.length + 1);
        honcot.effects.push({ year: '10 Vạn', star: nextStar, desc: 'Tăng 20% sát thương và hiệu quả kỹ năng.' });
        renderHoncotCanvas(containerId, honcot, onSaveCallback);
        if (onSaveCallback) onSaveCallback(honcot, { field: 'effects' });
      });
    }

    container.querySelectorAll('.ce-hc-star-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const idx = parseInt(sel.getAttribute('data-idx'), 10);
        if (honcot.effects && honcot.effects[idx]) {
          honcot.effects[idx].star = parseInt(sel.value, 10) || 1;
          if (onSaveCallback) onSaveCallback(honcot, { field: 'effects' });
        }
      });
    });

    container.querySelectorAll('.ce-btn-del-hc-eff').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (honcot.effects && honcot.effects[idx] !== undefined) {
          honcot.effects.splice(idx, 1);
          renderHoncotCanvas(containerId, honcot, onSaveCallback);
          if (onSaveCallback) onSaveCallback(honcot, { field: 'effects' });
        }
      });
    });

    _bindContentEditable(container, (field, fieldPath, newValue) => {
      if (fieldPath === 'nameVi') {
        honcot.nameVi = newValue;
        honcot.name = newValue;
      } else if (fieldPath === 'wusoulType') {
        honcot.wusoulType = newValue.replace(/^Hệ:\s*/i, '').trim();
      } else if (fieldPath === 'enhanceStats') {
        honcot.enhanceStats = field.innerHTML;
      }
      if (onSaveCallback) onSaveCallback(honcot, { field: fieldPath });
    }, 'data-ce-hc');

    // Bind effect fields
    container.querySelectorAll('[data-ce-hc-eff-year]').forEach(f => {
      f.addEventListener('blur', () => {
        const idx = parseInt(f.getAttribute('data-ce-hc-eff-year'), 10);
        if (honcot.effects && honcot.effects[idx]) {
          honcot.effects[idx].year = f.innerText.trim();
          if (onSaveCallback) onSaveCallback(honcot, { field: 'effects' });
        }
      });
    });

    container.querySelectorAll('[data-ce-hc-eff-desc]').forEach(f => {
      f.addEventListener('blur', () => {
        const idx = parseInt(f.getAttribute('data-ce-hc-eff-desc'), 10);
        if (honcot.effects && honcot.effects[idx]) {
          honcot.effects[idx].desc = f.innerText.trim();
          if (onSaveCallback) onSaveCallback(honcot, { field: 'effects' });
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED CONTENTEDITABLE BINDING & TOOLBAR
  // ═══════════════════════════════════════════════════════════════════════════

  function _bindContentEditable(container, onCommit, attrName = 'data-ce-field') {
    container.querySelectorAll(`[${attrName}]`).forEach(field => {
      const fieldPath = field.getAttribute(attrName);

      field.addEventListener('focus', () => {
        _activeField   = field;
        _originalValue = field.innerText.trim();
        _showToolbar(field, fieldPath);
      });

      field.addEventListener('blur', () => {
        setTimeout(() => {
          if (_activeField === field) {
            const val = field.innerText.trim();
            if (val !== _originalValue) {
              onCommit(field, fieldPath, val);
            }
            _hideToolbar();
            _activeField = null;
          }
        }, 180);
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const multilineFields = ['skill.description', 'bio', 'ring', 'description', 'enhanceStats', 'set4.desc', 'set4.extra24'];
          const isMultiline = multilineFields.some(f => fieldPath && fieldPath.includes(f));
          if (!isMultiline) {
            e.preventDefault();
            field.blur();
          }
        }
        if (e.key === 'Escape') {
          field.innerText = _originalValue;
          _activeField = null;
          field.blur();
          _hideToolbar();
        }
      });
    });
  }

  function _createToolbar() {
    if (_toolbar) return;
    _toolbar = document.createElement('div');
    _toolbar.className = 'ce-toolbar';
    _toolbar.style.display = 'none';
    _toolbar.innerHTML = `
      <span class="ce-toolbar-label" id="ceToolbarFieldLabel">✏️</span>
      <button class="ce-toolbar-btn save"   id="ceToolbarSave">✓ Lưu</button>
      <button class="ce-toolbar-btn cancel" id="ceToolbarCancel">✕ Huỷ</button>
    `;
    document.body.appendChild(_toolbar);

    document.getElementById('ceToolbarSave').addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (_activeField) {
        _activeField.blur();
        _hideToolbar();
        _activeField = null;
      }
    });

    document.getElementById('ceToolbarCancel').addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (_activeField) {
        _activeField.innerText = _originalValue;
        _activeField.blur();
      }
      _hideToolbar();
      _activeField = null;
    });
  }

  function _showToolbar(field, fieldPath) {
    if (!_toolbar) return;
    const labelMap = {
      name: 'Tên Hồn Sư', wusoul: 'Võ Hồn', role: 'Vai Trò',
      title: 'Danh Hiệu', bio: 'Tiểu Sử',
      'skill.name': 'Tên KN', 'skill.type': 'Loại KN', 'skill.cost': 'Tiêu Hao',
      'skill.description': 'Mô Tả KN', 'skill.group': 'Group ID',
      nameVi: 'Tên Gọi', description: 'Mô Tả', set2: 'Set 2', 'set4.desc': 'Set 4 Mẫu',
      'set4.extra24': '24★ Bonus', enhanceStats: 'Cường Hóa', wusoulType: 'Hệ Võ Hồn'
    };
    const label = document.getElementById('ceToolbarFieldLabel');
    if (label) {
      let displayLabel = fieldPath || '✏️';
      if (labelMap[fieldPath]) displayLabel = labelMap[fieldPath];
      else if (fieldPath && fieldPath.startsWith('branch.')) displayLabel = 'Tên Nhánh';
      else if (fieldPath && fieldPath.startsWith('ring.')) displayLabel = 'Niên Hạn';
      label.textContent = '✏️ ' + displayLabel;
    }

    const rect = field.getBoundingClientRect();
    _toolbar.style.display = 'flex';
    _toolbar.style.top  = `${Math.max(4, rect.top + window.scrollY - 44)}px`;
    _toolbar.style.left = `${Math.min(rect.left, window.innerWidth - 210)}px`;
  }

  function _hideToolbar() {
    if (_toolbar) _toolbar.style.display = 'none';
  }

  function _applyFieldValue(fieldPath, value) {
    if (!_hero) return;
    const heroFields = ['name', 'wusoul', 'role', 'title', 'bio', 'rarity'];
    if (heroFields.includes(fieldPath)) {
      _hero[fieldPath] = value;
      return;
    }
    if (fieldPath.startsWith('skill.')) {
      const subField = fieldPath.slice(6);
      const skill = _getActiveSkill();
      if (skill) skill[subField] = value;
      return;
    }
    if (fieldPath.startsWith('branch.')) {
      const parts = fieldPath.split('.');
      const bIdx  = parseInt(parts[1], 10);
      const sub   = parts[2];
      if (_hero.branches && _hero.branches[bIdx]) {
        _hero.branches[bIdx][sub] = value;
      }
      return;
    }
    if (fieldPath.startsWith('ring.')) {
      const parts   = fieldPath.split('.');
      const mIdx    = parseInt(parts[1], 10);
      const subField = parts[2];
      const skill = _getActiveSkill();
      if (skill && skill.ringUpgrades && skill.ringUpgrades[mIdx]) {
        skill.ringUpgrades[mIdx][subField] = value;
      }
      return;
    }
  }

  function _save(fieldPath, value) {
    if (typeof HistoryManager !== 'undefined' && _hero) {
      HistoryManager.pushState(_hero);
    }
    if (_onSave) _onSave(_hero, { fieldPath, value });
  }

  function _matchesGroup(s, groupId) {
    if (!s) return false;
    if (s.group === groupId || s.groupId === groupId) return true;
    if (!s.group && !s.groupId) {
      if (groupId === 'honky') return s.type === 'Chủ động' || !!s.ringUpgrades;
      if (groupId === 'passive') return s.type === 'Bị động';
      if (groupId === 'normal') return s.name && s.name.includes('Đánh Thường');
    }
    return false;
  }

  function _getSkillsForGroup() {
    if (!_hero) return [];
    const branch = (_hero.branches || [])[_activeBranchIdx] || (_hero.branches || [])[0];
    if (!branch) return [];

    let skills = (branch.skills || []).filter(s => _matchesGroup(s, _activeGroupId));
    if (skills.length === 0 && (branch.skills || []).length > 0) {
      skills = branch.skills;
    }
    return skills;
  }

  function _getActiveSkill() {
    const skills = _getSkillsForGroup();
    if (_activeSkillIdx >= skills.length) _activeSkillIdx = Math.max(0, skills.length - 1);
    return skills[_activeSkillIdx] || null;
  }

  function _getGroupRule() {
    if (typeof DataLayer !== 'undefined' && DataLayer.SKILL_GROUP_RULES) {
      return DataLayer.SKILL_GROUP_RULES[_activeGroupId] || null;
    }
    return null;
  }

  // ─── Exports ──────────────────────────────────────────────────────────────
  return {
    init,
    render,
    renderHeroCanvas: render,
    renderHonhachCanvas,
    renderHoncotCanvas,
    setGroup,
    setBranch,
    setGroupAndBranch,
    setHero
  };
})();
