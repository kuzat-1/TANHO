/* TANHO — js/theme.js */

  /* Legacy entry — single source of truth is setThemeMode() in screens.js.
     Kept for compatibility, delegates to the unified logic. */
  function toggleTheme() {
    if (typeof setThemeMode === 'function') {
      setThemeMode(document.body.classList.contains('light-theme') ? 'dark' : 'light');
    } else {
      document.body.classList.toggle('light-theme');
      notifyNativeTheme();
    }
    if(navigator.vibrate) navigator.vibrate(15);
  }
