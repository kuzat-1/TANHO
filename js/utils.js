/* TANHO — js/utils.js */

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function slugUserId(name){
    var base = (name || 'user').toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 20) || 'user';
    var id = base, n = 1;
    while(TANHO_USERS[id]){ n++; id = base + '_' + n; }
    return id;
  }
  function avatarFor(id, name){
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || id) + '&background=7c3aed&color=fff&size=300';
  }
  function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  function notifyNativeTheme(){
    try {
      var light = document.body.classList.contains('light-theme');
      try { localStorage.setItem('tanho_theme', light ? 'light' : 'dark'); } catch(e){}
      if(window.TanhoTheme && window.TanhoTheme.setTheme) window.TanhoTheme.setTheme(light ? 'light' : 'dark');
    } catch(e){}
  }
  function sharePost(btn){
    const card = btn.closest('.post-card');
    const title = card.querySelector('.post-title-text')?.innerText || 'TANHO пост';
    if(navigator.share){
      navigator.share({title, text: title, url: location.href}).catch(()=>{});
    } else {
      // fallback copy
      navigator.clipboard?.writeText(location.href);
      const orig = btn.innerHTML;
      btn.innerHTML = '✓';
      setTimeout(()=> btn.innerHTML = orig, 1200);
    }
  }
  let lastTapTarget = null;
  function handleDoubleTapRefresh(e, pageId){
    const now = Date.now();
    const isDouble = (now - lastTapTime < 350) && lastTapTarget === pageId;
    lastTapTime = now;
    lastTapTarget = pageId;
    if(!isDouble) return;
    // double tap detected
    const indicator = document.getElementById(pageId==='pageMain' ? 'refreshMain' : pageId==='pageReels' ? 'refreshReels' : 'refreshProfile');
    if(indicator) { indicator.classList.add('active'); }
    // вибрация
    if(navigator.vibrate) navigator.vibrate(30);
    // прокрутка вверх и имитация обновления
    const scrollEl = pageId==='pageMain' ? document.getElementById('pageMain') : pageId==='pageReels' ? document.getElementById('pageReels') : document.getElementById('pageProfile');
    if(scrollEl) scrollEl.scrollTop = 0;
    const feed = document.getElementById('ytFeed');
    if(feed && pageId==='pageReels') { /* обновить ленту видео */ if(typeof renderYtFeed==='function') setTimeout(renderYtFeed, 400); }
    setTimeout(()=>{
      if(indicator) indicator.classList.remove('active');
      if(navigator.vibrate) navigator.vibrate(20);
    }, 900);
  }

  function handleSliderScroll(slider) {
    const currentIndex = Math.round(slider.scrollLeft / slider.clientWidth);
    const container = slider.parentElement;
    const badge = container.querySelector('.slider-badge');
    const dots = container.querySelectorAll('.dot');
    if (badge) badge.textContent = `${currentIndex + 1}/${dots.length}`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
  }
