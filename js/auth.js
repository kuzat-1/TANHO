/* TANHO — js/auth.js */

  var TANHO_REGISTERED_KEY = 'tanho_registered';
  function getRegisteredUsers(){
    try { return JSON.parse(localStorage.getItem(TANHO_REGISTERED_KEY) || '[]'); }
    catch(e){ return []; }
  }
  function saveRegisteredUsers(list){
    try { localStorage.setItem(TANHO_REGISTERED_KEY, JSON.stringify(list)); } catch(e){}
  }
  function isLoggedIn(){
    try {
      var a = JSON.parse(localStorage.getItem(TANHO_AUTH_KEY) || 'null');
      return !!(a && a.userId && TANHO_USERS[a.userId]);
    } catch(e){ return false; }
  }
  function setSession(userId){
    try {
      if(userId) localStorage.setItem(TANHO_AUTH_KEY, JSON.stringify({userId: userId}));
      else localStorage.removeItem(TANHO_AUTH_KEY);
    } catch(e){}
  }
  function loginUser(id){
    var u = TANHO_USERS[id];
    if(!u) return;
    Object.keys(TANHO_USERS).forEach(function(k){ TANHO_USERS[k].isOwn = (k === id); });
    OWN_USER_ID = id;
    currentProfileId = id;
    setSession(id);
    syncSettingsInputs(u);
    closeAuthModal();
    openUserProfile(id);
    if(navigator.vibrate) navigator.vibrate(20);
  }
  function setAuthError(msg){
    var el = document.getElementById('authError');
    if(el) el.textContent = msg || '';
  }
  function switchAuthTab(mode){
    var isLogin = mode !== 'register';
    document.getElementById('authTabLogin').classList.toggle('active', isLogin);
    document.getElementById('authTabRegister').classList.toggle('active', !isLogin);
    document.getElementById('authFormLogin').classList.toggle('active', isLogin);
    document.getElementById('authFormRegister').classList.toggle('active', !isLogin);
    setAuthError('');
  }
  function openAuthModal(mode){
    document.querySelectorAll('.post-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.profile-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    switchAuthTab(mode || 'login');
    document.getElementById('auth-modal').classList.add('active');
    setTimeout(function(){ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }
  function closeAuthModal(){
    document.getElementById('auth-modal').classList.remove('active');
    document.getElementById('authLoading').classList.remove('active');
    setTimeout(function(){ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }
  function handleEmailLogin(){
    var email = (document.getElementById('authLoginEmail').value || '').trim().toLowerCase();
    var pass = document.getElementById('authLoginPass').value || '';
    if(!email || !pass){ setAuthError('Введите email и пароль.'); return; }
    var found = null;
    getRegisteredUsers().forEach(function(r){ if((r.email || '').toLowerCase() === email) found = r; });
    if(!found){ setAuthError('Аккаунт не найден. Зарегистрируйтесь.'); switchAuthTab('register'); return; }
    if(found.pass !== pass){ setAuthError('Неверный пароль.'); return; }
    if(!TANHO_USERS[found.id]){
      TANHO_USERS[found.id] = { id: found.id, name: found.name, handle: found.handle, avatar: found.avatar, bio: found.bio || 'Новый пользователь TANHO ✨', location: 'Ташкент', verified: false, isOwn: false, posts: 0, followers: '0', following: 0, isSubscribed: false, isBlocked: false };
    }
    loginUser(found.id);
  }
  function handleEmailRegister(){
    var name = (document.getElementById('authRegName').value || '').trim();
    var email = (document.getElementById('authRegEmail').value || '').trim().toLowerCase();
    var pass = document.getElementById('authRegPass').value || '';
    if(name.length < 2){ setAuthError('Введите имя пользователя (минимум 2 символа).'); return; }
    if(!validEmail(email)){ setAuthError('Введите корректную почту.'); return; }
    if(pass.length < 4){ setAuthError('Пароль — минимум 4 символа.'); return; }
    var exists = null;
    getRegisteredUsers().forEach(function(r){ if((r.email || '').toLowerCase() === email) exists = r; });
    if(exists){ setAuthError('Эта почта уже зарегистрирована. Войдите.'); switchAuthTab('login'); return; }
    var id = slugUserId(name);
    var avatar = avatarFor(id, name);
    var handle = '@' + id;
    TANHO_USERS[id] = { id: id, name: name, handle: handle, avatar: avatar, bio: 'Новый пользователь TANHO ✨', location: 'Ташкент', verified: false, isOwn: false, posts: 0, followers: '0', following: 0, isSubscribed: false, isBlocked: false };
    var list = getRegisteredUsers();
    list.push({ id: id, name: name, handle: handle, email: email, pass: pass, avatar: avatar, bio: 'Новый пользователь TANHO ✨', provider: 'email' });
    saveRegisteredUsers(list);
    loginUser(id);
  }
  function mockOAuthLogin(provider){
    var loading = document.getElementById('authLoading');
    var loadingText = document.getElementById('authLoadingText');
    setAuthError('');
    if(loadingText) loadingText.textContent = provider === 'google' ? 'Входим через Google…' : 'Входим через Telegram…';
    if(loading) loading.classList.add('active');
    setTimeout(function(){
      if(loading) loading.classList.remove('active');
      var list = getRegisteredUsers();
      var found = null;
      list.forEach(function(r){ if(r.provider === provider) found = r; });
      if(found){
        if(!TANHO_USERS[found.id]){
          TANHO_USERS[found.id] = { id: found.id, name: found.name, handle: found.handle, avatar: found.avatar, bio: found.bio || 'Новый пользователь TANHO ✨', location: 'Ташкент', verified: false, isOwn: false, posts: 0, followers: '0', following: 0, isSubscribed: false, isBlocked: false };
        }
        loginUser(found.id);
        return;
      }
      var name = provider === 'google' ? 'Google User' : 'Telegram User';
      var id = slugUserId(name);
      var avatar = avatarFor(id, name);
      var handle = '@' + id;
      var email = provider === 'google' ? 'google.user@gmail.com' : 'telegram_user@t.me';
      TANHO_USERS[id] = { id: id, name: name, handle: handle, avatar: avatar, bio: 'Вошёл через ' + (provider === 'google' ? 'Google' : 'Telegram') + ' ✨', location: 'Ташкент', verified: false, isOwn: false, posts: 0, followers: '0', following: 0, isSubscribed: false, isBlocked: false };
      list.push({ id: id, name: name, handle: handle, email: email, pass: '', avatar: avatar, bio: TANHO_USERS[id].bio, provider: provider });
      saveRegisteredUsers(list);
      loginUser(id);
    }, 900);
  }
  function handleGoogleAuth(){ mockOAuthLogin('google'); }
  function handleTelegramAuth(){ mockOAuthLogin('telegram'); }
