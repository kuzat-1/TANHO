/* TANHO — js/profile.js */


  function saveSettingsChanges() {
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const bio = document.getElementById('inputBio').value.trim();

    const fullName = (firstName + ' ' + lastName).trim() || 'Пользователь';

    document.getElementById('displayProfileName').innerText = fullName;
    if (username) document.getElementById('displayProfileHandle').innerText = username;
    if (bio) document.getElementById('displayProfileBio').innerText = bio;
    // обновить текущего пользователя в базе
    try {
      var _uid = (typeof getCurrentUserId === 'function') ? getCurrentUserId() : 'khadija_92';
      if (typeof TANHO_USERS !== 'undefined' && TANHO_USERS[_uid]) {
        TANHO_USERS[_uid].name = fullName;
        if (username) TANHO_USERS[_uid].handle = username;
        if (bio) TANHO_USERS[_uid].bio = bio;
      }
    } catch(e){}

    settingsPage.classList.remove('active');
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }
  var TANHO_USERS = {
    khadija_92: { id: 'khadija_92', name: 'Khadija_92', handle: '@khadija_92', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', bio: 'Мечтай. Действуй. Будь собой ✨', location: 'Узбекистан', verified: true, isOwn: true, posts: 342, followers: '12.4K', following: 156, isSubscribed: false, isBlocked: false },
    tanho_official: { id: 'tanho_official', name: 'TANHO Official', handle: '@tanho_official', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', bio: 'Официальный канал TANHO — новости, обновления и видео', location: 'Ташкент', verified: true, isOwn: false, posts: 128, followers: '45.2K', following: 12, isSubscribed: false, isBlocked: false },
    urbancore: { id: 'urbancore', name: 'Urbancore', handle: '@urbancore', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', bio: 'Город с высоты • дрон 4K', location: 'Ташкент', verified: false, isOwn: false, posts: 86, followers: '8.1K', following: 210, isSubscribed: false, isBlocked: false },
    naturevibe: { id: 'naturevibe', name: 'Nature Vibe', handle: '@naturevibe', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', bio: 'Природа, горы, тишина', location: 'Чимган', verified: false, isOwn: false, posts: 54, followers: '3.2K', following: 98, isSubscribed: false, isBlocked: false },
    caliraval: { id: 'caliraval', name: 'Calira Val', handle: '@CaliraVal', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', bio: 'Монтаж Reels за 60 сек', location: 'Ташкент', verified: false, isOwn: false, posts: 112, followers: '21K', following: 340, isSubscribed: false, isBlocked: false },
    tasty_uz: { id: 'tasty_uz', name: 'Tasty UZ', handle: '@tasty.uz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', bio: 'Узбекская кухня • рецепты шефа', location: 'Самарканд', verified: false, isOwn: false, posts: 203, followers: '89K', following: 45, isSubscribed: false, isBlocked: false, kind: 'channel', channelType: 'food' },
    tashkent_news: { id: 'tashkent_news', name: 'Tashkent News', handle: '@tashkent_news', avatar: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=100', bio: 'Новости Ташкента и Узбекистана — коротко и по делу', location: 'Ташкент', verified: true, isOwn: false, posts: 3, followers: '28.5K', following: 4, isSubscribed: false, isBlocked: false, kind: 'channel', channelType: 'news' }
  }
  // mark base users that are channels (keeps TANHO_USERS literal above untouched)
  try {
    if (TANHO_USERS.tanho_official) { TANHO_USERS.tanho_official.kind = 'channel'; TANHO_USERS.tanho_official.channelType = 'official'; }
  } catch(e){}
  function channelToUserId(channel){
    if(!channel) return 'tanho_official';
    var c = channel.trim().toLowerCase();
    if(c.indexOf('tanho') !== -1) return 'tanho_official';
    if(c.indexOf('urbancore') !== -1) return 'urbancore';
    if(c.indexOf('naturevibe') !== -1) return 'naturevibe';
    if(c.indexOf('caliraval') !== -1) return 'caliraval';
    if(c.indexOf('tasty') !== -1) return 'tasty_uz';
    return 'tanho_official';
  }
  var currentProfileId = 'khadija_92';
  function getCurrentUserId(){ return OWN_USER_ID; }
  function persistUserState(){
    try {
      var s = {};
      Object.keys(TANHO_USERS).forEach(function(k){ s[k] = { isSubscribed: TANHO_USERS[k].isSubscribed, isBlocked: TANHO_USERS[k].isBlocked }; });
      localStorage.setItem('tanho_users_state', JSON.stringify(s));
    } catch(e){}
  }
  function restoreUserState(){
    try {
      var raw = localStorage.getItem('tanho_users_state');
      if(!raw) return;
      var s = JSON.parse(raw);
      Object.keys(s).forEach(function(k){ if(TANHO_USERS[k]){ TANHO_USERS[k].isSubscribed = !!s[k].isSubscribed; TANHO_USERS[k].isBlocked = !!s[k].isBlocked; } });
    } catch(e){}
  }
  function syncSettingsInputs(user){
    try {
      if(document.getElementById('inputFirstName')) document.getElementById('inputFirstName').value = user.name || '';
      if(document.getElementById('inputUsername')) document.getElementById('inputUsername').value = user.handle || '';
      if(document.getElementById('inputBio')) document.getElementById('inputBio').value = user.bio || '';
    } catch(e){}
  }
  function setProfileButtons(user){
    var secondaryBtn = document.getElementById('profileSecondaryBtn');
    var secondaryText = document.getElementById('profileSecondaryText');
    var menuWrap = document.getElementById('profileMenuWrap');
    var blockMenuBtn = document.getElementById('profileBlockMenuBtn');
    var settingsBtn = document.getElementById('openSettingsBtn');
    if(user.isOwn){
      if(secondaryBtn) secondaryBtn.style.display = 'none';
      if(menuWrap) menuWrap.style.display = 'none';
      if(settingsBtn) settingsBtn.style.display = 'flex';
    } else {
      if(secondaryBtn){
        secondaryBtn.style.display = 'flex';
        if(user.isBlocked){
          if(secondaryText) secondaryText.textContent = 'Заблокирован';
          secondaryBtn.className = 'btn btn-secondary';
          secondaryBtn.disabled = true;
          secondaryBtn.style.opacity = '0.6';
        } else {
          secondaryBtn.disabled = false;
          secondaryBtn.style.opacity = '1';
          if(secondaryText) secondaryText.textContent = user.isSubscribed ? 'Подписан ✓' : 'Подписаться';
          secondaryBtn.className = user.isSubscribed ? 'btn btn-secondary subscribed' : 'btn btn-secondary';
        }
      }
      if(menuWrap) menuWrap.style.display = 'flex';
      if(blockMenuBtn) blockMenuBtn.textContent = user.isBlocked ? 'Разблокировать' : 'Заблокировать';
      if(settingsBtn) settingsBtn.style.display = 'flex';
    }
    var dd = document.getElementById('profileMenuDropdown');
    if(dd) dd.classList.remove('active');
    // sync mini-header subscribe button with the same state (no duplicate logic)
    try {
      var miniBtn = document.getElementById('miniSubBtn');
      if (miniBtn) {
        if (user.isOwn || user.isBlocked) { miniBtn.style.display = 'none'; }
        else {
          miniBtn.style.display = '';
          miniBtn.disabled = false;
          miniBtn.style.opacity = '1';
          miniBtn.textContent = user.isSubscribed ? 'Подписан ✓' : 'Подписаться';
          if (user.isSubscribed) miniBtn.classList.add('subscribed');
          else miniBtn.classList.remove('subscribed');
        }
      }
    } catch(e){}
  }
  function openUserProfile(userId){
    var targetId = TANHO_USERS[userId] ? userId : OWN_USER_ID;
    if(!isLoggedIn() && targetId === getCurrentUserId()){
      openAuthModal('register');
      return;
    }
    var user = TANHO_USERS[userId] || TANHO_USERS[OWN_USER_ID];
    currentProfileId = user.id;
    try { localStorage.setItem('tanho_profile_id', user.id); } catch(e){}
    // remember previous non-profile screen once (profile-to-profile keeps it)
    try {
      var wasProfile = document.getElementById('pageProfile').classList.contains('active');
      if (!wasProfile) {
        TANHO_PREV_PAGE = tanhoCurrentPageId();
        if (TANHO_BOOTED && !TANHO_PROFILE_PUSHED) {
          try { history.pushState({ tanhoProfile: true }, ''); TANHO_PROFILE_PUSHED = true; } catch(e){}
        }
      }
    } catch(e){}
    var avatarEl = document.getElementById('displayProfileAvatar');
    if (avatarEl) avatarEl.src = user.avatar;
    document.getElementById('displayProfileName').innerText = user.name;
    document.getElementById('displayProfileHandle').innerText = user.handle;
    document.getElementById('displayProfileBio').innerText = user.bio;
    var stats = document.querySelectorAll('.stats-grid .stat-value');
    if (stats.length >= 3) {
      stats[0].innerText = user.posts;
      stats[1].innerText = user.followers;
      stats[2].innerText = user.following;
    }
    var metaLoc = document.querySelector('.meta-info .meta-item:first-child span');
    if (metaLoc) metaLoc.textContent = user.location;
    var verifiedBadge = document.querySelector('.verified-badge');
    if (verifiedBadge) verifiedBadge.style.display = user.verified ? 'flex' : 'none';
    var channelBadge = document.getElementById('profileChannelBadge');
    if (channelBadge) {
      if (user.kind === 'channel') { channelBadge.textContent = channelTypeLabel(user); channelBadge.style.display = 'inline-flex'; }
      else channelBadge.style.display = 'none';
    }
    // статичные тексты кнопок (без innerHTML, чтобы не ломать DOM)
    var primaryText = document.getElementById('profilePrimaryText');
    if(primaryText) primaryText.textContent = user.isOwn ? 'Редактировать профиль' : 'Сообщение';
    setProfileButtons(user);
    if (typeof updateProfileAuthBadge === 'function') updateProfileAuthBadge();
    if (typeof syncMiniHeader === 'function') syncMiniHeader(user);
    if (typeof renderProfileContent === 'function') renderProfileContent(user);
    if (typeof updateProfileEmptyState === 'function') updateProfileEmptyState();
    var pill = document.querySelector('.floating-nav-container .nav-item-pill:last-child');
    switchPage('pageProfile', pill);
  }
  function handleProfilePrimaryAction(){
    var user = TANHO_USERS[currentProfileId];
    if(!user) return;
    if(user.isOwn){
      document.getElementById('settingsPage').classList.add('active');
      setTimeout(function(){ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
    } else {
      openGeneralChat();
    }
  }
  function handleProfileSecondaryAction(){
    var user = TANHO_USERS[currentProfileId];
    if(!user || user.isOwn || user.isBlocked) return;
    user.isSubscribed = !user.isSubscribed;
    persistUserState();
    setProfileButtons(user);
    if(navigator.vibrate) navigator.vibrate(20);
  }
  function toggleProfileMenu(e){
    if(e) e.stopPropagation();
    var dd = document.getElementById('profileMenuDropdown');
    if(!dd) return;
    var wasActive = dd.classList.contains('active');
    document.querySelectorAll('.profile-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.post-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    if(!wasActive) dd.classList.add('active');
  }
  function handleProfileMenuAction(action){
    var user = TANHO_USERS[currentProfileId];
    if(!user || user.isOwn) return;
    var dd = document.getElementById('profileMenuDropdown');
    if(dd) dd.classList.remove('active');
    if(action==='report'){ alert('Жалоба отправлена ✓'); }
    else if(action==='block'){
      if(user.isBlocked){
        user.isBlocked = false;
        persistUserState();
        setProfileButtons(user);
        alert(user.name + ' разблокирован ✓');
      } else {
        if(confirm('Заблокировать ' + user.name + '?')){
          user.isBlocked = true;
          persistUserState();
          setProfileButtons(user);
          alert(user.name + ' заблокирован');
        }
      }
    }
    if(navigator.vibrate) navigator.vibrate(20);
  }

  // ---------- profile as separate screen: prev page + history ----------
  var TANHO_PREV_PAGE = null;
  var TANHO_PROFILE_PUSHED = false;
  var TANHO_CLOSING_PROFILE = false;
  var TANHO_BOOTED = false;
  setTimeout(function(){ TANHO_BOOTED = true; }, 2500);

  function tanhoCurrentPageId(){
    try {
      if (document.getElementById('generalChatScreen').classList.contains('active')) return 'generalChat';
      if (document.getElementById('pageReels').classList.contains('active')) return 'pageReels';
      if (document.getElementById('pageMain').classList.contains('active')) return 'pageMain';
    } catch(e){}
    return 'pageMain';
  }

  // Back returns to the previous screen (uses existing switchPage/openGeneralChat)
  function goBackFromProfile(fromPop){
    var prev = TANHO_PREV_PAGE || 'pageMain';
    TANHO_PREV_PAGE = null;
    if (TANHO_PROFILE_PUSHED && !fromPop) {
      TANHO_PROFILE_PUSHED = false;
      TANHO_CLOSING_PROFILE = true;
      try { history.back(); } catch(e){ TANHO_CLOSING_PROFILE = false; }
    } else {
      TANHO_PROFILE_PUSHED = false;
    }
    setTimeout(function(){
      if (prev === 'generalChat') {
        if (typeof openGeneralChat === 'function') openGeneralChat(true);
      } else if (prev === 'pageReels') {
        var b2 = document.querySelector('.floating-nav-container .nav-item-pill:nth-child(2)');
        if (typeof switchPage === 'function') switchPage('pageReels', b2);
      } else {
        var b1 = document.querySelector('.floating-nav-container .nav-item-pill:first-child');
        if (typeof switchPage === 'function') switchPage('pageMain', b1);
      }
      if (typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
    }, fromPop ? 0 : 60);
  }

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('popstate', function(){
      if (TANHO_CLOSING_PROFILE) { TANHO_CLOSING_PROFILE = false; return; }
      try {
        var pActive = document.getElementById('pageProfile').classList.contains('active');
        var dr = document.getElementById('drawerOverlay');
        var overlayOpen = !!document.querySelector('.screen-overlay.active') || (dr && dr.classList.contains('active'));
        if (TANHO_PROFILE_PUSHED && pActive && !overlayOpen) {
          TANHO_PROFILE_PUSHED = false;
          goBackFromProfile(true);
        }
      } catch(e){}
    });
  }

  var TANHO_COLLAPSE_INIT = false;
  function setupProfileCollapse(){
    if (TANHO_COLLAPSE_INIT) return;
    var sec = document.getElementById('pageProfile');
    if (!sec || !sec.addEventListener) return;
    TANHO_COLLAPSE_INIT = true;
    sec.addEventListener('scroll', function(){
      try { sec.classList.toggle('collapsed', sec.scrollTop > 200); } catch(e){}
    }, { passive: true });
  }
  try { setupProfileCollapse(); } catch(e){}
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function(){ try { setupProfileCollapse(); } catch(e){} });
  }

  function syncMiniHeader(user){
    try {
      var av = document.getElementById('miniProfileAvatar');
      if (av) av.src = user.avatar;
      var nm = document.getElementById('miniProfileName');
      if (nm) nm.textContent = user.name;
      var vb = document.getElementById('miniVerifiedBadge');
      if (vb) vb.style.display = user.verified ? 'inline-flex' : 'none';
      var sb = document.getElementById('miniProfileSubs');
      if (sb) sb.textContent = user.followers + ' подписчиков';
      var sec = document.getElementById('pageProfile');
      if (sec) { try { sec.scrollTop = 0; sec.classList.remove('collapsed'); } catch(e){} }
    } catch(e){}
  }

  function filterProfileFeed(chipEl) {
    var tabs = document.getElementById('profileTabs');
    if (tabs) {
      var chips = tabs.querySelectorAll('.chip');
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    } else {
      document.querySelectorAll('.filter-tabs .chip').forEach(c => c.classList.remove('active'));
    }
    chipEl.classList.add('active');
    TANHO_CURRENT_FILTER = chipEl.getAttribute('data-filter') || 'all';
    applyProfileFilter();
    if (typeof updateProfileEmptyState === 'function') updateProfileEmptyState();
  }

  // ---------- share profile (real Web Share / clipboard) ----------
  function shareProfile(){
    var user = (typeof TANHO_USERS !== 'undefined') ? TANHO_USERS[currentProfileId] : null;
    var title = user ? ('TANHO — ' + user.name) : 'TANHO';
    var url = location.href.split('#')[0] + '#profile';
    if (navigator.share) { navigator.share({ title: title, text: title, url: url }).catch(function(){}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function(){ alert('Ссылка на профиль скопирована ✓'); }, function(){ alert(title); }); }
    else { alert(title); }
    if (navigator.vibrate) navigator.vibrate(15);
  }

  // ---------- auth provider badge under bio ----------
  function updateProfileAuthBadge(){
    var badge = document.getElementById('profileAuthBadge');
    if (!badge) return;
    var text = '';
    try {
      var session = JSON.parse(localStorage.getItem('tanho_auth') || 'null');
      if (session && session.userId) {
        var list = JSON.parse(localStorage.getItem('tanho_registered') || '[]');
        var found = null;
        list.forEach(function(r){ if (r.id === session.userId) found = r; });
        if (found && found.provider === 'google') text = 'Вошёл через Google ✨';
        else if (found && found.provider === 'telegram') text = 'Вошёл через Telegram ✨';
        else if (found && found.email) text = 'Вошёл по email ✨';
        else text = 'Гость TANHO ✨';
      }
    } catch(e){}
    badge.textContent = text;
    badge.style.display = text ? 'inline-flex' : 'none';
  }

  // ---------- empty state when no posts ----------
  function updateProfileEmptyState(){
    var grid = document.getElementById('profileFeedGrid');
    var empty = document.getElementById('profileEmptyState');
    if (!grid || !empty) return;
    var hasCards = grid.querySelectorAll('.feed-card').length > 0;
    empty.style.display = hasCards ? 'none' : 'flex';
    grid.style.display = hasCards ? 'grid' : 'none';
  }

  // ---------- save from the dedicated Edit Profile screen ----------
  function saveEditProfile(){
    var name = (document.getElementById('editProfileName').value || '').trim();
    var username = (document.getElementById('editProfileUsername').value || '').trim();
    var bio = (document.getElementById('editProfileBio').value || '').trim();
    var city = (document.getElementById('editProfileCity').value || '').trim();
    if (!name) { alert('Введите имя'); return; }
    var user = TANHO_USERS[currentProfileId];
    if (!user) return;
    user.name = name;
    if (username) user.handle = username.charAt(0) === '@' ? username : '@' + username;
    if (bio) user.bio = bio;
    if (city) user.location = city;
    document.getElementById('displayProfileName').innerText = user.name;
    document.getElementById('displayProfileHandle').innerText = user.handle;
    document.getElementById('displayProfileBio').innerText = user.bio;
    var metaLoc = document.querySelector('.meta-info .meta-item:first-child span');
    if (metaLoc) metaLoc.textContent = user.location;
    try {
      var list = (typeof getRegisteredUsers === 'function') ? getRegisteredUsers() : [];
      list.forEach(function(r){ if (r.id === user.id) { r.name = user.name; r.handle = user.handle; r.bio = user.bio; } });
      if (typeof saveRegisteredUsers === 'function') saveRegisteredUsers(list);
    } catch(e){}
    if (typeof syncSettingsInputs === 'function') syncSettingsInputs(user);
    if (typeof closeScreen === 'function') closeScreen();
    else if (typeof goBackScreen === 'function') goBackScreen();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  // ---------- per-profile published content (drives dynamic tabs) ----------
  // News items: short original summary + explicit source + link to original.
  // Full articles are never copied; read more via the source link.
  var TANHO_PROFILE_CONTENT = {
    tashkent_news: [
      { type: 'news', title: 'В Ташкенте расширяют сеть электробусов', desc: 'Новые маршруты свяжут спальные районы с центром. Оплата — картами ATTO и Payme.', img: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500', date: '2 часа назад', source: 'Gazeta.uz', url: 'https://www.gazeta.uz/ru/', likes: 128, comments: 24 },
      { type: 'news', title: 'Курс сум: итоги недели', desc: 'Сум укрепился к доллару на фоне роста экспортной выручки. Краткий разбор цифр.', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500', date: '5 часов назад', source: 'Kun.uz', url: 'https://kun.uz/news', likes: 96, comments: 41 },
      { type: 'news', title: 'Погода в Узбекистане на выходные', desc: 'Синоптики обещают тёплые выходные до +28°C, в горах возможны дожди.', img: '', date: 'вчера', source: 'Kun.uz', url: 'https://kun.uz/news', likes: 54, comments: 9 }
    ]
  };
  var TANHO_DEMO_CARDS = null; // cached own-profile demo cards (profileFeedGrid initial HTML)
  var TANHO_TAB_ORDER = ['video', 'news', 'photo', 'music'];
  var TANHO_TAB_META = {
    all:   { label: 'Все',     icon: 'i-grid' },
    video: { label: 'Видео',   icon: 'i-play' },
    news:  { label: 'Новости', icon: 'i-news' },
    photo: { label: 'Фото',    icon: 'i-image' },
    music: { label: 'Музыка',  icon: 'i-music' }
  };
  var TANHO_CURRENT_FILTER = 'all';
  var TANHO_CHANNEL_LABEL = { news: 'Новости', official: 'Официальный', food: 'Еда' };

  function escHtml(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function newsCardHtml(n){
    var media = n.img
      ? '<div class="card-media"><img src="' + escHtml(n.img) + '" class="card-img" alt="Новость"><div class="badge-type"><svg class="ic"><use href="assets/icons.svg#i-news"/></svg>Новости</div><div class="badge-time">' + escHtml(n.date) + '</div></div>'
      : '';
    return '<div class="feed-card" data-ctype="news">'
      + media
      + '<div class="card-body"><div class="card-title">' + escHtml(n.title) + '</div>'
      + (n.desc ? '<div class="card-source">' + escHtml(n.desc) + '</div>' : '')
      + '<div class="card-source">Источник: <a href="' + escHtml(n.url) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">' + escHtml(n.source) + '</a>' + (n.date && !n.img ? ' • ' + escHtml(n.date) : '') + '</div>'
      + '<div class="card-stats"><div class="stat-group">'
      + '<span class="stat-icon-val"><svg class="ic"><use href="assets/icons.svg#i-heart"/></svg>' + (n.likes || 0) + '</span>'
      + '<span class="stat-icon-val"><svg class="ic"><use href="assets/icons.svg#i-chat"/></svg>' + (n.comments || 0) + '</span>'
      + '</div></div></div></div>';
  }

  function genericCardHtml(c){
    var media;
    if (c.img) {
      var icon = c.type === 'video' ? 'i-play-fill' : (c.type === 'music' ? 'i-music' : 'i-image');
      var label = (TANHO_TAB_META[c.type] || {}).label || '';
      media = '<div class="card-media"><img src="' + escHtml(c.img) + '" class="card-img" alt="' + escHtml(label) + '"><div class="badge-type"><svg class="ic"><use href="assets/icons.svg#' + icon + '"/></svg>' + escHtml(label) + '</div><div class="badge-time">' + escHtml(c.date || '') + '</div></div>';
    } else if (c.type === 'music') {
      media = '<div class="card-media card-media--audio"><svg class="ic"><use href="assets/icons.svg#i-music"/></svg></div>';
    } else {
      media = '';
    }
    return '<div class="feed-card" data-ctype="' + escHtml(c.type) + '">'
      + media
      + '<div class="card-body"><div class="card-title">' + escHtml(c.title) + '</div>'
      + '<div class="card-stats"><div class="stat-group">'
      + '<span class="stat-icon-val"><svg class="ic"><use href="assets/icons.svg#i-heart"/></svg>' + (c.likes || 0) + '</span>'
      + '<span class="stat-icon-val"><svg class="ic"><use href="assets/icons.svg#i-chat"/></svg>' + (c.comments || 0) + '</span>'
      + '</div></div></div></div>';
  }

  function profileItemHtml(item){
    return item.type === 'news' ? newsCardHtml(item) : genericCardHtml(item);
  }

  // render grid for the opened profile: own demo cards (+live) or stored content
  function renderProfileContent(user){
    var grid = document.getElementById('profileFeedGrid');
    if (!grid || !user) return;
    if (TANHO_DEMO_CARDS === null) TANHO_DEMO_CARDS = grid.innerHTML;
    if (user.id === OWN_USER_ID || user.isOwn) {
      var extras = TANHO_PROFILE_CONTENT[OWN_USER_ID] || [];
      grid.innerHTML = TANHO_DEMO_CARDS + extras.map(profileItemHtml).join('');
    } else {
      var items = TANHO_PROFILE_CONTENT[user.id] || [];
      grid.innerHTML = items.map(profileItemHtml).join('');
    }
    renderProfileTabs();
    applyProfileFilter();
  }

  // rebuild tabs from types actually present in the grid
  function renderProfileTabs(){
    var tabs = document.getElementById('profileTabs');
    var grid = document.getElementById('profileFeedGrid');
    if (!tabs || !grid) return;
    var present = [];
    TANHO_TAB_ORDER.forEach(function(t){
      if (grid.querySelector('.feed-card[data-ctype="' + t + '"]') && present.indexOf(t) === -1) present.push(t);
    });
    var cards = grid.querySelectorAll('.feed-card').length;
    tabs.classList.toggle('is-hidden', cards === 0);
    if (TANHO_CURRENT_FILTER !== 'all' && present.indexOf(TANHO_CURRENT_FILTER) === -1) TANHO_CURRENT_FILTER = 'all';
    var html = '<div class="chip' + (TANHO_CURRENT_FILTER === 'all' ? ' active' : '') + '" role="tab" data-filter="all" onclick="filterProfileFeed(this)"><svg class="ic"><use href="assets/icons.svg#i-grid"/></svg>Все</div>';
    present.forEach(function(t){
      var m = TANHO_TAB_META[t];
      html += '<div class="chip' + (TANHO_CURRENT_FILTER === t ? ' active' : '') + '" role="tab" data-filter="' + t + '" onclick="filterProfileFeed(this)"><svg class="ic"><use href="assets/icons.svg#' + m.icon + '"/></svg>' + m.label + '</div>';
    });
    tabs.innerHTML = html;
  }

  function applyProfileFilter(){
    var grid = document.getElementById('profileFeedGrid');
    if (!grid) return;
    // Новости — полноширинточная лента как на главной, остальные — сетка
    try { grid.classList.toggle('feed-grid--list', TANHO_CURRENT_FILTER === 'news'); } catch(e){}
    var cards = grid.querySelectorAll('.feed-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var show = TANHO_CURRENT_FILTER === 'all' || c.getAttribute('data-ctype') === TANHO_CURRENT_FILTER;
      c.style.display = show ? '' : 'none';
    }
  }

  // store newly published own content (auto-creates its tab on re-render)
  function addProfileCard(c){
    if (!TANHO_PROFILE_CONTENT[OWN_USER_ID]) TANHO_PROFILE_CONTENT[OWN_USER_ID] = [];
    TANHO_PROFILE_CONTENT[OWN_USER_ID].unshift(c);
    var grid = document.getElementById('profileFeedGrid');
    if (!grid) return;
    if (typeof currentProfileId === 'undefined') return;
    var viewing = (typeof TANHO_USERS !== 'undefined') ? TANHO_USERS[currentProfileId] : null;
    if (!viewing || viewing.id === OWN_USER_ID || viewing.isOwn) {
      renderProfileContent(TANHO_USERS[OWN_USER_ID]);
    }
  }

  // ---------- channels: strip + store-backed subscribe (existing system) ----------
  function channelTypeLabel(u){
    return TANHO_CHANNEL_LABEL[u.channelType] || (u.kind === 'channel' ? 'Канал' : '');
  }

  function toggleChannelSubscribe(btn, userId){
    var user = (typeof TANHO_USERS !== 'undefined') ? TANHO_USERS[userId] : null;
    if (!user) return;
    user.isSubscribed = !user.isSubscribed;
    if (typeof persistUserState === 'function') persistUserState();
    syncChannelButtons(userId);
    if (typeof currentProfileId !== 'undefined' && currentProfileId === userId && typeof setProfileButtons === 'function') setProfileButtons(user);
    if (navigator.vibrate) navigator.vibrate(20);
  }

  function syncChannelButtons(userId){
    var user = TANHO_USERS[userId];
    if (!user) return;
    var btns = document.querySelectorAll('[data-channel-sub="' + userId + '"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (user.isSubscribed) { b.classList.add('subscribed'); b.textContent = 'Подписан ✓'; }
      else { b.classList.remove('subscribed'); b.textContent = 'Подписаться'; }
    }
  }

  function renderChannelsStrip(){
    var row = document.getElementById('channelsRow');
    if (!row || typeof TANHO_USERS === 'undefined') return;
    var html = '';
    Object.keys(TANHO_USERS).forEach(function(k){
      var u = TANHO_USERS[k];
      if (!u || u.kind !== 'channel' || u.isOwn) return;
      html += '<div class="channel-card">'
        + '<div class="channel-avatar" style="background-image:url(\'' + escHtml(u.avatar) + '\')" onclick="openUserProfile(\'' + u.id + '\')"></div>'
        + '<div class="channel-name" onclick="openUserProfile(\'' + u.id + '\')">' + escHtml(u.name) + '</div>'
        + '<div class="channel-type">' + escHtml(channelTypeLabel(u)) + '</div>'
        + '<div class="channel-desc">' + escHtml(u.bio || '') + '</div>'
        + '<button class="subscribe-btn' + (u.isSubscribed ? ' subscribed' : '') + '" data-channel-sub="' + u.id + '" onclick="toggleChannelSubscribe(this, \'' + u.id + '\')">' + (u.isSubscribed ? 'Подписан ✓' : 'Подписаться') + '</button>'
        + '</div>';
    });
    row.innerHTML = html;
    var strip = document.getElementById('channelsStrip');
    if (strip) strip.style.display = html ? '' : 'none';
  }
