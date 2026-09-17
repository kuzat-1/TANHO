/* TANHO — js/editor.js */


  let selectedTextPosition = 'bottom';
  function openEditor() { 
    document.getElementById('editorModal').classList.add('open'); 
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30);
    // фокус на заголовок с задержкой чтобы клавиатура успела открыться
    setTimeout(()=> document.getElementById('article-title')?.focus(), 350);
  }
  function closeEditor() { 
    document.getElementById('editorModal').classList.remove('open'); 
    document.getElementById('editorModal').classList.remove('keyboard-open');
    setTimeout(()=>{ if(typeof updateFloatingNavVisibility==='function') updateFloatingNavVisibility(); }, 30); 
  }

  function toggleTextPosition() {
    const iconSpan = document.getElementById('headerTogglePosIcon');
    const editorBody = document.getElementById('editorBody');
    const textInputsBox = document.getElementById('textInputsBox');
    const attachmentsPreview = document.getElementById('attachmentsPreview');

    if (selectedTextPosition === 'bottom') {
      selectedTextPosition = 'top';
      iconSpan.innerHTML = `<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>`;
      editorBody.insertBefore(textInputsBox, attachmentsPreview);
    } else {
      selectedTextPosition = 'bottom';
      iconSpan.innerHTML = `<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>`;
      editorBody.insertBefore(attachmentsPreview, textInputsBox);
    }
  }
  const stickerPopover = document.getElementById('sticker-popover');
  const stickersRow = document.getElementById('stickers-row');
  let attachedStickers = [];

  const galleryContainer = document.getElementById('gallery-container');
  const photoGrid = document.getElementById('photo-grid');
  let attachedPhotos = [];

  function renderGallery() {
    if (!attachedPhotos.length) { galleryContainer.classList.remove('active'); return; }
    galleryContainer.classList.add('active');
    document.getElementById('photo-count').innerText = attachedPhotos.length;
    photoGrid.setAttribute('data-count', Math.min(attachedPhotos.length, 2));
    photoGrid.innerHTML = '';
    attachedPhotos.slice(0, 2).forEach((photo) => {
      const item = document.createElement('div');
      item.className = 'photo-item';
      item.innerHTML = `<img src="${photo.url}"><button class="remove-badge-btn" onclick="removePhoto(${photo.id})">×</button>`;
      photoGrid.appendChild(item);
    });
  }

  function removePhoto(id) { attachedPhotos = attachedPhotos.filter(p => p.id !== id); renderGallery(); }
  let attachedAudioData = null;
  function clearAudio() { document.getElementById('music-container').innerHTML = ''; attachedAudioData = null; }

  let attachedVideoData = null;

  function attachVideoFromInput() {
    const url = document.getElementById('video-url-input').value.trim();
    const customName = document.getElementById('video-name-input').value.trim() || 'Видеоролик';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      document.getElementById('youtube-error').style.display = 'block';
      return;
    }

    const targetUrl = url || 'https://vk.com/video_ext.php?oid=-237335724&id=456239089&js_api=1';
    attachedVideoData = { url: targetUrl, title: customName };

    let playerHtml = targetUrl.endsWith('.mp4') 
      ? `<video controls src="${targetUrl}"></video>` 
      : `<iframe src="${targetUrl}"></iframe>`;

    document.getElementById('video-container').innerHTML = `
      <div style="padding:0; position:relative;">
        <div style="width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000;">${playerHtml}</div>
        <button class="remove-badge-btn" onclick="clearVideo()">×</button>
      </div>
    `;
    closeModals();
  }
  function clearVideo() { document.getElementById('video-container').innerHTML = ''; attachedVideoData = null; }

  let selectedLocation = null;
  function attachCustomLocation() {
    const val = document.getElementById('custom-location-input').value.trim();
    if (val) {
      selectedLocation = '📍 ' + val;
      document.getElementById('location-container').innerHTML = `<div style="color:#38bdf8; font-size:12px;">${selectedLocation} <button class="remove-badge-btn" onclick="clearLocation()">×</button></div>`;
    }
    closeModals();
  }
  function clearLocation() { document.getElementById('location-container').innerHTML = ''; selectedLocation = null; }
  function startDragSticker(e, el){
    e.preventDefault();
    dragSticker = el;
    el.classList.remove('moving');
    const touch = e.touches ? e.touches[0] : e;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
    el.style.zIndex = 10;
    const move = (ev)=>{
      if(!dragSticker) return;
      const t = ev.touches ? ev.touches[0] : ev;
      const pr = dragSticker.parentElement.getBoundingClientRect();
      let x = t.clientX - pr.left - dragOffsetX;
      let y = t.clientY - pr.top - dragOffsetY;
      x = Math.max(0, Math.min(x, pr.width - dragSticker.offsetWidth));
      y = Math.max(0, Math.min(y, pr.height - dragSticker.offsetHeight));
      dragSticker.style.left = x + 'px';
      dragSticker.style.top = y + 'px';
    };
    const up = ()=>{
      if(dragSticker){ dragSticker.style.zIndex=''; dragSticker.classList.add('moving'); }
      dragSticker = null;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, {passive:false});
    document.addEventListener('touchend', up);
  }
