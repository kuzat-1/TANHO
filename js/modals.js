/* TANHO — js/modals.js */

  function openInfoModal(title, html, actionHtml){
    document.getElementById('infoModalTitle').textContent = title;
    document.getElementById('infoModalBody').innerHTML = html;
    document.getElementById('infoModalAction').innerHTML = actionHtml || '';
    document.getElementById('info-modal').classList.add('active');
  }
  function closeInfoModal(){
    document.getElementById('info-modal').classList.remove('active');
  }
  function renderRateStars(){
    var box = document.getElementById('rateStarsBox');
    if(!box) return;
    var cur = 0;
    try { cur = parseInt(localStorage.getItem('tanho_rating') || '0'); } catch(e){}
    var html = '';
    for(var i = 1; i <= 5; i++){
      html += '<button class="' + (i <= cur ? 'lit' : '') + '" onclick="setAppRating(' + i + ')">★</button>';
    }
    box.innerHTML = html;
    var note = document.getElementById('rateNote');
    if(note) note.textContent = cur > 0 ? 'Ваша оценка: ' + cur + ' из 5. Спасибо! ✨' : 'Нажмите на звёзды, чтобы оценить.';
  }
  function setAppRating(n){
    try { localStorage.setItem('tanho_rating', String(n)); } catch(e){}
    renderRateStars();
    if(navigator.vibrate) navigator.vibrate(20);
  }
  function closeModals() {
    document.getElementById('location-modal').classList.remove('active');
    document.getElementById('video-modal').classList.remove('active');
    var _am = document.getElementById('auth-modal');
    if(_am) _am.classList.remove('active');
    var _im = document.getElementById('info-modal');
    if(_im) _im.classList.remove('active');
    document.querySelectorAll('.burger-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
  }
