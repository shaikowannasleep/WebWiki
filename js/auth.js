/**
 * Douluo Studio Admin Security Engine - Douluo MMO Wiki
 * Protects `edit.html` and hides the `🛠️ Editor Mode` navbar link from normal visitors on GitHub Pages.
 * 
 * Default Secret PIN: '123456' (can be changed in Studio)
 * Authentication Methods:
 *  1. Secret Hotkey: Press `Ctrl + Shift + E` on any page
 *  2. Secret Gesture: Double-click on Header Brand Logo 🐉
 *  3. Secret URL Param: Access `your-site.com/?admin=123456`
 *  4. Direct Access to `edit.html`: Prompted for PIN; invalid PIN redirects to index.html
 */

const AdminAuth = (() => {
  const DEFAULT_PIN = '123456';

  function getSecretPin() {
    return localStorage.getItem('douluo_studio_pin') || DEFAULT_PIN;
  }

  function setSecretPin(newPin) {
    if (!newPin) return false;
    localStorage.setItem('douluo_studio_pin', newPin);
    return true;
  }

  function isAuthenticated() {
    return localStorage.getItem('douluo_admin_auth') === 'true';
  }

  function authenticate(inputPin) {
    if (String(inputPin).trim() === String(getSecretPin()).trim()) {
      localStorage.setItem('douluo_admin_auth', 'true');
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem('douluo_admin_auth');
    window.location.href = 'index.html';
  }

  /**
   * Update Navbar link visibility
   */
  function syncNavbarVisibility() {
    const editorLinks = document.querySelectorAll('.editor-badge, [data-i18n="nav_editor"], a[href="edit.html"]');
    const authed = isAuthenticated();
    editorLinks.forEach(link => {
      link.style.display = authed ? 'inline-flex' : 'none';
    });
  }

  /**
   * Create and open PIN Authentication Modal
   */
  function openAuthModal(options = {}) {
    const existing = document.getElementById('adminAuthModalOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'adminAuthModalOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(11, 17, 32, 0.88);
      backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem; animation: authFadeIn 0.2s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes authFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes authShake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
        .auth-modal-card {
          background: #151E32;
          border: 1.5px solid rgba(251, 191, 36, 0.5);
          border-radius: 16px;
          padding: 1.75rem 2rem;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 0 40px rgba(251, 191, 36, 0.25);
          text-align: center;
          color: #fff;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .auth-pin-input {
          width: 100%;
          background: #1E293B;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 1.2rem;
          font-weight: 800;
          color: #fef08a;
          text-align: center;
          letter-spacing: 4px;
          outline: none;
          margin: 1.25rem 0;
          transition: border-color 0.2s ease;
        }
        .auth-pin-input:focus {
          border-color: #FBBF24;
          box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
        }
      </style>
      <div class="auth-modal-card" id="authModalCard">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔐</div>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 800; color: #FBBF24; margin-bottom: 0.3rem;">
          WIKI STUDIO ADMIN AUTH
        </h3>
        <p style="font-size: 0.82rem; color: #94A3B8; margin-bottom: 0.5rem; line-height: 1.5;">
          ${options.message || 'Nhập mã PIN Bí Mật để mở khóa tính năng Quản lý Wiki Studio.'}
        </p>

        <form id="authPinForm" style="margin:0;">
          <input type="password" id="authPinInput" class="auth-pin-input" placeholder="••••••" autofocus maxlength="20">
          <div id="authErrMsg" style="color: #f87171; font-size: 0.8rem; font-weight: 700; display: none; margin-bottom: 0.75rem;">
            ❌ Mã PIN không chính xác! Thử lại.
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button type="button" id="btnCancelAuth" style="flex:1; padding: 0.65rem; background: #1E293B; border: 1px solid #334155; color: #CBD5E1; font-weight: 700; border-radius: 10px; cursor: pointer;">
              ✕ Huỷ
            </button>
            <button type="submit" style="flex:1.5; padding: 0.65rem; background: #FBBF24; border: none; color: #000; font-weight: 800; border-radius: 10px; cursor: pointer; box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);">
              🔓 Mở Khóa
            </button>
          </div>
        </form>

        <div style="margin-top: 1rem; font-size: 0.72rem; color: #64748B;">
          💡 Gợi ý: Mã PIN mặc định ban đầu là <strong>123456</strong>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const form = document.getElementById('authPinForm');
    const input = document.getElementById('authPinInput');
    const errMsg = document.getElementById('authErrMsg');
    const card = document.getElementById('authModalCard');
    const btnCancel = document.getElementById('btnCancelAuth');

    setTimeout(() => input.focus(), 100);

    btnCancel.addEventListener('click', () => {
      overlay.remove();
      if (options.redirectOnCancel) {
        window.location.href = 'index.html';
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      if (authenticate(val)) {
        overlay.remove();
        syncNavbarVisibility();
        if (typeof showToast === 'function') {
          showToast('🔓 Đã xác thực quyền Admin Studio thành công!', 'success');
        } else {
          alert('🔓 Đã mở khóa quyền Admin Studio!');
        }
        if (options.onSuccess) {
          options.onSuccess();
        } else if (window.location.pathname.endsWith('edit.html') === false) {
          // If on public page, ask if user wants to enter studio
          if (confirm('Đã xác thực thành công! Bạn có muốn mở trang Wiki Studio (edit.html) ngay bây giờ?')) {
            window.location.href = 'edit.html';
          }
        }
      } else {
        errMsg.style.display = 'block';
        card.style.animation = 'authShake 0.4s ease';
        setTimeout(() => card.style.animation = '', 400);
        input.value = '';
        input.focus();
      }
    });
  }

  /**
   * Check page protection & event listeners on DOM Ready
   */
  function init() {
    // 1. Check URL parameters for secret admin pin (e.g. ?admin=123456)
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin') || urlParams.get('pin');
    if (adminParam) {
      if (authenticate(adminParam)) {
        console.log('🔓 Studio Admin authenticated via URL parameter.');
      }
    }

    // 2. Sync navbar link visibility (hide edit link if not authed)
    syncNavbarVisibility();

    // 3. Page Protection for edit.html removed (free local access)

    // 4. Hotkey Listener: Ctrl + Shift + E
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        if (isAuthenticated()) {
          if (confirm('🔒 Bạn hiện đang là Admin. Bạn có muốn ĐĂNG XUẤT khỏi Studio?')) {
            logout();
          }
        } else {
          openAuthModal();
        }
      }
    });

    // 5. Secret Gesture: Double-click Brand Logo
    const brandLogos = document.querySelectorAll('.brand-logo');
    brandLogos.forEach(logo => {
      logo.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (!isAuthenticated()) {
          openAuthModal();
        }
      });
    });
  }

  function _addStudioLogoutButton() {
    const topBar = document.querySelector('.studio-top-bar');
    if (topBar && !document.getElementById('btnStudioLogout')) {
      const group = topBar.querySelector('.btn-group') || topBar;
      const logoutBtn = document.createElement('button');
      logoutBtn.id = 'btnStudioLogout';
      logoutBtn.className = 'btn-editor btn-editor-danger';
      logoutBtn.style.cssText = 'padding: 0.4rem 0.8rem; font-size: 0.8rem; font-weight: 700;';
      logoutBtn.innerHTML = '🔒 Khóa Admin';
      logoutBtn.title = 'Đăng xuất & Khóa truy cập Wiki Studio';
      logoutBtn.addEventListener('click', () => {
        if (confirm('Khóa quyền Admin & đăng xuất về Trang Chủ?')) {
          logout();
        }
      });

      // Change PIN button
      const changePinBtn = document.createElement('button');
      changePinBtn.className = 'btn-editor btn-editor-ghost';
      changePinBtn.style.cssText = 'padding: 0.4rem 0.8rem; font-size: 0.8rem;';
      changePinBtn.innerHTML = '🔑 Đổi PIN';
      changePinBtn.title = 'Đổi mã PIN Admin Bí Mật';
      changePinBtn.addEventListener('click', () => {
        const newPin = prompt('Nhập mã PIN Bí Mật mới (Ví dụ: 888888):', getSecretPin());
        if (newPin && newPin.trim()) {
          setSecretPin(newPin.trim());
          alert(`✅ Đã đổi mã PIN Admin mới thành: ${newPin.trim()}`);
        }
      });

      group.appendChild(changePinBtn);
      group.appendChild(logoutBtn);
    }
  }

  return {
    isAuthenticated,
    authenticate,
    logout,
    openAuthModal,
    getSecretPin,
    setSecretPin,
    init
  };
})();

// Auto-run security check on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  AdminAuth.init();
});
