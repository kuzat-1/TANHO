# TANHO

TANHO — мобильная видео-социальная платформа (Telegram + Instagram + YouTube в одном приложении).
Тёмная тема основная, фирменный фиолетово-синий градиент, mobile-first интерфейс 320–430px.

## Features

- Video feed (лента постов: лайки, комментарии, репосты, закладки)
- Reels (вертикальная лента + YouTube-стиль лента + полноэкранный просмотр видео)
- Social profile (премиальный профиль: статистика, категории, сетка публикаций)
- Posts (редактор: фото, стикеры, музыка, видео, гео)
- Videos (лайки, похожие видео, подписки на авторов)
- Categories (Все / Видео / Новости / Фото / Музыка с SVG-иконками)
- User profile (свой/чужой профиль, подписки, блокировки, жалоба)
- General chat (общий чат, ответы, реакции)
- Settings (аккаунт, уведомления, конфиденциальность, тема, язык, хранилище)
- Notifications (экран уведомлений на основе реальных данных)
- Saved (сохранённые посты из ленты)
- Burger drawer (мобильное меню справа: профиль, уведомления, сохранённое, настройки, тема, помощь, выход)
- Auth (гость, email, Google, Telegram; сессия в localStorage)
- Responsive mobile UI (320 / 360 / 375 / 390 / 412 / 430px, safe-area)
- Dark / Light theme (переключение без потери состояния)

## Project structure

```
/
├── index.html            # HTML-структура экранов + подключение css/js
├── README.md
├── .gitignore
│
├── css/
│   ├── variables.css     # CSS-переменные (:root)
│   ├── theme.css         # светлая тема (переопределения)
│   ├── base.css          # reset, экраны, общие кнопки
│   ├── header.css        # верхняя шапка + поиск
│   ├── cards.css         # карточки ленты
│   ├── videos.css        # Reels, YouTube-лента, просмотр видео
│   ├── profile.css       # премиальный профиль
│   ├── chat.css          # общий чат
│   ├── settings.css      # старая страница настроек/устройств
│   ├── editor.css        # редактор поста
│   ├── forms.css         # инпуты и формы
│   ├── modals.css        # модалки (auth, info, rate)
│   ├── menus.css         # выпадающие меню (посты, профиль, reels)
│   ├── drawer.css        # burger drawer
│   ├── screens.css       # полноэкранные overlay-экраны
│   ├── navigation.css    # bottom navigation + FAB
│   └── responsive.css    # медиа-запросы + защита от overflow
│
├── js/
│   ├── utils.js          # хелперы (escape, share, double-tap, тема persist)
│   ├── theme.js          # toggleTheme
│   ├── auth.js           # регистрация, вход, OAuth-заглушка, сессия
│   ├── navigation.js     # switchPage, switchNavTab, видимость меню
│   ├── posts.js          # лайки, комменты, закладки, подписки, публикация
│   ├── videos.js         # reels, viewer, yt-лента, persistence страниц
│   ├── chat.js           # общий чат
│   ├── profile.js        # пользователи, профиль, share, edit, empty-state
│   ├── editor.js         # вложения редактора (фото/аудио/видео/гео/стикеры)
│   ├── menus.js          # burger-меню (drawer) + legacy modal fallback
│   ├── modals.js         # info modal + оценка приложения
│   ├── screens.js        # openScreen/closeScreen/goBackScreen + рендеры экранов
│   └── app.js            # init, listeners, restore состояния
│
└── assets/
    ├── icons.svg         # единая SVG-система иконок (Lucide-style, stroke 2)
    └── images/           # локальные изображения (опционально)
```

Порядок подключения важен: `index.html` грузит CSS от токенов к компонентам,
JS — от утилит к `screens.js` и `app.js` (init последним). Все скрипты классические
(глобальный scope), имена функций сохранены — inline `onclick` работают как раньше.

Ключевые ID/классы-контракты (не переименовывать без обновления JS):
`pageMain`, `pageReels`, `pageProfile`, `generalChatScreen`, `settingsPage`,
`editorModal`, `auth-modal`, `info-modal`, `burgerDrawer`, `drawerOverlay`,
`screen-*`, `displayProfile*`, `profilePrimaryBtn`, `profileSecondaryBtn`,
`filter-tabs .chip`, `feed-grid .feed-card`, `bottom-nav`, `.nav-items`, `.nav-item`, `.nav-gap`, `floating-add-btn`.

## Development

Без сборки — открой в браузере:

```bash
# из корня проекта
python3 -m http.server 5102 --bind 0.0.0.0
# открыть http://localhost:5102/
```

Проверки после изменений:

```bash
for f in js/*.js; do node --check "$f" || echo "FAIL $f"; done
```

Чеклист: приложение открывается, профиль открывается, bottom nav + активный
Профиль работают, "+" открывает редактор, бургер открывает drawer (закрытие: X /
тап по фону / свайп вправо / Back / Esc), настройки и подэкраны открываются,
"Назад" возвращает, категории переключаются, тема переключается, нет
горизонтального скролла на 320–430px, нет JS-ошибок в консоли.

## Deployment

GitHub Pages раздаёт корень ветки `main`:

1. `git add index.html css js assets README.md .gitignore`
2. `git commit -m "..."`
3. `git push origin main`
4. Pages: Settings → Pages → Deploy from branch → `main` / root.

Все пути относительные (`css/…`, `js/…`, `assets/…`), абсолютных URL нет —
страница работает и локально, и на `https://<user>.github.io/TANHO/`.

APK (`*.apk`) в репозиторий не коммитятся (см. `.gitignore`) — распространяются
через GitHub Releases.
