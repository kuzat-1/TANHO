/* TANHO — js/chat.js */

  // 💬 🔥 УПРАВЛЕНИЕ ОБЩИМ ЧАТОМ + persistence
  // withUserId: optional DM target — permission is checked here, right before opening
  var TANHO_DM_TARGET = null;
  var TANHO_CHAT_PUSHED = false;
  var TANHO_CHAT_CLOSING = false;
  function openGeneralChat(skipPersist, withUserId) {
    if (withUserId && typeof TANHO_USERS !== 'undefined' && TANHO_USERS[withUserId]) {
      if (typeof canReceiveDM === 'function' && !canReceiveDM(TANHO_USERS[withUserId])) return dmBlockedNotice();
    }
    TANHO_DM_TARGET = withUserId || null;
    document.getElementById('generalChatScreen').classList.add('active');
    const container = document.getElementById('chatMessagesContainer');
    if (container) container.scrollTop = container.scrollHeight;
    if (!skipPersist) {
      try { localStorage.setItem('tanho_page', 'generalChat'); } catch(e){}
      if (location.hash.slice(1) !== 'chat') {
        try { history.pushState({tanhoChat:true}, '', '#chat'); TANHO_CHAT_PUSHED = true; } catch(e){ history.replaceState(null,'','#chat'); }
      }
    }
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }

  function closeGeneralChat(skipPersist) {
    TANHO_DM_TARGET = null;
    var wasPushed = TANHO_CHAT_PUSHED;
    if (wasPushed && !skipPersist) {
      TANHO_CHAT_PUSHED = false;
      TANHO_CHAT_CLOSING = true;
      try { history.back(); } catch(e){ TANHO_CHAT_CLOSING = false; }
      // actual DOM cleanup will happen on popstate; do minimal now
      document.getElementById('generalChatScreen').classList.remove('active');
      try { document.getElementById('replyPreview')?.classList.remove('active'); document.getElementById('replyPreview').style.display='none'; } catch(e){}
      document.querySelectorAll('.reaction-picker.active').forEach(p=>p.classList.remove('active'));
      setTimeout(()=>{ TANHO_CHAT_CLOSING=false; if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
      return;
    }
    document.getElementById('generalChatScreen').classList.remove('active');
    // всегда показать капсулу, сбросить превью ответа
    try { document.getElementById('replyPreview')?.classList.remove('active'); document.getElementById('replyPreview').style.display='none'; } catch(e){}
    // убрать все пикеры реакций
    document.querySelectorAll('.reaction-picker.active').forEach(p=>p.classList.remove('active'));
    if (!skipPersist) {
      try {
        const last = localStorage.getItem('tanho_page_before_chat') || 'pageMain';
        localStorage.setItem('tanho_page', last);
        const map={pageMain:'main',pageReels:'reels',pageProfile:'profile'};
        const h = map[last] || 'main';
        if (location.hash.slice(1)==='chat') history.replaceState(null,'', h==='main' ? '#main' : '#'+h);
        // надёжно восстановить страницу и пилюлю
        const btnMap = {
          pageMain: document.querySelector('.bottom-nav .nav-item[onclick*="pageMain"]'),
          pageReels: document.querySelector('.bottom-nav .nav-item[onclick*="pageReels"]'),
          pageProfile: document.querySelector('.bottom-nav .nav-item[onclick*="openUserProfile"]')
        };
        const btn = btnMap[last];
        // сбросить все пилюли и поставить нужную
        document.querySelectorAll('.bottom-nav .nav-item').forEach(b=>b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        else {
          // fallback по hash (у профиля onclick=openUserProfile, а не pageProfile)
          const key = last === 'pageProfile' ? 'openUserProfile' : last;
          const fallback = document.querySelector(`.bottom-nav .nav-item[onclick*="${key}"]`);
          if(fallback) fallback.classList.add('active');
        }
        // показать правильную страницу
        const pageEl = document.getElementById(last);
        const reelsEl = document.getElementById('pageReels');
        document.querySelectorAll('.page-screen').forEach(p=>p.classList.remove('active'));
        if (reelsEl) reelsEl.classList.remove('active');
        if (last === 'pageReels' && reelsEl) {
          reelsEl.classList.add('active');
          try{ const sub = localStorage.getItem('tanho_reels_tab') || 'feed'; if(typeof switchReelsTab==='function') switchReelsTab(sub, true); }catch(e){}
        } else if (last === 'pageProfile') {
          try{
            const pid = localStorage.getItem('tanho_profile_id') || 'khadija_92';
            openUserProfile(pid);
            // openUserProfile already calls switchPage, so avoid duplicate
            // skip the outer pageEl handling
          } catch(e){
            if (pageEl) pageEl.classList.add('active');
          }
          // prevent double handling below
        } else if (pageEl) {
          pageEl.classList.add('active');
        }
        const appHeader = document.getElementById('appHeader');
        if (appHeader) appHeader.style.display = (last==='pageReels' || last==='pageProfile') ? 'none' : 'flex';
        const headerLogo = document.getElementById('headerLogo');
        if (headerLogo && last!=='pageReels' && last!=='pageProfile') headerLogo.innerText='TANHO';
      } catch(e){}
    }
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
  }

  let replyTo = null;
  function setReply(name, text){
    replyTo = {name, text};
    document.getElementById('replyPreviewName').textContent = name;
    document.getElementById('replyPreviewText').textContent = text;
    document.getElementById('replyPreview').classList.add('active');
    document.getElementById('replyPreview').style.display = 'flex';
    document.getElementById('chatTextInput').focus();
  }
  function clearReply(){
    replyTo = null;
    document.getElementById('replyPreview').classList.remove('active');
    document.getElementById('replyPreview').style.display = 'none';
  }

  // ❤️ Telegram-style реакции — палец вверх заменяется выбранной
  function addReaction(bubble, emoji){
    if(!bubble) return;
    const container = bubble.querySelector('.message-reactions');
    const picker = bubble.querySelector('.reaction-picker');
    if(picker) picker.classList.remove('active');
    const quickBtn = container.querySelector('.quick-like');
    let chip = container.querySelector(`[data-emoji="${emoji}"]`);
    if(chip){
      const isActive = chip.classList.contains('active');
      const countEl = chip.querySelector('.reaction-count');
      let count = parseInt(countEl.textContent) || 0;
      if(isActive){
        chip.classList.remove('active');
        count--;
        if(count<=0){
          chip.remove();
          if(!container.querySelector('[data-emoji]') && !container.querySelector('.quick-like')){
            const qb=document.createElement('button');
            qb.className='quick-like';
            qb.title='Реакция';
            qb.textContent='👍';
            qb.onclick=(e)=>{ e.stopPropagation(); qb.nextElementSibling.classList.toggle('active'); };
            container.prepend(qb);
          } else if(!container.querySelector('[data-emoji]')){
            const qb=container.querySelector('.quick-like');
            if(qb){ qb.textContent='👍'; qb.removeAttribute('data-emoji'); }
          }
        } else countEl.textContent = count;
      } else {
        chip.classList.add('active');
        count++;
        countEl.textContent = count;
        chip.style.transform='scale(1.2)'; setTimeout(()=>chip.style.transform='',150);
      }
      if(navigator.vibrate) navigator.vibrate(20);
      return;
    }
    if(quickBtn){
      quickBtn.className='reaction-chip active';
      quickBtn.setAttribute('data-emoji', emoji);
      quickBtn.innerHTML=`${emoji} <span class="reaction-count">1</span>`;
      quickBtn.onclick=(e)=>{ e.stopPropagation(); addReaction(bubble, emoji); };
      quickBtn.title='Нажмите чтобы убрать';
      quickBtn.style.transform='scale(1.2)'; setTimeout(()=>quickBtn.style.transform='',150);
    } else {
      const newChip = document.createElement('button');
      newChip.className='reaction-chip active';
      newChip.setAttribute('data-emoji', emoji);
      newChip.onclick=(e)=>{ e.stopPropagation(); addReaction(bubble, emoji); };
      newChip.innerHTML=`${emoji} <span class="reaction-count">1</span>`;
      container.appendChild(newChip);
      newChip.style.transform='scale(1.2)'; setTimeout(()=>newChip.style.transform='',150);
    }
    if(navigator.vibrate) navigator.vibrate(20);
  }

  function sendChatMessage() {
    // permission check directly before sending (UI hiding is not enough)
    if (TANHO_DM_TARGET && typeof TANHO_USERS !== 'undefined' && TANHO_USERS[TANHO_DM_TARGET]) {
      if (typeof canReceiveDM === 'function' && !canReceiveDM(TANHO_USERS[TANHO_DM_TARGET])) return dmBlockedNotice();
    }
    const input = document.getElementById('chatTextInput');
    const text = input.value.trim();
    if (!text) return;
    const container = document.getElementById('chatMessagesContainer');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const escText = escapeHtml(text);
    const escReplyName = replyTo ? escapeHtml(replyTo.name) : '';
    const escReplyText = replyTo ? escapeHtml(replyTo.text) : '';
    const quoted = replyTo ? '<div class="quoted-reply"><div class="quoted-reply-name">'+escReplyName+'</div><div class="quoted-reply-text">'+escReplyText+'</div></div>' : '';
    const safeText = escText.replace(/'/g, "&#39;");
    const msgHTML = `
      <div class="message-bubble outgoing">
        <div class="message-content-box" ondblclick="event.stopPropagation(); this.parentElement.querySelector('.reaction-picker').classList.toggle('active')">
          `+quoted+escText+`
          <span class="message-time-stamp">`+timeStr+`</span>
        </div>
        <button class="reply-btn" onclick="event.stopPropagation(); setReply('Вы', '`+safeText+`')" title="Ответить"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg></button>
        <div class="message-reactions" style="position:relative;">
          <button class="quick-like" onclick="event.stopPropagation(); this.nextElementSibling.classList.toggle('active')" title="Реакция">👍</button>
          <div class="reaction-picker">
          <button onclick="addReaction(this.closest('.message-bubble'),'❤️')">❤️</button>
          <button onclick="addReaction(this.closest('.message-bubble'),'👍')">👍</button>
          <button onclick="addReaction(this.closest('.message-bubble'),'🔥')">🔥</button>
          <button onclick="addReaction(this.closest('.message-bubble'),'😂')">😂</button>
          <button onclick="addReaction(this.closest('.message-bubble'),'🎉')">🎉</button>
          <button onclick="addReaction(this.closest('.message-bubble'),'😮')">😮</button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', msgHTML);
    input.value = '';
    clearReply();
    container.scrollTop = container.scrollHeight;
  }
  window.addEventListener('popstate', function(e){
    if (TANHO_CHAT_CLOSING) { TANHO_CHAT_CLOSING = false; TANHO_CHAT_PUSHED = false; return; }
    var isActive = document.getElementById('generalChatScreen')?.classList.contains('active');
    // if we were pushed and now the history state is not chat, user pressed back -> close
    if (TANHO_CHAT_PUSHED && isActive) {
      var isChatState = e.state && e.state.tanhoChat;
      // if popped state was chat (now state is not chat) or hash is not #chat, close
      if (!isChatState && location.hash.slice(1) !== 'chat') {
        TANHO_CHAT_PUSHED = false;
        // close without pushing history again
        document.getElementById('generalChatScreen').classList.remove('active');
        try { document.getElementById('replyPreview')?.classList.remove('active'); document.getElementById('replyPreview').style.display='none'; } catch(err){}
        document.querySelectorAll('.reaction-picker.active').forEach(p=>p.classList.remove('active'));
        try {
          var last = localStorage.getItem('tanho_page_before_chat') || 'pageMain';
          var map={pageMain:'main',pageReels:'reels',pageProfile:'profile'};
          var h = map[last] || 'main';
          if (location.hash.slice(1)==='chat') history.replaceState(null,'', h==='main' ? '#main' : '#'+h);
        } catch(err){}
        setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
      }
    } else if (TANHO_CHAT_PUSHED && !isActive) {
      TANHO_CHAT_PUSHED = false;
    }
  });

  const statusEl = document.getElementById('chatHeaderStatus');
  const defaultStatus = '1,284 участников • 142 онлайн';
