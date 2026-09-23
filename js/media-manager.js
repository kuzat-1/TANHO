/* TANHO — js/media-manager.js — single active media (VK / video / audio) */
var TANHO_MEDIA = {
  active: null,

  activate: function(el, type, meta) {
    var prev = this.active;
    if (prev && prev.element === el) return;
    if (prev) this.stop(prev);
    this.active = { element: el, type: type || (el && el.tagName ? el.tagName.toLowerCase() : 'unknown'), postId: meta && meta.postId || null, title: meta && meta.title || '' };
  },

  stop: function(entry) {
    if (!entry || !entry.element) return;
    try {
      if (entry.type === 'vk') {
        if (typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.activeVideo && TANHO_VIDEO_PLAYER.activeVideo.postId === entry.postId) {
          TANHO_VIDEO_PLAYER.pauseVideo(TANHO_VIDEO_PLAYER.activeVideo);
        } else {
          try { entry.element.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'); } catch (e) {}
        }
        if (typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.activeVideo && TANHO_VIDEO_PLAYER.activeVideo.postId === entry.postId) {
          TANHO_VIDEO_PLAYER.activeVideo = null;
          TANHO_VIDEO_PLAYER.hideMiniPlayer();
        }
      } else if (entry.element instanceof HTMLMediaElement) {
        try { entry.element.pause(); } catch (e) {}
        if (entry.element.tagName.toLowerCase() === 'audio') {
          try {
            var card = entry.element.closest('.tg-audio-card');
            if (card) {
              var btn = card.querySelector('.tg-play-btn');
              if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
            }
          } catch (e) {}
        }
      } else {
        try { entry.element.pause(); } catch (e) {}
      }
    } catch (e) {}
  },

  pauseAllVk: function(exceptEl) {
    // VK iframes never notify us about taps inside them, so whenever any
    // other media starts we pause every VK player explicitly (belt & braces
    // next to the per-post tap catchers in video-player.js).
    try {
      if (typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.pauseAllVkExcept) {
        TANHO_VIDEO_PLAYER.pauseAllVkExcept(exceptEl || null);
        return;
      }
    } catch (e) {}
    try {
      var frames = document.querySelectorAll('#postsContainer iframe[src*="video_ext"]');
      Array.prototype.forEach.call(frames, function(fr) {
        if (fr === exceptEl) return;
        try { fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*'); } catch (e) {}
      });
    } catch (e) {}
  },

  stopAllExcept: function(el) {
    try { this.pauseAllVk(el); } catch (e) {}
    if (this.active && this.active.element !== el) {
      var prev = this.active;
      this.active = null;
      this.stop(prev);
    }
  },

  stopAll: function() {
    try { this.pauseAllVk(null); } catch (e) {}
    if (this.active) {
      var prev = this.active;
      this.active = null;
      this.stop(prev);
    }
    try {
      document.querySelectorAll('video, audio').forEach(function(m) { try { if (!m.paused) m.pause(); } catch (e) {} });
    } catch (e) {}
    try {
      if (typeof TANHO_VIDEO_PLAYER !== 'undefined' && TANHO_VIDEO_PLAYER.activeVideo) {
        TANHO_VIDEO_PLAYER.pauseVideo(TANHO_VIDEO_PLAYER.activeVideo);
      }
    } catch (e) {}
  },

  onHtmlMediaPlay: function(e) {
    var el = e.target;
    if (!(el instanceof HTMLMediaElement)) return;
    if (this.active && this.active.element === el) return;
    this.stopAllExcept(el);
    var postId = null;
    try { var c = el.closest('[data-post-id]'); if (c) postId = c.getAttribute('data-post-id'); } catch (err) {}
    var title = '';
    try {
      var card = el.closest('.post-card');
      var t = card ? card.querySelector('.post-title-text') : null;
      if (t) title = t.textContent.trim();
    } catch (err) {}
    this.active = { element: el, type: el.tagName.toLowerCase(), postId: postId, title: title };
  },

  onVkStarted: function(postId, iframe, title) {
    var el = iframe;
    if (this.active && this.active.element === el) return;
    this.stopAllExcept(el);
    this.active = { element: el, type: 'vk', postId: postId, title: title || 'Video' };
  },

  onPauseOrEnded: function(el) {
    if (this.active && this.active.element === el) this.active = null;
  }
};

(function() {
  try {
    document.addEventListener('play', function(e) {
      try { TANHO_MEDIA.onHtmlMediaPlay(e); } catch (err) {}
    }, true);
    document.addEventListener('pause', function(e) {
      try {
        if (TANHO_MEDIA.active && TANHO_MEDIA.active.element === e.target) TANHO_MEDIA.active = null;
      } catch (err) {}
    }, true);
    document.addEventListener('ended', function(e) {
      try {
        if (TANHO_MEDIA.active && TANHO_MEDIA.active.element === e.target) TANHO_MEDIA.active = null;
      } catch (err) {}
    }, true);
  } catch (e) {}

  try {
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { try { TANHO_MEDIA.stopAll(); } catch (e) {} }
    });
    window.addEventListener('pagehide', function() { try { TANHO_MEDIA.stopAll(); } catch (e) {} });
    window.addEventListener('hashchange', function() {
      try {
        if (TANHO_MEDIA.active && (TANHO_MEDIA.active.type === 'video' || TANHO_MEDIA.active.type === 'audio')) {
          var el = TANHO_MEDIA.active.element;
          var postEl = null;
          try { postEl = el.closest('[data-post-id]'); } catch (e) {}
          var visible = false;
          try {
            if (postEl) {
              var r = postEl.getBoundingClientRect();
              visible = r.bottom > 0 && r.top < window.innerHeight && postEl.offsetParent !== null;
            }
          } catch (e) {}
          if (!postEl || !visible) TANHO_MEDIA.stopAll();
        }
      } catch (e) {}
    });
  } catch (e) {}
})();

window.TANHO_MEDIA = TANHO_MEDIA;
