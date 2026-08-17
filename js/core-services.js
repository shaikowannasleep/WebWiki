/**
 * DOULUO PRO CORE SERVICES V6.0
 * Modular Service Layer for Data Health, Diff Engine, Scaling Graph, Effect Builder, and Command Palette
 */

// Global Safe HTML Escaper
window.escapeHtml = function(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

window.CoreServices = (function() {
  'use strict';

  // ═════════════════════════════════════════════════════════════════════════
  // 1. DATA HEALTH & DIAGNOSTIC ENGINE
  // ═════════════════════════════════════════════════════════════════════════
  const DataHealthEngine = {
    /**
     * Run full database diagnostics
     * @returns {Object} { score, totalChecks, errors: [], warnings: [], summary: {} }
     */
    runDiagnostics: function() {
      const issues = [];
      const cache = (window.DataLayer && window.DataLayer.cache) ? window.DataLayer.cache : {};
      const heroes = cache.heroesList || [];
      const keywords = cache.keywords || {};
      const honhachs = cache.honhachList || [];
      const honcots = cache.honcotList || [];
      const heroesCache = cache.heroesCache || {};

      // 1. Check Heroes
      heroes.forEach(hSummary => {
        const hero = heroesCache[hSummary.id] || hSummary;
        if (!hero) {
          issues.push({
            entityType: 'hero',
            entityId: hSummary.id,
            entityName: hSummary.name || hSummary.id,
            field: 'id',
            type: 'error',
            message: `Không tìm thấy chi tiết dữ liệu cho Hồn Sư [${hSummary.id}]`
          });
          return;
        }

        // Basic Info Checks
        if (!hero.name || hero.name.trim() === '') {
          issues.push({ entityType: 'hero', entityId: hero.id, entityName: hero.id, field: 'name', type: 'error', message: 'Tên Hồn Sư không được để trống' });
        }
        if (!hero.avatar || hero.avatar.trim() === '') {
          issues.push({ entityType: 'hero', entityId: hero.id, entityName: hero.name, field: 'avatar', type: 'warning', message: 'Chưa cấu hình ảnh Avatar' });
        }
        if (!hero.role || hero.role.trim() === '') {
          issues.push({ entityType: 'hero', entityId: hero.id, entityName: hero.name, field: 'role', type: 'warning', message: 'Chưa chọn Hệ / Vai Trò' });
        }

        // Check Branches & Skills
        if (Array.isArray(hero.branches)) {
          hero.branches.forEach((b, bIdx) => {
            if (Array.isArray(b.skills)) {
              b.skills.forEach((sk, sIdx) => {
                if (!sk.name || sk.name.trim() === '') {
                  issues.push({
                    entityType: 'hero',
                    entityId: hero.id,
                    entityName: hero.name,
                    field: `branches[${bIdx}].skills[${sIdx}]`,
                    type: 'warning',
                    message: `Kỹ năng thứ ${sIdx + 1} của "${b.branchName || `Nhánh ${bIdx+1}`}" chưa đặt tên`
                  });
                }

                // Check keyword markup {keyword}
                if (sk.description) {
                  const kwMatches = sk.description.match(/\{([a-zA-Z0-9_\u00C0-\u1EF9]+)\}/g);
                  if (kwMatches) {
                    kwMatches.forEach(rawKw => {
                      const kwKey = rawKw.replace(/[{}]/g, '');
                      if (kwKey !== 'stat' && !keywords[kwKey]) {
                        issues.push({
                          entityType: 'hero',
                          entityId: hero.id,
                          entityName: hero.name,
                          field: `skill_desc_kw`,
                          type: 'warning',
                          message: `Từ khóa {${kwKey}} trong chiêu "${sk.name || ''}" chưa có trong từ điển Keywords`
                        });
                      }
                    });
                  }
                }

                // Check Ring Upgrades
                if (Array.isArray(sk.ringUpgrades)) {
                  sk.ringUpgrades.forEach((ring, rIdx) => {
                    if (!ring.requirements || ring.requirements.length === 0) {
                      issues.push({
                        entityType: 'hero',
                        entityId: hero.id,
                        entityName: hero.name,
                        field: `ringUpgrades[${rIdx}]`,
                        type: 'warning',
                        message: `Mốc Hồn Hoàn [${ring.year || rIdx}] của chiêu "${sk.name || ''}" thiếu Typed Requirements (sao)`
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });

      // 2. Check Soul Cores (Honhach)
      honhachs.forEach(core => {
        if (!core.nameVi || core.nameVi.trim() === '') {
          issues.push({ entityType: 'honhach', entityId: core.id, entityName: core.id, field: 'nameVi', type: 'error', message: 'Tên Bộ Hồn Hạch chưa được nhập' });
        }
        if (!core.roles || core.roles.length === 0) {
          issues.push({ entityType: 'honhach', entityId: core.id, entityName: core.nameVi || core.id, field: 'roles', type: 'warning', message: 'Chưa chọn Hệ Phái áp dụng' });
        }
        if (!core.set2 || (typeof core.set2 === 'string' && core.set2.trim() === '')) {
          issues.push({ entityType: 'honhach', entityId: core.id, entityName: core.nameVi || core.id, field: 'set2', type: 'warning', message: 'Chưa nhập hiệu ứng Bộ 2 món' });
        }
        if (!core.set4 || !core.set4.desc) {
          issues.push({ entityType: 'honhach', entityId: core.id, entityName: core.nameVi || core.id, field: 'set4.desc', type: 'warning', message: 'Chưa có mô tả hiệu ứng Bộ 4 món' });
        } else if (!core.set4.stats || core.set4.stats.length < 6) {
          issues.push({ entityType: 'honhach', entityId: core.id, entityName: core.nameVi || core.id, field: 'set4.stats', type: 'warning', message: 'Bộ 4 món chưa đủ 6 mốc chỉ số sao (4★ - 24★)' });
        }
      });

      // 3. Check Soul Bones (Honcot)
      honcots.forEach(bone => {
        if (!bone.name && !bone.nameVi) {
          issues.push({ entityType: 'honcot', entityId: bone.id, entityName: bone.id, field: 'name', type: 'error', message: 'Tên Hồn Cốt chưa được nhập' });
        }
      });

      const errors = issues.filter(i => i.type === 'error');
      const warnings = issues.filter(i => i.type === 'warning');
      const totalChecks = heroes.length + honhachs.length + honcots.length + Object.keys(keywords).length;
      const score = Math.max(0, Math.round(100 - (errors.length * 15 + warnings.length * 3)));

      return {
        score,
        totalChecks,
        errors,
        warnings,
        allIssues: issues,
        summary: {
          heroesCount: heroes.length,
          soulCoresCount: honhachs.length,
          soulBonesCount: honcots.length,
          keywordsCount: Object.keys(keywords).length
        }
      };
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 2. DIFF VIEWER ENGINE
  // ═════════════════════════════════════════════════════════════════════════
  const DiffEngine = {
    computeDiff: function(oldData, newData) {
      const oldStr = typeof oldData === 'string' ? oldData : JSON.stringify(oldData, null, 2);
      const newStr = typeof newData === 'string' ? newData : JSON.stringify(newData, null, 2);

      const oldLines = oldStr.split('\n');
      const newLines = newStr.split('\n');

      const result = [];
      let i = 0, j = 0;
      let addedCount = 0;
      let removedCount = 0;

      while (i < oldLines.length || j < newLines.length) {
        if (i < oldLines.length && j < newLines.length) {
          if (oldLines[i] === newLines[j]) {
            result.push({ type: 'same', text: oldLines[i], oldLine: i + 1, newLine: j + 1 });
            i++;
            j++;
          } else {
            const nextMatchInNew = newLines.indexOf(oldLines[i], j);
            const nextMatchInOld = oldLines.indexOf(newLines[j], i);

            if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - j <= nextMatchInOld - i)) {
              while (j < nextMatchInNew) {
                result.push({ type: 'added', text: newLines[j], newLine: j + 1 });
                addedCount++;
                j++;
              }
            } else if (nextMatchInOld !== -1) {
              while (i < nextMatchInOld) {
                result.push({ type: 'removed', text: oldLines[i], oldLine: i + 1 });
                removedCount++;
                i++;
              }
            } else {
              result.push({ type: 'removed', text: oldLines[i], oldLine: i + 1 });
              result.push({ type: 'added', text: newLines[j], newLine: j + 1 });
              removedCount++;
              addedCount++;
              i++;
              j++;
            }
          }
        } else if (i < oldLines.length) {
          result.push({ type: 'removed', text: oldLines[i], oldLine: i + 1 });
          removedCount++;
          i++;
        } else if (j < newLines.length) {
          result.push({ type: 'added', text: newLines[j], newLine: j + 1 });
          addedCount++;
          j++;
        }
      }

      return {
        diffLines: result,
        addedCount,
        removedCount,
        hasChanges: addedCount > 0 || removedCount > 0
      };
    },

    renderDiffHTML: function(diffResult) {
      if (!diffResult.hasChanges) {
        return `<div style="text-align:center; padding:2rem; color:var(--text-muted);">
          <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">✨</span>
          Không có thay đổi nào giữa bản nháp và dữ liệu gốc.
        </div>`;
      }

      let html = `<div class="diff-container" style="font-family:'Fira Code', monospace; font-size:0.8rem; background:#070b14; border-radius:8px; overflow-x:auto; border:1px solid var(--border-glass); max-height:480px;">`;
      
      diffResult.diffLines.forEach(line => {
        if (line.type === 'added') {
          html += `<div style="background:rgba(34,197,94,0.15); color:#86efac; padding:2px 8px; border-left:3px solid #22c55e; white-space:pre;"><span style="color:#22c55e; margin-right:8px; user-select:none;">+</span>${window.escapeHtml(line.text)}</div>`;
        } else if (line.type === 'removed') {
          html += `<div style="background:rgba(239,68,68,0.15); color:#fca5a5; padding:2px 8px; border-left:3px solid #ef4444; white-space:pre;"><span style="color:#ef4444; margin-right:8px; user-select:none;">-</span>${window.escapeHtml(line.text)}</div>`;
        } else {
          html += `<div style="color:rgba(255,255,255,0.45); padding:2px 8px; border-left:3px solid transparent; white-space:pre;"><span style="color:rgba(255,255,255,0.2); margin-right:8px; user-select:none;"> </span>${window.escapeHtml(line.text)}</div>`;
        }
      });

      html += `</div>`;
      return html;
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 3. SCALING GRAPH RENDERER
  // ═════════════════════════════════════════════════════════════════════════
  const ScalingGraphRenderer = {
    renderMiniCurve: function(stats, options = {}) {
      if (!Array.isArray(stats) || stats.length === 0) return '';
      
      const width = options.width || 280;
      const height = options.height || 70;
      const padding = 16;
      const color = options.color || '#06B6D4';
      const labels = options.labels || ['4★', '8★', '12★', '16★', '20★', '24★'];

      const minVal = Math.min(...stats);
      const maxVal = Math.max(...stats);
      const valRange = maxVal - minVal || 1;

      const points = stats.map((val, idx) => {
        const x = padding + (idx / (stats.length - 1)) * (width - padding * 2);
        const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
        return { x, y, val, label: labels[idx] || `${idx + 1}` };
      });

      const pathD = points.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x},${pt.y}`;
        const prev = arr[idx - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
      }, '');

      const areaD = `${pathD} L ${points[points.length - 1].x},${height - 4} L ${points[0].x},${height - 4} Z`;
      const gradientId = `scaleGrad_${Math.random().toString(36).substr(2, 9)}`;

      return `
        <svg class="scaling-curve-svg" viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; overflow:visible;" title="Đường cong tăng tiến chỉ số">
          <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${areaD}" fill="url(#${gradientId})" />
          <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${points.map(pt => `
            <g class="scaling-pt-group">
              <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#0B1120" stroke="${color}" stroke-width="2" />
              <text x="${pt.x}" y="${pt.y - 7}" font-size="9" font-family="'Outfit', sans-serif" font-weight="700" fill="#F8FAFC" text-anchor="middle">${pt.val}%</text>
              <text x="${pt.x}" y="${height - 2}" font-size="8" font-family="'Inter', sans-serif" fill="rgba(255,255,255,0.4)" text-anchor="middle">${pt.label}</text>
            </g>
          `).join('')}
        </svg>
      `;
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 4. HONHACH EFFECT BUILDER ENGINE
  // ═════════════════════════════════════════════════════════════════════════
  const EffectBuilderEngine = {
    presets: {
      triggers: [
        { id: 'bithuat', name: 'Khi Võ Hồn thi triển Bí Thuật' },
        { id: 'honky', name: 'Khi phóng thích Hồn Kỹ' },
        { id: 'enter_combat', name: 'Khi bắt đầu vào trận chiến' },
        { id: 'hp_low', name: 'Khi lượng HP bản thân giảm xuống dưới 50%' },
        { id: 'ally_action', name: 'Khi đồng đội thi triển Hồn Kỹ trị liệu' },
        { id: 'crit_hit', name: 'Khi đánh trúng bạo kích mục tiêu' }
      ],
      actions: [
        { id: 'target_self', name: 'Võ Hồn đang trang bị nhận' },
        { id: 'field_buff', name: 'Tạo pháp trận lĩnh vực giúp toàn đội nhận' },
        { id: 'enemy_debuff', name: 'Khiến toàn bộ kẻ địch chịu' },
        { id: 'shield_grant', name: 'Nhận khiên hộ thuẫn tương đương' }
      ],
      effects: [
        { id: 'st_cuoi', name: 'Tăng ST Cuối', base: 7.5, step: 1.5, unit: '%' },
        { id: 'crit_rate', name: 'Tăng Tỷ Lệ Bạo', base: 5.0, step: 1.0, unit: '%' },
        { id: 'crit_dmg', name: 'Tăng Sát Thương Bạo', base: 12.0, step: 2.5, unit: '%' },
        { id: 'dmg_red', name: 'Giảm Sát Thương Chịu Vào', base: 6.0, step: 1.2, unit: '%' },
        { id: 'heal_boost', name: 'Tăng Lượng Trị Liệu', base: 10.0, step: 2.0, unit: '%' },
        { id: 'spd_boost', name: 'Tăng Tốc Độ Di Chuyển & Đánh', base: 8.0, step: 1.5, unit: '%' }
      ]
    },

    generateScalingValues: function(baseVal, stepVal) {
      const b = parseFloat(baseVal) || 7.5;
      const s = parseFloat(stepVal) || 1.5;
      return [
        Number(b.toFixed(1)),
        Number((b + s).toFixed(1)),
        Number((b + s * 2).toFixed(1)),
        Number((b + s * 3).toFixed(1)),
        Number((b + s * 4).toFixed(1)),
        Number((b + s * 5).toFixed(1))
      ];
    },

    buildDescription: function(params) {
      const { trigger, action, effectName, duration, cooldown } = params;
      let text = `${trigger}, ${action} ${effectName} {stat}%`;
      if (duration && parseInt(duration) > 0) {
        text += `, duy trì ${duration} giây`;
      }
      if (cooldown && parseInt(cooldown) > 0) {
        text += `, CD ${cooldown} giây`;
      }
      text += '.';
      return text;
    },

    buildBreakthrough24: function(durationPlus, statBonusPercent, effectName) {
      const parts = [];
      if (durationPlus && parseInt(durationPlus) > 0) {
        parts.push(`Kéo dài thời gian duy trì thêm ${durationPlus} giây`);
      }
      if (statBonusPercent && parseFloat(statBonusPercent) > 0) {
        parts.push(`${effectName || 'Hiệu ứng'} tăng thêm ${statBonusPercent}%`);
      }
      return parts.join(', ') || 'Cường hóa toàn bộ hiệu ứng lên mức tối đa.';
    }
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 5. UNIVERSAL COMMAND PALETTE (⌘K / Ctrl+K)
  // ═════════════════════════════════════════════════════════════════════════
  const CommandPaletteService = {
    actions: [],

    init: function(customActions = []) {
      this.actions = [
        { id: 'create_hero', label: 'Tạo Hồn Sư Mới (Archetype Picker)', icon: '👤', category: 'Tạo Mới', shortcut: 'N' },
        { id: 'create_honhach', label: 'Tạo Bộ Hồn Hạch Mới', icon: '🦴', category: 'Tạo Mới' },
        { id: 'create_honcot', label: 'Tạo Hồn Cốt Mới', icon: '🦴', category: 'Tạo Mới' },
        { id: 'open_health', label: 'Kiểm Tra Dữ Liệu (Data Health Diagnostic)', icon: '🛡️', category: 'Hệ Thống', shortcut: 'H' },
        { id: 'open_diff', label: 'Xem Thay Đổi Bản Nháp (Diff Viewer)', icon: '📊', category: 'Hệ Thống', shortcut: 'D' },
        { id: 'connect_disk', label: 'Kết Nối Thư Mục Đĩa Cứng (Local Disk)', icon: '📂', category: 'Đồng Bộ' },
        { id: 'save_disk', label: 'Lưu Dữ Liệu Vào Đĩa Cứng Máy Tính', icon: '💾', category: 'Đồng Bộ', shortcut: 'S' },
        { id: 'export_json', label: 'Xuất Toàn Bộ Database Dạng File JSON Bundle', icon: '📦', category: 'Dữ Liệu' },
        { id: 'open_effect_builder', label: 'Mở Trình Dựng Hiệu Ứng Hồn Hạch (Effect Builder)', icon: '⚡', category: 'Công Cụ' },
        { id: 'open_batch_ocr', label: 'Ghép Nối N Ảnh Chụp & Quét Chữ OCR Kỹ Năng (Batch OCR)', icon: '📸', category: 'Công Cụ', shortcut: 'O' },
        { id: 'goto_viewer', label: 'Xem Website Giao Diện Người Dùng (Viewer)', icon: '🌐', category: 'Điều Hướng' },
        { id: 'goto_teambuilder', label: 'Mở Trình Xây Dựng Đội Hình (Team Builder 6 Vị Trí)', icon: '👥', category: 'Điều Hướng', shortcut: 'T' },
        { id: 'goto_honcot_builder', label: 'Mở Trình Giả Lập Setup Hồn Cốt (Soul Bone Builder)', icon: '⚡', category: 'Điều Hướng', shortcut: 'B' },
        { id: 'goto_compare', label: 'Mở Chế Độ So Sánh (Compare Mode)', icon: '⚖️', category: 'Điều Hướng' },
        ...customActions
      ];
    },

    search: function(query) {
      if (!query || query.trim() === '') {
        return this.actions.map(a => ({ ...a, type: 'action' }));
      }

      const q = query.toLowerCase().trim();
      const results = [];
      const cache = (window.DataLayer && window.DataLayer.cache) ? window.DataLayer.cache : {};

      // 1. Match Actions
      this.actions.forEach(a => {
        if (a.label.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q))) {
          results.push({ ...a, type: 'action' });
        }
      });

      // 2. Match Heroes
      const heroes = cache.heroesList || [];
      heroes.forEach(h => {
        const name = (h.name || '').toLowerCase();
        const id = (h.id || '').toLowerCase();
        const role = (h.role || '').toLowerCase();
        const title = (h.title || '').toLowerCase();
        if (name.includes(q) || id.includes(q) || role.includes(q) || title.includes(q)) {
          results.push({
            id: `hero_${h.id}`,
            entityId: h.id,
            label: `${h.name} (${h.title || h.role || 'Hồn Sư'})`,
            icon: '👤',
            category: 'Hồn Sư',
            type: 'entity_hero',
            badge: h.rarity || 'SSR'
          });
        }
      });

      // 3. Match Soul Cores (Honhach)
      const honhachs = cache.honhachList || [];
      honhachs.forEach(core => {
        const nameVi = (core.nameVi || '').toLowerCase();
        const id = (core.id || '').toLowerCase();
        if (nameVi.includes(q) || id.includes(q)) {
          results.push({
            id: `honhach_${core.id}`,
            entityId: core.id,
            label: `Bộ: ${core.nameVi}`,
            icon: '🦴',
            category: 'Hồn Hạch',
            type: 'entity_honhach',
            badge: core.rarity || 'SSR'
          });
        }
      });

      // 4. Match Keywords
      const keywords = cache.keywords || {};
      Object.keys(keywords).forEach(kKey => {
        const kw = keywords[kKey];
        const kwName = (kw.name || '').toLowerCase();
        if (kKey.toLowerCase().includes(q) || kwName.includes(q)) {
          results.push({
            id: `kw_${kKey}`,
            entityId: kKey,
            label: `Từ Khóa: [${kw.name || kKey}] (${kw.type || 'Hiệu ứng'})`,
            icon: kw.icon || '✨',
            category: 'Keywords',
            type: 'entity_keyword',
            badge: kw.type
          });
        }
      });

      return results;
    }
  };

  return {
    DataHealthEngine,
    DiffEngine,
    ScalingGraphRenderer,
    EffectBuilderEngine,
    CommandPaletteService
  };
})();
