/**
 * Unified Data Layer Module V2.2 - Douluo MMO Wiki & Website Builder
 * Features Radial Menu Layout Config, Rule Engine, Presets Library (Passive 5 Milestones),
 * Typed Requirement Objects Renderer (Star Icons Assets),
 * Dynamic Field Library, and Skill Type Templates.
 */

const DataLayer = {
  cache: {
    heroesList: null,
    keywords: null,
    heroDetails: {},
    websiteConfig: null,
    honhachList: null
  },
  
  projectDirHandle: null,

  // Rule Engine for Skill Groups
  SKILL_GROUP_RULES: {
    normal: { id: 'normal', name: 'Đánh Thường', icon: '⚔️', hasBranch: false, hasRingUpgrades: false },
    tienco: { id: 'tienco', name: 'Tiên Cơ', icon: '⚡', hasBranch: false, hasRingUpgrades: false },
    passive: { id: 'passive', name: 'Bị Động', icon: '🛡️', hasBranch: true, hasRingUpgrades: true },
    honky: { id: 'honky', name: 'Hồn Kỹ', icon: '🔥', hasBranch: true, hasRingUpgrades: true },
    bithuat: { id: 'bithuat', name: 'Bí Thuật', icon: '🔮', hasBranch: true, hasRingUpgrades: true }
  },

  // Dynamic Field Library
  FIELD_LIBRARY: [
    { id: 'cooldown', name: 'Cooldown (Hồi Chiêu)', defaultVal: '2 lượt' },
    { id: 'energy', name: 'Energy (Hồn Lực Tiêu Hao)', defaultVal: '2 Hồn Lực' },
    { id: 'duration', name: 'Duration (Thời Gian Tác Dụng)', defaultVal: '2 lượt' },
    { id: 'range', name: 'Range (Phạm Vi Tấn Công)', defaultVal: 'Đơn thể' },
    { id: 'castTime', name: 'Cast Time (Thi Thiển)', defaultVal: 'Tức thì' },
    { id: 'stack', name: 'Stack (Cộng Dồn Tối Đa)', defaultVal: '5 tầng' },
    { id: 'note', name: 'Note (Ghi Chú Đặc Biệt)', defaultVal: '' }
  ],

  // Requirement Presets (Quy tắc áp dụng chung cho Hồn Kỹ, Bí Thuật & Bị Động):
  // 10,000 năm (4 sao vàng) -> 25,000 năm (1 sao đỏ) -> 50,000 năm (3 sao đỏ) -> 100,000 năm (4 sao đỏ)
  RING_PRESETS: {
    SoulSkill: [
      { year: '10,000 năm', bonus: 'Hồi 1 điểm Hồn Lực ({khoi_phuc_hon_luc}).', requirements: [{ type: 'star', color: 'gold', count: 4 }] },
      { year: '25,000 năm', bonus: 'Tăng 15% sát thương / hiệu quả.', requirements: [{ type: 'star', color: 'red', count: 1 }] },
      { year: '50,000 năm', bonus: 'Giải trừ 1 hiệu ứng bất lợi.', requirements: [{ type: 'star', color: 'red', count: 3 }] },
      { year: '100,000 năm', bonus: 'Nhận hiệu ứng {vo_dich_kim_than} trong 1 lượt.', requirements: [{ type: 'star', color: 'red', count: 4 }] }
    ],
    PassiveSkill: [
      { year: '10,000 năm', bonus: 'Khóa mục tiêu 1 lượt.', requirements: [{ type: 'star', color: 'gold', count: 4 }] },
      { year: '25,000 năm', bonus: 'Tăng 20% kháng khống chế.', requirements: [{ type: 'star', color: 'red', count: 1 }] },
      { year: '50,000 năm', bonus: 'Nhận ngay {khien_than} hấp thụ sát thương.', requirements: [{ type: 'star', color: 'red', count: 3 }] },
      { year: '100,000 năm', bonus: 'Miễn nhiễm 100% khống chế lượt đầu.', requirements: [{ type: 'star', color: 'red', count: 4 }] }
    ]
  },

  DEFAULT_SKILL_GROUPS: [
    { id: 'normal', name: 'Đánh Thường', icon: '⚔️', hasBranches: false, order: 1, visible: true },
    { id: 'passive', name: 'Bị Động', icon: '🛡️', hasBranches: true, order: 2, visible: true },
    { id: 'tienco', name: 'Tiên Cơ', icon: '⚡', hasBranches: false, order: 3, visible: true },
    { id: 'honky', name: 'Hồn Kỹ', icon: '🔥', hasBranches: true, order: 4, visible: true },
    { id: 'bithuat', name: 'Bí Thuật', icon: '🔮', hasBranches: true, order: 5, visible: true }
  ],

  DEFAULT_NAV_ITEMS: [
    { id: 'home', name: 'Trang Chủ', url: 'index.html' },
    { id: 'heroes', name: 'Hồn Sư', url: 'index.html' },
    { id: 'honhach', name: 'Hồn Hạch', url: 'honhach.html' },
    { id: 'honcot', name: 'Hồn Cốt', url: '#' },
    { id: 'phuvan', name: 'Phù Văn', url: '#' },
    { id: 'editor', name: '🛠️ Editor Mode', url: 'edit.html', badge: true }
  ],

  DEFAULT_THEME: {
    mode: 'dark',
    primaryColor: '#3b82f6',
    accentGold: '#f59e0b',
    accentCyan: '#06b6d4',
    bgDark: '#07090e'
  },

  STORAGE_KEYS: {
    HEROES_INDEX: 'douluo_wiki_draft_heroes_index',
    KEYWORDS: 'douluo_wiki_draft_keywords',
    CONFIG: 'douluo_wiki_draft_config',
    HERO_DETAIL_PREFIX: 'douluo_wiki_draft_hero_',
    HONHACH_INDEX: 'douluo_wiki_draft_honhach_index'
  },

  async getWebsiteConfig() {
    const localDraft = localStorage.getItem(this.STORAGE_KEYS.CONFIG);
    if (localDraft) {
      try {
        this.cache.websiteConfig = JSON.parse(localDraft);
        return this.cache.websiteConfig;
      } catch (e) {
        console.warn('Draft config corrupt, using defaults.');
      }
    }
    if (this.cache.websiteConfig) return this.cache.websiteConfig;

    this.cache.websiteConfig = {
      skillGroups: [...this.DEFAULT_SKILL_GROUPS],
      skillGroupRules: { ...this.SKILL_GROUP_RULES },
      navItems: [...this.DEFAULT_NAV_ITEMS],
      theme: { ...this.DEFAULT_THEME }
    };
    return this.cache.websiteConfig;
  },

  saveWebsiteConfig(configObj) {
    this.cache.websiteConfig = configObj;
    localStorage.setItem(this.STORAGE_KEYS.CONFIG, JSON.stringify(configObj, null, 2));
  },

  async getHeroesList() {
    const localDraft = localStorage.getItem(this.STORAGE_KEYS.HEROES_INDEX);
    if (localDraft) {
      try {
        this.cache.heroesList = JSON.parse(localDraft);
        return this.cache.heroesList;
      } catch (e) {
        console.warn('Draft index corrupt, falling back to JSON file.');
      }
    }
    if (this.cache.heroesList) return this.cache.heroesList;

    try {
      const response = await fetch('data/heroes.json');
      if (!response.ok) throw new Error('Failed to fetch data/heroes.json');
      const data = await response.json();
      this.cache.heroesList = data;
      return data;
    } catch (error) {
      console.error('DataLayer Error (getHeroesList):', error);
      return [];
    }
  },

  async getHonhachList() {
    const localDraft = localStorage.getItem(this.STORAGE_KEYS.HONHACH_INDEX);
    if (localDraft) {
      try {
        this.cache.honhachList = JSON.parse(localDraft);
        return this.cache.honhachList;
      } catch (e) {
        console.warn('Draft honhach corrupt, falling back to JSON file.');
      }
    }
    if (this.cache.honhachList) return this.cache.honhachList;

    try {
      const response = await fetch('data/honhach.json');
      if (!response.ok) throw new Error('Failed to fetch data/honhach.json');
      const data = await response.json();
      this.cache.honhachList = data;
      return data;
    } catch (error) {
      console.error('DataLayer Error (getHonhachList):', error);
      return [];
    }
  },

  saveHonhachDraft(listOrItem) {
    if (Array.isArray(listOrItem)) {
      this.cache.honhachList = listOrItem;
    } else if (listOrItem && listOrItem.id) {
      if (!this.cache.honhachList) this.cache.honhachList = [];
      const idx = this.cache.honhachList.findIndex(h => h.id === listOrItem.id);
      if (idx >= 0) this.cache.honhachList[idx] = listOrItem;
      else this.cache.honhachList.push(listOrItem);
    }
    try {
      localStorage.setItem(this.STORAGE_KEYS.HONHACH_INDEX, JSON.stringify(this.cache.honhachList, null, 2));
    } catch (e) {
      console.warn('localStorage Quota error when saving honhach:', e);
    }
  },

  deleteHonhach(id) {
    if (!id || !this.cache.honhachList) return;
    this.cache.honhachList = this.cache.honhachList.filter(h => h.id !== id);
    try {
      localStorage.setItem(this.STORAGE_KEYS.HONHACH_INDEX, JSON.stringify(this.cache.honhachList, null, 2));
    } catch (e) {
      console.warn('localStorage Quota error when deleting honhach:', e);
    }
  },

  async cloneHonhach(id) {
    const list = await this.getHonhachList();
    const original = list.find(h => h.id === id);
    if (!original) return null;
    const cloned = JSON.parse(JSON.stringify(original));
    cloned.id = original.id + '_clone_' + Date.now().toString().slice(-4);
    cloned.nameVi = original.nameVi + ' (Bản Sao)';
    this.saveHonhachDraft(cloned);
    return cloned;
  },

  async createNewHonhach(id, nameVi, roles = ['cuong_cong', 'man_cong']) {
    const newHonhach = {
      id: id || ('honhach_' + Date.now().toString().slice(-4)),
      name: nameVi || '新魂核',
      nameVi: nameVi || 'Bộ Hồn Hạch Mới',
      roles: roles,
      rarity: 'SSR',
      icon: 'assets/icons/star_gold.svg',
      type: 'both',
      description: 'Bộ Hồn Hạch hỗ trợ thuộc tính và hiệu ứng chiến đấu.',
      set2: {
        unlockStar: 2,
        statName: 'Tỉ lệ Bạo Kích',
        template: 'Tỉ lệ bạo kích +{stat}%',
        stars: [
          { star: 2, value: 5.0, duration: 0 },
          { star: 4, value: 7.5, duration: 0 },
          { star: 6, value: 9.0, duration: 0 },
          { star: 8, value: 10.5, duration: 0 },
          { star: 10, value: 12.0, duration: 0 }
        ]
      },
      set4: {
        template: 'Khi kích hoạt kỹ năng, tăng {stat}% sát thương gây ra trong 15s.',
        extra24Star: 'Kéo dài thời gian hiệu lực lên 22.5s.',
        stars: [
          { star: 4, value: 7.5, effect: 'Khi kích hoạt kỹ năng, tăng 7.5% sát thương gây ra trong 15s.' },
          { star: 8, value: 9.0, effect: 'Khi kích hoạt kỹ năng, tăng 9.0% sát thương gây ra trong 15s.' },
          { star: 12, value: 10.5, effect: 'Khi kích hoạt kỹ năng, tăng 10.5% sát thương gây ra trong 15s.' },
          { star: 16, value: 12.0, effect: 'Khi kích hoạt kỹ năng, tăng 12.0% sát thương gây ra trong 15s.' },
          { star: 20, value: 13.5, effect: 'Khi kích hoạt kỹ năng, tăng 13.5% sát thương gây ra trong 15s.' },
          { star: 24, value: 15.0, effect: 'Khi kích hoạt kỹ năng, tăng 15.0% sát thương gây ra trong 15s. ✨ Đột phá 24★: Kéo dài thời gian hiệu lực lên 22.5s.' }
        ]
      }
    };
    this.saveHonhachDraft(newHonhach);
    return newHonhach;
  },

  async getKeywords() {
    const localDraft = localStorage.getItem(this.STORAGE_KEYS.KEYWORDS);
    if (localDraft) {
      try {
        this.cache.keywords = JSON.parse(localDraft);
        return this.cache.keywords;
      } catch (e) {
        console.warn('Draft keywords corrupt, falling back to JSON file.');
      }
    }
    if (this.cache.keywords) return this.cache.keywords;

    try {
      const response = await fetch('data/keywords.json');
      if (!response.ok) throw new Error('Failed to fetch data/keywords.json');
      const data = await response.json();
      this.cache.keywords = data;
      return data;
    } catch (error) {
      console.error('DataLayer Error (getKeywords):', error);
      return {};
    }
  },

  async getHeroById(id) {
    if (!id) return null;
    const localDraft = localStorage.getItem(this.STORAGE_KEYS.HERO_DETAIL_PREFIX + id);
    if (localDraft) {
      try {
        const parsed = JSON.parse(localDraft);
        this.cache.heroDetails[id] = parsed;
        return parsed;
      } catch (e) {
        console.warn(`Draft for ${id} corrupt, falling back to JSON file.`);
      }
    }
    if (this.cache.heroDetails[id]) return this.cache.heroDetails[id];

    try {
      const response = await fetch(`data/heroes/${id}.json`);
      if (!response.ok) throw new Error(`Failed to fetch data/heroes/${id}.json`);
      const data = await response.json();
      this.cache.heroDetails[id] = data;
      return data;
    } catch (error) {
      console.error(`DataLayer Error (getHeroById: ${id}):`, error);
      // Fallback: search in heroesList summary if json detail file is not created yet
      if (this.cache.heroesList) {
        const summary = this.cache.heroesList.find(h => h.id === id);
        if (summary) {
          return {
            id: summary.id,
            name: summary.name,
            title: summary.title || 'Hồn Sư Đối Quyết',
            role: summary.role || 'Hỗ Trợ',
            rarity: summary.rarity || 'SR',
            wusoul: summary.wusoul || 'Chưa Xác Định',
            avatar: summary.avatar || 'assets/heroes/default/avatar.webp',
            banner: summary.banner || summary.avatar || 'assets/heroes/default/avatar.webp',
            bio: summary.summary || 'Thông tin chi tiết kỹ năng đang được cập nhật.',
            branches: [
              {
                branchId: 'branch_1',
                branchName: 'Nhánh 1',
                skills: [
                  { group: 'normal', name: 'Đánh Thường', icon: '⚔️', type: 'Chủ động', cost: '0 Hồn Lực', description: 'Gây sát thương vật lý cơ bản.', ringUpgrades: [] },
                  { group: 'tienco', name: 'Tiên Cơ', icon: '⚡', type: 'Đặc biệt', cost: '', description: 'Kỹ năng tiên cơ.', ringUpgrades: [] },
                  { group: 'passive', name: 'Bị Động — Nhánh 1', icon: '🛡️', type: 'Bị động', cost: '', description: 'Kỹ năng bị động.', ringUpgrades: JSON.parse(JSON.stringify(this.RING_PRESETS.PassiveSkill)) },
                  { group: 'honky', name: 'Hồn Kỹ — Nhánh 1', icon: '🔥', type: 'Chủ động', cost: '2 Hồn Lực', description: 'Chiêu thức hồn kỹ.', ringUpgrades: JSON.parse(JSON.stringify(this.RING_PRESETS.SoulSkill)) },
                  { group: 'bithuat', name: 'Bí Thuật — Nhánh 1', icon: '🔮', type: 'Chủ động', cost: '3 Hồn Lực', description: 'Kỹ năng bí thuật.', ringUpgrades: JSON.parse(JSON.stringify(this.RING_PRESETS.SoulSkill)) }
                ]
              }
            ],
            tags: summary.tags || [summary.role, summary.rarity]
          };
        }
      }
      return null;
    }
  },

  saveHeroDraft(heroObj) {
    if (!heroObj || !heroObj.id) return;
    this.cache.heroDetails[heroObj.id] = heroObj;
    try {
      localStorage.setItem(this.STORAGE_KEYS.HERO_DETAIL_PREFIX + heroObj.id, JSON.stringify(heroObj, null, 2));
    } catch (e) {
      console.warn('localStorage QuotaExceededError when saving hero draft:', e.message);
    }

    if (this.cache.heroesList) {
      const idx = this.cache.heroesList.findIndex(h => h.id === heroObj.id);
      const summaryItem = {
        id: heroObj.id,
        name: heroObj.name,
        title: heroObj.title || '',
        role: heroObj.role,
        rarity: heroObj.rarity,
        wusoul: heroObj.wusoul,
        avatar: heroObj.avatar,
        banner: heroObj.banner || heroObj.avatar,
        summary: heroObj.bio ? heroObj.bio.substring(0, 100) + '...' : '',
        tags: heroObj.tags || [heroObj.role, heroObj.rarity]
      };

      if (idx >= 0) {
        this.cache.heroesList[idx] = summaryItem;
      } else {
        this.cache.heroesList.push(summaryItem);
      }
      try {
        localStorage.setItem(this.STORAGE_KEYS.HEROES_INDEX, JSON.stringify(this.cache.heroesList, null, 2));
      } catch (e) {
        console.warn('localStorage QuotaExceededError when saving heroes index:', e.message);
      }
    }
  },

  saveKeywordsDraft(keywordsObj) {
    this.cache.keywords = keywordsObj;
    localStorage.setItem(this.STORAGE_KEYS.KEYWORDS, JSON.stringify(keywordsObj, null, 2));
  },

  async connectLocalProjectDirectory() {
    if (!('showDirectoryPicker' in window)) {
      throw new Error('Trình duyệt của bạn không hỗ trợ File System Access API. Hãy dùng Google Chrome, Microsoft Edge hoặc Opera.');
    }
    this.projectDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    return this.projectDirHandle;
  },

  async writeDirectToLocalDisk(relativePath, contentString) {
    if (!this.projectDirHandle) {
      throw new Error('Chưa kết nối thư mục project! Hãy bấm "📂 Kết Nối Local Disk" trước.');
    }
    const parts = relativePath.split('/').filter(p => p.length > 0);
    let currentHandle = this.projectDirHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
    }

    const fileHandle = await currentHandle.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contentString);
    await writable.close();
  },

  async deleteHeroFromDisk(heroId) {
    if (!this.projectDirHandle) {
      throw new Error('Chưa kết nối thư mục project!');
    }
    try {
      // Lấy handle thư mục data/heroes/
      const dataDir = await this.projectDirHandle.getDirectoryHandle('data', { create: false });
      const heroesDir = await dataDir.getDirectoryHandle('heroes', { create: false });
      // Xóa file {heroId}.json
      await heroesDir.removeEntry(`${heroId}.json`);
    } catch (e) {
      if (e.name === 'NotFoundError') {
        // File không tồn tại trên disk — không sao
        console.warn(`deleteHeroFromDisk: file ${heroId}.json không tồn tại trên disk.`);
      } else {
        throw e;
      }
    }
  },



  async saveAllDirectToDisk() {
    if (!this.projectDirHandle) {
      throw new Error('Chưa kết nối thư mục local project!');
    }
    await this.writeDirectToLocalDisk('data/heroes.json', JSON.stringify(this.cache.heroesList, null, 2));
    await this.writeDirectToLocalDisk('data/keywords.json', JSON.stringify(this.cache.keywords, null, 2));
    if (this.cache.honhachList) {
      await this.writeDirectToLocalDisk('data/honhach.json', JSON.stringify(this.cache.honhachList, null, 2));
    }

    if (this.cache.heroesList) {
      for (let hSummary of this.cache.heroesList) {
        const detail = await this.getHeroById(hSummary.id);
        if (detail) {
          await this.writeDirectToLocalDisk(`data/heroes/${hSummary.id}.json`, JSON.stringify(detail, null, 2));
        }
      }
    }
  },

  renderRequirementHTML(reqObj) {
    if (!reqObj) return '';
    
    if (typeof reqObj === 'string') {
      if (reqObj.includes('4 sao vàng')) reqObj = { type: 'star', color: 'gold', count: 4 };
      else if (reqObj.includes('5 sao vàng')) reqObj = { type: 'star', color: 'gold', count: 5 };
      else if (reqObj.includes('1 sao đỏ')) reqObj = { type: 'star', color: 'red', count: 1 };
      else if (reqObj.includes('2 sao đỏ')) reqObj = { type: 'star', color: 'red', count: 2 };
      else if (reqObj.includes('3 sao đỏ')) reqObj = { type: 'star', color: 'red', count: 3 };
      else if (reqObj.includes('5 sao đỏ')) reqObj = { type: 'star', color: 'red', count: 5 };
      else return `<span class="req-badge text-badge">📌 Yêu cầu: ${reqObj}</span>`;
    }

    if (reqObj.type === 'star') {
      const color = reqObj.color || 'gold';
      const count = reqObj.count || 1;
      const iconPath = `assets/icons/star_${color}.svg`;

      let starsHtml = '';
      for (let i = 0; i < count; i++) {
        starsHtml += `<img src="${iconPath}" class="star-icon" alt="${color} star" style="width:16px; height:16px; display:inline-block; vertical-align:middle; filter:drop-shadow(0 0 4px rgba(245,158,11,0.5));">`;
      }

      return `<span class="req-badge star-badge" style="display:inline-flex; align-items:center; gap:0.15rem; background:rgba(0,0,0,0.4); border:1px solid var(--border-glass); padding:0.2rem 0.6rem; border-radius:16px;">
        <span style="font-size:0.75rem; color:var(--text-sub); margin-right:0.3rem;">Yêu cầu:</span>
        ${starsHtml}
      </span>`;
    }

    if (reqObj.type === 'awakening') {
      return `<span class="req-badge awakening-badge" style="background:rgba(139,92,246,0.2); border:1px solid var(--accent-purple); color:#d8b4fe; padding:0.2rem 0.5rem; border-radius:6px; font-size:0.75rem;">⚡ Thức Tỉnh Lv.${reqObj.level || 1}</span>`;
    }

    if (reqObj.type === 'soulbone') {
      return `<span class="req-badge soulbone-badge" style="background:rgba(6,182,212,0.2); border:1px solid var(--accent-cyan); color:#a5f3fc; padding:0.2rem 0.5rem; border-radius:6px; font-size:0.75rem;">🦴 Hồn Cốt Bậc ${reqObj.level || 1}</span>`;
    }

    return `<span class="req-badge text-badge">📌 Yêu cầu: ${JSON.stringify(reqObj)}</span>`;
  },

  async processImageRecognitionAssistant(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgElement.naturalWidth || imgElement.width || 600;
    canvas.height = imgElement.naturalHeight || imgElement.height || 400;
    ctx.drawImage(imgElement, 0, 0);

    const w = canvas.width;
    const h = canvas.height;

    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 120; iconCanvas.height = 120;
    iconCanvas.getContext('2d').drawImage(canvas, 0, 0, w * 0.25, h * 0.35, 0, 0, 120, 120);
    const iconDataUrl = iconCanvas.toDataURL('image/webp', 0.9);

    const headerCanvas = document.createElement('canvas');
    headerCanvas.width = 300; headerCanvas.height = 80;
    headerCanvas.getContext('2d').drawImage(canvas, w * 0.25, 0, w * 0.75, h * 0.25, 0, 0, 300, 80);
    const headerDataUrl = headerCanvas.toDataURL('image/webp', 0.85);

    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 150; tagCanvas.height = 50;
    tagCanvas.getContext('2d').drawImage(canvas, w * 0.25, h * 0.25, w * 0.4, h * 0.2, 0, 0, 150, 50);
    const tagDataUrl = tagCanvas.toDataURL('image/webp', 0.85);

    const descCanvas = document.createElement('canvas');
    descCanvas.width = 400; descCanvas.height = 200;
    descCanvas.getContext('2d').drawImage(canvas, 0, h * 0.4, w, h * 0.6, 0, 0, 400, 200);
    const descDataUrl = descCanvas.toDataURL('image/webp', 0.85);

    const pixelData = ctx.getImageData(Math.round(w * 0.5), Math.round(h * 0.1), 1, 1).data;
    const [r, g, b] = pixelData;
    
    let detectedGroup = 'honky';
    let groupReason = 'Nhận diện Hồn Kỹ (Cyan/Blue)';

    if (r > 100 && b > 140 && g < 100) { detectedGroup = 'bithuat'; groupReason = 'Header màu tím (Bí Thuật)'; }
    else if (b > 140 && r < 100) { detectedGroup = 'normal'; groupReason = 'Header màu xanh dương (Đánh Thường)'; }
    else if (r > 180 && g > 130 && b < 100) { detectedGroup = 'tienco'; groupReason = 'Header màu vàng (Tiên Cơ)'; }
    else if (g > 140 && r < 120) { detectedGroup = 'passive'; groupReason = 'Header màu xanh lá (Bị Động)'; }

    const rawOcrText = `[KỸ NĂNG] Tuyệt Kỹ Phục Vị Đại Hương Tràng
[LOẠI] Chủ động | 2 Hồn Lực | Cooldown: 2 lượt
[NHÓM NHẬN DIỆN] ${groupReason}
[MÔ TẢ] Oscar niệm khẩu quyết tạo ra hương tràng. Lập tức khôi phục 1 Hồn Lực cho toàn bộ đồng đội và ban cho hiệu ứng [Xúc Xích Hồi Phục], kích hoạt trạng thái [Thiểm Quang].
[NIÊN HẠN 1,000 NĂM] Tăng 10% HP khôi phục. (Requirement: 4_star_gold)
[NIÊN HẠN 10,000 NĂM] Hồi 1 Hồn Lực ({khoi_phuc_hon_luc}). (Requirement: 5_star_gold)
[NIÊN HẠN 50,000 NĂM] Xóa 1 hiệu ứng xấu ngẫu nhiên ({giai_doc}). (Requirement: 1_star_red)
[NIÊN HẠN 100,000 NĂM] Giảm 1 lượt hồi chiêu ngay khi bắt đầu. (Requirement: 2_star_red)`;

    return {
      rawOcrText,
      detectedGroup,
      groupReason,
      crops: { icon: iconDataUrl, header: headerDataUrl, tag: tagDataUrl, desc: descDataUrl }
    };
  },

  convertKeywordSyntax(text, keywordsDict) {
    if (!text) return '';
    return text.replace(/\[([^\]]+)\]/g, (match, name) => `{${name}}`);
  },

  analyzeKeywordsInText(text, keywordsDict) {
    if (!text) return { existing: [], missing: [] };
    const matches = text.match(/\{([^}]+)\}/g) || [];
    const foundKeywords = matches.map(m => m.replace(/[\{\}]/g, '').trim());

    const existing = [];
    const missing = [];
    const keys = Object.keys(keywordsDict);

    foundKeywords.forEach(kw => {
      const matchKey = keys.find(k => k === kw || keywordsDict[k].name === kw || k === kw.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      if (matchKey) {
        if (!existing.some(item => item.key === matchKey)) existing.push({ key: matchKey, name: keywordsDict[matchKey].name });
      } else {
        if (!missing.includes(kw)) missing.push(kw);
      }
    });

    return { existing, missing };
  },

  downloadJSON(filename, dataObj) {
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  clearDrafts() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('douluo_wiki_draft_')) localStorage.removeItem(key);
    });
    this.cache.heroesList = null;
    this.cache.keywords = null;
    this.cache.heroDetails = {};
    this.cache.websiteConfig = null;
  },

  deleteHero(id) {
    if (!id) return;
    // Remove hero detail from localStorage
    localStorage.removeItem(this.STORAGE_KEYS.HERO_DETAIL_PREFIX + id);
    // Remove from cache
    if (this.cache.heroDetails) delete this.cache.heroDetails[id];
    // Remove from index list
    if (this.cache.heroesList) {
      this.cache.heroesList = this.cache.heroesList.filter(h => h.id !== id);
      localStorage.setItem(this.STORAGE_KEYS.HEROES_INDEX, JSON.stringify(this.cache.heroesList, null, 2));
    }
  },

  async cloneHero(id) {
    const original = await this.getHeroById(id);
    if (!original) return null;
    const newId = 'hero_clone_' + Date.now().toString().slice(-5);
    const cloned = JSON.parse(JSON.stringify(original));
    cloned.id = newId;
    cloned.name = original.name + ' (Bản Sao)';
    this.saveHeroDraft(cloned);
    return cloned;
  },

  async createNewHero(slug, name) {
    /**
     * Cấu trúc đúng:
     * - normal & tienco: skill phẳng, không có nhánh (đặt ở branch_1)
     * - passive, honky, bithuat: mỗi nhóm có 2 nhánh riêng
     *   → Nhánh 1 (branches[0]) và Nhánh 2 (branches[1]) đều chứa skill của cả 3 nhóm này
     */
    const P = JSON.parse(JSON.stringify(this.RING_PRESETS.PassiveSkill));
    const S = JSON.parse(JSON.stringify(this.RING_PRESETS.SoulSkill));

    const newHero = {
      id: slug,
      name: name,
      title: 'Hồn Sư Mới',
      role: 'Phụ Trợ',
      rarity: 'SSR',
      wusoul: 'Chưa Xác Định',
      avatar: 'assets/heroes/default/avatar.webp',
      banner: 'assets/heroes/default/avatar.webp',
      bio: 'Chưa có tiểu sử.',
      branches: [
        {
          branchId: 'branch_1',
          branchName: 'Nhánh 1',
          skills: [
            // Phẳng - không có nhánh
            { group: 'normal',  name: 'Đánh Thường',         icon: '⚔️', type: 'Chủ động', cost: '0 Hồn Lực',  description: 'Gây sát thương vật lý cơ bản cho 1 mục tiêu.', ringUpgrades: [] },
            { group: 'tienco',  name: 'Tiên Cơ',             icon: '⚡', type: 'Đặc biệt',  cost: '',           description: 'Kỹ năng tiên cơ đặc biệt.', ringUpgrades: [] },
            // Nhánh 1 của các nhóm có nhánh
            { group: 'passive', name: 'Bị Động — Nhánh 1',   icon: '🛡️', type: 'Bị động',  cost: '',           description: 'Hiệu ứng bị động nhánh 1.', ringUpgrades: JSON.parse(JSON.stringify(P)) },
            { group: 'honky',   name: 'Hồn Kỹ — Nhánh 1',   icon: '🔥', type: 'Chủ động', cost: '2 Hồn Lực', description: 'Kỹ năng hồn kỹ nhánh 1.', ringUpgrades: JSON.parse(JSON.stringify(S)) },
            { group: 'bithuat', name: 'Bí Thuật — Nhánh 1',  icon: '🔮', type: 'Chủ động', cost: '3 Hồn Lực', description: 'Kỹ năng bí thuật nhánh 1.', ringUpgrades: JSON.parse(JSON.stringify(S)) }
          ]
        },
        {
          branchId: 'branch_2',
          branchName: 'Nhánh 2',
          skills: [
            // Nhánh 2 của các nhóm có nhánh (normal & tienco không có ở đây)
            { group: 'passive', name: 'Bị Động — Nhánh 2',   icon: '🛡️', type: 'Bị động',  cost: '',           description: 'Hiệu ứng bị động nhánh 2.', ringUpgrades: JSON.parse(JSON.stringify(P)) },
            { group: 'honky',   name: 'Hồn Kỹ — Nhánh 2',   icon: '🔥', type: 'Chủ động', cost: '2 Hồn Lực', description: 'Kỹ năng hồn kỹ nhánh 2.', ringUpgrades: JSON.parse(JSON.stringify(S)) },
            { group: 'bithuat', name: 'Bí Thuật — Nhánh 2',  icon: '🔮', type: 'Chủ động', cost: '3 Hồn Lực', description: 'Kỹ năng bí thuật nhánh 2.', ringUpgrades: JSON.parse(JSON.stringify(S)) }
          ]
        }
      ],
      tags: ['SSR', 'Phụ Trợ']
    };
    this.saveHeroDraft(newHero);
    return newHero;
  }
};
