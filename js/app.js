/* TANHO — js/app.js */

  // закрыть пикер при клике вне
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.message-bubble')){
      document.querySelectorAll('.reaction-picker.active').forEach(p=>p.classList.remove('active'));
    }
  });

  // 🔥 СИМУЛЯЦИЯ ИНДИКАТОРА "ПЕЧАТАЕТ..." В ШАПКЕ ЧАТА
  const typingUsers = ['Алишер', 'Мадина', 'Сардор', 'Шахзод', 'Зарина'];

  setInterval(() => {
    if (Math.random() > 0.4) {
      const randomUser = typingUsers[Math.floor(Math.random() * typingUsers.length)];
      statusEl.innerText = `${randomUser} печатает...`;
      statusEl.classList.add('typing');

      setTimeout(() => {
        statusEl.innerText = defaultStatus;
        statusEl.classList.remove('typing');
      }, 3500);
    }
  }, 9000);

  // НАСТРОЙКИ
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const settingsPage = document.getElementById('settingsPage');

  closeSettingsBtn.addEventListener('click', () => { settingsPage.classList.remove('active'); setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30); });

  // 🍔 Бургер-меню профиля (видно всегда, работает без входа)
  var APP_VERSION = '1.0.0';
  try {
    var _bv = document.getElementById('burgerMenuVersion');
    if(_bv) _bv.textContent = 'Версия ' + APP_VERSION;
  } catch(e){}

  // 👤 База пользователей и логика профилей (стабильная, без innerHTML-перезаписей)
  var OWN_USER_ID = 'khadija_92';;
  try { restoreUserState(); } catch(e){}
  // 🔐 Авторизация (гость / регистрация)
  var TANHO_AUTH_KEY = 'tanho_auth';
  // восстановить созданных пользователей и сессию
  try {
    getRegisteredUsers().forEach(function(r){
      if(!TANHO_USERS[r.id]){
        TANHO_USERS[r.id] = { id: r.id, name: r.name, handle: r.handle, avatar: r.avatar, bio: r.bio || 'Новый пользователь TANHO ✨', location: 'Ташкент', verified: false, isOwn: false, posts: 0, followers: '0', following: 0, isSubscribed: false, isBlocked: false };
      }
    });
    var _savedAuth = null;
    try { _savedAuth = JSON.parse(localStorage.getItem(TANHO_AUTH_KEY) || 'null'); } catch(e){}
    if(_savedAuth && _savedAuth.userId && TANHO_USERS[_savedAuth.userId]){
      OWN_USER_ID = _savedAuth.userId;
      Object.keys(TANHO_USERS).forEach(function(k){ TANHO_USERS[k].isOwn = (k === _savedAuth.userId); });
      currentProfileId = _savedAuth.userId;
      syncSettingsInputs(TANHO_USERS[_savedAuth.userId]);
    }
  } catch(e){}
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.post-header-actions')) document.querySelectorAll('.post-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    if(!e.target.closest('.profile-menu-wrap')) document.querySelectorAll('.profile-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    if(!e.target.closest('.yt-menu-wrap')) document.querySelectorAll('.yt-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    if(!e.target.closest('.reel-menu-wrap')) document.querySelectorAll('.reel-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    if(!e.target.closest('.top-nav-profile')) document.querySelectorAll('.burger-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
  });
  // восстановить тему и мгновенно синхронизировать системные иконки
  try {
    if(localStorage.getItem('tanho_theme') === 'light') document.body.classList.add('light-theme');
  } catch(e){}
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(notifyNativeTheme, 600); });
  // клавиатура — только маркер класса; layout держит flex (100dvh) без ручных height/transform,
  // иначе редактор сжимается и под ним просвечивает лента, а тулбар улетает
  (function(){
    const editorEl = document.getElementById('editorModal');
    if (!editorEl || !window.visualViewport) return;
    const vv = window.visualViewport;
    let ticking = false;
    const handler = () => {
      if (!editorEl.classList.contains('open')) return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(()=>{
        const curH = vv.height;
        const diff = window.innerHeight - curH;
        editorEl.classList.toggle('keyboard-open', diff > 100);
        ticking = false;
      });
    };
    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
  })();
  // также слушать focus на инпутах чтобы поднять док
  document.getElementById('article-title')?.addEventListener('focus', ()=>{
    setTimeout(()=>{
      const ed = document.getElementById('editorModal');
      if(ed && ed.classList.contains('open')){
        ed.classList.add('keyboard-open');
      }
    }, 300);
  });
  document.getElementById('article-content')?.addEventListener('focus', ()=>{
    setTimeout(()=>{
      const ed = document.getElementById('editorModal');
      if(ed && ed.classList.contains('open')){
        ed.classList.add('keyboard-open');
      }
    }, 300);
  });
  // чат — composer следует за клавиатурой через flex + resizes-content (без transform-хаков:
  // ручной translateY давал устаревшее смещение, а scrollIntoView сдвигал весь absolute-экран)
  if (window.visualViewport) {
    const chatScreen = document.getElementById('generalChatScreen');
    if (chatScreen) {
      document.getElementById('chatTextInput')?.addEventListener('focus', ()=>{
        setTimeout(()=>{
          const cont = document.getElementById('chatMessagesContainer');
          if(cont) cont.scrollTop = cont.scrollHeight;
        }, 300);
      });
    }
  }

  // СТИКЕРЫ И ГАЛЕРЕЯ
  const btnSticker = document.getElementById('btn-sticker');

  btnSticker.addEventListener('click', (e) => { e.stopPropagation(); stickerPopover.classList.toggle('active'); });
  document.querySelectorAll('.sticker-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      attachedStickers.push(src);
      const card = document.createElement('div');
      card.className = 'sticker-chip';
      card.innerHTML = `<img src="${src}"><button class="remove-badge-btn" onclick="this.parentElement.remove()">×</button>`;
      stickersRow.appendChild(card);
      stickerPopover.classList.remove('active');
    });
  });

  document.getElementById('btn-image').addEventListener('click', () => document.getElementById('image-file-input').click());
  document.getElementById('image-file-input').addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const dup = attachedPhotos.some(p => p.name === file.name && p.size === file.size && p.lastModified === file.lastModified);
      if (dup) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        attachedPhotos.push({ id: Date.now() + Math.random(), url: event.target.result, name: file.name, size: file.size, lastModified: file.lastModified });
        renderGallery();
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  // МУЗЫКА И ВИДЕО МОДАЛКИ
  const musicInput = document.getElementById('music-file-input');

  document.getElementById('btn-music').addEventListener('click', () => musicInput.click());
  musicInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      attachedAudioData = { name: file.name, url: URL.createObjectURL(file) };
      document.getElementById('music-container').innerHTML = `
        <div class="tg-audio-card">
          <button class="tg-play-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
          <div class="tg-audio-body"><div class="tg-audio-title">${file.name}</div><div class="tg-audio-time">Аудиозапись ready</div></div>
          <button class="remove-badge-btn" onclick="clearAudio()">×</button>
        </div>
      `;
    }
  });
  document.getElementById('btn-video').addEventListener('click', () => {
    document.getElementById('video-url-input').value = '';
    document.getElementById('youtube-error').style.display = 'none';
    document.getElementById('video-modal').classList.add('active');
  });
  document.getElementById('btn-location').addEventListener('click', () => document.getElementById('location-modal').classList.add('active'));

  // 🔊 Real audio playback
  let currentAudio = null;

  // 🎨 Draggable stickers for posts
  let dragSticker = null, dragOffsetX=0, dragOffsetY=0;

  // ↔️ свайп влево/вправо для переключения Лента <-> Reels
  (function setupReelsSwipe(){
    let sx=0, sy=0;
    const container = document.getElementById('pageReels');
    if(!container) return;
    container.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; }, {passive:true});
    container.addEventListener('touchend', e=>{
      const ex=e.changedTouches[0].clientX, ey=e.changedTouches[0].clientY;
      const dx=sx-ex, dy=sy-ey;
      if(Math.abs(dx)<60 || Math.abs(dx) < Math.abs(dy)) return;
      if(!container.classList.contains('active')) return;
      const feedActive = document.getElementById('reelsFeedTab')?.classList.contains('active');
      const cur = feedActive ? 'feed' : 'reels';
      if(dx>0 && cur==='feed') switchReelsTab('reels');
      else if(dx<0 && cur==='reels') switchReelsTab('feed');
    }, {passive:true});
    let mDown=false, mSx=0;
    container.addEventListener('mousedown', e=>{ mDown=true; mSx=e.clientX; });
    container.addEventListener('mouseup', e=>{
      if(!mDown) return; mDown=false;
      const dx=mSx - e.clientX;
      if(Math.abs(dx)<60) return;
      if(!container.classList.contains('active')) return;
      const feedActive2 = document.getElementById('reelsFeedTab')?.classList.contains('active');
      const cur=feedActive2?'feed':'reels';
      if(dx>0 && cur==='feed') switchReelsTab('reels');
      else if(dx<0 && cur==='reels') switchReelsTab('feed');
    });
  })();
  document.addEventListener('DOMContentLoaded', renderYtFeed);
  setTimeout(renderYtFeed, 300);
  document.addEventListener('DOMContentLoaded', () => { if (typeof restorePublishedPosts === 'function') restorePublishedPosts().catch(function(){}); });
  setTimeout(() => { if (typeof restorePublishedPosts === 'function') restorePublishedPosts().catch(function(){}); }, 350);
  document.addEventListener('DOMContentLoaded', () => { if (typeof renderChannelsStrip === 'function') renderChannelsStrip(); });
  setTimeout(() => { if (typeof renderChannelsStrip === 'function') renderChannelsStrip(); }, 300);
  document.addEventListener('DOMContentLoaded', () => setTimeout(restoreTanhoPage, 80));
  window.addEventListener('hashchange', () => {
    const h=location.hash.slice(1);
    if (!h) return;
    if (h==='chat') { openGeneralChat(true); return; }
    if (h==='main') { const b=document.querySelector('.floating-nav-container .nav-item-pill:nth-child(1)') || document.querySelector('.bottom-nav .nav-tab-btn:nth-child(1)'); if(b) switchPage('pageMain', b); return; }
    if (h==='profile') {
      try{
        const pid = localStorage.getItem('tanho_profile_id') || 'khadija_92';
        openUserProfile(pid);
      } catch(e){
        const b=document.querySelector('.floating-nav-container .nav-item-pill:last-child') || document.querySelector('.bottom-nav .nav-tab-btn:last-child'); if(b) switchPage('pageProfile', b);
      }
      return;
    }
    if (h.startsWith('reels')) {
      const sub=h.split('-')[1]||'feed';
      const b=document.querySelector('.floating-nav-container .nav-item-pill:nth-child(2)') || document.querySelector('.bottom-nav .nav-tab-btn:nth-child(2)');
      if (b) switchPage('pageReels', b);
      setTimeout(()=>switchReelsTab(sub,true), 30);
    }
  });
  // also restore immediately if DOM already ready
  if (document.readyState !== 'loading') setTimeout(restoreTanhoPage, 50);

  // 🔄 Double-tap to refresh — лента и другие вкладки
  let lastTapTime = 0;
  // также двойной тап по логотипу обновляет текущую страницу
  document.getElementById('headerLogo')?.addEventListener('dblclick', (e)=>{
    const activePage = document.querySelector('.page-screen.active')?.id || document.querySelector('.reels-screen-container.active')?.id || 'pageMain';
    handleDoubleTapRefresh(e, activePage);
    // визуальный эффект
    e.target.style.transform='scale(0.92)'; setTimeout(()=>e.target.style.transform='',150);
  });
  // двойной тап по заголовку редактора тоже
  document.getElementById('headerLogo')?.addEventListener('click', (e)=>{
    // одинарный тап — скролл вверх
    const now = Date.now();
    if(now - lastTapTime < 350 && lastTapTarget === 'headerLogo'){
      handleDoubleTapRefresh(e, document.querySelector('.page-screen.active')?.id || 'pageMain');
    }
    lastTapTime = now;
    lastTapTarget = 'headerLogo';
  });
