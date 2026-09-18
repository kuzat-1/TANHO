/* TANHO — js/posts.js */


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
      const titleEl = post.querySelector('.post-title-text');
      const capEl = post.querySelector('.caption');
      document.getElementById('article-title').value = titleEl ? titleEl.innerText : '';
      document.getElementById('article-content').value = capEl ? capEl.innerText : '';
      // удалить старый пост после редактирования (как обновление)
      post.remove();
      openEditor();
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
    if(currentAudio && currentAudio !== audio){ currentAudio.pause(); if(currentBtn) currentBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; }
    if(audio.paused){
      audio.play().catch(()=>{});
      btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      currentAudio = audio; currentBtn = btn;
    } else {
      audio.pause();
      btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
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
  function toggleComments(btn){
    const countSpan = btn.querySelector('.comments-count');
    let c = parseInt(countSpan.textContent) || 0;
    const txt = prompt('Напиши комментарий:');
    if(txt && txt.trim()){
      c++;
      countSpan.textContent = c;
      // haptic
      if(navigator.vibrate) navigator.vibrate(20);
    }
  }
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
  function publishArticle() {
    if(!isLoggedIn()){ openAuthModal('register'); setAuthError('Войдите или зарегистрируйтесь, чтобы опубликовать пост.'); return; }
    const title = document.getElementById('article-title').value.trim();
    const content = document.getElementById('article-content').value.trim();

    if (!title) { alert('Пожалуйста, введите заголовок поста!'); return; }

    const textBlockHTML = `
      <div class="post-content-text" onclick="togglePostExpand(this)">
        <h2 class="post-title-text">${title}</h2>
        ${content ? `<p class="caption">${content}</p><button class="expand-toggle-btn">Читать полностью ↓</button>` : ''}
      </div>
    `;

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
      const vPlayer = attachedVideoData.url.endsWith('.mp4')
        ? `<video controls src="${attachedVideoData.url}" style="width:100%; height:100%; object-fit:cover;"></video>`
        : `<iframe src="${attachedVideoData.url}" style="width:100%; height:100%; border:none;" allow="autoplay; fullscreen"></iframe>`;
      mediaContentHTML = `<div style="padding: 0 14px;"><div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000; position:relative;">${vPlayer}${stickersHTML}</div></div>`;
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

    const currentUserName = document.getElementById('displayProfileName').innerText;

    const newPostCardHTML = `
      <article class="post-card" data-owner="self" data-user-id="${getCurrentUserId()}">
        <div class="post-header">
          <div class="post-author" onclick="openUserProfile(getCurrentUserId())">
            <div class="author-avatar" style="background-image: url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100');"></div>
            <div class="author-meta">
              <div class="author-name">${currentUserName}</div>
              <div class="post-time-top">только что</div>
            </div>
          </div>
          <div class="post-header-actions">
            <button class="post-menu-btn" onclick="togglePostMenu(this)">⋮</button>
            <div class="post-menu-dropdown">
              <button onclick="handlePostMenuAction('interesting', this)">Интересный</button>
              <button onclick="handlePostMenuAction('not_interesting', this)">Неинтересный</button>
              <button class="danger" onclick="handlePostMenuAction('report', this)">Пожаловаться</button>
              <button onclick="handlePostMenuAction('edit', this)">✏️ Редактировать</button>
            </div>
          </div>
        </div>

        ${bodyOrderHTML}

        <div class="post-actions">
          <div class="action-group">
            <button class="action-with-count" onclick="toggleLike(this)"><svg class="heart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="likes-count">0</span></button>
            <button class="action-with-count" onclick="toggleComments(this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span class="comments-count">0</span></button>
            <button class="icon-btn" onclick="sharePost(this)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </div>
          <button class="icon-btn" onclick="toggleBookmark(this)" title="Закладка"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>
        </div>
      </article>
    `;

    document.getElementById('postsContainer').insertAdjacentHTML('afterbegin', newPostCardHTML);

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
