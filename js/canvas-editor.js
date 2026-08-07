/**
 * CanvasEditor Module — Douluo Wiki Studio V3.2
 * Full inline editable canvas (Panel 2):
 * - Every text element is contenteditable
 * - Branch names editable (double-click or click edit icon next to tab)
 * - Rarity dropdown inline
 * - Skill nav arrows to browse all skills in a group
 * - All changes auto-sync to hero JSON
 */

const CanvasEditor = (() => {
  // ─── State ───────────────────────────────────────────────────────────────
  let _hero = null;
  let _onSave = null;
  let _activeGroupId = 'honky';
  let _activeBranchIdx = 0;
  let _activeSkillIdx = 0;       // index within current group's skill list
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
  function setHero(hero)   { _hero = hero; }

  /** Full render into target container by id */
  function render(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !_hero) return;
    container.innerHTML = _buildCanvasHTML();
    _bindEvents(container);
  }

  // ─── HTML Builders ────────────────────────────────────────────────────────

  function _buildCanvasHTML() {
    if (!_hero) return `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Chưa có Hồn Sư được chọn.</p>`;

    const skills = _getSkillsForGroup();
    const skill  = skills[_activeSkillIdx] || skills[0] || null;

    return `
      <!-- ① HERO HEADER — fully editable -->
      <div style="background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:12px; padding:1rem; margin-bottom:1rem;">
        <div style="display:flex; gap:1rem; align-items:flex-start;">

          <!-- Avatar -->
          <div class="ce-avatar-wrapper" id="ceAvatarWrapper" title="Click để đổi ảnh avatar">
            <img id="ceAvatarImg"
              src="${_hero.avatar || 'assets/heroes/oscar/avatar.webp'}"
              style="width:80px; height:80px; border-radius:10px; object-fit:cover; display:block; border:1.5px solid var(--border-glass);"
              onerror="this.src='assets/heroes/oscar/avatar.webp'">
            <input type="file" id="ceAvatarFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <!-- Rarity (inline select) + Role (editable) -->
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center; margin-bottom:0.4rem;">
              <!-- Rarity dropdown -->
              <select class="ce-rarity-select" data-ce-field="rarity"
                style="background:transparent; border:none; font-size:0.75rem; font-weight:800; color:${_rarityColor(_hero.rarity)}; cursor:pointer; padding:0.15rem 0.3rem; border-radius:6px; appearance:none; text-align:center;"
                title="Click để đổi độ hiếm">
                ${['N','R','SR','SSR','SP'].map(r => `<option value="${r}" ${_hero.rarity === r ? 'selected' : ''} style="background:#1e293b; color:#fff;">${r}</option>`).join('')}
              </select>
              <!-- Role -->
              <span class="ce-field role-badge"
                contenteditable="true"
                data-ce-field="role"
                style="padding:0.15rem 0.5rem;"
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

      <!-- ② BRANCH TABS — tên tab hoàn toàn có thể sửa -->
      ${_buildBranchTabs()}

      <!-- ③ SKILL NAVIGATOR — arrow browse + full skill card editable -->
      ${_buildSkillNavigator(skills, skill)}

      <!-- ④ RING MILESTONES -->
      ${skill && skill.ringUpgrades && skill.ringUpgrades.length ? _buildRingMilestones(skill) : ''}

      <!-- ⑤ HINT -->
      <div style="margin-top:0.75rem; padding:0.4rem 0.75rem; background:rgba(251,191,36,0.05); border:1px dashed rgba(251,191,36,0.25); border-radius:8px; font-size:0.7rem; color:rgba(251,191,36,0.6); text-align:center;">
        ✏️ Click vào bất kỳ nội dung nào để chỉnh sửa trực tiếp — đổi tên nhánh, kỹ năng, mọi thứ đều lưu về JSON
      </div>
    `;
  }

  function _rarityColor(rarity) {
    const map = { SP: '#ef4444', SSR: '#FBBF24', SR: '#c084fc', R: '#60a5fa', N: '#94a3b8' };
    return map[rarity] || '#fff';
  }

  /** Branch tabs: click = switch, inline edit icon = rename */
  function _buildBranchTabs() {
    const rule = _getGroupRule();
    if (!rule || !rule.hasBranch) return '';
    const branches = _hero.branches || [];
    if (branches.length < 1) return '';

    return `
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.75rem; align-items:center;">
        ${branches.map((b, idx) => `
          <div class="ce-branch-tab-wrap" style="display:flex; align-items:center; gap:0; position:relative;">
            <!-- Tab switch button -->
            <button class="ce-branch-tab ${idx === _activeBranchIdx ? 'active' : ''}"
              data-ce-branch="${idx}"
              style="padding-right:1.5rem; position:relative;">
              <!-- Branch name: contenteditable span inside button -->
              <span class="ce-field ce-branch-name"
                contenteditable="true"
                data-ce-field="branch.${idx}.branchName"
                title="Double-click hoặc click để sửa tên nhánh"
                style="outline:none; pointer-events:auto;"
                >${b.branchName || `Nhánh ${idx + 1}`}</span>
            </button>
          </div>
        `).join('')}
        <!-- Add branch hint -->
        <span style="font-size:0.7rem; color:var(--text-muted); margin-left:0.25rem;">← Click để chọn • Click vào tên để đổi tên</span>
      </div>
    `;
  }

  /** Skill navigator: ◀ [1/N] ▶ + full editable skill card */
  function _buildSkillNavigator(skills, skill) {
    const total = skills.length;
    const idx   = _activeSkillIdx;

    const navBar = total > 1 ? `
      <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
        <button class="ce-nav-btn" data-ce-skill-nav="-1" ${idx === 0 ? 'disabled style="opacity:0.35;"' : ''}
          style="padding:0.2rem 0.6rem; background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:6px; color:#fff; cursor:pointer; font-weight:700;">◀</button>
        <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Kỹ năng ${idx + 1} / ${total}</span>
        <button class="ce-nav-btn" data-ce-skill-nav="1" ${idx === total - 1 ? 'disabled style="opacity:0.35;"' : ''}
          style="padding:0.2rem 0.6rem; background:var(--bg-surface); border:1px solid var(--border-glass); border-radius:6px; color:#fff; cursor:pointer; font-weight:700;">▶</button>
        <span style="font-size:0.7rem; color:var(--accent-gold); margin-left:auto;">Nhóm: <strong>${_activeGroupId}</strong></span>
      </div>
    ` : '';

    if (!skill) {
      return `
        ${navBar}
        <div style="background:var(--bg-surface); border:1px dashed var(--border-glass); border-radius:12px; padding:2rem; text-align:center; color:var(--text-muted);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">⚠️</div>
          <div>Nhóm <strong>${_activeGroupId}</strong> chưa có kỹ năng nào.<br>Dùng sidebar để thêm kỹ năng.</div>
        </div>
      `;
    }

    return `${navBar}${_buildSkillCard(skill, idx)}`;
  }

  function _buildSkillCard(skill, skillIdx) {
    return `
      <div class="ce-skill-card" style="margin-bottom:0.75rem;">
        <!-- Skill header -->
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.85rem;">

          <!-- Skill icon (click to change) -->
          <div class="ce-avatar-wrapper" id="ceSkillIconWrapper" title="Click để đổi Icon kỹ năng" style="width:46px; height:46px; flex-shrink:0;">
            <img id="ceSkillIconImg"
              src="${skill.icon && skill.icon.includes('/') ? skill.icon : 'assets/icons/star_gold.svg'}"
              style="width:46px; height:46px; border-radius:8px; object-fit:cover; display:block; border:1px solid var(--border-glass);"
              onerror="this.src='assets/icons/star_gold.svg'">
            <input type="file" id="ceSkillIconFileInput" accept="image/*" style="display:none">
          </div>

          <div style="flex:1; min-width:0;">
            <!-- Skill name -->
            <div class="ce-field"
              contenteditable="true"
              data-ce-field="skill.name"
              style="font-weight:800; font-size:1rem; color:#fff; margin-bottom:0.25rem;"
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
              <!-- Group label (editable) -->
              <span class="ce-field"
                contenteditable="true"
                data-ce-field="skill.group"
                style="font-size:0.68rem; padding:0.1rem 0.4rem; background:rgba(192,132,252,0.1); border:1px solid rgba(192,132,252,0.35); color:#c084fc; border-radius:20px; font-weight:600; font-family:monospace;"
                title="Click để sửa Group ID (honky/passive/tienco/normal/bithuat)">${skill.group || _activeGroupId}</span>
            </div>
          </div>
        </div>

        <!-- Skill description (multiline editable) -->
        <div class="ce-field"
          contenteditable="true"
          data-ce-field="skill.description"
          style="font-size:0.88rem; color:var(--text-sub); line-height:1.65; min-height:3rem; padding:0.5rem 0.6rem; background:rgba(255,255,255,0.02); border-radius:6px; border:1px solid rgba(255,255,255,0.04); white-space:pre-wrap;"
          title="Click để sửa Mô Tả kỹ năng">${skill.description || '(Nhập mô tả kỹ năng...)'}</div>
      </div>
    `;
  }

  function _buildRingMilestones(skill) {
    const upgrades = skill.ringUpgrades || [];
    if (!upgrades.length) return '';
    return `
      <div style="background:rgba(192,132,252,0.06); border:1px solid rgba(192,132,252,0.2); border-radius:10px; padding:0.85rem; margin-bottom:0.75rem;">
        <div style="font-size:0.75rem; font-weight:800; color:#c084fc; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:0.6rem;">⭕ MỐC NIÊN HẠN HỒN HOÀN</div>
        <div style="display:flex; flex-direction:column; gap:0.45rem;">
          ${upgrades.map((u, mIdx) => `
            <div style="display:flex; gap:0.5rem; align-items:flex-start; padding:0.45rem 0.5rem; background:rgba(192,132,252,0.05); border-radius:6px;">
              <div class="ce-field"
                contenteditable="true"
                data-ce-field="ring.${mIdx}.year"
                style="font-size:0.8rem; font-weight:700; color:#c084fc; min-width:100px; flex-shrink:0;"
                title="Sửa niên hạn">${u.year || '10,000 năm'}</div>
              <div class="ce-field"
                contenteditable="true"
                data-ce-field="ring.${mIdx}.bonus"
                style="font-size:0.82rem; color:var(--text-sub); flex:1; white-space:pre-wrap;"
                title="Sửa hiệu ứng mốc">${u.bonus || '(Tác dụng nâng cấp...)'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ─── Event Binding ────────────────────────────────────────────────────────

  function _bindEvents(container) {

    // ── Avatar → file picker ──
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

    // ── Skill icon → file picker ──
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

    // ── Rarity select ──
    const raritySelect = container.querySelector('.ce-rarity-select');
    if (raritySelect) {
      raritySelect.addEventListener('change', () => {
        _hero.rarity = raritySelect.value;
        raritySelect.style.color = _rarityColor(raritySelect.value);
        _save('rarity', raritySelect.value);
      });
    }

    // ── Skill navigation arrows ──
    container.querySelectorAll('[data-ce-skill-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const delta = parseInt(btn.getAttribute('data-ce-skill-nav'), 10);
        const skills = _getSkillsForGroup();
        _activeSkillIdx = Math.max(0, Math.min(skills.length - 1, _activeSkillIdx + delta));
        render(container.id);
      });
    });

    // ── Branch tab clicks (switch branch — but NOT on the name span) ──
    container.querySelectorAll('[data-ce-branch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If click is on the editable name span, don't switch branch — let it edit
        if (e.target.classList.contains('ce-branch-name') || e.target.closest('.ce-branch-name')) return;
        _activeBranchIdx = parseInt(btn.getAttribute('data-ce-branch'), 10);
        _activeSkillIdx = 0;
        render(container.id);
        if (_onSave) _onSave(_hero, { branchChanged: true, branchIdx: _activeBranchIdx });
      });
    });

    // ── All contenteditable .ce-field elements ──
    container.querySelectorAll('.ce-field[contenteditable]').forEach(field => {
      const fieldPath = field.getAttribute('data-ce-field');

      // Branch name fields: clicking them should NOT bubble to the button
      if (fieldPath && fieldPath.startsWith('branch.')) {
        field.addEventListener('mousedown', (e) => e.stopPropagation());
        field.addEventListener('click',     (e) => e.stopPropagation());
      }

      field.addEventListener('focus', () => {
        _activeField   = field;
        _originalValue = field.innerText.trim();
        _showToolbar(field, fieldPath);
      });

      field.addEventListener('blur', () => {
        setTimeout(() => {
          if (_activeField === field) {
            _commitField(field, fieldPath);
            _hideToolbar();
            _activeField = null;
          }
        }, 180);
      });

      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const multilineFields = ['skill.description', 'bio', 'ring'];
          const isMultiline = multilineFields.some(f => fieldPath && fieldPath.startsWith(f));
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

  // ─── Floating Toolbar ─────────────────────────────────────────────────────

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
        const fieldPath = _activeField.getAttribute('data-ce-field');
        _commitField(_activeField, fieldPath);
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
    // Update label to show which field is being edited
    const labelMap = {
      name: 'Tên Hồn Sư', wusoul: 'Võ Hồn', role: 'Vai Trò',
      title: 'Danh Hiệu', bio: 'Tiểu Sử',
      'skill.name': 'Tên KN', 'skill.type': 'Loại KN', 'skill.cost': 'Tiêu Hao',
      'skill.description': 'Mô Tả KN', 'skill.group': 'Group ID'
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

  // ─── Field Commit & Save ──────────────────────────────────────────────────

  function _commitField(field, fieldPath) {
    if (!_hero || !fieldPath) return;
    const newValue = field.innerText.trim();
    if (newValue === _originalValue) return;
    _applyFieldValue(fieldPath, newValue);
    _save(fieldPath, newValue);
  }

  function _applyFieldValue(fieldPath, value) {
    if (!_hero) return;

    // ── Hero top-level fields ──
    const heroFields = ['name', 'wusoul', 'role', 'title', 'bio', 'rarity'];
    if (heroFields.includes(fieldPath)) {
      _hero[fieldPath] = value;
      return;
    }

    // ── Skill fields: skill.name / skill.type / skill.cost / skill.description / skill.group / skill.icon ──
    if (fieldPath.startsWith('skill.')) {
      const subField = fieldPath.slice(6);
      const skill = _getActiveSkill();
      if (skill) skill[subField] = value;
      return;
    }

    // ── Branch name: branch.<idx>.branchName ──
    if (fieldPath.startsWith('branch.')) {
      const parts = fieldPath.split('.');
      const bIdx  = parseInt(parts[1], 10);
      const sub   = parts[2]; // 'branchName'
      if (_hero.branches && _hero.branches[bIdx]) {
        _hero.branches[bIdx][sub] = value;
      }
      return;
    }

    // ── Ring milestone: ring.<mIdx>.year | ring.<mIdx>.bonus ──
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
    if (_onSave) _onSave(_hero, { fieldPath, value });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /** Get all skills for the current group (handles branched and non-branched groups) */
  function _getSkillsForGroup() {
    if (!_hero) return [];
    const rule = _getGroupRule();
    let skills = [];

    if (rule && rule.hasBranch) {
      const branch = (_hero.branches || [])[_activeBranchIdx] || (_hero.branches || [])[0];
      if (branch) skills = (branch.skills || []).filter(s => s.group === _activeGroupId);
    } else {
      (_hero.branches || []).forEach(b => {
        const found = (b.skills || []).filter(s => s.group === _activeGroupId);
        skills.push(...found);
      });
    }
    return skills;
  }

  /** Get the currently-indexed skill */
  function _getActiveSkill() {
    const skills = _getSkillsForGroup();
    // Clamp index
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
  return { init, render, setGroup, setBranch, setHero };
})();
