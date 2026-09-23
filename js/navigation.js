/* TANHO — js/navigation.js */

  function updateFloatingNavVisibility(){
    const nav = document.querySelector('.bottom-nav');
    if(!nav) return;
    const chatActive = document.getElementById('generalChatScreen')?.classList.contains('active');
    const editorOpen = document.getElementById('editorModal')?.classList.contains('open');
    const settingsActive = document.getElementById('settingsPage')?.classList.contains('active');
    const authActive = document.getElementById('auth-modal')?.classList.contains('active');
    const drawerActive = document.getElementById('drawerOverlay')?.classList.contains('active');
    const screenActive = !!document.querySelector('.screen-overlay.active');
    const profileActive = document.getElementById('pageProfile')?.classList.contains('active');
    const hidden = chatActive || editorOpen || settingsActive || authActive || drawerActive || screenActive || profileActive;
    nav.style.display = hidden ? 'none' : '';
    try { document.body.classList.toggle('nav-hidden', !!hidden); } catch(e){}
  }
  // Универсальный клик по меню — надёжно
  function switchNavTab(btnEl, target) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    if (target === 'openChat') {
      if (typeof openGeneralChat === 'function') openGeneralChat();
    } else {
      if (typeof switchPage === 'function') switchPage(target, btnEl);
    }
    setTimeout(updateFloatingNavVisibility, 30);
  }

  function switchPage(pageId, btnEl) {
    const appHeader = document.getElementById('appHeader');
    const headerLogo = document.getElementById('headerLogo');

    document.querySelectorAll('.page-screen').forEach(p => p.classList.remove('active'));
    document.getElementById('pageReels').classList.remove('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

    if (pageId === 'pageReels') {
      appHeader.style.display = 'none';
      document.getElementById('pageReels').classList.add('active');
      const hashSub = location.hash.slice(1).startsWith('reels-') ? location.hash.slice(1).split('-')[1] : null;
      if (hashSub) {
        if (typeof switchReelsTab === 'function') switchReelsTab(hashSub, true);
      } else {
        try {
          const saved = localStorage.getItem('tanho_reels_tab');
          if (saved && typeof switchReelsTab === 'function') switchReelsTab(saved, true);
          else if (typeof switchReelsTab === 'function') switchReelsTab('feed', true);
        } catch(e){ if (typeof switchReelsTab === 'function') switchReelsTab('feed', true); }
      }
    } else if (pageId === 'pageProfile') {
      appHeader.style.display = 'none';
      document.getElementById('pageProfile').classList.add('active');
    } else {
      appHeader.style.display = 'flex';
      document.getElementById(pageId).classList.add('active');
      headerLogo.innerText = 'TANHO';
    }
    if (btnEl) btnEl.classList.add('active');
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
    // persistence: hash + localStorage
    try {
      localStorage.setItem('tanho_page', pageId);
      if (pageId === 'generalChat') localStorage.setItem('tanho_page', 'generalChat');
      else {
        const chatActive = document.getElementById('generalChatScreen')?.classList.contains('active');
        if (!chatActive) localStorage.setItem('tanho_page_before_chat', pageId);
      }
    } catch(e){}
    const map={pageMain:'main',pageReels:'reels',pageProfile:'profile',generalChat:'chat'};
    let hash = map[pageId] || pageId.replace('page','').toLowerCase();
    if (pageId === 'pageReels') {
      try {
        const sub = localStorage.getItem('tanho_reels_tab') || 'feed';
        hash = 'reels-' + sub;
      } catch(e){ hash='reels-feed'; }
    }
    if (location.hash.slice(1) !== hash) history.replaceState(null,'','#'+hash);
  }

  // --- unified hardware/gesture Back: close topmost layer or go to main ---
  (function(){
    var lastBackExitToast = 0;
    function isModalOverlayActive(){
      try {
        if (document.getElementById('info-modal')?.classList.contains('active')) return true;
        if (document.getElementById('location-modal')?.classList.contains('active')) return true;
        if (document.getElementById('video-modal')?.classList.contains('active')) return true;
        if (document.getElementById('auth-modal')?.classList.contains('active')) return true;
      } catch(e){}
      return false;
    }
    function handleBack(){
      // 1) close topmost overlay/screen first (those already use pushState)
      try {
        if (document.getElementById('editorModal')?.classList.contains('open')) { if(typeof closeEditor==='function') closeEditor(); return true; }
        if (document.querySelector('.screen-overlay.active')) { if(typeof closeScreen==='function') closeScreen(); else if(typeof goBackScreen==='function') goBackScreen(); return true; }
        if (document.getElementById('drawerOverlay')?.classList.contains('active')) { if(typeof closeBurgerDrawer==='function') closeBurgerDrawer(); return true; }
        if (isModalOverlayActive()) { if(typeof closeInfoModal==='function') closeInfoModal(); try{ document.querySelectorAll('.modal-overlay.active').forEach(function(m){m.classList.remove('active');}); }catch(e){} return true; }
        if (document.getElementById('generalChatScreen')?.classList.contains('active')) { if(typeof closeGeneralChat==='function') closeGeneralChat(); return true; }
        if (document.getElementById('settingsPage')?.classList.contains('active')) { try{ document.getElementById('settingsPage').classList.remove('active'); if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }catch(e){} return true; }
      } catch(e){}
      // 2) profile as separate screen: back to previous tab
      try {
        if (document.getElementById('pageProfile')?.classList.contains('active')) {
          if (typeof goBackFromProfile === 'function') goBackFromProfile();
          else {
            var b=document.querySelector('.bottom-nav .nav-item[onclick*="pageMain"]');
            if(typeof switchPage==='function') switchPage('pageMain', b);
          }
          return true;
        }
      } catch(e){}
      // 3) other tabs: back to main instead of exiting
      try {
        var isMain = document.getElementById('pageMain')?.classList.contains('active');
        if (!isMain) {
          var b=document.querySelector('.bottom-nav .nav-item[onclick*="pageMain"]');
          if(typeof switchPage==='function') switchPage('pageMain', b);
          try { history.replaceState(null,'','#main'); } catch(e){}
          return true;
        }
      } catch(e){}
      // 4) on main: double-press to exit
      try {
        var now = Date.now();
        if (now - lastBackExitToast < 2000) return false;
        lastBackExitToast = now;
        if (typeof openInfoModal === 'function') openInfoModal('Выход', 'Нажмите Назад ещё раз, чтобы выйти.');
        else alert('Нажмите Назад ещё раз, чтобы выйти.');
        setTimeout(function(){ try{ closeInfoModal(); }catch(e){} }, 1500);
      } catch(e){}
      return true;
    }
    // history pop (gesture / system back)
    window.addEventListener('popstate', function(e){
      // if we pushed tanho states, let their own handlers run first; otherwise handle here
      // delay to let other popstate handlers fire, then check if still needing handling
      setTimeout(function(){
        // if any overlay was just closed by its own handler, nothing to do
        try {
          var anyOverlay = document.getElementById('editorModal')?.classList.contains('open')
            || document.querySelector('.screen-overlay.active')
            || document.getElementById('drawerOverlay')?.classList.contains('active')
            || isModalOverlayActive()
            || document.getElementById('generalChatScreen')?.classList.contains('active')
            || document.getElementById('settingsPage')?.classList.contains('active')
            || document.getElementById('pageProfile')?.classList.contains('active');
          // if still any overlay, or not on main, handleBack will have been called via its own popstate;
          // if we are here due to root pop, ensure we don't exit immediately
          if (!anyOverlay) {
            var isMain = document.getElementById('pageMain')?.classList.contains('active');
            if (!isMain) { handleBack(); history.pushState({tanhoRoot:true},''); }
            else { history.pushState({tanhoRoot:true},''); handleBack(); }
          }
        } catch(err){}
      }, 30);
    });
    // Capacitor hardware back
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', function(e){
          if (handleBack()) e.canGoBack = false;
        });
      } else {
        document.addEventListener('backbutton', function(e){ if(handleBack()){ e.preventDefault(); e.stopPropagation(); } }, false);
      }
    } catch(e){}
    // ensure there is a history entry to intercept first back on main
    try { history.pushState({tanhoRoot:true},''); } catch(e){}
    window.TANHO_handleBack = handleBack;
  })();

  // ОБЩИЕ ФУНКЦИИ
  function openSearch() {
    document.getElementById('headerLogo').style.display = 'none';
    document.getElementById('headerActions').style.display = 'none';
    const searchBox = document.getElementById('headerSearchBox');
    searchBox.classList.add('active');
    document.getElementById('headerSearchInput').focus();
  }

  function closeSearch() {
    document.getElementById('headerSearchBox').classList.remove('active');
    document.getElementById('headerLogo').style.display = 'block';
    document.getElementById('headerActions').style.display = 'flex';
  }

  /* Запасной замер системных отступов для Android WebView, где
     env(safe-area-inset-*) иногда равен 0: натив отдаёт реальную высоту
     навбара через window.TanhoTheme.getNavBarHeight() (CSS px), кладём в
     --tanho-sab. В браузере моста нет — остаётся чистый env(). */
  (function(){
    function tanhoSyncNavInset(){
      var h = 0;
      try {
        if (window.TanhoTheme && typeof window.TanhoTheme.getNavBarHeight === 'function') {
          h = parseInt(window.TanhoTheme.getNavBarHeight(), 10) || 0;
        }
      } catch (e) { h = 0; }
      try { document.documentElement.style.setProperty('--tanho-sab', (h > 0 ? h : 0) + 'px'); } catch (e) {}
    }
    window.tanhoSyncNavInset = tanhoSyncNavInset;
    try {
      document.addEventListener('DOMContentLoaded', function(){ tanhoSyncNavInset(); setTimeout(tanhoSyncNavInset, 600); });
      window.addEventListener('resize', tanhoSyncNavInset);
      window.addEventListener('orientationchange', function(){ setTimeout(tanhoSyncNavInset, 300); });
    } catch (e) {}
  })();
