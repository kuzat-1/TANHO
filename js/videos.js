/* TANHO — js/videos.js */


  function switchReelsTab(tab, skipPersist) {
    const feedTab = document.getElementById('reelsFeedTab');
    const reelsTab = document.getElementById('reelsReelsTab');
    const feedBtn = document.getElementById('segFeedBtn');
    const reelsBtn = document.getElementById('segReelsBtn');
    const header = document.querySelector('.reels-tabs-header');
    if (!feedTab || !reelsTab) return;
        if (tab === 'feed') {
      feedTab.classList.add('active'); reelsTab.classList.remove('active');
      if (feedBtn) feedBtn.classList.add('active'); if (reelsBtn) reelsBtn.classList.remove('active');
      if (header) header.style.display = 'flex';
      feedTab.style.paddingTop = 'calc(42px + env(safe-area-inset-top, 0px))';
      reelsTab.style.paddingTop = 'calc(42px + env(safe-area-inset-top, 0px))';
    } else {
      reelsTab.classList.add('active'); feedTab.classList.remove('active');
      if (header) header.style.display = 'flex';
      if (reelsBtn) reelsBtn.classList.add('active'); if (feedBtn) feedBtn.classList.remove('active');
      reelsTab.style.paddingTop = '0';
      feedTab.style.paddingTop = 'calc(42px + env(safe-area-inset-top, 0px))';
    }
    if (!skipPersist) {
      try { localStorage.setItem('tanho_reels_tab', tab); localStorage.setItem('tanho_page', 'pageReels'); } catch(e){}
      const hash='reels-'+tab;
      if (location.hash.slice(1)!==hash) history.replaceState(null,'','#'+hash);
    }
  }

  const ytVideosData = [
    { id:1, title: 'Обзор нового TANHO — как работает лента и чат', channel: 'TANHO Official', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', duration: '8:42', views: '124K', time: '3 дня назад' },
    { id:2, title: 'Ташкент с высоты: дрон 4K • красивый закат над городом', channel: '@urbancore', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', thumb: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', duration: '3:12', views: '89K', time: '5 дней назад' },
    { id:3, title: 'Утро в горах Чимгана — релакс, природа, тишина', channel: '@naturevibe', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', thumb: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800', duration: '12:05', views: '45K', time: '1 неделю назад' },
    { id:4, title: 'Как собрать идеальный Reels за 60 сек — монтаж в телефоне', channel: '@CaliraVal', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', duration: '5:33', views: '210K', time: '2 дня назад' },
    { id:5, title: 'Готовим плов по-узбекски: пошаговый рецепт от шефа', channel: '@tasty.uz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', thumb: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', duration: '14:22', views: '312K', time: '4 дня назад' },
  ];

  function renderYtFeed() {
    const container = document.getElementById('ytFeed');
    if (!container) return;
    container.innerHTML = ytVideosData.map(v => {
      var uid = (typeof channelToUserId==='function') ? channelToUserId(v.channel) : 'tanho_official';
      return `
      <div class="yt-card" onclick="openVideoViewer(${v.id})">
        <div class="yt-thumb"><img src="${v.thumb}" alt="" loading="lazy"><span class="yt-duration">${v.duration}</span></div>
        <div class="yt-info">
          <div class="yt-avatar" style="background-image:url('${v.avatar}')" onclick="event.stopPropagation(); openUserProfile('${uid}')"></div>
          <div class="yt-meta" onclick="event.stopPropagation(); openUserProfile('${uid}')">
            <div class="yt-title">${v.title}</div>
            <div class="yt-channel">${v.channel}</div>
            <div class="yt-stats"><span>${v.views} просмотров</span><span>•</span><span>${v.time}</span></div>
          </div>
          <div class="yt-menu-wrap">
            <button class="yt-more-btn" onclick="event.stopPropagation(); toggleYtMenu(this)">⋮</button>
            <div class="yt-menu-dropdown">
              <button onclick="handleYtMenuAction('interesting', ${v.id}, this)">Интересно</button>
              <button onclick="handleYtMenuAction('report', ${v.id}, this)">Пожаловаться</button>
              <button onclick="handleYtMenuAction('share', ${v.id}, this)">Поделиться</button>
            </div>
          </div>
        </div>
      </div>
    `; }).join('');
  }
  function toggleYtMenu(btn){
    var dd = btn.nextElementSibling;
    if(!dd) return;
    var wasActive = dd.classList.contains('active');
    document.querySelectorAll('.yt-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.reel-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    if(!wasActive) dd.classList.add('active');
    if(event) event.stopPropagation();
  }
  function handleYtMenuAction(action, id, btn){
    var dd = btn.closest('.yt-menu-dropdown');
    if(dd) dd.classList.remove('active');
    if(event) event.stopPropagation();
    if(action==='interesting'){ if(navigator.vibrate) navigator.vibrate(20); }
    else if(action==='report'){ alert('Жалоба отправлена ✓'); }
    else if(action==='share'){
      var v = ytVideosData.find(function(x){ return x.id===id; });
      var title = v ? v.title : 'TANHO видео';
      if(navigator.share){ navigator.share({title: title, text: title, url: location.href}).catch(function(){}); }
      else if(navigator.clipboard){ navigator.clipboard.writeText(location.href + '#video-' + id); alert('Ссылка скопирована ✓'); }
    }
  }
  function toggleReelMenu(btn){
    var dd = btn.nextElementSibling;
    if(!dd) return;
    var wasActive = dd.classList.contains('active');
    document.querySelectorAll('.reel-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.yt-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    if(!wasActive) dd.classList.add('active');
  }
  function handleReelMenuAction(action, btn){
    var dd = btn.closest('.reel-menu-dropdown');
    if(dd) dd.classList.remove('active');
    if(event) event.stopPropagation();
    if(action==='interesting'){ if(navigator.vibrate) navigator.vibrate(20); }
    else if(action==='report'){ alert('Жалоба отправлена ✓'); }
    else if(action==='share'){
      if(navigator.share){ navigator.share({title: 'TANHO Reels', text: 'Смотри Reels в TANHO', url: location.href}).catch(function(){}); }
      else alert('Ссылка скопирована ✓');
    }
  }
  var currentViewerVideoId = null;
  var viewerLiked = {}
  var viewerCommentsCount = {}
  var viewerCommented = {}
  function openVideoViewer(id){
    var v = ytVideosData.find(function(x){ return x.id===id; });
    if(!v) return;
    currentViewerVideoId = id;
    document.getElementById('videoViewerTitle').textContent = v.title;
    document.getElementById('videoViewerThumb').src = v.thumb;
    document.getElementById('videoViewerAvatar').style.backgroundImage = "url('" + v.avatar + "')";
    document.getElementById('videoViewerChannel').textContent = v.channel;
    document.getElementById('videoViewerSub').textContent = v.views + ' просмотров • ' + v.time;
    document.getElementById('videoViewerLikes').textContent = viewerLiked[id] ? '1' : '0';
    document.getElementById('videoViewerComments').textContent = (viewerCommentsCount[id] !== undefined) ? viewerCommentsCount[id] : (12 + ((id * 29) % 90));
    var likeIcon = document.querySelector('#videoViewer .reel-heart-icon');
    if(likeIcon){ likeIcon.setAttribute('fill', viewerLiked[id] ? 'var(--like-red)' : 'none'); likeIcon.setAttribute('stroke', viewerLiked[id] ? 'var(--like-red)' : 'currentColor'); }
    // подписка автора
    var subBtn = document.getElementById('videoViewerSubBtn');
    if(subBtn){
      var uid = (typeof channelToUserId==='function') ? channelToUserId(v.channel) : 'tanho_official';
      var u = (typeof TANHO_USERS!=='undefined' && TANHO_USERS[uid]) ? TANHO_USERS[uid] : null;
      var isOwn = (u && u.isOwn) || uid === getCurrentUserId();
      if(isOwn){ subBtn.style.display = 'none'; }
      else {
        subBtn.style.display = '';
        var sub = u ? !!u.isSubscribed : false;
        subBtn.textContent = sub ? 'Подписан ✓' : 'Подписаться';
        subBtn.classList.toggle('subscribed', sub);
      }
    }
    var sim = document.getElementById('videoViewerSimilar');
    sim.classList.remove('hidden');
    document.getElementById('similarToggleBtn').textContent = '›';
    sim.innerHTML = ytVideosData.filter(function(x){ return x.id!==id; }).map(function(x){
      return `<div class="similar-card" onclick="openVideoViewer(${x.id})"><div class="similar-thumb"><img src="${x.thumb}" alt="" loading="lazy"></div><div class="similar-title">${x.title}</div></div>`;
    }).join('');
    document.getElementById('videoViewer').classList.add('active');
    var scroller = document.querySelector('#videoViewer .video-viewer-scroll');
    if(scroller) scroller.scrollTop = 0;
    if(navigator.vibrate) navigator.vibrate(15);
  }
  function closeVideoViewer(){
    document.getElementById('videoViewer').classList.remove('active');
    currentViewerVideoId = null;
  }
  function toggleSimilarPanel(e){
    if(e) e.stopPropagation();
    var sim = document.getElementById('videoViewerSimilar');
    var btn = document.getElementById('similarToggleBtn');
    if(!sim || !btn) return;
    sim.classList.toggle('hidden');
    btn.textContent = sim.classList.contains('hidden') ? '‹' : '›';
  }
  function viewerAuthorProfile(){
    var v = ytVideosData.find(function(x){ return x.id===currentViewerVideoId; });
    if(!v) return;
    var uid = (typeof channelToUserId==='function') ? channelToUserId(v.channel) : 'tanho_official';
    closeVideoViewer();
    setTimeout(function(){ openUserProfile(uid); }, 50);
  }
  function toggleViewerLike(btn){
    if(!currentViewerVideoId) return;
    var on = !viewerLiked[currentViewerVideoId];
    viewerLiked[currentViewerVideoId] = on;
    document.getElementById('videoViewerLikes').textContent = on ? '1' : '0';
    var svg = btn.querySelector('.reel-heart-icon');
    if(svg){ svg.setAttribute('fill', on ? 'var(--like-red)' : 'none'); svg.setAttribute('stroke', on ? 'var(--like-red)' : 'currentColor'); }
    if(navigator.vibrate) navigator.vibrate(20);
  }
  function shareViewerVideo(){
    var v = ytVideosData.find(function(x){ return x.id===currentViewerVideoId; });
    var title = v ? v.title : 'TANHO видео';
    if(navigator.share){ navigator.share({title: title, text: title, url: location.href + '#video-' + currentViewerVideoId}).catch(function(){}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(location.href); alert('Ссылка скопирована ✓'); }
  }
  function toggleViewerComments(btn){
    if(!currentViewerVideoId) return;
    if(viewerCommented[currentViewerVideoId]){
      viewerCommented[currentViewerVideoId] = false;
      viewerCommentsCount[currentViewerVideoId] = Math.max(0, (viewerCommentsCount[currentViewerVideoId] !== undefined ? viewerCommentsCount[currentViewerVideoId] : 0) - 1);
    } else {
      var txt = prompt('Напиши комментарий:');
      if(!txt || !txt.trim()) return;
      viewerCommented[currentViewerVideoId] = true;
      var base = (viewerCommentsCount[currentViewerVideoId] !== undefined) ? viewerCommentsCount[currentViewerVideoId] : 0;
      viewerCommentsCount[currentViewerVideoId] = base + 1;
      if(navigator.vibrate) navigator.vibrate(20);
    }
    document.getElementById('videoViewerComments').textContent = viewerCommentsCount[currentViewerVideoId];
  }
  function toggleViewerSubscribe(){
    var v = ytVideosData.find(function(x){ return x.id===currentViewerVideoId; });
    if(!v) return;
    var uid = (typeof channelToUserId==='function') ? channelToUserId(v.channel) : 'tanho_official';
    var u = (typeof TANHO_USERS!=='undefined') ? TANHO_USERS[uid] : null;
    if(!u || u.isOwn) return;
    u.isSubscribed = !u.isSubscribed;
    try {
      if(typeof persistUserState==='function') persistUserState();
    } catch(e){}
    var subBtn = document.getElementById('videoViewerSubBtn');
    if(subBtn){
      subBtn.textContent = u.isSubscribed ? 'Подписан ✓' : 'Подписаться';
      subBtn.classList.toggle('subscribed', u.isSubscribed);
    }
    if(navigator.vibrate) navigator.vibrate(20);
  }
  function viewerReportVideo(){ alert('Жалоба отправлена ✓'); }

  // 🔄 Persistence: restore page on reload + hash navigation
  function restoreTanhoPage() {
    let hash = location.hash.slice(1);
    let pageId = null, sub = null;
    if (hash.startsWith('reels-')) { pageId='pageReels'; sub=hash.split('-')[1]; }
    else {
      const rev={main:'pageMain',reels:'pageReels',profile:'pageProfile',chat:'generalChat'};
      if (rev[hash]) pageId=rev[hash];
    }
    if (!pageId) {
      try { pageId=localStorage.getItem('tanho_page'); sub=localStorage.getItem('tanho_reels_tab'); } catch(e){}
    }
    if (!pageId || pageId==='pageMain') return;
    if (pageId==='generalChat') { openGeneralChat(true); return; }
    let btn=null;
    if (pageId==='pageMain') btn=document.querySelector('.bottom-nav .nav-item[onclick*="pageMain"]');
    else if (pageId==='pageReels') btn=document.querySelector('.bottom-nav .nav-item[onclick*="pageReels"]');
    else if (pageId==='pageProfile') btn=document.querySelector('.bottom-nav .nav-item[onclick*="openUserProfile"]');
    if (pageId==='pageProfile') {
      try {
        var pid = localStorage.getItem('tanho_profile_id') || 'khadija_92';
        if(typeof openUserProfile==='function') openUserProfile(pid);
        else if (btn && document.getElementById(pageId)) switchPage(pageId, btn);
      } catch(e){
        if (btn && document.getElementById(pageId)) switchPage(pageId, btn);
      }
      return;
    }
    if (btn && document.getElementById(pageId)) {
      switchPage(pageId, btn);
      if (pageId==='pageReels' && sub) switchReelsTab(sub, true);
      else if (pageId==='pageReels' && sub===null) {
        try { const s=localStorage.getItem('tanho_reels_tab'); if(s) switchReelsTab(s,true); } catch(e){}
      }
    } else if (pageId && document.getElementById(pageId)) {
      switchPage(pageId, null);
    }
  }

  function toggleReelLike(chip) {
    const svg = chip.querySelector('.reel-heart-icon');
    const valSpan = chip.querySelector('.reel-likes-val');
    let count = parseInt(valSpan.textContent) || 0;
    if (svg.getAttribute('fill') === 'none') {
      svg.setAttribute('fill', 'var(--like-red)'); svg.setAttribute('stroke', 'var(--like-red)'); count++;
    } else {
      svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); count--;
    }
    valSpan.textContent = count;
  }
