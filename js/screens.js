/* TANHO — js/screens.js — drawer + overlay screen stack (openScreen/closeScreen/goBackScreen) */
var TANHO_SCREEN_STACK = [];
var TANHO_DRAWER_OPEN = false;
var TANHO_OVERLAY_PUSHED = 0;
var TANHO_CLOSING_VIA_HISTORY = false;

/* ---------- history integration (safe Back-button close) ---------- */
function tanhoPushOverlay(){
  try { history.pushState({ tanhoOverlay: true }, ''); TANHO_OVERLAY_PUSHED++; } catch(e){}
}
function tanhoPopOverlay(){
  if (TANHO_OVERLAY_PUSHED > 0) {
    TANHO_OVERLAY_PUSHED--;
    TANHO_CLOSING_VIA_HISTORY = true;
    try { history.back(); } catch(e){ TANHO_CLOSING_VIA_HISTORY = false; }
  }
}
window.addEventListener('popstate', function(){
  if (TANHO_CLOSING_VIA_HISTORY) { TANHO_CLOSING_VIA_HISTORY = false; }
  else if (TANHO_OVERLAY_PUSHED > 0) { TANHO_OVERLAY_PUSHED--; }
  // close topmost UI without touching history (Back already popped)
  var top = TANHO_SCREEN_STACK[TANHO_SCREEN_STACK.length - 1];
  if (top) { tanhoHideScreen(top, true); TANHO_SCREEN_STACK.pop(); }
  else if (TANHO_DRAWER_OPEN) { tanhoHideDrawer(true); }
  if (typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') {
    if (TANHO_SCREEN_STACK.length) closeScreen();
    else if (TANHO_DRAWER_OPEN) closeBurgerDrawer();
    else if (typeof closeInfoModal === 'function') closeInfoModal();
  }
});

/* ---------- drawer ---------- */
function openBurgerDrawer(){
  var ov = document.getElementById('drawerOverlay');
  var dr = document.getElementById('burgerDrawer');
  if (!ov || !dr) return;
  try {
    var v = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '1.0.0';
    var vv = document.getElementById('drawerVersion');
    if (vv) vv.textContent = 'TANHO • Версия ' + v;
    var hv = document.getElementById('helpVersion');
    if (hv) hv.textContent = 'TANHO • Версия ' + v;
  } catch(e){}
  var sw = document.getElementById('drawerThemeSwitch');
  if (sw) sw.classList.toggle('on', !document.body.classList.contains('light-theme'));
  ov.classList.add('active');
  dr.classList.add('active');
  TANHO_DRAWER_OPEN = true;
  tanhoPushOverlay();
  if (typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
  if (navigator.vibrate) navigator.vibrate(10);
}
function tanhoHideDrawer(silent){
  var ov = document.getElementById('drawerOverlay');
  var dr = document.getElementById('burgerDrawer');
  if (ov) ov.classList.remove('active');
  if (dr) dr.classList.remove('active');
  TANHO_DRAWER_OPEN = false;
  if (!silent && typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
}
function closeBurgerDrawer(){
  if (!TANHO_DRAWER_OPEN) return;
  tanhoHideDrawer();
  tanhoPopOverlay();
}
function drawerGo(name){
  tanhoHideDrawer();
  // replace drawer history entry with the screen entry
  if (TANHO_OVERLAY_PUSHED > 0) { try { history.back(); } catch(e){} TANHO_OVERLAY_PUSHED--; TANHO_CLOSING_VIA_HISTORY = true; setTimeout(function(){ TANHO_CLOSING_VIA_HISTORY = false; openScreen(name); }, 60); }
  else openScreen(name);
}
function drawerGoProfile(){
  tanhoHideDrawer();
  tanhoPopOverlay();
  setTimeout(function(){
    if (typeof openUserProfile === 'function' && typeof getCurrentUserId === 'function') openUserProfile(getCurrentUserId());
    else if (typeof switchPage === 'function') switchPage('pageProfile', document.querySelector('.floating-nav-container .nav-item-pill:last-child'));
  }, 60);
}
function drawerToggleTheme(){
  if (typeof toggleTheme === 'function') toggleTheme();
  var sw = document.getElementById('drawerThemeSwitch');
  if (sw) setTimeout(function(){ sw.classList.toggle('on', !document.body.classList.contains('light-theme')); }, 50);
  syncAppearanceChecks();
}
function drawerLogout(){
  tanhoHideDrawer();
  tanhoPopOverlay();
  setTimeout(function(){
    try { if (typeof setSession === 'function') setSession(null); else localStorage.removeItem('tanho_auth'); } catch(e){}
    if (typeof openAuthModal === 'function') openAuthModal('login');
  }, 80);
}
// swipe-right on drawer closes it
(function(){
  var sx = 0;
  document.addEventListener('touchstart', function(e){
    if (!TANHO_DRAWER_OPEN) return;
    try { sx = e.touches[0].clientX; } catch(err){}
  }, { passive: true });
  document.addEventListener('touchend', function(e){
    if (!TANHO_DRAWER_OPEN) return;
    try {
      var dx = e.changedTouches[0].clientX - sx;
      if (dx > 70) closeBurgerDrawer();
    } catch(err){}
  }, { passive: true });
})();

/* ---------- screen stack ---------- */
function openScreen(name){
  var el = document.getElementById('screen-' + name);
  if (!el) return;
  // hide current top (stacked slide)
  var cur = TANHO_SCREEN_STACK[TANHO_SCREEN_STACK.length - 1];
  if (cur) { var c = document.getElementById('screen-' + cur); if (c) c.classList.remove('active'); }
  TANHO_SCREEN_STACK.push(name);
  renderScreen(name);
  el.classList.add('active');
  tanhoPushOverlay();
  if (typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
}
function tanhoHideScreen(name, silent){
  var el = document.getElementById('screen-' + name);
  if (el) el.classList.remove('active');
  if (!silent && typeof updateFloatingNavVisibility === 'function') setTimeout(updateFloatingNavVisibility, 30);
}
function closeScreen(){
  var top = TANHO_SCREEN_STACK.pop();
  if (!top) return;
  tanhoHideScreen(top);
  tanhoPopOverlay();
  var prev = TANHO_SCREEN_STACK[TANHO_SCREEN_STACK.length - 1];
  if (prev) { var p = document.getElementById('screen-' + prev); if (p) p.classList.add('active'); }
}
function goBackScreen(){ closeScreen(); }
function tanhoAnyScreenOpen(){ return TANHO_SCREEN_STACK.length > 0; }

function renderScreen(name){
  if (name === 'notifications') renderNotifications();
  else if (name === 'saved') renderSaved();
  else if (name === 'followers') renderFollowers();
  else if (name === 'following') renderFollowing();
  else if (name === 'edit-profile') prefillEditProfile();
  else if (name === 'appearance') syncAppearanceChecks();
  else if (name === 'language') syncLanguageChecks();
  else if (name === 'storage') updateStorageInfo();
  else if (name === 'notif-settings') syncPrefSwitches();
  else if (name === 'settings') { updateStorageInfo(); syncLanguageLabel(); }
}

/* ---------- notifications (data-driven, no fake backend) ---------- */
function renderNotifications(){
  var box = document.getElementById('notificationsList');
  if (!box) return;
  var items = [];
  var hideWelcome = false;
  try { hideWelcome = localStorage.getItem('tanho_notif_welcome') === '0'; } catch(e){}
  if (!hideWelcome) {
    items.push('<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-info"/></svg></span><div class="notif-text">Добро пожаловать в TANHO! Лента, Reels и общий чат уже работают.<div class="notif-time">TANHO Official</div></div></div>');
  }
  try {
    if (typeof TANHO_USERS !== 'undefined') {
      Object.keys(TANHO_USERS).forEach(function(k){
        var u = TANHO_USERS[k];
        if (u && u.isSubscribed && !u.isOwn) {
          items.push('<div class="notif-item"><img class="notif-avatar" src="' + u.avatar + '" alt=""><div class="notif-text">Вы подписаны на <b>' + u.name + '</b><div class="notif-time">' + (u.handle || '') + '</div></div></div>');
        }
      });
    }
  } catch(e){}
  try {
    var v = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '1.0.0';
    items.push('<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-check"/></svg></span><div class="notif-text">TANHO обновлён до версии ' + v + '<div class="notif-time">Системное сообщение</div></div></div>');
  } catch(e){}
  if (!items.length) {
    box.innerHTML = '<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-bell"/></svg></span><div class="notif-text">Пока тихо. Новые события появятся здесь.<div class="notif-time">TANHO</div></div></div>';
  } else {
    box.innerHTML = items.join('');
  }
}
function clearNotifications(){
  try { localStorage.setItem('tanho_notif_welcome', '0'); } catch(e){}
  renderNotifications();
}

/* ---------- saved (real bookmarks from feed) ---------- */
function escAttr(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function renderSaved(){
  var box = document.getElementById('savedList');
  if (!box) return;
  var marked = [];
  try {
    marked = Array.prototype.slice.call(document.querySelectorAll('#postsContainer [data-bookmarked="1"]'));
  } catch(e){}
  if (!marked.length) {
    box.innerHTML = '<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-bookmark"/></svg></span><div class="notif-text">Ничего не сохранено. Нажмите на флажок под постом, чтобы добавить его сюда.<div class="notif-time">TANHO</div></div></div>'
      + '<div style="padding:12px 14px;"><button class="mini-btn accent" onclick="closeScreen(); setTimeout(function(){ switchPage(\'pageMain\', document.querySelector(\'.floating-nav-container .nav-item-pill:first-child\')); }, 80);">Перейти к ленте</button></div>';
    return;
  }
  box.innerHTML = marked.map(function(card, i){
    var t = card.querySelector('.post-title-text');
    var tm = card.querySelector('.post-time-top');
    card.setAttribute('data-saved-idx', 'sv' + i);
    return '<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-bookmark"/></svg></span>'
      + '<div class="notif-text">' + escAttr(t ? t.textContent : 'Публикация') + '<div class="notif-time">' + escAttr(tm ? tm.textContent : '') + '</div></div>'
      + '<button class="mini-btn" onclick="openSavedPost(\'sv' + i + '\')">Открыть</button></div>';
  }).join('');
}
function openSavedPost(idx){
  var card = document.querySelector('#postsContainer [data-saved-idx="' + idx + '"]');
  closeScreen();
  setTimeout(function(){
    if (typeof switchPage === 'function') switchPage('pageMain', document.querySelector('.floating-nav-container .nav-item-pill:first-child'));
    setTimeout(function(){ if (card && card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  }, 80);
}

/* ---------- followers / following (real local data) ---------- */
function userRowHtml(u, actionHtml){
  return '<div class="user-row"><img class="user-row-avatar" src="' + escAttr(u.avatar) + '" alt="">'
    + '<div class="user-row-info">' + escAttr(u.name) + '<div class="user-row-sub">' + escAttr(u.handle || '') + '</div></div>' + actionHtml + '</div>';
}
function renderFollowers(){
  var box = document.getElementById('followersList');
  if (!box) return;
  var rows = [];
  try {
    if (typeof TANHO_USERS !== 'undefined') {
      Object.keys(TANHO_USERS).forEach(function(k){
        var u = TANHO_USERS[k];
        if (u && !u.isOwn && u.id !== currentProfileId) {
          rows.push(userRowHtml(u, '<button class="mini-btn" onclick="openScreenUser(\'' + u.id + '\')">Открыть</button>'));
        }
      });
    }
  } catch(e){}
  if (!rows.length) rows.push('<div class="notif-item"><div class="notif-text">Пока нет данных о подписчиках.</div></div>');
  box.innerHTML = rows.join('');
}
function renderFollowing(){
  var box = document.getElementById('followingList');
  if (!box) return;
  var rows = [];
  try {
    if (typeof TANHO_USERS !== 'undefined') {
      Object.keys(TANHO_USERS).forEach(function(k){
        var u = TANHO_USERS[k];
        if (u && u.isSubscribed && !u.isOwn) {
          rows.push(userRowHtml(u, '<button class="mini-btn" onclick="unfollowFromScreen(\'' + u.id + '\')">Отписаться</button>'));
        }
      });
    }
  } catch(e){}
  if (!rows.length) {
    box.innerHTML = '<div class="notif-item"><span class="notif-avatar"><svg class="ic"><use href="assets/icons.svg#i-user"/></svg></span><div class="notif-text">Вы ни на кого не подписаны.<div class="notif-time">Найдите авторов в ленте</div></div></div>'
      + '<div style="padding:12px 14px;"><button class="mini-btn accent" onclick="closeScreen(); setTimeout(function(){ switchPage(\'pageMain\', document.querySelector(\'.floating-nav-container .nav-item-pill:first-child\')); }, 80);">Перейти к ленте</button></div>';
  } else {
    box.innerHTML = rows.join('');
  }
}
function openScreenUser(id){
  closeScreen();
  setTimeout(function(){ if (typeof openUserProfile === 'function') openUserProfile(id); }, 80);
}
function unfollowFromScreen(id){
  try {
    if (typeof TANHO_USERS !== 'undefined' && TANHO_USERS[id]) {
      TANHO_USERS[id].isSubscribed = false;
      if (typeof persistUserState === 'function') persistUserState();
    }
  } catch(e){}
  renderFollowing();
}

/* ---------- edit profile prefill ---------- */
function prefillEditProfile(){
  try {
    var u = (typeof TANHO_USERS !== 'undefined') ? TANHO_USERS[currentProfileId] : null;
    if (!u) return;
    var av = document.getElementById('editProfileAvatar');
    if (av) av.src = u.avatar;
    var nm = document.getElementById('editProfileName');
    if (nm) nm.value = u.name || '';
    var un = document.getElementById('editProfileUsername');
    if (un) un.value = u.handle || '';
    var bi = document.getElementById('editProfileBio');
    if (bi) bi.value = u.bio || '';
    var ct = document.getElementById('editProfileCity');
    if (ct) ct.value = u.location || '';
  } catch(e){}
}

/* ---------- appearance / language ---------- */
function setThemeMode(mode){
  var light = (mode === 'light');
  document.body.classList.toggle('light-theme', light);
  try { localStorage.setItem('tanho_theme', light ? 'light' : 'dark'); } catch(e){}
  if (typeof notifyNativeTheme === 'function') notifyNativeTheme();
  syncAppearanceChecks();
  var sw = document.getElementById('drawerThemeSwitch');
  if (sw) sw.classList.toggle('on', !light);
}
function syncAppearanceChecks(){
  var light = document.body.classList.contains('light-theme');
  document.querySelectorAll('.row-check[data-theme]').forEach(function(el){
    el.classList.toggle('on', (el.getAttribute('data-theme') === 'light') === light);
  });
}
var TANHO_LANGS = { ru: 'Русский', uz: "O'zbekcha", en: 'English' };
function setLanguage(code){
  try { localStorage.setItem('tanho_lang', code); } catch(e){}
  syncLanguageChecks();
  syncLanguageLabel();
}
function syncLanguageChecks(){
  var cur = 'ru';
  try { cur = localStorage.getItem('tanho_lang') || 'ru'; } catch(e){}
  document.querySelectorAll('.row-check[data-lang]').forEach(function(el){
    el.classList.toggle('on', el.getAttribute('data-lang') === cur);
  });
}
function syncLanguageLabel(){
  var cur = 'ru';
  try { cur = localStorage.getItem('tanho_lang') || 'ru'; } catch(e){}
  var el = document.getElementById('languageCurrent');
  if (el) el.textContent = TANHO_LANGS[cur] || TANHO_LANGS.ru;
}

/* ---------- notification prefs (persisted, vibrate enforced globally) ---------- */
function getPrefs(){
  try { return Object.assign({ sound: 1, vibrate: 1, chat: 1 }, JSON.parse(localStorage.getItem('tanho_prefs') || '{}')); }
  catch(e){ return { sound: 1, vibrate: 1, chat: 1 }; }
}
function togglePref(btn, key){
  var p = getPrefs();
  p[key] = p[key] ? 0 : 1;
  try { localStorage.setItem('tanho_prefs', JSON.stringify(p)); } catch(e){}
  syncPrefSwitches();
}
function syncPrefSwitches(){
  var p = getPrefs();
  document.querySelectorAll('.row-switch[data-pref]').forEach(function(el){
    el.classList.toggle('on', !!p[el.getAttribute('data-pref')]);
  });
}
try {
  if (navigator.vibrate) {
    var _tanhoVibrate = navigator.vibrate.bind(navigator);
    navigator.vibrate = function(pattern){
      try {
        var p = JSON.parse(localStorage.getItem('tanho_prefs') || '{}');
        if (p && p.vibrate === 0) return false;
      } catch(e){}
      return _tanhoVibrate(pattern);
    };
  }
} catch(e){}

/* ---------- storage ---------- */
function tanhoStorageBytes(){
  var bytes = 0, keys = 0;
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      keys++;
      bytes += (k.length + (localStorage.getItem(k) || '').length) * 2;
    }
  } catch(e){}
  return { bytes: bytes, keys: keys };
}
function updateStorageInfo(){
  var s = tanhoStorageBytes();
  var kb = (s.bytes / 1024).toFixed(1);
  var a = document.getElementById('storageSize');
  if (a) a.textContent = kb + ' КБ • ' + s.keys + ' ключей';
  var d = document.getElementById('storageDetail');
  if (d) d.textContent = kb + ' КБ в ' + s.keys + ' ключах localStorage';
}
function clearAppCache(){
  var drop = ['tanho_page', 'tanho_page_before_chat', 'tanho_profile_id', 'tanho_reels_tab'];
  try { drop.forEach(function(k){ localStorage.removeItem(k); }); } catch(e){}
  alert('Кэш очищен ✓');
  updateStorageInfo();
}
function wipeAppData(){
  if (!confirm('Удалить все данные TANHO на этом устройстве? Понадобится войти заново.')) return;
  try {
    var kills = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('tanho_') === 0) kills.push(k); }
    kills.forEach(function(k){ localStorage.removeItem(k); });
  } catch(e){}
  location.reload();
}
