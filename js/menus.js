/* TANHO — js/menus.js */

  function toggleBurgerMenu(e){
    if(e) e.stopPropagation();
    var dd = document.getElementById('burgerMenuDropdown');
    if(!dd) { openBurgerMenu(); return; }
    var wasActive = dd.classList.contains('active');
    document.querySelectorAll('.burger-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.post-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.profile-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.yt-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    document.querySelectorAll('.reel-menu-dropdown.active').forEach(function(d){ d.classList.remove('active'); });
    if(!wasActive) dd.classList.add('active');
  }
  function openBurgerMenu(){
    if (typeof openBurgerDrawer === 'function' && document.getElementById('burgerDrawer')) { openBurgerDrawer(); return; }
    openInfoModal('Меню',
      '<div class="burger-menu-list">'
      + '<button onclick="handleBurgerMenu(\'privacy\')">📄 Политика конфиденциальности</button>'
      + '<button onclick="handleBurgerMenu(\'copyright\')">©️ Правообладателям</button>'
      + '<button onclick="handleBurgerMenu(\'share\')">📤 Поделиться приложением</button>'
      + '<button onclick="handleBurgerMenu(\'rate\')">⭐ Оценить приложение</button>'
      + '<button onclick="handleBurgerMenu(\'support\')">💬 Поддержка</button>'
      + '</div><div class="burger-menu-version">Версия ' + APP_VERSION + '</div>');
  }
  function handleBurgerMenu(action){
    var dd = document.getElementById('burgerMenuDropdown');
    if(dd) dd.classList.remove('active');
    try { if(typeof event !== 'undefined' && event) event.stopPropagation(); } catch(e){}
    if(action === 'privacy'){
      openInfoModal('Политика конфиденциальности',
        'TANHO уважает вашу приватность.\n\n• Мы храним данные только на вашем устройстве (localStorage): профиль, подписки и настройки.\n• Мы не передаём ваши данные третьим лицам.\n• Вы можете удалить свои данные в любой момент, очистив данные приложения.');
    } else if(action === 'copyright'){
      openInfoModal('Правообладателям',
        'Если вы считаете, что контент в TANHO нарушает ваши авторские права, напишите нам.\n\n• Укажите ссылку на материал и подтверждение прав.\n• Мы рассмотрим обращение и при необходимости удалим материал.\n• Контакт: через раздел «Поддержка» в этом меню.');
    } else if(action === 'share'){
      var text = 'TANHO — Video & Social Platform';
      if(navigator.share){ navigator.share({ title: text, text: text, url: location.href }).catch(function(){}); }
      else if(navigator.clipboard){ navigator.clipboard.writeText(location.href); alert('Ссылка скопирована ✓'); }
      else { alert('TANHO — Video & Social Platform'); }
    } else if(action === 'rate'){
      openInfoModal('Оценить приложение', '<div class="rate-stars" id="rateStarsBox"></div><div id="rateNote" style="text-align:center; font-size:12px; color:var(--text-muted);"></div>');
      renderRateStars();
    } else if(action === 'support'){
      openInfoModal('Поддержка',
        'Нужна помощь? Мы рядом.\n\n• Опишите проблему максимально подробно.\n• Быстрее всего отвечаем в общем чате приложения.',
        '<button class="auth-submit" onclick="closeInfoModal(); openGeneralChat();">Открыть общий чат</button>');
    }
  }
