/**
 * Persistent Floating Action Menu
 * Includes Back-To-Top and Contact/Support Floating Action Button (FAB)
 * Data-driven & persists state across Multi-Page App via localStorage.
 */

(function () {
  // --- Data Configuration ---
  const FAB_ACTIONS = [
    {
      id: 'support',
      icon: '💬',
      title: 'Hỗ Trợ',
      type: 'link',
      url: '#'
    },
    {
      id: 'discord',
      icon: '🎮',
      title: 'Cộng Đồng Discord',
      type: 'link',
      url: 'https://discord.gg/ct7e7mAuK'
    },
    {
      id: 'telegram',
      icon: '✈️',
      title: 'Kênh Telegram',
      type: 'link',
      url: 'https://t.me/dungcaodeptrai'
    }
  ];

  // --- Styles ---
  const styles = `
    /* Floating Widget Container */
    .floating-widget-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
      z-index: 9999;
      font-family: var(--font-body), sans-serif;
    }

    /* Back to Top Button */
    .btn-back-to-top {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-surface, #1E293B);
      border: 1px solid var(--border-glass, #334155);
      color: var(--accent-cyan, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.2rem;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .btn-back-to-top.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .btn-back-to-top:hover {
      background: var(--accent-cyan, #06b6d4);
      color: #fff;
    }

    /* Contact FAB Wrapper */
    .contact-fab-wrapper {
      position: relative;
    }

    /* Action Menu List */
    .contact-fab-menu {
      position: absolute;
      bottom: 100%;
      right: 0;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-end;
      opacity: 0;
      transform: translateY(20px) scale(0.9);
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom right;
    }
    .contact-fab-menu.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Individual Action Item */
    .fab-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #fff;
      background: var(--bg-card, #151E32);
      border: 1px solid var(--border-glass, #334155);
      padding: 0.4rem 0.4rem 0.4rem 1rem;
      border-radius: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    .fab-item:hover {
      border-color: var(--accent-cyan, #06b6d4);
      background: var(--bg-surface, #1E293B);
      transform: scale(1.05);
    }
    .fab-item-title {
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .fab-item-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-surface, #1E293B);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border: 1px solid var(--border-glass, #334155);
    }

    /* Main Toggle Button */
    .btn-contact-fab {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-cyan, #06b6d4), #3b82f6);
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.8rem;
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-contact-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 8px 25px rgba(6, 182, 212, 0.6);
    }
    .btn-contact-fab.open {
      transform: rotate(45deg);
      background: linear-gradient(135deg, #ef4444, #f59e0b);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
  `;

  // --- HTML Structure ---
  function createWidgetHTML() {
    const actionsHTML = FAB_ACTIONS.map(action => `
      <a href="${action.url}" class="fab-item" target="${action.type === 'link' && action.url !== '#' ? '_blank' : '_self'}" title="${action.title}">
        <span class="fab-item-title">${action.title}</span>
        <span class="fab-item-icon">${action.icon}</span>
      </a>
    `).join('');

    return `
      <div class="floating-widget-container" id="floatingWidgetContainer">
        <!-- Contact FAB -->
        <div class="contact-fab-wrapper">
          <div class="contact-fab-menu" id="contactFabMenu">
            ${actionsHTML}
          </div>
          <button class="btn-contact-fab" id="btnContactFabToggle" title="Hỗ Trợ / Liên Hệ">
            💬
          </button>
        </div>

        <!-- Back to Top Button -->
        <button class="btn-back-to-top" id="btnBackToTop" title="Lên đầu trang">
          ▲
        </button>
      </div>
    `;
  }

  // --- Logic Initialization ---
  function initFloatingWidget() {
    // 1. Inject Styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Inject HTML
    document.body.insertAdjacentHTML('beforeend', createWidgetHTML());

    // 3. DOM References
    const btnBackToTop = document.getElementById('btnBackToTop');
    const btnContactFabToggle = document.getElementById('btnContactFabToggle');
    const contactFabMenu = document.getElementById('contactFabMenu');

    // 4. Back to Top Logic
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btnBackToTop.classList.add('show');
      } else {
        btnBackToTop.classList.remove('show');
      }
    });

    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 5. Contact FAB Persistent State Logic
    const WIKI_FAB_STATE_KEY = 'wiki_fab_menu_open';
    // Remove "false" string logic to be safe, treat "true" as only truthy
    const isMenuOpen = localStorage.getItem(WIKI_FAB_STATE_KEY) === 'true';

    function toggleMenu(forceState) {
      const newState = typeof forceState === 'boolean' ? forceState : !contactFabMenu.classList.contains('open');
      if (newState) {
        contactFabMenu.classList.add('open');
        btnContactFabToggle.classList.add('open');
        btnContactFabToggle.innerHTML = '+'; // cross icon when rotated
        localStorage.setItem(WIKI_FAB_STATE_KEY, 'true');
      } else {
        contactFabMenu.classList.remove('open');
        btnContactFabToggle.classList.remove('open');
        btnContactFabToggle.innerHTML = '💬';
        localStorage.setItem(WIKI_FAB_STATE_KEY, 'false');
      }
    }

    // Apply initial state
    if (isMenuOpen) {
      // Disabling smooth transitions for the initial render so it doesn't animate in weirdly
      contactFabMenu.style.transition = 'none';
      btnContactFabToggle.style.transition = 'none';

      toggleMenu(true);

      // Restore transitions after a brief delay
      setTimeout(() => {
        contactFabMenu.style.transition = '';
        btnContactFabToggle.style.transition = '';
      }, 50);
    }

    btnContactFabToggle.addEventListener('click', () => toggleMenu());

    // 6. Interactive Knowledge-Graph Keyword Tooltip Pipeline
    let keywordsCache = null;
    const popupEl = document.getElementById('global-keyword-popup');

    async function showKeywordTooltip(e, keywordKey) {
      if (!popupEl) return;
      if (!keywordsCache && window.DataLayer) {
        keywordsCache = await DataLayer.getKeywords();
      }

      const kw = (keywordsCache && keywordsCache[keywordKey]) ? keywordsCache[keywordKey] : {
        name: keywordKey,
        type: 'Cơ Chế Kỹ Năng',
        description: `Thuộc tính hoặc hiệu ứng kỹ năng đặc thù [${keywordKey}] trong game Đấu La Đại Lục MMO.`,
        icon: '✨'
      };

      const iconEl = document.getElementById('popKwIcon');
      const titleEl = document.getElementById('popKwTitle');
      const typeEl = document.getElementById('popKwType');
      const descEl = document.getElementById('popKwDesc');

      if (iconEl) iconEl.textContent = kw.icon || '✨';
      if (titleEl) titleEl.textContent = kw.name || keywordKey;
      if (typeEl) typeEl.textContent = kw.type || 'Hiệu Ứng / Cơ Chế';
      if (descEl) descEl.innerHTML = kw.description || 'Chưa có mô tả chi tiết.';

      popupEl.style.display = 'block';
      const x = Math.min(window.innerWidth - 340, Math.max(10, e.pageX - 160));
      const y = e.pageY + 18;
      popupEl.style.left = `${x}px`;
      popupEl.style.top = `${y}px`;
    }

    function hideKeywordTooltip() {
      if (popupEl) popupEl.style.display = 'none';
    }

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.skill-keyword, .combat-kw-tag, [data-keyword]');
      if (target) {
        const kKey = target.getAttribute('data-keyword');
        if (kKey) showKeywordTooltip(e, kKey);
      }
    });

    document.addEventListener('mousemove', (e) => {
      const target = e.target.closest('.skill-keyword, .combat-kw-tag, [data-keyword]');
      if (target && popupEl && popupEl.style.display === 'block') {
        const x = Math.min(window.innerWidth - 340, Math.max(10, e.pageX - 160));
        const y = e.pageY + 18;
        popupEl.style.left = `${x}px`;
        popupEl.style.top = `${y}px`;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('.skill-keyword, .combat-kw-tag, [data-keyword]');
      if (target) hideKeywordTooltip();
    });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingWidget);
  } else {
    initFloatingWidget();
  }
})();
