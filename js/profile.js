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
    tasty_uz: { id: 'tasty_uz', name: 'Tasty UZ', handle: '@tasty.uz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', bio: 'Узбекская кухня • рецепты шефа', location: 'Самарканд', verified: false, isOwn: false, posts: 203, followers: '89K', following: 45, isSubscribed: false, isBlocked: false }
  }
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
    // статичные тексты кнопок (без innerHTML, чтобы не ломать DOM)
    var primaryText = document.getElementById('profilePrimaryText');
    if(primaryText) primaryText.textContent = user.isOwn ? 'Редактировать профиль' : 'Сообщение';
    setProfileButtons(user);
    if (typeof updateProfileAuthBadge === 'function') updateProfileAuthBadge();
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

  function filterProfileFeed(chipEl) {
    document.querySelectorAll('.filter-tabs .chip').forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
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
