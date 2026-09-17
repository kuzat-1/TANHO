/* TANHO — js/navigation.js */

  function updateFloatingNavVisibility(){
    const nav = document.querySelector('.floating-nav-container');
    if(!nav) return;
    const chatActive = document.getElementById('generalChatScreen')?.classList.contains('active');
    const editorOpen = document.getElementById('editorModal')?.classList.contains('open');
    const settingsActive = document.getElementById('settingsPage')?.classList.contains('active');
    const authActive = document.getElementById('auth-modal')?.classList.contains('active');
    const drawerActive = document.getElementById('drawerOverlay')?.classList.contains('active');
    const screenActive = !!document.querySelector('.screen-overlay.active');
    if(chatActive || editorOpen || settingsActive || authActive || drawerActive || screenActive) nav.style.display = 'none';
    else nav.style.display = 'flex';
  }
  // Универсальный клик по меню — надёжно
  function switchNavTab(btnEl, target) {
    document.querySelectorAll('.nav-item-pill').forEach(btn => btn.classList.remove('active'));
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
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-item-pill').forEach(b => b.classList.remove('active'));

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
