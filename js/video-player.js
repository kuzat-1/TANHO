/* TANHO - js/video-player.js */

var TANHO_VIDEO_PLAYER = {
  activeVideo: null,
  miniPlayerEl: null,
  observer: null,
  isInBackground: false,

  init: function() {
    this.createMiniPlayer();
    this.setupIntersectionObserver();
    this.bindGlobalEvents();
    this.guardVkIframes();
    this.observeNewIframes();
  },

  createMiniPlayer: function() {
    if (this.miniPlayerEl) return;
    var mp = document.createElement('div');
    mp.id = 'tanho-mini-player';
    mp.setAttribute('style', 'position:fixed;bottom:calc(70px + env(safe-area-inset-bottom,0px));left:12px;right:12px;max-width:400px;margin:0 auto;background:var(--card-bg);border:1px solid var(--border-color);border-radius:16px;box-shadow:0 -4px 24px rgba(0,0,0,0.4);padding:8px;display:none;z-index:2000;');
    mp.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">'
      + '<div class="mp-thumb" style="width:48px;height:27px;border-radius:8px;background:#111;overflow:hidden;flex-shrink:0;cursor:pointer;">'
      + '<div class="mp-thumb-label" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">&#9654;</div>'
      + '</div>'
      + '<div class="mp-info" style="flex:1;min-width:0;cursor:pointer;">'
      + '<div class="mp-title" style="font-size:12px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>'
      + '<div class="mp-sub" style="font-size:11px;color:var(--text-sub);">мини-плеер</div>'
      + '</div>'
      + '<button class="mp-btn mp-toggle" aria-label="Play/Pause" style="width:32px;height:32px;border:none;border-radius:50%;background:var(--primary-accent);color:#fff;font-size:14px;cursor:pointer;flex-shrink:0;">&#10074;&#10074;</button>'
      + '<button class="mp-btn mp-close" aria-label="Close" style="width:32px;height:32px;border:none;border-radius:50%;background:transparent;color:var(--text-muted);font-size:16px;cursor:pointer;flex-shrink:0;">&times;</button>'
      + '</div>';
    document.body.appendChild(mp);
    this.miniPlayerEl = mp;
    var self = this;
    mp.querySelector('.mp-toggle').addEventListener('click', function(e) { e.stopPropagation(); self.togglePlayPause(); });
    mp.querySelector('.mp-close').addEventListener('click', function(e) { e.stopPropagation(); self.closeMiniPlayer(); });
    mp.querySelector('.mp-thumb').addEventListener('click', function() { self.expandFromMini(); });
    mp.querySelector('.mp-info').addEventListener('click', function() { self.expandFromMini(); });
  },

  setupIntersectionObserver: function() {
    if (!('IntersectionObserver' in window)) return;
    var self = this;
    try {
      this.observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          var postEl = entry.target.closest ? entry.target.closest('[data-post-id]') : null;
          var postId = postEl ? postEl.getAttribute('data-post-id') : null;
          if (!postId || !self.activeVideo || self.activeVideo.postId !== postId) return;
          if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            if (!self.activeVideo.isMini) self.collapseToMini(postEl);
          } else {
            if (self.activeVideo.isMini && entry.intersectionRatio > 0.5) self.expandFromMini(true);
          }
        });
      }, { root: null, rootMargin: '0px', threshold: [0, 0.2, 0.5, 1] });
    } catch (e) { this.observer = null; }
  },

  observePost: function(postEl) {
    if (!this.observer || !postEl || !postEl.getAttribute) return;
    try {
      var pid = postEl.getAttribute('data-post-id');
      if (pid) this.observer.observe(postEl);
    } catch (e) {}
  },

  unobservePost: function(postEl) {
    if (!this.observer || !postEl) return;
    try { this.observer.unobserve(postEl); } catch (e) {}
  },

  /* ----- single-playback guard: taps inside a VK iframe never reach our
     document, so every VK iframe gets a transparent catcher. First tap on a
     video stops everything else, then starts this one via the VK API. ----- */
  guardVkIframes: function(root) {
    var self = this;
    var frames = [];
    try {
      var scope = root || document;
      var box = document.getElementById('postsContainer');
      if (box && (scope === document || (scope.contains && scope.contains(box)) || scope === box)) scope = box;
      if (scope.querySelectorAll) frames = Array.prototype.slice.call(scope.querySelectorAll('iframe[src*="video_ext"]'));
    } catch (e) { frames = []; }
    frames.forEach(function(fr) { self.ensureCatcher(fr); });
  },

  ensureCatcher: function(iframe) {
    try {
      if (!iframe || iframe._vkGuarded) return;
      var wrap = iframe.parentElement;
      if (!wrap) return;
      try {
        var cs = window.getComputedStyle ? window.getComputedStyle(wrap) : null;
        if (cs && cs.position === 'static') wrap.style.position = 'relative';
      } catch (e) {}
      var c = document.createElement('div');
      c.className = 'vk-tap-catcher';
      var self = this;
      c.addEventListener('click', function(ev) { self.onCatcherTap(ev, iframe); });
      wrap.appendChild(c);
      iframe._vkGuarded = true;
      iframe._vkCatcher = c;
      this.refreshCatchers();
    } catch (e) {}
  },

  pauseAllVkExcept: function(exceptIframe) {
    var frames = [];
    try { frames = Array.prototype.slice.call(document.querySelectorAll('#postsContainer iframe[src*="video_ext"]')); } catch (e) {}
    frames.forEach(function(fr) {
      if (fr === exceptIframe) return;
      try {
        var pl = fr._vkPlayer || null;
        if (!pl && typeof VK !== 'undefined' && VK.VideoPlayer) { pl = VK.VideoPlayer(fr); fr._vkPlayer = pl; }
        if (pl && pl.pause) pl.pause();
        else if (fr.contentWindow) fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
      } catch (e) {}
    });
  },

  playVk: function(iframe) {
    try {
      var pl = iframe._vkPlayer || null;
      if (!pl && typeof VK !== 'undefined' && VK.VideoPlayer) { pl = VK.VideoPlayer(iframe); iframe._vkPlayer = pl; }
      if (pl && pl.play) { pl.play(); return true; }
    } catch (e) {}
    try { iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*'); return true; } catch (e) {}
    return false;
  },

  onCatcherTap: function(ev, iframe) {
    try { ev.preventDefault(); ev.stopPropagation(); } catch (e) {}
    // 1) stop everything else: HTML media + known active VK player
    try { if (typeof TANHO_MEDIA !== 'undefined') TANHO_MEDIA.stopAll(); } catch (e) {}
    try { document.querySelectorAll('video, audio').forEach(function(m) { try { if (!m.paused) m.pause(); } catch (e) {} }); } catch (e) {}
    // 2) pause every other VK iframe explicitly (their taps never notify us)
    try { this.pauseAllVkExcept(iframe); } catch (e) {}
    // 3) identify the post
    var postEl = (iframe.closest && iframe.closest('[data-post-id]')) || null;
    var pid = postEl ? postEl.getAttribute('data-post-id') : null;
    if (!pid) { try { pid = 'vk-' + Array.prototype.indexOf.call(document.querySelectorAll('#postsContainer iframe[src*="video_ext"]'), iframe); } catch (e) { pid = 'vk-unknown'; } }
    var title = 'Video';
    try { var t = postEl ? postEl.querySelector('.post-title-text') : null; if (t && t.textContent) title = t.textContent.trim(); } catch (e) {}
    // 4) this one becomes active and starts playing (single tap, no double-tap needed)
    var started = false;
    try { this.setActiveVideo(pid, iframe, title); } catch (e) {}
    try { if (typeof TANHO_MEDIA !== 'undefined') TANHO_MEDIA.onVkStarted(pid, iframe, title); } catch (e) {}
    try { started = this.playVk(iframe); } catch (e) {}
    if (!started) {
      // VK API unreachable: remove catcher so the user controls the player directly
      try { var c = iframe._vkCatcher; if (c) c.classList.add('hidden'); } catch (e) {}
    }
    try { this.refreshCatchers(); } catch (e) {}
  },

  refreshCatchers: function() {
    var activeIframe = (this.activeVideo && this.activeVideo.iframe) ? this.activeVideo.iframe : null;
    var playing = !!(this.activeVideo && !this.activeVideo.paused && !this.activeVideo.isMini);
    var frames = [];
    try { frames = Array.prototype.slice.call(document.querySelectorAll('#postsContainer iframe[src*="video_ext"]')); } catch (e) {}
    frames.forEach(function(fr) {
      var c = fr._vkCatcher;
      if (!c) return;
      if (fr === activeIframe && playing) c.classList.add('hidden');
      else c.classList.remove('hidden');
    });
  },

  observeNewIframes: function() {
    var self = this;
    try {
      if (!('MutationObserver' in window)) return;
      var box = document.getElementById('postsContainer');
      if (!box) return;
      var mo = new MutationObserver(function(muts) {
        var need = false;
        muts.forEach(function(mu) {
          Array.prototype.forEach.call(mu.addedNodes || [], function(n) {
            if (!n || n.nodeType !== 1) return;
            if ((n.tagName === 'IFRAME' && n.src && n.src.indexOf('video_ext') !== -1) ||
                (n.querySelector && n.querySelector('iframe[src*="video_ext"]'))) need = true;
          });
        });
        if (need) { try { self.guardVkIframes(); } catch (e) {} }
      });
      mo.observe(box, { childList: true, subtree: true });
    } catch (e) {}
  },

  setActiveVideo: function(postId, iframe, title) {
    if (this.activeVideo && this.activeVideo.postId !== postId) {
      try { this.pauseVideo(this.activeVideo); } catch (e) {}
      try {
        var oldEl = document.querySelector('[data-post-id="' + this.activeVideo.postId + '"]');
        if (oldEl) this.unobservePost(oldEl);
      } catch (e) {}
    }
    var src = '';
    try { src = iframe ? iframe.src : ''; } catch (e) {}
    this.activeVideo = { postId: postId, iframe: iframe || null, title: title || 'Video', url: src, startTime: 0, isMini: false, paused: false };
    try {
      var postEl = iframe && iframe.closest ? iframe.closest('[data-post-id]') : null;
      if (postEl) this.observePost(postEl);
    } catch (e) {}
    this.updateMiniPlayerUI();
    try { this.refreshCatchers(); } catch (e) {}
  },

  _vkPlayer: function(iframe) {
    try {
      if (!iframe) return null;
      if (iframe._vkPlayer) return iframe._vkPlayer;
      if (typeof VK !== 'undefined' && VK.VideoPlayer) {
        var pl = VK.VideoPlayer(iframe);
        iframe._vkPlayer = pl;
        return pl;
      }
    } catch (e) {}
    return null;
  },

  pauseVideo: function(st) {
    if (!st || !st.iframe) return;
    var handled = false;
    try {
      var pl = this._vkPlayer(st.iframe);
      if (pl && pl.pause) { pl.pause(); handled = true; }
    } catch (e) {}
    if (!handled) try { st.iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'); } catch (e) {}
    try {
      var v = st.iframe.parentElement ? st.iframe.parentElement.querySelector('video') : null;
      if (v && !v.paused) v.pause();
    } catch (e) {}
    st.paused = true;
    this.updateMiniPlayerUI();
    try { this.refreshCatchers(); } catch (e) {}
  },

  resumeVideo: function(st) {
    st = st || this.activeVideo;
    if (!st || !st.iframe) return;
    var handled = false;
    try {
      var pl = this._vkPlayer(st.iframe);
      if (pl && pl.play) { pl.play(); handled = true; }
    } catch (e) {}
    if (!handled) try { st.iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*'); } catch (e) {}
    try {
      var v = st.iframe.parentElement ? st.iframe.parentElement.querySelector('video') : null;
      if (v && v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function() {}); }
    } catch (e) {}
    st.paused = false;
    this.updateMiniPlayerUI();
    try { this.refreshCatchers(); } catch (e) {}
  },

  togglePlayPause: function() {
    if (!this.activeVideo) return;
    if (this.activeVideo.paused) this.resumeVideo(this.activeVideo);
    else this.pauseVideo(this.activeVideo);
  },

  getCurrentTime: function(st, cb) {
    cb = cb || function() {};
    if (!st || !st.iframe) { cb(0); return; }
    cb(0);
  },

  updateMiniPlayerUI: function() {
    var mp = this.miniPlayerEl;
    if (!mp) return;
    if (!this.activeVideo || !this.activeVideo.isMini) { this.hideMiniPlayer(); return; }
    var t = mp.querySelector('.mp-title');
    if (t) t.textContent = this.activeVideo.title || 'Video';
    var tg = mp.querySelector('.mp-toggle');
    if (tg) tg.innerHTML = this.activeVideo.paused ? '&#9654;' : '&#10074;&#10074;';
    this.showMiniPlayer();
  },

  showMiniPlayer: function() {
    var mp = this.miniPlayerEl;
    if (!mp) return;
    mp.style.display = 'block';
  },

  hideMiniPlayer: function() {
    var mp = this.miniPlayerEl;
    if (!mp) return;
    mp.style.display = 'none';
    var f = mp.querySelector('.mp-iframe');
    if (f) { try { f.src = 'about:blank'; } catch (e) {} }
  },

  collapseToMini: function(postEl) {
    if (!this.activeVideo) return;
    var pid = postEl && postEl.getAttribute ? postEl.getAttribute('data-post-id') : null;
    if (pid && this.activeVideo.postId !== pid) return;
    if (this.activeVideo.isMini) return;
    var self = this;
    this.getCurrentTime(this.activeVideo, function(time) {
      self.activeVideo.startTime = time || 0;
      self.activeVideo.isMini = true;
      self.pauseVideo(self.activeVideo);
      self.updateMiniPlayerUI();
    });
  },

  expandFromMini: function(silent) {
    if (!this.activeVideo || !this.activeVideo.isMini) return;
    var postEl = null;
    try { postEl = document.querySelector('[data-post-id="' + this.activeVideo.postId + '"]'); } catch (e) {}
    this.activeVideo.isMini = false;
    this.hideMiniPlayer();
    if (!postEl) return;
    try { postEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    if (!silent) this.resumeVideo(this.activeVideo);
  },

  closeMiniPlayer: function() {
    if (this.activeVideo) { try { this.pauseVideo(this.activeVideo); } catch (e) {} }
    this.activeVideo = null;
    this.hideMiniPlayer();
    try { this.refreshCatchers(); } catch (e) {}
  },

  setupVisibilityHandling: function() {},

  bindGlobalEvents: function() {
    var self = this;
    // VK video_ext JS API (js_api=1) play state events -> drive single active player
    window.addEventListener('message', function(ev) {
      var d = null;
      try { d = (typeof ev.data === 'string') ? JSON.parse(ev.data) : ev.data; } catch (e) { return; }
      if (!d || typeof d !== 'object') return;
      var origin = String(ev.origin || '');
      if (origin.indexOf('vk.com') === -1 && origin.indexOf('vkvideo.ru') === -1 && origin.indexOf('vk-cdn') === -1 && origin.indexOf('userapi.com') === -1) return;
      var type = String(d.type || d.event || '').toLowerCase();
      if (!type) return;
      var frames = [];
      try { frames = Array.prototype.slice.call(document.querySelectorAll('#postsContainer iframe[src*="video_ext"]')); } catch (e) {}
      var srcEl = null;
      for (var i = 0; i < frames.length; i++) {
        try { if (frames[i].contentWindow === ev.source) { srcEl = frames[i]; break; } } catch (e) {}
      }
      if (!srcEl) return;
      var postEl = srcEl.closest ? srcEl.closest('[data-post-id]') : null;
      var pid = postEl ? postEl.getAttribute('data-post-id') : null;
      if (!pid) return;
      var title = 'Video';
      try {
        var t = postEl.querySelector('.post-title-text');
        if (t && t.textContent) title = t.textContent.trim();
      } catch (e) {}
      if (type === 'started' || type === 'play' || type === 'playing' || type === 'resumed' || type === 'unpaused') {
        self.setActiveVideo(pid, srcEl, title);
        if (self.activeVideo) { self.activeVideo.paused = false; self.updateMiniPlayerUI(); }
        try { if (typeof TANHO_MEDIA !== 'undefined') TANHO_MEDIA.onVkStarted(pid, srcEl, title); } catch (e) {}
        try { self.refreshCatchers(); } catch (e) {}
      } else if (type === 'paused' || type === 'pause' || type === 'ended' || type === 'end') {
        if (self.activeVideo && self.activeVideo.postId === pid) { self.activeVideo.paused = true; self.updateMiniPlayerUI(); }
        try { if (typeof TANHO_MEDIA !== 'undefined' && TANHO_MEDIA.active && TANHO_MEDIA.active.type === 'vk' && TANHO_MEDIA.active.postId === pid) TANHO_MEDIA.active = null; } catch (e) {}
        try { self.refreshCatchers(); } catch (e) {}
      }
    });
    document.addEventListener('visibilitychange', function() {
      if (document.hidden && self.activeVideo) { try { self.pauseVideo(self.activeVideo); } catch (e) {} }
    });
    window.addEventListener('pagehide', function() {
      if (self.activeVideo) { try { self.pauseVideo(self.activeVideo); } catch (e) {} }
    });
    window.addEventListener('hashchange', function() {
      if (self.activeVideo && !self.activeVideo.isMini) {
        var postEl = null;
        try { postEl = document.querySelector('[data-post-id="' + self.activeVideo.postId + '"]'); } catch (e) {}
        var vis = false;
        try {
          if (postEl) {
            var r = postEl.getBoundingClientRect();
            vis = r.bottom > 0 && r.top < window.innerHeight;
          }
        } catch (e) {}
        if (!vis) self.collapseToMini(postEl || document.body);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', function() {
  try { if (typeof TANHO_VIDEO_PLAYER !== 'undefined') TANHO_VIDEO_PLAYER.init(); } catch (e) {}
});

window.TANHO_VIDEO_PLAYER = TANHO_VIDEO_PLAYER;
