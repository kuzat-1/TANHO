/* TANHO — js/theme.js */

  function toggleTheme() {
    document.body.classList.toggle('light-theme');
    notifyNativeTheme();
    if(navigator.vibrate) navigator.vibrate(15);
  }
