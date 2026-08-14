/**
 * i18n Translation Engine & Concept Dictionary Module - Douluo MMO Wiki
 * Manages language state ('vi' / 'en'), UI translations, and dynamic data concept mapping.
 */

const i18n = {
  currentLang: localStorage.getItem('douluo_wiki_lang') || 'vi',

  // UI Translation Dictionary (Strictly 1 Language: Pure VI or Pure EN)
  ui: {
    vi: {
      // Header Nav
      nav_home: 'Trang Chủ',
      nav_heroes: 'Hồn Sư',
      nav_honhach: 'Hồn Hạch',
      nav_honcot: 'Hồn Cốt',
      nav_phuvan: 'Phù Văn',
      nav_editor: '🛠️ Editor Mode',
      editor_title: 'WIKI STUDIO V3.1',

      // Hero Banner & Stats Bar
      banner_badge: 'WIKI V3.1 BÁCH KHOA',
      banner_title: 'TRA CỨU KỸ NĂNG HỒN SƯ',
      banner_desc: 'Bách khoa toàn thư Đấu La Đại Lục MMO: Hồn Sư Đối Quyết. Tra cứu chi tiết 2 Nhánh Hồn Hoàn, thông số kỹ năng, mốc Niên Hạn và giải thích Từ Khóa hiệu ứng tức thì.',
      stat_heroes: '👥 Hồn Sư:',
      stat_honhach: '🦴 Bộ Hồn Hạch:',
      stat_branches: '⚡ Nhánh Hồn Hoàn:',
      stat_keywords: '✨ Tra Cứu Từ Khóa:',
      stat_honhach_val: '8+ Bộ',
      stat_branches_val: '2 Nhánh / Hồn Sư',
      stat_keywords_val: 'Tự Động Pop-up',

      // Filter Section
      search_placeholder: 'Nhập tên Hồn Sư, danh hiệu, Võ Hồn hoặc đặc điểm (VD: Oscar, Đường Tam, Hồi Hồn Lực)...',
      search_honhach_placeholder: 'Nhập tên Bộ Hồn Hạch (Sương Ảnh Thương Long, Ngục Hỏa Xích Quyền...), thuộc tính hoặc hiệu ứng...',
      role_title: '❖ PHÂN LOẠI HỆ HỒN SƯ',
      rarity_title: '⭐ ĐỘ HIẾM:',
      sort_title: '⇅ SẮP XẾP:',
      sort_default: 'Mặc định',
      sort_name_asc: 'Tên (A ➔ Z)',
      sort_name_desc: 'Tên (Z ➔ A)',
      sort_rarity_desc: 'Độ Hiếm (SP ➔ SR)',

      // Roles
      role_all: '⚡ Tất Cả Hệ',
      role_cuong_cong: '⚔️ Cường Công',
      role_man_cong: '⚡ Mẫn Công',
      role_khong_che: '🌿 Khống Chế',
      role_phu_tro: '🧪 Phụ Trợ',
      role_phong_thu: '🛡️ Phòng Thủ',

      // Rarity
      rarity_all: 'Tất Cả',

      // Hero Card
      view_detail: 'Xem Chi Tiết Kỹ Năng',
      no_results_title: 'Không tìm thấy Hồn Sư phù hợp',
      no_results_desc: 'Thử nhập lại từ khóa khác hoặc xóa bộ lọc để xem tất cả!',

      // Radial Menu & Skills
      skill_group_normal: 'Đánh Thường',
      skill_group_passive: 'Bị Động',
      skill_group_honky: 'Hồn Kỹ',
      skill_group_tienco: 'Tiên Cơ',
      skill_group_bithuat: 'Bí Thuật',
      ring_milestone_title: '⭕ MỐC NIÊN HẠN HỒN HOÀN',
      wusoul_label: '✨ Võ Hồn:',
      view_detail_hero: '➔ Xem Chi Tiết',

      // Honhach Page
      honhach_banner_title: 'BÁCH KHOA BỘ HỒN HẠCH',
      honhach_banner_desc: 'Tra cứu danh sách Bộ Hồn Hạch 2 món & 4 món, thông số kích hoạt mốc Sao (2★ - 24★) và thuộc tính cường hóa trong Đấu La MMO.',
      honhach_role_title: '❖ PHÂN LOẠI THEO HỆ HỒN SƯ',
      honhach_set2_title: 'Bộ 2 Món',
      honhach_set4_title: 'Bộ 4 Món',
      honhach_breakthrough: 'Đột phá 24★:',

      // Edit Studio
      editor_mode_title: 'CHẾ ĐỘ EDITOR STUDIO:',
      tab_hero_mgr: '👤 Quản Lý Hồn Sư',
      tab_honhach_mgr: '🦴 Quản Lý Hồn Hạch',
      view_desktop: '🖥️ Giao Diện Desktop',
      view_phone: '📱 Giao Diện Mobile',
      btn_add_hero: '➕ Thêm Hồn Sư',
      btn_add_honhach: '➕ Thêm Bộ Mới',
      btn_clone: '📋 Nhân Bản',
      btn_delete: '🗑️ Xóa',
      btn_connect_disk: '📂 Kết Nối Local Disk',
      btn_save_disk: '💾 Lưu Disk JSON',
      btn_reset: '🔄 Reset',
      folder_status_disconnected: 'Chưa kết nối',
      folder_status_connected: 'Đã kết nối Local Disk',
      folder_banner_text: 'Hệ thống Quản lý Hồn Sư & Hồn Hạch tích hợp Live Canvas Preview tự động đồng bộ.',
      
      // Studio Stepper
      step_1: '👤 1. Chọn Mục Tiêu',
      step_2: '📝 2. Thông Tin Cơ Bản',
      step_3: '⚔️ 3. Chỉnh Kỹ Năng / Preset',
      step_4: '👁️ 4. Live Canvas & Lưu Disk',

      // Sidebar Form Steps
      step_hero_info: '👤 BƯỚC 1: THÔNG TIN HỒN SƯ',
      step_skill_group: '⚔️ BƯỚC 2: CHỌN NHÓM KỸ NĂNG',
      step_skill_detail: '🛠️ BƯỚC 3: CHI TIẾT KỸ NĂNG',
      step_ring_milestone: '⭕ BƯỚC 4: MỐC NIÊN HẠN HỒN HOÀN',
      step_asset_paste: '🖼️ BƯỚC 5: THAY ĐỔI ẢNH & DÁN MEDIA',
      
      label_hero_name: 'Tên Hồn Sư:',
      label_wusoul: 'Võ Hồn:',
      label_role: 'Hệ / Vai Trò:',
      label_title: 'Danh Hiệu:',
      label_rarity: 'Độ Hiếm:',
      label_bio: 'Tiểu Sử:',
      label_skill_name: 'Tên Kỹ Năng:',
      label_skill_type: 'Loại Kỹ Năng:',
      label_skill_cost: 'Tiêu Hao Hồn Lực:',
      label_skill_desc: 'Mô Tả ({TừKhóa}):',
      btn_insert_kw: '✨ Chèn từ khóa (@)',
      btn_add_milestone: '+ Thêm Mốc',
      label_paste_hint: 'Nhấn Ctrl+V hoặc Click để tải ảnh',
      
      // Footer
      footer_copy: '© 2026 Douluo MMO Wiki - Hồn Sư Đối Quyết. Static Site powered by GitHub Pages.'
    },

    en: {
      // Header Nav
      nav_home: 'Home',
      nav_heroes: 'Soul Masters',
      nav_honhach: 'Soul Cores',
      nav_honcot: 'Soul Bones',
      nav_phuvan: 'Runes',
      nav_editor: '🛠️ Editor Mode',
      editor_title: 'WIKI STUDIO V3.1',

      // Hero Banner & Stats Bar
      banner_badge: 'WIKI V3.1 ENCYCLOPEDIA',
      banner_title: 'SOUL MASTER SKILLS WIKI',
      banner_desc: 'Douluo MMO Encyclopedia: Soul Master Showdown. Detailed 2 Soul Ring Branches, Skill Stats, Year Milestones, and Instant Keyword Effects.',
      stat_heroes: '👥 Masters:',
      stat_honhach: '🦴 Soul Cores:',
      stat_branches: '⚡ Ring Branches:',
      stat_keywords: '✨ Keyword Search:',
      stat_honhach_val: '8+ Sets',
      stat_branches_val: '2 / Master',
      stat_keywords_val: 'Auto Pop-up',

      // Filter Section
      search_placeholder: 'Search Soul Master, title, Martial Soul, or attributes (e.g. Oscar, Tang San, Energy)...',
      search_honhach_placeholder: 'Search Soul Core Set (Frost Dragon, Hellfire Fist...), attributes, or effects...',
      role_title: '❖ SYSTEM ROLE CLASSIFICATION',
      rarity_title: '⭐ RARITY:',
      sort_title: '⇅ SORT BY:',
      sort_default: 'Default',
      sort_name_asc: 'Name (A ➔ Z)',
      sort_name_desc: 'Name (Z ➔ A)',
      sort_rarity_desc: 'Rarity (SP ➔ SR)',

      // Roles
      role_all: '⚡ All Roles',
      role_cuong_cong: '⚔️ Heavy Attack',
      role_man_cong: '⚡ Agility',
      role_khong_che: '🌿 Control',
      role_phu_tro: '🧪 Support',
      role_phong_thu: '🛡️ Defense',

      // Rarity
      rarity_all: 'All',

      // Hero Card
      view_detail: 'View Skill Details',
      no_results_title: 'No Matching Soul Master Found',
      no_results_desc: 'Try searching with different keywords or reset filters!',

      // Radial Menu & Skills
      skill_group_normal: 'Normal Attack',
      skill_group_passive: 'Passive',
      skill_group_honky: 'Soul Skill',
      skill_group_tienco: 'Initiative',
      skill_group_bithuat: 'Secret Tech',
      ring_milestone_title: '⭕ SOUL RING YEAR MILESTONES',
      wusoul_label: '✨ Martial Soul:',
      view_detail_hero: '➔ View Details',

      // Honhach Page
      honhach_banner_title: 'SOUL CORE ENCYCLOPEDIA',
      honhach_banner_desc: 'Explore 2-Piece & 4-Piece Soul Core Sets, Star Activation Milestones (2★ - 24★), and Combat Enhancements in Douluo MMO.',
      honhach_role_title: '❖ SOUL MASTER ROLE CLASSIFICATION',
      honhach_set2_title: '2-Piece Set',
      honhach_set4_title: '4-Piece Set',
      honhach_breakthrough: '24★ Breakthrough:',

      // Edit Studio
      editor_mode_title: 'STUDIO EDITOR MODE:',
      tab_hero_mgr: '👤 Soul Master Manager',
      tab_honhach_mgr: '🦴 Soul Core Manager',
      view_desktop: '🖥️ Desktop View',
      view_phone: '📱 Mobile View',
      btn_add_hero: '➕ Add Soul Master',
      btn_add_honhach: '➕ Add New Set',
      btn_clone: '📋 Clone',
      btn_delete: '🗑️ Delete',
      btn_connect_disk: '📂 Connect Local Disk',
      btn_save_disk: '💾 Save Disk JSON',
      btn_reset: '🔄 Reset',
      folder_status_disconnected: 'Not Connected',
      folder_status_connected: 'Local Disk Connected',
      folder_banner_text: 'Soul Master & Soul Core Management System with Real-Time Live Canvas Preview.',
      
      // Studio Stepper
      step_1: '👤 1. Select Target',
      step_2: '📝 2. Basic Profile',
      step_3: '⚔️ 3. Skill Config',
      step_4: '👁️ 4. Live Canvas & Save',

      // Sidebar Form Steps
      step_hero_info: '👤 STEP 1: SOUL MASTER INFO',
      step_skill_group: '⚔️ STEP 2: SELECT SKILL GROUP',
      step_skill_detail: '🛠️ STEP 3: SKILL DETAILS',
      step_ring_milestone: '⭕ STEP 4: SOUL RING MILESTONES',
      step_asset_paste: '🖼️ STEP 5: ASSET PASTE & MEDIA',
      
      label_hero_name: 'Master Name:',
      label_wusoul: 'Martial Soul:',
      label_role: 'Role / System:',
      label_title: 'Title:',
      label_rarity: 'Rarity:',
      label_bio: 'Biography:',
      label_skill_name: 'Skill Name:',
      label_skill_type: 'Skill Type:',
      label_skill_cost: 'Energy Cost:',
      label_skill_desc: 'Description ({Keyword}):',
      btn_insert_kw: '✨ Insert Keyword (@)',
      btn_add_milestone: '+ Add Milestone',
      label_paste_hint: 'Press Ctrl+V or Click to Upload Image',
      
      // Footer
      footer_copy: '© 2026 Douluo MMO Wiki - Soul Master Showdown. Static Site powered by GitHub Pages.'
    }
  },

  // Dictionary for translating dynamic JSON data concepts (VI <-> EN)
  concepts: {
    // Roles
    'Cường Công': { en: 'Heavy Attack', vi: 'Cường Công' },
    'Mẫn Công': { en: 'Agility Attack', vi: 'Mẫn Công' },
    'Khống Chế': { en: 'Control', vi: 'Khống Chế' },
    'Phụ Trợ': { en: 'Support', vi: 'Phụ Trợ' },
    'Phòng Thủ': { en: 'Defense', vi: 'Phòng Thủ' },

    // Skill Group Names
    'Đánh Thường': { en: 'Normal Attack', vi: 'Đánh Thường' },
    'Bị Động': { en: 'Passive', vi: 'Bị Động' },
    'Hồn Kỹ': { en: 'Soul Skill', vi: 'Hồn Kỹ' },
    'Tiên Cơ': { en: 'Initiative', vi: 'Tiên Cơ' },
    'Bí Thuật': { en: 'Secret Tech', vi: 'Bí Thuật' },

    // Common Hero Names & Titles
    'Đường Tam': { en: 'Tang San', vi: 'Đường Tam' },
    'Oscar': { en: 'Oscar', vi: 'Oscar' },
    'Tiểu Vũ': { en: 'Xiao Wu', vi: 'Tiểu Vũ' },
    'Đới Mộc Bạch': { en: 'Dai Mubai', vi: 'Đới Mộc Bạch' },
    'Mã Hồng Tuấn': { en: 'Ma Hongjun', vi: 'Mã Hồng Tuấn' },
    'Ninh Vinh Vinh': { en: 'Ning Rongrong', vi: 'Ninh Vinh Vinh' },
    'Chu Trúc Thanh': { en: 'Zhu Zhuqing', vi: 'Chu Trúc Thanh' },

    // Soul Cores
    'Sương Ảnh Thương Long': { en: 'Frost Dragon Core', vi: 'Sương Ảnh Thương Long' },
    'Ngục Hỏa Xích Quyền': { en: 'Hellfire Fist Core', vi: 'Ngục Hỏa Xích Quyền' },
    'Thiên Không Cửu Hồn': { en: 'Sky Nine Soul Core', vi: 'Thiên Không Cửu Hồn' },
    'Băng Phong Vương Tọa': { en: 'Ice Throne Core', vi: 'Băng Phong Vương Tọa' },
    'Thánh Quang Hộ Thể': { en: 'Holy Light Guard Core', vi: 'Thánh Quang Hộ Thể' },

    // Common Skill Types & Terms
    'Chủ động': { en: 'Active', vi: 'Chủ động' },
    '10,000 năm': { en: '10,000 Years', vi: '10,000 năm' },
    '25,000 năm': { en: '25,000 Years', vi: '25,000 năm' },
    '50,000 năm': { en: '50,000 Years', vi: '50,000 năm' },
    '100,000 năm': { en: '100,000 Years', vi: '100,000 năm' },
    '4 sao vàng': { en: '4 Gold Stars', vi: '4 sao vàng' },
    '1 sao đỏ': { en: '1 Red Star', vi: '1 sao đỏ' },
    '3 sao đỏ': { en: '3 Red Stars', vi: '3 sao đỏ' },
    '4 sao đỏ': { en: '4 Red Stars', vi: '4 sao đỏ' }
  },

  /**
   * Get translation for UI string key
   */
  t(key) {
    const langDict = this.ui[this.currentLang] || this.ui.vi;
    return langDict[key] || this.ui.vi[key] || key;
  },

  /**
   * Get translation for a dynamic concept (e.g. role, skill group, concept name)
   */
  translateConcept(term) {
    if (!term) return '';
    if (this.currentLang === 'vi') return term;

    const mapped = this.concepts[term];
    if (mapped && mapped.en) return mapped.en;

    // Automatic substring replacements for EN
    return term
      .replace(/Cường Công/g, 'Heavy Attack')
      .replace(/Mẫn Công/g, 'Agility')
      .replace(/Khống Chế/g, 'Control')
      .replace(/Phụ Trợ/g, 'Support')
      .replace(/Phòng Thủ/g, 'Defense')
      .replace(/Hồn Kỹ/g, 'Soul Skill')
      .replace(/Bị Động/g, 'Passive')
      .replace(/Tiên Cơ/g, 'Initiative')
      .replace(/Bí Thuật/g, 'Secret Tech')
      .replace(/Đánh Thường/g, 'Normal Attack')
      .replace(/10,000 năm/g, '10,000 Years')
      .replace(/25,000 năm/g, '25,000 Years')
      .replace(/50,000 năm/g, '50,000 Years')
      .replace(/100,000 năm/g, '100,000 Years')
      .replace(/Bộ 2 Món/g, '2-Piece Set')
      .replace(/Bộ 4 Món/g, '4-Piece Set')
      .replace(/Đột phá 24★/g, '24★ Breakthrough');
  },

  /**
   * Automatically update all DOM elements containing data-i18n attributes
   */
  applyToPage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.placeholder) el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
  },

  /**
   * Switch Language ('vi' | 'en')
   */
  setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    this.currentLang = lang;
    localStorage.setItem('douluo_wiki_lang', lang);

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Apply translations to DOM
    this.applyToPage();

    // Dispatch event so all components update immediately
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  getLanguage() {
    return this.currentLang;
  },

  /**
   * Initialize Language Selector Switch UI
   */
  initLanguageSelector() {
    const wrappers = document.querySelectorAll('.lang-selector-wrapper');
    wrappers.forEach(wrapper => {
      wrapper.innerHTML = `
        <div class="lang-switch-pill" style="display: flex; gap: 0.2rem; background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-glass); padding: 0.2rem; border-radius: 20px;">
          <button class="lang-btn ${this.currentLang === 'vi' ? 'active' : ''}" data-lang="vi" style="padding: 0.25rem 0.65rem; border-radius: 14px; font-size: 0.75rem; font-weight: 700; color: ${this.currentLang === 'vi' ? '#fff' : 'var(--text-sub)'}; background: ${this.currentLang === 'vi' ? 'var(--primary)' : 'transparent'}; border: none; cursor: pointer; transition: all 0.2s;">🇻🇳 VI</button>
          <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en" style="padding: 0.25rem 0.65rem; border-radius: 14px; font-size: 0.75rem; font-weight: 700; color: ${this.currentLang === 'en' ? '#fff' : 'var(--text-sub)'}; background: ${this.currentLang === 'en' ? 'var(--primary)' : 'transparent'}; border: none; cursor: pointer; transition: all 0.2s;">🇬🇧 EN</button>
        </div>
      `;

      const btns = wrapper.querySelectorAll('.lang-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetLang = btn.getAttribute('data-lang');
          if (targetLang !== this.currentLang) {
            this.setLanguage(targetLang);
            this.initLanguageSelector(); // refresh active pills UI
          }
        });
      });
    });
  }
};

// Auto initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = i18n.getLanguage();
  i18n.initLanguageSelector();
  i18n.applyToPage();
});
