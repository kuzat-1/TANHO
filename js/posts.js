/* TANHO — js/posts.js */


// normalize VK/video URLs to a playable embed src.
function normalizeVideoUrl(url){
  var u = String(url || '').trim();
  if (!u) return '';
  var m = u.match(/video_ext\.php\?([^#]*)/i);
  if (m) {
    var q = m[1];
    var oid = (q.match(/(?:^|&)oid=([^&]*)/) || [])[1] || '';
    var vid = (q.match(/(?:^|&)&id=([^&]*)/) || [])[1] || '';
    if (oid && vid) return 'https://vk.com/video_ext.php?oid=' + oid + '&id=' + vid + '&hd=2';
    return u;
  }
  m = u.match(/(?:vk\.com|vkvideo\.ru|m\.vk\.com)\/(?:video|clip)(-?\d+)_(\d+)/i);
  if (m) return 'https://vk.com/video_ext.php?oid=' + m[1] + '&id=' + m[2] + '&hd=2';
  return u;
}

// Build VK embed URL with parameters to disable autoplay and recommendations
function buildVkEmbedUrl(url){
  var base = normalizeVideoUrl(url);
  if (base.includes('video_ext.php')) {
    var sep = base.includes('?') ? '&' : '?';
    return base + '&autoplay=0&start=0&is_replay=0&muted=0&controls=1&loop=0&js_api=1';
  }
  return base;
}

function toggleSubscribe(btn){
    const isSub = btn.classList.contains('subscribed');
    if(isSub){ btn.classList.remove('subscribed'); btn.textContent='Подписаться'; }
    else { btn.classList.add('subscribed'); btn.textContent='Подписан ✓'; if(navigator.vibrate) navigator.vibrate(20); }
  }
  function isOwnPost(post){
    if(!post) return false;
    if(post.getAttribute('data-owner')==='self') return true;
    if(post.getAttribute('data-owner')==='other') return false;
    var uid = post.getAttribute('data-user-id');
    if(uid) return uid === OWN_USER_ID;
    return false;
  }
  function togglePostMenu(btn){
    const dd = btn.nextElementSibling;
    const wasActive = dd.classList.contains('active');
    document.querySelectorAll('.post-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    document.querySelectorAll('.profile-menu-dropdown.active').forEach(d=>d.classList.remove('active'));
    if(!wasActive){
      dd.classList.add('active');
      const post = btn.closest('.post-card');
      const isOwn = isOwnPost(post);
      const editBtn = dd.querySelector('button[onclick*="edit"]');
      if(editBtn) editBtn.style.display = isOwn ? 'flex' : 'none';
      const delBtn = dd.querySelector('button[onclick*="delete"]');
      if(delBtn) delBtn.style.display = isOwn ? 'flex' : 'none';
      const interestingBtn = dd.querySelector('button[onclick*="interesting"]');
      if(interestingBtn) interestingBtn.style.display = isOwn ? 'none' : 'flex';
      const notIntBtn = dd.querySelector('button[onclick*="not_interesting"]');
      if(notIntBtn) notIntBtn.style.display = isOwn ? 'none' : 'flex';
      const reportBtn = dd.querySelector('button[onclick*="report"]');
      if(reportBtn) reportBtn.style.display = isOwn ? 'none' : 'flex';
    }
  }
  function handlePostMenuAction(action, btn){
    const dd = btn.closest('.post-menu-dropdown');
    const post = btn.closest('.post-card');
    if(dd) dd.classList.remove('active');
    if(action==='interesting'){ post.style.transform='scale(0.99)'; setTimeout(()=>post.style.transform='',200); if(navigator.vibrate) navigator.vibrate(20); }
    else if(action==='not_interesting'){ post.style.opacity='0.6'; setTimeout(()=>post.style.opacity='1',800); }
    else if(action==='report'){ alert('Жалоба отправлена ✓'); }
    else if(action==='edit'){
      if(!isOwnPost(post)) return;
      const titleEl = post.querySelector('.post-title-text');
      const capEl = post.querySelector('.caption');
      document.getElementById('article-title').value = titleEl ? titleEl.innerText : '';
      document.getElementById('article-content').value = capEl ? capEl.innerText : '';
      // reset editor state
      try { attachedPhotos = []; attachedStickers = []; clearVideo(); clearAudio(); clearLocation(); document.getElementById('stickers-row').innerHTML = ''; } catch(e){}
      // repopulate photos from post slider (supports multiple)
      try {
        var imgs = post.querySelectorAll('.post-media-slider .slide-item img');
        imgs.forEach(function(img){
          var src = img.getAttribute('src') || img.src;
          if (src) attachedPhotos.push({ id: Date.now() + Math.random(), url: src, name: 'photo.jpg', size: 0, lastModified: Date.now() });
        });
        if (imgs.length) renderGallery();
      } catch(e){}
      // repopulate video (MP4 or VK iframe)
      try {
        var vEl = post.querySelector('video');
        var fEl = post.querySelector('iframe');
        if (vEl && vEl.getAttribute('src')) {
          attachedVideoData = { url: vEl.getAttribute('src'), title: 'Видео' };
          var pHtml = '<video controls src="' + attachedVideoData.url + '"></video>';
          document.getElementById('video-container').innerHTML = '<div style="padding:0; position:relative;"><div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000;">' + pHtml + '</div><button class="remove-badge-btn" onclick="clearVideo()">×</button></div>';
        } else if (fEl && fEl.getAttribute('src')) {
          var fSrc = fEl.getAttribute('src');
          attachedVideoData = { url: fSrc, title: 'VK Video' };
          var fHtml = '<iframe src="' + fSrc + '"></iframe>';
          document.getElementById('video-container').innerHTML = '<div style="padding:0; position:relative;"><div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000;">' + fHtml + '</div><button class="remove-badge-btn" onclick="clearVideo()">×</button></div>';
        }
      } catch(e){}
      // repopulate audio
      try {
        var aEl = post.querySelector('.tg-audio-card audio');
        var aTitle = post.querySelector('.tg-audio-title');
        if (aEl && aEl.getAttribute('src')) {
          attachedAudioData = { url: aEl.getAttribute('src'), name: aTitle ? aTitle.innerText : 'Аудио' };
          document.getElementById('music-container').innerHTML = '<div class="tg-audio-card"><button class="tg-play-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button><div class="tg-audio-body"><div class="tg-audio-title">' + attachedAudioData.name + '</div><div class="tg-audio-time">Аудиозапись</div></div><button class="remove-badge-btn" onclick="clearAudio()">×</button></div>';
        }
      } catch(e){}
      // keep stable ID across edit; drop old stored copy now (publish overwrites same ID)
      try {
        var eid = post.getAttribute('data-post-id');
        if (eid) { TANHO_EDITING_ID = eid; deletePostRecord(eid); }
      } catch(e){}
      post.remove();
      openEditor();
    }
    else if(action==='delete'){
      if(!isOwnPost(post)) return;
      if(!confirm('Удалить публикацию?')) return;
      try {
        var did = post.getAttribute('data-post-id');
        if (did) deletePostRecord(did);
      } catch(e){}
      post.remove();
      if(navigator.vibrate) navigator.vibrate(20);
    }
  }

  function togglePostExpand(element) {
    const card = element.closest('.post-card');
    if (!card) return;
    card.classList.toggle('expanded');
    const btn = card.querySelector('.expand-toggle-btn');
    if (btn) btn.innerText = card.classList.contains('expanded') ? 'Свернуть ↑' : 'Читать полностью ↓';
  }
  let currentBtn = null;
  function togglePostAudio(btn, url){
    const card = btn.closest('.tg-audio-card');
    const audio = card.querySelector('audio');
    if(!audio) return;
    // unified: stop any other playing media (VK/video/audio) before this one
    try { if (typeof TANHO_MEDIA !== 'undefined' && audio.paused) { var _c = audio.closest('[data-post-id]'); var _pid = _c ? _c.getAttribute('data-post-id') : null; var _title = ''; try { var _card = audio.closest('.post-card'); var _t = _card ? _card.querySelector('.post-title-text') : null; if (_t) _title = _t.textContent.trim(); } catch (e) {} TANHO_MEDIA.stopAllExcept(audio); } } catch (e) {}
    if(currentAudio && currentAudio !== audio){ try { currentAudio.pause(); } catch (e) {} if(currentBtn) currentBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; }
    if(audio.paused){
      try { if (typeof TANHO_MEDIA !== 'undefined') { var _cc = audio.closest('[data-post-id]'); var _pp = _cc ? _cc.getAttribute('data-post-id') : null; var _tt2 = ''; try { var _ca = audio.closest('.post-card'); var _tt = _ca ? _ca.querySelector('.post-title-text') : null; if (_tt) _tt2 = _tt.textContent.trim(); } catch (e) {} TANHO_MEDIA.activate(audio, 'audio', { postId: _pp, title: _tt2 || 'Audio' }); } } catch (e) {}
      audio.play().catch(()=>{});
      btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      currentAudio = audio; currentBtn = btn;
    } else {
      audio.pause();
      btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      try { if (typeof TANHO_MEDIA !== 'undefined' && TANHO_MEDIA.active && TANHO_MEDIA.active.element === audio) TANHO_MEDIA.active = null; } catch (e) {}
    }
  }
  function updateAudioTime(audio){
    const card = audio.closest('.tg-audio-card');
    const timeEl = card.querySelector('.tg-audio-time');
    if(timeEl && audio.duration){ timeEl.textContent = Math.floor(audio.currentTime) + 's / ' + Math.floor(audio.duration) + 's • TANHO'; }
  }
  function resetAudioBtn(audio){
    const btn = audio.closest('.tg-audio-card').querySelector('.tg-play-btn');
    if(btn) btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    currentAudio = null; currentBtn = null;
  }

  function toggleLike(btn) {
    const svg = btn.querySelector('.heart-icon');
    const countSpan = btn.querySelector('.likes-count');
    let count = parseInt(countSpan.textContent.replace(/\s/g, '')) || 0;
    if (svg.getAttribute('fill') === 'none') {
      svg.setAttribute('fill', 'var(--like-red)'); svg.setAttribute('stroke', 'var(--like-red)'); count++;
      if(navigator.vibrate) navigator.vibrate(20);
    } else {
      svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); count--;
    }
    countSpan.textContent = count;
  }
  var TANHO_COMMENTS = {};
  var TANHO_CURRENT_COMMENT_POST = null;
  try {
    var _cc = JSON.parse(localStorage.getItem('tanho_comments') || '{}');
    if (_cc && typeof _cc === 'object') TANHO_COMMENTS = _cc;
  } catch(e){}
  function saveComments(){ try { localStorage.setItem('tanho_comments', JSON.stringify(TANHO_COMMENTS)); } catch(e){} }
  function getComments(postId){ return TANHO_COMMENTS[postId] || []; }
  function openComments(btn){
    var post = btn ? btn.closest('.post-card') : null;
    var postId = post ? post.getAttribute('data-post-id') : null;
    if (!postId) {
      postId = 'static_' + (post ? post.querySelector('.post-title-text')?.textContent.trim().slice(0,20) : 'unknown');
      if (post) post.setAttribute('data-post-id', postId);
    }
    TANHO_CURRENT_COMMENT_POST = postId;
    var storedCount = getComments(postId).length;
    var domCount = 0;
    try { domCount = parseInt(btn.querySelector('.comments-count')?.textContent) || 0; } catch(e){}
    var displayCount = Math.max(storedCount, domCount);
    // if stored is 0 and dom is 84, keep 84 until new comments are added
    if (storedCount === 0 && domCount > 0) displayCount = domCount;
    document.getElementById('commentsCount').textContent = displayCount;
    renderCommentsList();
    if (typeof openScreen === 'function') openScreen('comments');
    else {
      document.getElementById('screen-comments').classList.add('active');
      try { history.pushState({tanhoComments:true}, ''); } catch(e){}
    }
    setTimeout(function(){ document.getElementById('commentsInput')?.focus(); }, 300);
    try {
      var av = document.getElementById('commentsInputAvatar');
      var cur = TANHO_USERS[getCurrentUserId()];
      if (av && cur) av.src = cur.avatar;
    } catch(e){}
    if (typeof updateFloatingNavVisibility === 'function') updateFloatingNavVisibility();
  }
  function closeComments(){
    if (typeof closeScreen === 'function' && document.getElementById('screen-comments')?.classList.contains('active')) {
      closeScreen();
    } else {
      document.getElementById('screen-comments').classList.remove('active');
      try { if (history.state && history.state.tanhoComments) history.back(); } catch(e){}
    }
    TANHO_CURRENT_COMMENT_POST = null;
    setTimeout(function(){ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }
  function renderCommentsList(){
    var list = document.getElementById('commentsList');
    if (!list || !TANHO_CURRENT_COMMENT_POST) return;
    var comments = getComments(TANHO_CURRENT_COMMENT_POST);
    if (!comments.length) {
      list.innerHTML = '<div style="text-align:center; padding:40px 20px; color:var(--text-sub);"><div style="width:48px;height:48px;border-radius:50%;background:var(--btn-secondary);display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div><div style="font-size:14px; font-weight:600; color:var(--text-main);">Пока нет комментариев</div><div style="font-size:13px; margin-top:4px;">Станьте первым, кто оставит комментарий</div></div>';
      return;
    }
    list.innerHTML = comments.map(function(c){
      return '<div class="comment-item">'
        + '<img class="comment-avatar" src="' + (c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100') + '" alt="">'
        + '<div class="comment-body">'
        + '<div class="comment-author">' + escapeHtml(c.author) + ' <span style="font-weight:400; color:var(--text-sub); font-size:12px;">• ' + escapeHtml(c.time) + '</span></div>'
        + '<div class="comment-text">' + escapeHtml(c.text) + '</div>'
        + '<div class="comment-meta"><span class="comment-like' + (c.liked ? ' active' : '') + '" onclick="toggleCommentLike(\'' + c.id + '\')"><svg width="12" height="12" viewBox="0 0 24 24" fill="' + (c.liked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ' + (c.likes || 0) + '</span><span onclick="replyToComment(\'' + c.id + '\')" style="cursor:pointer;">Ответить</span></div>'
        + '</div></div>';
    }).join('');
    list.scrollTop = list.scrollHeight;
  }
  function sendComment(){
    var input = document.getElementById('commentsInput');
    var text = input ? input.value.trim() : '';
    if (!text || !TANHO_CURRENT_COMMENT_POST) return;
    var postId = TANHO_CURRENT_COMMENT_POST;
    var cur = null;
    try { cur = TANHO_USERS[getCurrentUserId()]; } catch(e){}
    var comment = {
      id: 'c' + Date.now(),
      author: cur ? cur.name : 'Вы',
      avatar: cur ? cur.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: text,
      time: 'сейчас',
      likes: 0,
      liked: false
    };
    if (!TANHO_COMMENTS[postId]) TANHO_COMMENTS[postId] = [];
    TANHO_COMMENTS[postId].push(comment);
    saveComments();
    try {
      var post = document.querySelector('.post-card[data-post-id="' + postId + '"]');
      if (post) {
        var span = post.querySelector('.comments-count');
        if (span) {
          var curCount = parseInt(span.textContent) || 0;
          span.textContent = curCount + 1;
          document.getElementById('commentsCount').textContent = curCount + 1;
        } else {
          document.getElementById('commentsCount').textContent = TANHO_COMMENTS[postId].length;
        }
      } else {
        document.getElementById('commentsCount').textContent = TANHO_COMMENTS[postId].length;
      }
    } catch(e){
      try { document.getElementById('commentsCount').textContent = TANHO_COMMENTS[postId].length; } catch(err){}
    }
    input.value = '';
    renderCommentsList();
    if (navigator.vibrate) navigator.vibrate(20);
  }
  function toggleCommentLike(id){
    if (!TANHO_CURRENT_COMMENT_POST) return;
    var list = TANHO_COMMENTS[TANHO_CURRENT_COMMENT_POST];
    if (!list) return;
    var c = list.find(function(x){ return x.id === id; });
    if (!c) return;
    c.liked = !c.liked;
    c.likes = (c.likes || 0) + (c.liked ? 1 : -1);
    if (c.likes < 0) c.likes = 0;
    saveComments();
    renderCommentsList();
    if (navigator.vibrate) navigator.vibrate(15);
  }
  function replyToComment(id){
    var c = (TANHO_COMMENTS[TANHO_CURRENT_COMMENT_POST] || []).find(function(x){ return x.id === id; });
    if (c) {
      var inp = document.getElementById('commentsInput');
      inp.value = '@' + c.author + ' ';
      inp.focus();
    }
  }
  // keep old name for compatibility, but now opens screen
  function toggleComments(btn){ openComments(btn); }
  function toggleBookmark(btn){
    const svg = btn.querySelector('svg');
    const isActive = btn.getAttribute('data-bookmarked') === '1';
    if(isActive){
      btn.setAttribute('data-bookmarked','0');
      svg.setAttribute('fill','none');
      svg.style.color='';
    } else {
      btn.setAttribute('data-bookmarked','1');
      svg.setAttribute('fill','var(--primary-accent)');
      svg.style.color='var(--primary-accent)';
      if(navigator.vibrate) navigator.vibrate(20);
    }
  }

  // 🚀 ПУБЛИКАЦИЯ В ЛЕНТУ
  var TANHO_EDITING_ID = null;
  function newPostId(){ return 'p' + Date.now().toString(36) + Math.floor(Math.random()*1e6).toString(36); }

  // ---------- local persistence: records in localStorage, blobs in IndexedDB ----------
  // Photos/audio are stored as Blobs in IndexedDB (never huge base64 in localStorage).
  // localStorage['tanho_posts_v1'] keeps only small JSON records with stable IDs.
  var TANHO_POSTS_KEY = 'tanho_posts_v1';
  function tanhoIDB(){
    return new Promise(function(res, rej){
      try {
        var r = indexedDB.open('tanho_db', 1);
        r.onupgradeneeded = function(){ try { r.result.createObjectStore('media'); } catch(e){} };
        r.onsuccess = function(){ res(r.result); };
        r.onerror = function(){ rej(r.error); };
      } catch(e){ rej(e); }
    });
  }
  // serialize all IndexedDB access through one queue: rapid parallel
  // open/put/close cycles from successive publishes can otherwise abort each other
  var TANHO_IDB_Q = Promise.resolve();
  function idbSerial(fn){
    var r = TANHO_IDB_Q.then(fn, fn);
    TANHO_IDB_Q = r.catch(function(){});
    return r;
  }
  function idbPut(key, blob, tries){
    tries = (typeof tries === 'number') ? tries : 3;
    return idbSerial(function(){
      return tanhoIDB().then(function(db){
        return new Promise(function(res, rej){
          try {
            var tx = db.transaction('media', 'readwrite');
            var q = tx.objectStore('media').put(blob, key);
            q.onsuccess = function(){ try { db.close(); } catch(e){} res(); };
            q.onerror = function(){ try { db.close(); } catch(e){} rej(q.error); };
            tx.onerror = function(){ try { db.close(); } catch(e){} rej(tx.error); };
            tx.onabort = function(){ try { db.close(); } catch(e){} rej(tx.error || new Error('tx abort')); };
          } catch(e){ rej(e); }
        });
      }).catch(function(e){
        if (tries > 1) return idbPut(key, blob, tries - 1);
        throw e;
      });
    });
  }
  function idbGet(key){
    return idbSerial(function(){
      return tanhoIDB().then(function(db){
        return new Promise(function(res, rej){
          try {
            var tx = db.transaction('media', 'readonly');
            var q = tx.objectStore('media').get(key);
            q.onsuccess = function(){ try { db.close(); } catch(e){} res(q.result || null); };
            q.onerror = function(){ rej(q.error); };
          } catch(e){ rej(e); }
        });
      });
    });
  }
  function idbDel(key){
    return idbSerial(function(){
      return tanhoIDB().then(function(db){
        return new Promise(function(res){
          try {
            var tx = db.transaction('media', 'readwrite');
            tx.objectStore('media').delete(key);
            tx.oncomplete = function(){ try { db.close(); } catch(e){} res(); };
            tx.onerror = function(){ res(); };
          } catch(e){ res(); }
        });
      });
    });
  }
  function getPostRecords(){
    try { var l = JSON.parse(localStorage.getItem(TANHO_POSTS_KEY) || '[]'); return Array.isArray(l) ? l : []; }
    catch(e){ return []; }
  }
  function savePostRecords(list){
    try { localStorage.setItem(TANHO_POSTS_KEY, JSON.stringify(list.slice(0, 30))); } catch(e){}
  }
  function dataURLtoBlob(dataURL){
    return fetch(dataURL).then(function(r){ return r.blob(); });
  }
  // build the exact same card markup for publish and for restore (single source)
  function postCardHTML(d){
    var mediaContentHTML = d.mediaHTML || '';
    var attachmentsBottomHTML = d.audioHTML || '';
    var textBlockHTML = '';
    if (d.title || d.content) {
      textBlockHTML = ''
      + '<div class="post-content-text" onclick="togglePostExpand(this)">'
      + (d.title ? '<h2 class="post-title-text">' + d.title + '</h2>' : '')
      + (d.content ? '<p class="caption">' + d.content + '</p><button class="expand-toggle-btn">Читать полностью ↓</button>' : '')
      + '</div>';
    }
    var bodyOrderHTML = (d.textOnTop) ? textBlockHTML + mediaContentHTML + attachmentsBottomHTML
                                      : mediaContentHTML + attachmentsBottomHTML + textBlockHTML;
    return ''
    + '<article class="post-card" data-owner="self" data-user-id="' + d.userId + '" data-post-id="' + d.id + '">'
    + '<div class="post-header">'
    + '<div class="post-author" onclick="openUserProfile(getCurrentUserId())">'
    + '<div class="author-avatar" style="background-image: url(\'' + d.avatar + '\');"></div>'
    + '<div class="author-meta"><div class="author-name">' + d.authorName + '</div>'
    + '<div class="post-time-top">' + d.timeLabel + '</div></div></div>'
    + '<div class="post-header-actions">'
    + '<button class="post-menu-btn" onclick="togglePostMenu(this)">⋮</button>'
    + '<div class="post-menu-dropdown">'
    + '<button onclick="handlePostMenuAction(\'interesting\', this)"><svg class="ic" width="14" height="14"><use href="assets/icons.svg#i-check"/></svg>Интересный</button>'
    + '<button onclick="handlePostMenuAction(\'not_interesting\', this)"><svg class="ic" width="14" height="14"><use href="assets/icons.svg#i-x"/></svg>Не интересно</button>'
    + '<button class="danger" onclick="handlePostMenuAction(\'report\', this)"><svg class="ic" width="14" height="14"><use href="assets/icons.svg#i-info"/></svg>Пожаловаться</button>'
    + '<button onclick="handlePostMenuAction(\'edit\', this)"><svg class="ic" width="14" height="14"><use href="assets/icons.svg#i-edit"/></svg>Редактировать</button>'
    + '<button class="danger" onclick="handlePostMenuAction(\'delete\', this)"><svg class="ic" width="14" height="14"><use href="assets/icons.svg#i-trash"/></svg>Удалить</button>'
    + '</div></div></div>'
    + bodyOrderHTML
    + '<div class="post-actions">'
    + '<div class="action-group">'
    + '<button class="action-with-count" onclick="toggleLike(this)"><svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="likes-count">0</span></button>'
    + '<button class="action-with-count" onclick="toggleComments(this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span class="comments-count">0</span></button>'
    + '<button class="icon-btn" onclick="sharePost(this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
    + '</div>'
    + '<button class="icon-btn" onclick="toggleBookmark(this)" title="Закладка"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>'
    + '</div></article>';
  }
  function persistPublishedPost(record){
    try {
      var list = getPostRecords().filter(function(r){ return r.id !== record.id; });
      list.unshift(record);
      savePostRecords(list);
    } catch(e){}
  }
  function deletePostRecord(id){
    try {
      var rec = null;
      var list = getPostRecords().filter(function(r){ if (r.id === id) { rec = r; return false; } return true; });
      savePostRecords(list);
      var kills = [];
      (rec && rec.photos || []).forEach(function(p){ if (p.blobId) kills.push(idbDel(p.blobId)); });
      if (rec && rec.audio && rec.audio.blobId) kills.push(idbDel(rec.audio.blobId));
      return Promise.all(kills).catch(function(){});
    } catch(e){ return Promise.resolve(); }
  }
  // restore user posts on boot: same markup, blobs resolved to object URLs, no duplicates.
  // Runs once (both DOMContentLoaded and fallback timer call it; the sync flag wins the race).
  var TANHO_RESTORE_DONE = false;
  function restorePublishedPosts(){
    if (TANHO_RESTORE_DONE) return Promise.resolve(0);
    TANHO_RESTORE_DONE = true;
    var list = getPostRecords();
    if (!list.length) return Promise.resolve(0);
    var box = document.getElementById('postsContainer');
    if (!box) return Promise.resolve(0);
    var chain = Promise.resolve();
    var restored = 0;
    list.slice().reverse().forEach(function(rec){
      chain = chain.then(function(){
        if (box.querySelector('[data-post-id="' + rec.id + '"]')) return;
        var jobs = (rec.photos || []).map(function(p){
          return p.blobId ? idbGet(p.blobId).then(function(b){ return b ? URL.createObjectURL(b) : ''; }).catch(function(){ return ''; }) : Promise.resolve('');
        });
        var audioJob = (rec.audio && rec.audio.blobId)
          ? idbGet(rec.audio.blobId).then(function(b){ return b ? URL.createObjectURL(b) : ''; }).catch(function(){ return ''; })
          : Promise.resolve('');
        return Promise.all([Promise.all(jobs), audioJob]).then(function(r){
          var urls = r[0], audioUrl = r[1];
          var d = { id: rec.id, userId: rec.userId, authorName: rec.authorName, avatar: rec.avatar,
                    title: rec.title, content: rec.content, timeLabel: rec.timeLabel || 'ранее',
                    textOnTop: rec.textOnTop !== false, mediaHTML: '', audioHTML: '' };
          if ((rec.photos || []).length) {
            d.mediaHTML = '<div class="post-slider-wrapper" style="position:relative;">'
              + '<div class="post-media-slider">'
              + rec.photos.map(function(p, i){ return '<div class="slide-item"><img src="' + (urls[i] || '') + '"></div>'; }).join('')
              + '</div>'
              + (rec.photos.length > 1 ? '<div class="slider-badge">1/' + rec.photos.length + '</div>' : '')
              + '<div class="slider-dots">' + rec.photos.map(function(){ return '<span class="dot"></span>'; }).join('') + '</div></div>';
          } else if (rec.video) {
            var isMp4 = (typeof isMp4Url === 'function') ? isMp4Url(rec.video.url) : /\.mp4($|\?)/i.test(rec.video.url || '');
            var embedUrl = isMp4 ? rec.video.url : ((typeof buildVkEmbedUrl === 'function') ? buildVkEmbedUrl(rec.video.url) : rec.video.url);
            var vp = isMp4
              ? '<video controls src="' + embedUrl + '" style="width:100%; height:100%; object-fit:cover;"></video>'
              : '<iframe src="' + embedUrl + '" style="width:100%; height:100%; border:none;" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>';
            d.mediaHTML = '<div style="padding: 0 14px;"><div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000; position:relative;">' + vp + '</div></div>';
          }
          if (rec.audio) {
            d.audioHTML = '<div class="post-attachments-bottom"><div class="tg-audio-card">'
              + '<button class="tg-play-btn" onclick="togglePostAudio(this, \'' + audioUrl + '\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>'
              + '<div class="tg-audio-body"><div class="tg-audio-title">' + rec.audio.name + '</div><div class="tg-audio-time">Аудиозапись • TANHO • tap to play</div></div>'
              + '<audio src="' + audioUrl + '" preload="metadata"></audio></div></div>';
          }
          box.insertAdjacentHTML('afterbegin', postCardHTML(d));
          restored++;
          try {
            var art = box.querySelector('[data-post-id="' + rec.id + '"]');
            if (art && art.querySelector('iframe[src*="video_ext"]') && typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.observePost) TANHO_VIDEO_PLAYER.observePost(art);
          } catch (e) {}
        }).catch(function(){});
      });
    });
    return chain.then(function(){ return restored; });
  }
  function publishArticle() {
    if(!isLoggedIn()){ openAuthModal('register'); setAuthError('Войдите или зарегистрируйтесь, чтобы опубликовать пост.'); return; }
    const title = document.getElementById('article-title').value.trim();
    const content = document.getElementById('article-content').value.trim();

    var hasMedia = attachedPhotos.length > 0 || !!attachedVideoData || !!attachedAudioData || attachedStickers.length > 0;
    if (!title && !content && !hasMedia) { alert('Добавьте текст или прикрепите медиа!'); return; }

    const textBlockHTML = (title || content) ? `
      <div class="post-content-text" onclick="togglePostExpand(this)">
        ${title ? `<h2 class="post-title-text">${title}</h2>` : ''}
        ${content ? `<p class="caption">${content}</p><button class="expand-toggle-btn">Читать полностью ↓</button>` : ''}
      </div>
    ` : '';

    let mediaContentHTML = '';
    let stickersHTML = '';
    if (attachedStickers.length > 0) {
      const stickersOverlay = attachedStickers.map((src, i) => {
        const left = 12 + (i * 62) % 220;
        const top = 12 + Math.floor(i / 3) * 62;
        return `<div class="post-sticker moving" style="left:${left}px; top:${top}px;" onmousedown="startDragSticker(event, this)" ontouchstart="startDragSticker(event, this)"><img src="${src}" draggable="false"></div>`;
      }).join('');
      stickersHTML = `<div class="post-stickers-overlay">${stickersOverlay}</div>`;
    }
    if (attachedPhotos.length > 0) {
      mediaContentHTML = `
        <div class="post-slider-wrapper" onclick="togglePostExpand(this)" style="position:relative;">
          <div class="post-media-slider" onscroll="handleSliderScroll(this)">
            ${attachedPhotos.map(p => `<div class="slide-item"><img src="${p.url}"></div>`).join('')}
          </div>
          ${attachedPhotos.length > 1 ? `<div class="slider-badge">1/${attachedPhotos.length}</div>` : ''}
          <div class="slider-dots">${Array(attachedPhotos.length).fill('<span class="dot"></span>').join('')}</div>
          ${stickersHTML}
        </div>
      `;
} else if (attachedVideoData) {
      const isMp4 = (typeof isMp4Url === 'function') ? isMp4Url(attachedVideoData.url) : /\.mp4($|\?)/i.test(attachedVideoData.url);
      const vPlayer = isMp4
        ? `<video controls src="${attachedVideoData.url}" style="width:100%; height:100%; object-fit:cover;"></video>`
        : `<iframe src="${buildVkEmbedUrl(attachedVideoData.url)}" style="width:100%; height:100%; border:none;" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      mediaContentHTML = `<div style="padding: 0 14px;"><div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000; position:relative;">${vPlayer}${stickersHTML}</div></div>`;
      // let the video manager observe this post (active state comes from real VK play events)
      setTimeout(function() {
        try {
          var art = document.querySelector('[data-post-id="' + postId + '"]');
          if (art && typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.observePost) TANHO_VIDEO_PLAYER.observePost(art);
        } catch (e) {}
      }, 0);
    } else if (attachedStickers.length > 0) {
      mediaContentHTML = `<div style="padding: 8px 14px;"><div style="width:100%; min-height:90px; background:var(--card-bg); border-radius:14px; position:relative; overflow:hidden; padding:8px;">${stickersHTML}<div style="height:70px;"></div></div></div>`;
    }

    let attachmentsBottomHTML = '';
    if (attachedAudioData) {
      attachmentsBottomHTML = `
        <div class="post-attachments-bottom">
          <div class="tg-audio-card">
            <button class="tg-play-btn" onclick="togglePostAudio(this, '${attachedAudioData.url}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
            <div class="tg-audio-body"><div class="tg-audio-title">${escapeHtml(attachedAudioData.name)}</div><div class="tg-audio-time">Аудиозапись • TANHO • tap to play</div></div>
            <audio src="${attachedAudioData.url}" preload="metadata" ontimeupdate="updateAudioTime(this)" onended="resetAudioBtn(this)"></audio>
          </div>
        </div>
      `;
    }

    const bodyOrderHTML = (selectedTextPosition === 'top') 
      ? textBlockHTML + mediaContentHTML + attachmentsBottomHTML
      : mediaContentHTML + attachmentsBottomHTML + textBlockHTML;

    const postId = TANHO_EDITING_ID || newPostId();
    TANHO_EDITING_ID = null;

    const newPostCardHTML = postCardHTML({
      id: postId,
      userId: getCurrentUserId(),
      authorName: document.getElementById('displayProfileName').innerText,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      title: title, content: content, timeLabel: 'только что',
      textOnTop: (selectedTextPosition === 'top'),
      mediaHTML: mediaContentHTML, audioHTML: attachmentsBottomHTML
    });

    document.getElementById('postsContainer').insertAdjacentHTML('afterbegin', newPostCardHTML);

    // persist record (metadata small JSON; photo/audio blobs go to IndexedDB).
    // Record is saved synchronously FIRST so an instant reload never loses the post;
    // blob uploads finish async and re-save the same stable ID.
    var rec = null;
    try {
      rec = { id: postId, userId: getCurrentUserId(),
        authorName: document.getElementById('displayProfileName').innerText,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        title: title, content: content, timeLabel: 'только что',
        textOnTop: (selectedTextPosition === 'top'),
        photos: [], video: null, audio: null, stickers: attachedStickers.slice() };
      if (attachedVideoData) rec.video = { url: attachedVideoData.url, title: attachedVideoData.title || '' };
      persistPublishedPost(rec);
      var photoJobs = attachedPhotos.map(function(p, i){
        var bid = postId + '_ph' + i;
        return dataURLtoBlob(p.url).then(function(b){ return idbPut(bid, b).then(function(){ return { blobId: bid, name: p.name || '' }; }); })
          .catch(function(){ return { blobId: '', name: p.name || '' }; });
      });
      var audioJob = attachedAudioData
        ? (function(){ var aUrl = attachedAudioData.url, aName = attachedAudioData.name;
            return fetch(aUrl).then(function(r){ return r.blob(); })
            .then(function(b){ var bid = postId + '_au'; return idbPut(bid, b).then(function(){ return { blobId: bid, name: aName }; }); })
            .catch(function(){ return { blobId: '', name: aName }; }); })()
        : Promise.resolve(null);
      Promise.all([Promise.all(photoJobs), audioJob]).then(function(r){
        rec.photos = r[0];
        rec.audio = r[1];
        persistPublishedPost(rec);
      }).catch(function(){});
    } catch(e){}

    // mirror into own profile grid so its tab appears automatically (existing types untouched)
    try {
      if (typeof addProfileCard === 'function') {
        var pubType = attachedVideoData ? 'video' : (attachedAudioData ? 'music' : 'photo');
        var pubImg = attachedPhotos.length > 0 ? attachedPhotos[0].url : ((attachedVideoData && attachedVideoData.thumb) ? attachedVideoData.thumb : '');
        addProfileCard({ type: pubType, title: title, img: pubImg, date: 'только что', likes: 0, comments: 0 });
      }
    } catch(e){}

    document.getElementById('article-title').value = '';
    document.getElementById('article-content').value = '';
    attachedPhotos = [];
    attachedStickers = [];
    document.getElementById('stickers-row').innerHTML = '';
    clearVideo();
    clearAudio();
    clearLocation();
    renderGallery();
    closeEditor();

    switchPage('pageMain', document.querySelectorAll('.nav-tab-btn')[0]);
  }

