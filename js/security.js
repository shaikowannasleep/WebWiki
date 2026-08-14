/**
 * Basic Frontend Security Module
 * Protects basic public assets from casual scraping (Right Click, F12, Ctrl+U, etc.)
 */
(function() {
  // Disable Right Click (Context Menu)
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  // Disable specific developer keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    if (e.ctrlKey && e.shiftKey) {
      // Ctrl + Shift + I (DevTools)
      if (e.key === 'I' || e.key === 'i' || e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
      // Ctrl + Shift + C (Inspect Element)
      if (e.key === 'C' || e.key === 'c' || e.keyCode === 67) {
        e.preventDefault();
        return false;
      }
      // Ctrl + Shift + J (Console)
      if (e.key === 'J' || e.key === 'j' || e.keyCode === 74) {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl + U (View Source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
  });

  // Clickjacking / Iframe protection
  // Only allow if we are the top window
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
})();
