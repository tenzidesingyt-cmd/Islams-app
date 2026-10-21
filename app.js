/* ============================================================
   Исламский помощник — «Кот в Мечети»
   Vanilla JS, no build step, works offline from a single folder.
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  const STORAGE_KEY = "islamCat.v2";
  const MAX_APPS = 12;
  const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const PRAYER_ICONS = {
    fajr: "i-fajr",
    dhuhr: "i-dhuhr",
    asr: "i-asr",
    maghrib: "i-maghrib",
    isha: "i-isha",
  };
  const ZIKRS = [
    { latin: "SubhanAllah", ru: "Пречист Аллах", en: "Glory be to Allah" },
    { latin: "Alhamdulillah", ru: "Хвала Аллаху", en: "Praise be to Allah" },
    { latin: "Allahu Akbar", ru: "Аллах Велик", en: "Allah is the Greatest" },
  ];

  const CITIES = {
    bishkek: { ru: "Бишкек", en: "Bishkek", lat: 42.8746, lng: 74.5698, tz: "Asia/Bishkek", offset: 6 },
    osh: { ru: "Ош", en: "Osh", lat: 40.5283, lng: 72.7985, tz: "Asia/Bishkek", offset: 6 },
    karakol: { ru: "Каракол", en: "Karakol", lat: 42.4907, lng: 78.3936, tz: "Asia/Bishkek", offset: 6 },
    almaty: { ru: "Алматы", en: "Almaty", lat: 43.2389, lng: 76.8897, tz: "Asia/Almaty", offset: 5 },
    tashkent: { ru: "Ташкент", en: "Tashkent", lat: 41.2995, lng: 69.2401, tz: "Asia/Tashkent", offset: 5 },
    dushanbe: { ru: "Душанбе", en: "Dushanbe", lat: 38.5598, lng: 68.787, tz: "Asia/Dushanbe", offset: 5 },
    moscow: { ru: "Москва", en: "Moscow", lat: 55.7558, lng: 37.6173, tz: "Europe/Moscow", offset: 3 },
    kazan: { ru: "Казань", en: "Kazan", lat: 55.7963, lng: 49.1088, tz: "Europe/Moscow", offset: 3 },
    istanbul: { ru: "Стамбул", en: "Istanbul", lat: 41.0082, lng: 28.9784, tz: "Europe/Istanbul", offset: 3 },
    mecca: { ru: "Мекка", en: "Makkah", lat: 21.4225, lng: 39.8262, tz: "Asia/Riyadh", offset: 3 },
    dubai: { ru: "Дубай", en: "Dubai", lat: 25.2048, lng: 55.2708, tz: "Asia/Dubai", offset: 4 },
    london: { ru: "Лондон", en: "London", lat: 51.5074, lng: -0.1278, tz: "Europe/London", offset: 0 },
    paris: { ru: "Париж", en: "Paris", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris", offset: 1 },
    newyork: { ru: "Нью-Йорк", en: "New York", lat: 40.7128, lng: -74.006, tz: "America/New_York", offset: -5 },
  };

  const METHODS = {
    mwl: { ru: "Лига исламского мира", en: "Muslim World League", fajr: 18, isha: 17 },
    isna: { ru: "ISNA (С. Америка)", en: "ISNA (North America)", fajr: 15, isha: 15 },
    egypt: { ru: "Египетское управление", en: "Egyptian Authority", fajr: 19.5, isha: 17.5 },
    karachi: { ru: "Университет Карачи", en: "University of Karachi", fajr: 18, isha: 18 },
    umm: { ru: "Умм аль-Кура (Мекка)", en: "Umm al-Qura (Makkah)", fajr: 18.5, isha: 90 },
    turkey: { ru: "Диянет (Турция)", en: "Diyanet (Turkey)", fajr: 18, isha: 17 },
  };

  const WALLPAPERS = [
    { ru: "Классика", en: "Classic" },
    { ru: "Тепло", en: "Warm" },
    { ru: "Ночь", en: "Night" },
    { ru: "Мягкость", en: "Soft" },
    { ru: "Моно", en: "Mono" },
  ];
  const CUSTOM_WALL_LABEL = { ru: "Свои", en: "Mine" };

  const HALAL_LINKS = [
    { key: "halal.quran", url: "https://quran.com/", domain: "quran.com", icon: "i-book" },
    { key: "halal.hadith", url: "https://sunnah.com/", domain: "sunnah.com", icon: "i-book" },
    { key: "halal.dua", url: "https://duam.ru/", domain: "duam.ru", icon: "i-moon" },
    { key: "halal.qa", url: "https://islamqa.info/ru", domain: "islamqa.info", icon: "i-info" },
    { key: "halal.prayer", url: "https://www.muslimpro.com/ru/", domain: "muslimpro.com", icon: "i-clock" },
  ];

  const BLOCKED_DOMAINS = [
    "pornhub.com", "xvideos.com", "xnxx.com", "xhamster.com", "redtube.com",
    "youporn.com", "onlyfans.com", "brazzers.com", "hentaihaven.xxx", "rule34.xxx",
  ];
  const BLOCKED_PATTERN = /(^|[^a-z])(porn|xxx|adult|nude|naked|erotic|escort|hentai|camgirl|onlyfans)([^a-z]|$)/i;

  const WEEKDAYS = {
    ru: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  };

  const I18N = {
    ru: {
      "nav.home": "Главная",
      "nav.prayers": "Молитвы",
      "nav.zikr": "Счётчик",
      "nav.notes": "Заметки",
      "home.next": "Следующий намаз",
      "home.hint": "Свайп влево — расписание",
      "home.in": "через {d}",
      "home.tomorrow": "завтра",
      "prayers.eyebrow": "Сегодня",
      "prayers.title": "Расписание намазов",
      "prayers.badge": "далее",
      "prayers.tomorrowBadge": "завтра",
      "prayers.to": "До {name} {d}",
      "prayers.toTomorrow": "До {name} завтра",
      "prayers.calc": "{city} · {method}",
      "prayer.fajr": "Фаджр",
      "prayer.dhuhr": "Зухр",
      "prayer.asr": "Аср",
      "prayer.maghrib": "Магриб",
      "prayer.isha": "Иша",
      "prayer.fajr.gen": "Фаджра",
      "prayer.dhuhr.gen": "Зухра",
      "prayer.asr.gen": "Асра",
      "prayer.maghrib.gen": "Магриба",
      "prayer.isha.gen": "Иши",
      "zikr.eyebrow": "Зикр",
      "zikr.title": "Счётчик",
      "zikr.reset": "Сброс",
      "zikr.total": "Всего",
      "zikr.goal": "Цель",
      "zikr.tap": "Нажмите, чтобы считать",
      "zikr.current": "Сейчас: {name}",
      "zikr.allDone": "Все 99 зикров выполнены",
      "zikr.doneHint": "Да вознаградит вас Аллах",
      "zikr.stepDone": "{name}: 33/33",
      "zikr.resetToast": "Счётчик сброшен",
      "zikr.undo": "Вернуть",
      "zikr.already": "Счётчик заполнен — нажмите «Сброс»",
      "zikr.completeToast": "99 зикров. Да примет Аллах",
      "zikr.tapAria": "Добавить зикр {name}",
      "settings.eyebrow": "Приложение",
      "settings.title": "Настройки",
      "settings.section.location": "Город и расчёт",
      "settings.city": "Город",
      "settings.geo": "Определить местоположение",
      "settings.method": "Метод расчёта",
      "settings.madhab": "Мазхаб (Аср)",
      "settings.shafi": "Шафии",
      "settings.hanafi": "Ханафи",
      "settings.section.look": "Оформление",
      "settings.wallpaper": "Обои",
      "settings.wallUpload": "Загрузить свои обои",
      "settings.wallRemove": "Убрать",
      "settings.wallHint": "Своё фото хранится только на этом устройстве.",
      "settings.wallSaved": "Обои обновлены",
      "settings.wallRemoved": "Свои обои убраны",
      "settings.wallError": "Не удалось загрузить изображение",
      "settings.section.app": "Поведение",
      "settings.clock24": "24-часовой формат",
      "settings.sound": "Звук нажатий",
      "settings.haptics": "Вибрация",
      "settings.install": "Установить приложение",
      "settings.installHint": "На iPhone: «Поделиться» → «На экран „Домой“».",
      "settings.installIos": "На iPhone: «Поделиться» → «На экран „Домой“».",
      "settings.installAndroid": "Меню браузера → «Установить приложение».",
      "settings.installed": "Приложение установлено",
      "settings.installManual": "Откройте меню браузера и выберите «Установить приложение»",
      "settings.language": "Язык",
      "settings.resetAll": "Сбросить все данные",
      "settings.resetConfirm": "Нажмите ещё раз, чтобы сбросить",
      "settings.resetDone": "Все данные удалены",
      "settings.version": "Исламский помощник · версия 1.1",
      "settings.about": "Расписание рассчитывается астрономически на устройстве. Данные хранятся только в вашем браузере.",
      "settings.customCity": "Моё местоположение",
      "settings.geoOk": "Местоположение определено",
      "settings.geoFail": "Не удалось получить геопозицию",
      "notes.eyebrow": "Дневник",
      "notes.title": "Заметки",
      "notes.new": "Новая",
      "notes.titlePh": "Заголовок",
      "notes.bodyPh": "Текст заметки…",
      "notes.cancel": "Отмена",
      "notes.save": "Сохранить",
      "notes.empty": "Пока нет заметок",
      "notes.emptyHint": "Запишите дуа, мысль или цель — всё останется на этом устройстве.",
      "notes.saved": "Заметка сохранена",
      "notes.deleted": "Заметка удалена",
      "notes.delete": "Удалить",
      "notes.undo": "Вернуть",
      "notes.needText": "Введите заголовок или текст",
      "notes.count": "{n} {word}",
      "notes.one": "заметка",
      "notes.few": "заметки",
      "notes.many": "заметок",
      "notes.untitled": "Без названия",
      "launcher.halal": "Халяльный веб",
      "launcher.add": "Добавить",
      "launcher.install": "Установить",
      "halal.eyebrow": "Безопасный режим",
      "halal.title": "Халяльный браузер",
      "halal.badge": "SafeSearch и только проверенные сайты",
      "halal.placeholder": "Найти или ввести адрес…",
      "halal.go": "Найти",
      "halal.hint": "Поиск открывается в новой вкладке с включённым безопасным поиском.",
      "halal.note": "Это безопасный портал, а не полноценный браузер. Веб-приложение не может фильтровать 18+ в других браузерах и приложениях Android — для этого нужен отдельный нативный браузер.",
      "halal.blocked": "Этот запрос или сайт заблокирован в безопасном режиме.",
      "halal.quran": "Коран",
      "halal.hadith": "Хадисы",
      "halal.dua": "Дуа",
      "halal.qa": "Вопросы и ответы",
      "halal.prayer": "Время намаза",
      "add.eyebrow": "Рабочий стол",
      "add.title": "Добавить приложение",
      "add.name": "Название",
      "add.namePh": "Коран",
      "add.link": "Ссылка или intent",
      "add.linkPh": "https://quran.com/ru",
      "add.icon": "Иконка",
      "add.submit": "Добавить на рабочий стол",
      "add.hint": "Список установленных приложений Android недоступен веб-сайту. Добавьте ссылку вручную — приложение откроется по нажатию. Для Android-приложений подойдёт intent-ссылка.",
      "add.mine": "Мои приложения",
      "add.empty": "Пока пусто. Добавьте первое приложение.",
      "add.saved": "Приложение добавлено",
      "add.deleted": "Приложение удалено",
      "add.undo": "Вернуть",
      "add.invalid": "Проверьте название и ссылку",
      "add.limit": "Можно добавить не больше 12 приложений",
      "install.eyebrow": "Android · iOS · ПК",
      "install.title": "Установить приложение",
      "install.appName": "Кот в Мечети",
      "install.lead": "Намазы, зикр и заметки — отдельным приложением на телефоне.",
      "install.android": "Android (Chrome)",
      "install.androidSteps": "Меню ⋮ → «Установить приложение» или «Добавить на главный экран».",
      "install.ios": "iPhone (Safari)",
      "install.iosSteps": "«Поделиться» → «На экран „Домой“» → «Добавить».",
      "install.desktop": "Компьютер (Chrome)",
      "install.desktopSteps": "Значок установки в адресной строке или меню браузера.",
      "install.now": "Установить сейчас",
      "install.note": "Кнопка работает, если браузер поддерживает установку PWA. Если нет — используйте шаги выше.",
      "install.done": "Приложение установлено",
      "install.already": "Приложение уже установлено",
      "install.manualShort": "Откройте меню браузера и выберите «Установить приложение»",
      "common.close": "Закрыть",
      "common.lessMinute": "меньше минуты",
      "common.hour": "ч",
      "common.min": "мин",
      "app.deskHint": "свайп или стрелки",
    },
    en: {
      "nav.home": "Home",
      "nav.prayers": "Prayers",
      "nav.zikr": "Counter",
      "nav.notes": "Notes",
      "home.next": "Next prayer",
      "home.hint": "Swipe left for the schedule",
      "home.in": "in {d}",
      "home.tomorrow": "tomorrow",
      "prayers.eyebrow": "Today",
      "prayers.title": "Prayer schedule",
      "prayers.badge": "next",
      "prayers.tomorrowBadge": "tomorrow",
      "prayers.to": "{name} in {d}",
      "prayers.toTomorrow": "{name} tomorrow",
      "prayers.calc": "{city} · {method}",
      "prayer.fajr": "Fajr",
      "prayer.dhuhr": "Dhuhr",
      "prayer.asr": "Asr",
      "prayer.maghrib": "Maghrib",
      "prayer.isha": "Isha",
      "prayer.fajr.gen": "Fajr",
      "prayer.dhuhr.gen": "Dhuhr",
      "prayer.asr.gen": "Asr",
      "prayer.maghrib.gen": "Maghrib",
      "prayer.isha.gen": "Isha",
      "zikr.eyebrow": "Dhikr",
      "zikr.title": "Counter",
      "zikr.reset": "Reset",
      "zikr.total": "Total",
      "zikr.goal": "Goal",
      "zikr.tap": "Tap to count",
      "zikr.current": "Now: {name}",
      "zikr.allDone": "All 99 dhikr completed",
      "zikr.doneHint": "May Allah reward you",
      "zikr.stepDone": "{name}: 33/33",
      "zikr.resetToast": "Counter reset",
      "zikr.undo": "Undo",
      "zikr.already": "The counter is full — tap Reset",
      "zikr.completeToast": "99 dhikr. May Allah accept",
      "zikr.tapAria": "Add dhikr {name}",
      "settings.eyebrow": "App",
      "settings.title": "Settings",
      "settings.section.location": "Location & calculation",
      "settings.city": "City",
      "settings.geo": "Use my location",
      "settings.method": "Calculation method",
      "settings.madhab": "Madhab (Asr)",
      "settings.shafi": "Shafi'i",
      "settings.hanafi": "Hanafi",
      "settings.section.look": "Appearance",
      "settings.wallpaper": "Wallpaper",
      "settings.wallUpload": "Upload wallpaper",
      "settings.wallRemove": "Remove",
      "settings.wallHint": "Your photo stays on this device only.",
      "settings.wallSaved": "Wallpaper updated",
      "settings.wallRemoved": "Custom wallpaper removed",
      "settings.wallError": "Could not load the image",
      "settings.section.app": "Behavior",
      "settings.clock24": "24-hour clock",
      "settings.sound": "Tap sounds",
      "settings.haptics": "Vibration",
      "settings.install": "Install app",
      "settings.installHint": "On iPhone: Share → Add to Home Screen.",
      "settings.installIos": "On iPhone: Share → Add to Home Screen.",
      "settings.installAndroid": "Browser menu → Install app.",
      "settings.installed": "App installed",
      "settings.installManual": "Open the browser menu and choose “Install app”",
      "settings.language": "Language",
      "settings.resetAll": "Reset all data",
      "settings.resetConfirm": "Tap again to reset everything",
      "settings.resetDone": "All data removed",
      "settings.version": "Islamic helper · version 1.1",
      "settings.about": "Prayer times are calculated astronomically on your device. Data stays in your browser.",
      "settings.customCity": "My location",
      "settings.geoOk": "Location detected",
      "settings.geoFail": "Could not get your location",
      "notes.eyebrow": "Journal",
      "notes.title": "Notes",
      "notes.new": "New",
      "notes.titlePh": "Title",
      "notes.bodyPh": "Write a note…",
      "notes.cancel": "Cancel",
      "notes.save": "Save",
      "notes.empty": "No notes yet",
      "notes.emptyHint": "Save a dua, a thought or a goal — it stays on this device.",
      "notes.saved": "Note saved",
      "notes.deleted": "Note deleted",
      "notes.delete": "Delete",
      "notes.undo": "Undo",
      "notes.needText": "Enter a title or some text",
      "notes.count": "{n} {word}",
      "notes.one": "note",
      "notes.few": "notes",
      "notes.many": "notes",
      "notes.untitled": "Untitled",
      "launcher.halal": "Halal web",
      "launcher.add": "Add",
      "launcher.install": "Install",
      "halal.eyebrow": "Safe mode",
      "halal.title": "Halal browser",
      "halal.badge": "SafeSearch and trusted sites only",
      "halal.placeholder": "Search or enter an address…",
      "halal.go": "Go",
      "halal.hint": "Search opens in a new tab with safe search enabled.",
      "halal.note": "This is a safe portal, not a full browser. A web app cannot filter 18+ content in other browsers and Android apps — that needs a separate native browser.",
      "halal.blocked": "This request or site is blocked in safe mode.",
      "halal.quran": "Quran",
      "halal.hadith": "Hadith",
      "halal.dua": "Duas",
      "halal.qa": "Q&A",
      "halal.prayer": "Prayer times",
      "add.eyebrow": "Home screen",
      "add.title": "Add an app",
      "add.name": "Name",
      "add.namePh": "Quran",
      "add.link": "Link or intent",
      "add.linkPh": "https://quran.com/",
      "add.icon": "Icon",
      "add.submit": "Add to home screen",
      "add.hint": "A website cannot list installed Android apps. Add a link manually and it will open on tap. For Android apps an intent link works.",
      "add.mine": "My apps",
      "add.empty": "Nothing yet. Add your first app.",
      "add.saved": "App added",
      "add.deleted": "App deleted",
      "add.undo": "Undo",
      "add.invalid": "Check the name and link",
      "add.limit": "You can add up to 12 apps",
      "install.eyebrow": "Android · iOS · desktop",
      "install.title": "Install the app",
      "install.appName": "Cat in the Mosque",
      "install.lead": "Prayer times, dhikr and notes as a separate app on your phone.",
      "install.android": "Android (Chrome)",
      "install.androidSteps": "Menu ⋮ → “Install app” or “Add to Home screen”.",
      "install.ios": "iPhone (Safari)",
      "install.iosSteps": "Share → Add to Home Screen → Add.",
      "install.desktop": "Desktop (Chrome)",
      "install.desktopSteps": "Use the install icon in the address bar or the browser menu.",
      "install.now": "Install now",
      "install.note": "The button works if your browser supports PWA installation. Otherwise use the steps above.",
      "install.done": "App installed",
      "install.already": "The app is already installed",
      "install.manualShort": "Open the browser menu and choose “Install app”",
      "common.close": "Close",
      "common.lessMinute": "less than a minute",
      "common.hour": "h",
      "common.min": "min",
      "app.deskHint": "swipe or use arrows",
    },
  };

  /* ---------- State ---------- */

  function defaultState() {
    return {
      settings: {
        lang: "ru",
        city: "bishkek",
        method: "mwl",
        madhab: "shafi",
        wall: 0,
        clock24: true,
        sound: true,
        haptics: true,
      },
      customCity: null,
      customWall: null,
      zikr: { day: "", counts: [0, 0, 0], active: 0 },
      notes: [],
      apps: [],
      history: {},
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const data = JSON.parse(raw);
      const settings = Object.assign({}, base.settings, data.settings || {});
      const zikr = Object.assign({}, base.zikr, data.zikr || {});
      const result = {
        settings,
        customCity: data.customCity && typeof data.customCity.lat === "number" ? data.customCity : null,
        customWall: normalizeCustomWall(data.customWall),
        zikr: {
          day: typeof zikr.day === "string" ? zikr.day : "",
          counts: Array.isArray(zikr.counts) && zikr.counts.length === 3
            ? zikr.counts.map((n) => clamp(parseInt(n, 10) || 0, 0, 33))
            : [0, 0, 0],
          active: clamp(parseInt(zikr.active, 10) || 0, 0, 2),
        },
        notes: Array.isArray(data.notes) ? data.notes.filter((n) => n && typeof n.id === "string") : [],
        apps: normalizeApps(data.apps),
        history: data.history && typeof data.history === "object" ? data.history : {},
      };
      if (!CITIES[result.settings.city] && result.settings.city !== "custom") result.settings.city = "bishkek";
      if (result.settings.city === "custom" && !result.customCity) result.settings.city = "bishkek";
      if (!METHODS[result.settings.method]) result.settings.method = "mwl";
      if (!["shafi", "hanafi"].includes(result.settings.madhab)) result.settings.madhab = "shafi";
      if (!["ru", "en"].includes(result.settings.lang)) result.settings.lang = "ru";
      result.settings.wall = clamp(parseInt(result.settings.wall, 10) || 0, 0, 5);
      if (result.settings.wall === 5 && !result.customWall) result.settings.wall = 0;
      return result;
    } catch (e) {
      return base;
    }
  }

  function isAppUrl(value) {
    return /^https?:\/\/\S+$/i.test(value) || /^intent:\/\/\S+$/i.test(value);
  }

  function normalizeCustomWall(value) {
    if (!value || typeof value.sharp !== "string" || typeof value.blur !== "string") return null;
    if (!value.sharp.startsWith("data:image/") || !value.blur.startsWith("data:image/")) return null;
    return { sharp: value.sharp, blur: value.blur };
  }

  function normalizeApps(apps) {    if (!Array.isArray(apps)) return [];
    return apps
      .filter((app) => app && typeof app.id === "string" && typeof app.name === "string" && typeof app.url === "string" && isAppUrl(app.url))
      .slice(0, MAX_APPS)
      .map((app) => {
        let icon = { type: "emoji", value: "🕌" };
        if (app.icon && app.icon.type === "image" && typeof app.icon.value === "string" && app.icon.value.startsWith("data:image/")) {
          icon = { type: "image", value: app.icon.value };
        } else if (app.icon && app.icon.type === "emoji" && app.icon.value) {
          icon = { type: "emoji", value: String(app.icon.value).slice(0, 4) };
        }
        return {
          id: app.id,
          name: app.name.slice(0, 24),
          url: app.url.slice(0, 500),
          icon,
        };
      });
  }

  let state = defaultState();
  let deferredPrompt = null;
  let activeSheet = null;
  let editingId = null;
  let pendingIcon = { type: "emoji", value: "🕌" };
  let current = 0;
  let lastMinuteKey = "";
  let lastCountdownAt = 0;
  let audioCtx = null;
  let toastTimer = null;
  let suppressClickUntil = 0;
  let resetArmed = false;
  let resetTimer = null;
  let drag = null;
  let wheelLock = 0;
  const dayMemo = new Map();
  const offsetCache = new Map();
  const ui = {};

  const t = (key, vars) => {
    const dict = I18N[state.settings.lang] || I18N.ru;
    let str = dict[key] || I18N.ru[key] || key;
    if (vars) {
      Object.keys(vars).forEach((name) => {
        str = str.split("{" + name + "}").join(String(vars[name]));
      });
    }
    return str;
  };
  const lang = () => state.settings.lang;

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* storage can be unavailable in private mode / file://. App still works. */
    }
  }

  /* ---------- Astronomy ---------- */

  function julianDay(y, m, d) {
    if (m <= 2) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  }

  const fixAngle = (a) => ((a % 360) + 360) % 360;
  const fixHour = (a) => ((a % 24) + 24) % 24;
  const sin = (deg) => Math.sin(deg * D2R);
  const cos = (deg) => Math.cos(deg * D2R);
  const tan = (deg) => Math.tan(deg * D2R);

  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const ra = fixHour(Math.atan2(cos(e) * sin(L), cos(L)) / D2R / 15);
    const decl = Math.asin(sin(e) * sin(L)) * R2D;
    let eqt = q / 15 - ra;
    if (eqt > 12) eqt -= 24;
    if (eqt < -12) eqt += 24;
    return { decl, eqt };
  }

  function zoneOffset(tz, date) {
    if (!tz) return null;
    const key = tz + "|" + date.toISOString().slice(0, 10);
    if (offsetCache.has(key)) return offsetCache.get(key);
    let off = null;
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "longOffset",
      }).formatToParts(date);
      const name = (parts.find((p) => p.type === "timeZoneName") || {}).value || "";
      const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
      if (m) off = (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3] || 0) / 60);
      else if (/^GMT$/.test(name)) off = 0;
    } catch (e) {
      off = null;
    }
    offsetCache.set(key, off);
    return off;
  }

  function getCity() {
    const id = state.settings.city;
    if (id === "custom" && state.customCity) {
      return {
        id: "custom",
        name: t("settings.customCity"),
        lat: state.customCity.lat,
        lng: state.customCity.lng,
        tz: state.customCity.tz,
        offset: state.customCity.offset,
      };
    }
    const c = CITIES[id] || CITIES.bishkek;
    return { id: CITIES[id] ? id : "bishkek", name: c[lang()], lat: c.lat, lng: c.lng, tz: c.tz, offset: c.offset };
  }

  function nowInCity() {
    const city = getCity();
    const now = new Date();
    const off = zoneOffset(city.tz, now);
    if (off == null) return new Date(now);
    const deviceOffset = -now.getTimezoneOffset() / 60;
    return new Date(now.getTime() + (off - deviceOffset) * 3600000);
  }

  function ymd(date) {
    return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
  }
  function dayKey(date) {
    const p = ymd(date);
    return p.y + "-" + pad(p.m) + "-" + pad(p.d);
  }
  function addDays(date, days) {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function hourAngleHours(altitude, lat, decl) {
    const numerator = sin(altitude) - sin(lat) * sin(decl);
    const denom = cos(lat) * cos(decl);
    const c = numerator / denom;
    if (!isFinite(c) || c > 1 || c < -1) return null;
    return Math.acos(c) * R2D / 15;
  }

  function computeDayTimes(y, m, d, city, methodId, madhab) {
    const method = METHODS[methodId] || METHODS.mwl;
    const tz = zoneOffset(city.tz, new Date(Date.UTC(y, m - 1, d, 12))) ?? city.offset ?? 0;
    const jd = julianDay(y, m, d) - city.lng / 360;
    const sun = sunPosition(jd);
    const decl = sun.decl;
    const dhuhr = 12 + tz - city.lng / 15 - sun.eqt;

    let sunrise = dhuhr - (hourAngleHours(-0.833, city.lat, decl) ?? 6);
    let maghrib = dhuhr + (hourAngleHours(-0.833, city.lat, decl) ?? 6);
    let fajrOff = hourAngleHours(-method.fajr, city.lat, decl);
    let ishaOff = method.isha > 0 && method.isha < 30
      ? hourAngleHours(-method.isha, city.lat, decl)
      : null;

    const night = 24 - (maghrib - sunrise);
    if (fajrOff == null) fajrOff = Math.max(1, night / 7);
    if (ishaOff == null) ishaOff = Math.max(1, night / 7);

    let fajr = dhuhr - fajrOff;
    let isha = method.isha > 30 ? maghrib + method.isha / 60 : dhuhr + ishaOff;

    const shadow = madhab === "hanafi" ? 2 : 1;
    const asrAlt = Math.atan(1 / (shadow + tan(Math.abs(city.lat - decl)))) * R2D;
    const asrOff = hourAngleHours(asrAlt, city.lat, decl);
    let asr = asrOff == null ? dhuhr + (maghrib - dhuhr) * 0.55 : dhuhr + asrOff;
    if (!(asr > dhuhr)) asr = dhuhr + 1.5;
    if (asr > maghrib) asr = maghrib - 0.25;

    return {
      fajr: fajr * 60,
      sunrise: sunrise * 60,
      dhuhr: dhuhr * 60,
      asr: asr * 60,
      maghrib: maghrib * 60,
      isha: isha * 60,
    };
  }

  function dayTimes(date) {
    const city = getCity();
    const p = ymd(date);
    const key = [p.y, p.m, p.d, city.id, city.lat.toFixed(3), city.lng.toFixed(3), state.settings.method, state.settings.madhab].join("|");
    if (dayMemo.has(key)) return dayMemo.get(key);
    const times = computeDayTimes(p.y, p.m, p.d, city, state.settings.method, state.settings.madhab);
    dayMemo.set(key, times);
    return times;
  }

  function getNextInfo(now) {
    const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const city = getCity();
    const today = dayTimes(now);
    const tomorrow = dayTimes(addDays(now, 1));
    const yesterday = dayTimes(addDays(now, -1));

    let idx = -1;
    for (let i = 0; i < PRAYER_KEYS.length; i += 1) {
      if (today[PRAYER_KEYS[i]] > nowMin + 0.0001) {
        idx = i;
        break;
      }
    }

    let key;
    let nextRaw;
    let tomorrowFlag = false;
    if (idx === -1) {
      key = "fajr";
      nextRaw = 1440 + tomorrow.fajr;
      tomorrowFlag = true;
    } else {
      key = PRAYER_KEYS[idx];
      nextRaw = today[key];
    }

    let start;
    let end = nextRaw;
    if (tomorrowFlag) {
      start = today.isha;
      end = 1440 + tomorrow.fajr;
    } else if (idx === 0) {
      start = yesterday.isha - 1440;
    } else {
      start = today[PRAYER_KEYS[idx - 1]];
    }
    if (!(end > start)) end = start + 1;
    const progress = clamp((nowMin - start) / (end - start), 0, 1);

    return {
      key,
      tomorrow: tomorrowFlag,
      nextRaw,
      countdown: Math.max(0, nextRaw - nowMin),
      progress,
      today,
      tomorrowTimes: tomorrow,
      nowMin,
      city,
    };
  }

  /* ---------- Formatting ---------- */

  function formatTime(rawMinutes, force24) {
    const total = ((Math.round(rawMinutes) % 1440) + 1440) % 1440;
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (force24 || state.settings.clock24) return pad(h) + ":" + pad(m);
    const h12 = h % 12 || 12;
    const suffix = h >= 12 ? "PM" : "AM";
    return lang() === "en" ? h12 + ":" + pad(m) + " " + suffix : h12 + ":" + pad(m);
  }

  function formatDuration(mins) {
    const m = Math.max(0, Math.round(mins));
    if (m < 1) return t("common.lessMinute");
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (lang() === "en") {
      if (!h) return mm + " min";
      return mm ? h + " h " + mm + " min" : h + " h";
    }
    if (!h) return mm + " мин";
    return mm ? h + " ч " + mm + " мин" : h + " ч";
  }

  function hijriDate(now) {
    try {
      const p = ymd(now);
      const date = new Date(Date.UTC(p.y, p.m - 1, p.d, 12));
      const locale = lang() === "ru" ? "ru-RU-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
      const parts = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).formatToParts(date);
      const get = (type) => (parts.find((part) => part.type === type) || {}).value || "";
      const text = get("day") + " " + get("month") + " " + get("year");
      return lang() === "ru" ? text + " г." : text;
    } catch (e) {
      return "";
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function setUse(el, id) {
    if (!el) return;
    el.setAttribute("href", "#" + id);
    try {
      el.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + id);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- Rendering ---------- */

  function cacheDom() {
    ui.homeBtn = $("#homeBtn");
    ui.settingsBtn = $("#settingsBtn");
    ui.wallBtn = $("#wallBtn");
    ui.wallUploadBtn = $("#wallUploadBtn");
    ui.wallRemoveBtn = $("#wallRemoveBtn");
    ui.wallFile = $("#wallFile");
    ui.screens = $("#screens");
    ui.stage = $("#stage");
    ui.wallpaper = $("#wallpaper");
    ui.pager = $("#pager");
    ui.dock = $(".dock");
    ui.notesDockBtn = $("#notesDockBtn");
    ui.clockHome = $("#clockHome");
    ui.clockHomeH = $("#clockHomeH");
    ui.clockHomeM = $("#clockHomeM");
    ui.clockSuffix = $("#clockSuffix");
    ui.clockPrayers = $("#clockPrayers");
    ui.clockZikr = $("#clockZikr");
    ui.homeCity = $("#homeCity");
    ui.homeDate = $("#homeDate");
    ui.homeWeekday = $("#homeWeekday");
    ui.homeHijri = $("#homeHijri");
    ui.datePrayers = $("#datePrayers");
    ui.wdPrayers = $("#wdPrayers");
    ui.dateZikr = $("#dateZikr");
    ui.wdZikr = $("#wdZikr");
    ui.nextCard = $("#nextCard");
    ui.nextIcon = $("#nextIcon");
    ui.nextName = $("#nextName");
    ui.nextTime = $("#nextTime");
    ui.nextCount = $("#nextCount");
    ui.prayerList = $("#prayerList");
    ui.prayersCity = $("#prayersCity");
    ui.prayersNextText = $("#prayersNextText");
    ui.prayersNextTime = $("#prayersNextTime");
    ui.prayerProgress = $("#prayerProgress");
    ui.calcNote = $("#calcNote");
    ui.zikrTotal = $("#zikrTotal");
    ui.zikrList = $("#zikrList");
    ui.tapBtn = $("#tapBtn");
    ui.tapBar = $("#tapBar");
    ui.tapHint = $("#tapHint");
    ui.tapSub = $("#tapSub");
    ui.resetZikr = $("#resetZikr");
    ui.settingsSheet = $("#settingsSheet");
    ui.notesSheet = $("#notesSheet");
    ui.halalSheet = $("#halalSheet");
    ui.addSheet = $("#addSheet");
    ui.installSheet = $("#installSheet");
    ui.scrim = $("#scrim");
    ui.launcherGrid = $("#launcherGrid");
    ui.halalForm = $("#halalForm");
    ui.halalInput = $("#halalInput");
    ui.halalError = $("#halalError");
    ui.halalLinks = $("#halalLinks");
    ui.appForm = $("#appForm");
    ui.appNameInput = $("#appNameInput");
    ui.appUrlInput = $("#appUrlInput");
    ui.iconPicker = $("#iconPicker");
    ui.appIconFile = $("#appIconFile");
    ui.appIconPreview = $("#appIconPreview");
    ui.myAppsList = $("#myAppsList");
    ui.myAppsEmpty = $("#myAppsEmpty");
    ui.installNowBtn = $("#installNowBtn");
    ui.installSheetHint = $("#installSheetHint");
    ui.citySelect = $("#citySelect");
    ui.methodSelect = $("#methodSelect");
    ui.madhabSeg = $("#madhabSeg");
    ui.langSeg = $("#langSeg");
    ui.wallpaperList = $("#wallpaperList");
    ui.geoBtn = $("#geoBtn");
    ui.clock24Toggle = $("#clock24Toggle");
    ui.soundToggle = $("#soundToggle");
    ui.hapticsToggle = $("#hapticsToggle");
    ui.installBtn = $("#installBtn");
    ui.installHint = $("#installHint");
    ui.resetAll = $("#resetAll");
    ui.notesList = $("#notesList");
    ui.notesEmpty = $("#notesEmpty");
    ui.notesCount = $("#notesCount");
    ui.addNote = $("#addNote");
    ui.noteEditor = $("#noteEditor");
    ui.noteTitleInput = $("#noteTitleInput");
    ui.noteBodyInput = $("#noteBodyInput");
    ui.noteCancel = $("#noteCancel");
    ui.noteSave = $("#noteSave");
    ui.toast = $("#toast");
    ui.toastMsg = $("#toastMsg");
    ui.toastAction = $("#toastAction");
    ui.confetti = $("#confetti");
  }

  function renderAll() {
    document.documentElement.lang = lang();
    applyWallpaper();

    $$("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    $$("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    $$("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });

    $$(".pager__dot").forEach((dot, i) => {
      dot.setAttribute("aria-label", [t("nav.home"), t("nav.prayers"), t("nav.zikr")][i]);
    });
    const dockLabels = [t("nav.prayers"), t("nav.zikr"), t("nav.notes")];
    $$(".dock__item").forEach((item, i) => item.setAttribute("aria-label", dockLabels[i]));

    buildSettingsOptions();
    renderSegments();
    renderWallpapers();
    renderLauncher();
    renderMyApps();
    renderHalalLinks();
    updateInstallUI();
    renderSettingsState();
    renderNotes();
    renderCounter();
    refreshAll(true);
    updatePager();
    updateDock();
  }

  function refreshAll(force) {
    dayMemo.clear();
    lastMinuteKey = "";
    lastCountdownAt = 0;
    tick(nowInCity(), force);
  }

  function setClocks(now, animate) {
    const h = now.getHours();
    const m = now.getMinutes();
    const hh = state.settings.clock24 ? pad(h) : String(h % 12 || 12);
    const mm = pad(m);

    if (ui.clockHomeH.textContent !== hh) ui.clockHomeH.textContent = hh;
    if (ui.clockHomeM.textContent !== mm) ui.clockHomeM.textContent = mm;

    if (ui.clockSuffix) {
      ui.clockSuffix.hidden = state.settings.clock24;
      if (!state.settings.clock24) ui.clockSuffix.textContent = h >= 12 ? "PM" : "AM";
    }

    const small = formatTime(h * 60 + m);
    if (ui.clockPrayers.textContent !== small) ui.clockPrayers.textContent = small;
    if (ui.clockZikr.textContent !== small) ui.clockZikr.textContent = small;

    if (animate && ui.clockHome) {
      ui.clockHome.classList.remove("is-tick");
      void ui.clockHome.offsetWidth;
      ui.clockHome.classList.add("is-tick");
    }
  }

  function renderDate(now) {
    const p = ymd(now);
    const dateStr = pad(p.d) + "." + pad(p.m) + "." + p.y;
    const wdRaw = WEEKDAYS[lang()][now.getDay()] || "";
    const wd = wdRaw.charAt(0).toUpperCase() + wdRaw.slice(1);

    ui.homeDate.textContent = dateStr;
    ui.homeWeekday.textContent = wd;
    ui.datePrayers.textContent = dateStr;
    ui.wdPrayers.textContent = wd;
    ui.dateZikr.textContent = dateStr;
    ui.wdZikr.textContent = wd;

    const hijri = hijriDate(now);
    ui.homeHijri.textContent = hijri;
    ui.homeHijri.hidden = !hijri;
  }

  function updateNextCard(info) {
    const name = t("prayer." + info.key);
    ui.nextName.textContent = name;
    ui.nextTime.textContent = formatTime(info.nextRaw);
    ui.nextCount.textContent = info.tomorrow ? t("home.tomorrow") : t("home.in", { d: formatDuration(info.countdown) });
    setUse(ui.nextIcon, PRAYER_ICONS[info.key]);
  }

  function updatePrayerList(info) {
    const badge = info.tomorrow ? t("prayers.tomorrowBadge") : t("prayers.badge");
    ui.prayerList.innerHTML = PRAYER_KEYS.map((key) => {
      const active = key === info.key;
      const raw = active && info.tomorrow ? info.tomorrowTimes[key] : info.today[key];
      return (
        '<li class="prayer' + (active ? " is-next" : "") + '" data-key="' + key + '">' +
        '<span class="prayer__icon"><svg class="ico" viewBox="0 0 24 24"><use href="#' + PRAYER_ICONS[key] + '"></use></svg></span>' +
        '<span class="prayer__name">' + t("prayer." + key) +
        (active ? '<span class="prayer__badge">' + badge + "</span>" : "") +
        "</span>" +
        '<span class="prayer__time">' + formatTime(raw) + "</span>" +
        "</li>"
      );
    }).join("");
  }

  function updatePrayerFooter(info) {
    const name = t("prayer." + info.key + ".gen");
    ui.prayersNextText.textContent = info.tomorrow
      ? t("prayers.toTomorrow", { name: name })
      : t("prayers.to", { name: name, d: formatDuration(info.countdown) });
    ui.prayersNextTime.textContent = formatTime(info.nextRaw);
    ui.prayerProgress.style.width = Math.round(info.progress * 100) + "%";
  }

  function renderCityLabels() {
    const city = getCity();
    const method = METHODS[state.settings.method] || METHODS.mwl;
    ui.homeCity.textContent = city.name;
    ui.prayersCity.textContent = city.name;
    ui.calcNote.textContent = t("prayers.calc", { city: city.name, method: method[lang()] || method.ru });
  }

  function tick(nowArg, force) {
    const now = nowArg || nowInCity();
    rolloverZikr(now);
    setClocks(now, force === true);

    const key = dayKey(now) + "|" + now.getHours() + "|" + now.getMinutes();
    if (key !== lastMinuteKey || force) {
      lastMinuteKey = key;
      renderDate(now);
      renderCityLabels();
      const info = getNextInfo(now);
      updateNextCard(info);
      updatePrayerList(info);
      updatePrayerFooter(info);
      return;
    }

    if (Date.now() - lastCountdownAt > 10000) {
      lastCountdownAt = Date.now();
      const info = getNextInfo(now);
      updateNextCard(info);
      updatePrayerFooter(info);
    }
  }

  /* ---------- Zikr ---------- */

  function zikrTotal() {
    return state.zikr.counts.reduce((sum, n) => sum + n, 0);
  }

  function zikrDone() {
    return state.zikr.counts.every((n) => n >= 33);
  }

  function ensureZikrActive() {
    if (zikrDone()) return;
    if (state.zikr.counts[state.zikr.active] < 33) return;
    const next = state.zikr.counts.findIndex((n) => n < 33);
    if (next !== -1) state.zikr.active = next;
  }

  function renderCounter(pop) {
    ensureZikrActive();
    const counts = state.zikr.counts;
    const done = zikrDone();
    const active = done ? -1 : state.zikr.active;

    ui.zikrTotal.textContent = String(zikrTotal());
    if (pop) {
      ui.zikrTotal.classList.add("is-pop");
      setTimeout(() => ui.zikrTotal.classList.remove("is-pop"), 200);
    }

    ui.zikrList.innerHTML = ZIKRS.map((z, i) => {
      const count = counts[i];
      const isActive = i === active;
      const isDone = count >= 33;
      return (
        '<li class="zikr-row' + (isActive ? " is-active" : "") + (isDone ? " is-done" : "") + '" data-i="' + i + '">' +
        '<span class="zikr-row__name"><span class="zikr-row__latin">' + z.latin + '</span><span class="zikr-row__ru">' + z[lang()] + "</span></span>" +
        '<span class="zikr-row__count">' + count + "/33</span>" +
        '<span class="zikr-row__check"><svg class="ico" viewBox="0 0 24 24"><use href="#i-check"></use></svg></span>' +
        "</li>"
      );
    }).join("");

    const activeCount = done ? 33 : counts[active] || 0;
    const circumference = 358.14;
    ui.tapBar.style.strokeDashoffset = String(circumference * (1 - activeCount / 33));
    ui.tapBtn.classList.toggle("is-done", done);
    ui.tapHint.textContent = done ? t("zikr.allDone") : t("zikr.tap");
    ui.tapSub.textContent = done
      ? t("zikr.doneHint")
      : t("zikr.current", { name: ZIKRS[active].latin });
    ui.tapBtn.setAttribute("aria-label", t("zikr.tapAria", { name: ZIKRS[Math.max(0, active)].latin }));
  }

  function rolloverZikr(now) {
    const key = dayKey(now);
    if (!state.zikr.day) {
      state.zikr.day = key;
      save();
      return;
    }
    if (state.zikr.day !== key) {
      if (zikrTotal() > 0) {
        state.history[state.zikr.day] = zikrTotal();
        const keys = Object.keys(state.history).sort();
        while (keys.length > 60) delete state.history[keys.shift()];
      }
      state.zikr = { day: key, counts: [0, 0, 0], active: 0 };
      save();
      renderCounter();
    }
  }

  function haptic(pattern) {
    if (!state.settings.haptics) return;
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {
      /* ignore */
    }
  }

  function beep(freq, duration, volume, type) {
    if (!state.settings.sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(90, freq * 0.72), now + duration);
      gain.gain.setValueAtTime(volume == null ? 0.04 : volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      /* audio is optional */
    }
  }

  function tapZikr() {
    rolloverZikr(nowInCity());
    if (zikrDone()) {
      showToast(t("zikr.already"));
      haptic(20);
      return;
    }
    const index = state.zikr.active;
    const before = state.zikr.counts[index];
    state.zikr.counts[index] = Math.min(33, before + 1);
    const reached = state.zikr.counts[index] >= 33;
    if (reached) {
      const next = state.zikr.counts.findIndex((n) => n < 33);
      if (next !== -1) state.zikr.active = next;
    }
    save();
    renderCounter(true);

    const row = $('.zikr-row[data-i="' + index + '"]');
    if (row) {
      row.classList.add("is-flash");
      setTimeout(() => row.classList.remove("is-flash"), 720);
    }

    ui.tapBtn.classList.remove("is-hit");
    void ui.tapBtn.offsetWidth;
    ui.tapBtn.classList.add("is-hit");
    setTimeout(() => ui.tapBtn.classList.remove("is-hit"), 170);

    if (reached) {
      beep(720, 0.18, 0.05);
      setTimeout(() => beep(960, 0.22, 0.035), 90);
      haptic([16, 26, 16]);
    } else {
      beep(480 + (before % 6) * 26, 0.055, 0.03, "triangle");
      haptic(9);
    }

    if (zikrDone()) {
      celebrate();
      showToast(t("zikr.completeToast"));
    } else if (reached) {
      showToast(t("zikr.stepDone", { name: ZIKRS[index].latin }));
    }
  }

  function resetZikr() {
    if (zikrTotal() === 0) {
      showToast(t("zikr.resetToast"));
      return;
    }
    const snapshot = {
      day: state.zikr.day,
      counts: state.zikr.counts.slice(),
      active: state.zikr.active,
    };
    state.zikr = { day: dayKey(nowInCity()), counts: [0, 0, 0], active: 0 };
    save();
    renderCounter();
    haptic(12);
    showToast(t("zikr.resetToast"), {
      action: t("zikr.undo"),
      onAction: () => {
        state.zikr = snapshot;
        save();
        renderCounter();
      },
    });
  }

  function celebrate() {
    const colors = ["#f0d2a2", "#d9b27a", "#fdf6e8", "#b98b4b", "#fff4dd"];
    for (let i = 0; i < 30; i += 1) {
      const bit = document.createElement("span");
      bit.className = "confetti__bit";
      bit.style.left = 50 + (Math.random() * 60 - 30) + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.setProperty("--dx", (Math.random() * 260 - 130).toFixed(0) + "px");
      bit.style.setProperty("--dy", (160 + Math.random() * 300).toFixed(0) + "px");
      bit.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
      bit.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";
      bit.style.width = 5 + Math.round(Math.random() * 4) + "px";
      bit.style.height = 8 + Math.round(Math.random() * 6) + "px";
      ui.confetti.appendChild(bit);
      setTimeout(() => bit.remove(), 2200);
    }
    haptic([24, 40, 24, 40, 60]);
    beep(660, 0.2, 0.05);
    setTimeout(() => beep(880, 0.26, 0.045), 120);
    setTimeout(() => beep(1040, 0.3, 0.04), 260);
  }

  /* ---------- Notes ---------- */

  function notesWord(n) {
    if (lang() === "en") return n === 1 ? t("notes.one") : t("notes.many");
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return t("notes.one");
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return t("notes.few");
    return t("notes.many");
  }

  function formatNoteDate(ts) {
    try {
      return new Intl.DateTimeFormat(lang() === "ru" ? "ru-RU" : "en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(ts));
    } catch (e) {
      return "";
    }
  }

  function saveNotes() {
    save();
  }

  function renderNotes() {
    const notes = state.notes.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    ui.notesList.innerHTML = "";
    notes.forEach((note) => {
      const li = document.createElement("li");
      li.className = "note";

      const open = document.createElement("button");
      open.type = "button";
      open.className = "note__open";
      open.setAttribute("aria-label", (note.title || t("notes.untitled")) + ", " + t("notes.title"));

      const title = document.createElement("span");
      title.className = "note__title";
      title.textContent = note.title || t("notes.untitled");

      const body = document.createElement("span");
      body.className = "note__body";
      body.textContent = note.body || "";

      const meta = document.createElement("span");
      meta.className = "note__meta";
      meta.textContent = formatNoteDate(note.updatedAt || note.createdAt || Date.now());

      open.append(title, body, meta);
      open.addEventListener("click", () => startEdit(note));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "note__del";
      del.setAttribute("aria-label", t("notes.delete"));
      del.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><use href="#i-trash"></use></svg>';
      del.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteNote(note);
      });

      li.append(open, del);
      ui.notesList.appendChild(li);
    });

    const count = notes.length;
    ui.notesCount.textContent = t("notes.count", { n: count, word: notesWord(count) });
    ui.notesEmpty.classList.toggle("is-visible", count === 0 && ui.noteEditor.hidden);
    if (editingId && !state.notes.some((n) => n.id === editingId)) {
      hideEditor();
    }
  }

  function startEdit(note) {
    editingId = note ? note.id : null;
    ui.noteTitleInput.value = note ? note.title || "" : "";
    ui.noteBodyInput.value = note ? note.body || "" : "";
    ui.noteEditor.hidden = false;
    ui.notesEmpty.classList.remove("is-visible");
    const notesBody = ui.notesSheet.querySelector(".sheet__body");
    if (notesBody) notesBody.scrollTop = 0;
    ui.noteTitleInput.focus({ preventScroll: true });
  }

  function hideEditor() {
    editingId = null;
    ui.noteEditor.hidden = true;
    ui.noteEditor.reset();
    renderNotes();
  }

  function saveNote(event) {
    if (event) event.preventDefault();
    const title = ui.noteTitleInput.value.trim();
    const body = ui.noteBodyInput.value.trim();
    if (!title && !body) {
      showToast(t("notes.needText"));
      ui.noteTitleInput.focus();
      return;
    }
    const now = Date.now();
    let note = editingId ? state.notes.find((n) => n.id === editingId) : null;
    if (note) {
      note.title = title;
      note.body = body;
      note.updatedAt = now;
    } else {
      state.notes.push({
        id: now.toString(36) + Math.random().toString(36).slice(2, 6),
        title,
        body,
        createdAt: now,
        updatedAt: now,
      });
    }
    saveNotes();
    hideEditor();
    showToast(t("notes.saved"));
    haptic(10);
  }

  function deleteNote(note) {
    const index = state.notes.findIndex((n) => n.id === note.id);
    if (index === -1) return;
    const removed = state.notes[index];
    state.notes.splice(index, 1);
    saveNotes();
    if (editingId === note.id) {
      editingId = null;
      ui.noteEditor.hidden = true;
      ui.noteEditor.reset();
    }
    renderNotes();
    haptic(8);
    showToast(t("notes.deleted"), {
      action: t("notes.undo"),
      onAction: () => {
        state.notes.push(removed);
        saveNotes();
        renderNotes();
      },
    });
  }

  /* ---------- Launcher ---------- */

  const LAUNCHER_BUILTINS = [
    { action: "prayers", labelKey: "nav.prayers", icon: "i-shield" },
    { action: "zikr", labelKey: "nav.zikr", icon: "i-shield-zikr" },
    { action: "notes", labelKey: "nav.notes", icon: "i-notes" },
    { action: "halal", labelKey: "launcher.halal", icon: "i-globe" },
  ];

  function makeAppIcon(app) {
    const icon = document.createElement("span");
    icon.className = "launcher__icon";
    if (app.icon.type === "image") {
      const img = document.createElement("img");
      img.src = app.icon.value;
      img.alt = "";
      icon.appendChild(img);
    } else if (app.icon.type === "emoji") {
      const emoji = document.createElement("span");
      emoji.className = "launcher__emoji";
      emoji.textContent = app.icon.value;
      icon.appendChild(emoji);
    } else {
      const letter = document.createElement("span");
      letter.className = "launcher__letter";
      letter.textContent = (app.name || "?").charAt(0).toUpperCase();
      icon.appendChild(letter);
    }
    return icon;
  }

  function launcherItem(options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "launcher__item" + (options.className ? " " + options.className : "");
    button.dataset.action = options.action;
    const icon = document.createElement("span");
    icon.className = "launcher__icon";
    icon.innerHTML = '<svg class="ico" viewBox="0 0 32 32"><use href="#' + options.icon + '"></use></svg>';
    const label = document.createElement("span");
    label.className = "launcher__label";
    label.textContent = options.label;
    button.append(icon, label);
    return button;
  }

  function renderLauncher() {
    if (!ui.launcherGrid) return;
    ui.launcherGrid.innerHTML = "";
    LAUNCHER_BUILTINS.forEach((item) => {
      ui.launcherGrid.appendChild(launcherItem({
        action: item.action,
        icon: item.icon,
        label: t(item.labelKey),
      }));
    });

    state.apps.forEach((app) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "launcher__item";
      button.dataset.app = app.id;
      const icon = makeAppIcon(app);
      const label = document.createElement("span");
      label.className = "launcher__label";
      label.textContent = app.name;
      button.append(icon, label);
      ui.launcherGrid.appendChild(button);
    });

    ui.launcherGrid.appendChild(launcherItem({
      action: "add",
      icon: "i-plus",
      label: t("launcher.add"),
      className: "launcher__item--add",
    }));

    if (!isStandalone()) {
      ui.launcherGrid.appendChild(launcherItem({
        action: "install",
        icon: "i-install",
        label: t("launcher.install"),
        className: "launcher__item--install",
      }));
    }
  }

  function openCustomApp(app) {
    if (!app || !isAppUrl(app.url)) return;
    haptic(7);
    if (/^intent:\/\//i.test(app.url)) {
      window.location.href = app.url;
      return;
    }
    try {
      const win = window.open(app.url, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = app.url;
    } catch (e) {
      window.location.href = app.url;
    }
  }

  function setIconPreview() {
    if (!ui.appIconPreview) return;
    const upload = ui.iconPicker.querySelector(".icon-pick--upload");
    const uploadSvg = upload ? upload.querySelector("svg") : null;
    if (pendingIcon.type === "image") {
      ui.appIconPreview.src = pendingIcon.value;
      ui.appIconPreview.hidden = false;
      if (uploadSvg) uploadSvg.hidden = true;
      $$(".icon-pick[data-emoji]", ui.iconPicker).forEach((b) => b.classList.remove("is-active"));
      if (upload) upload.classList.add("is-active");
    } else {
      ui.appIconPreview.hidden = true;
      ui.appIconPreview.removeAttribute("src");
      if (uploadSvg) uploadSvg.hidden = false;
      if (upload) upload.classList.remove("is-active");
    }
  }

  function resetAppForm() {
    if (!ui.appForm) return;
    ui.appForm.reset();
    pendingIcon = { type: "emoji", value: "🕌" };
    $$(".icon-pick[data-emoji]", ui.iconPicker).forEach((b, index) => {
      b.classList.toggle("is-active", index === 0);
    });
    setIconPreview();
  }

  async function processIconFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast(t("add.invalid"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast(t("add.invalid"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const size = 96;
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          const scale = Math.max(size / img.width, size / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
          pendingIcon = { type: "image", value: canvas.toDataURL("image/jpeg", 0.82) };
          setIconPreview();
        } catch (e) {
          showToast(t("add.invalid"));
        }
      };
      img.onerror = () => showToast(t("add.invalid"));
      img.src = reader.result;
    };
    reader.onerror = () => showToast(t("add.invalid"));
    reader.readAsDataURL(file);
  }

  function addApp(event) {
    if (event) event.preventDefault();
    const name = ui.appNameInput.value.trim();
    let url = ui.appUrlInput.value.trim();
    if (url && !/^(https?:\/\/|intent:\/\/)/i.test(url) && /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(url)) {
      url = "https://" + url;
    }
    if (!name || !url || !isAppUrl(url)) {
      showToast(t("add.invalid"));
      return;
    }
    if (state.apps.length >= MAX_APPS) {
      showToast(t("add.limit"));
      return;
    }
    state.apps.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: name.slice(0, 24),
      url: url.slice(0, 500),
      icon: pendingIcon,
    });
    save();
    renderLauncher();
    renderMyApps();
    resetAppForm();
    closeSheet();
    showToast(t("add.saved"));
    haptic(12);
  }

  function removeApp(id) {
    const index = state.apps.findIndex((app) => app.id === id);
    if (index === -1) return;
    const removed = state.apps[index];
    state.apps.splice(index, 1);
    save();
    renderLauncher();
    renderMyApps();
    haptic(8);
    showToast(t("add.deleted"), {
      action: t("add.undo"),
      onAction: () => {
        state.apps.splice(Math.min(index, state.apps.length), 0, removed);
        save();
        renderLauncher();
        renderMyApps();
      },
    });
  }

  function renderMyApps() {
    if (!ui.myAppsList) return;
    ui.myAppsList.innerHTML = "";
    state.apps.forEach((app) => {
      const li = document.createElement("li");
      li.className = "my-app";

      const icon = document.createElement("span");
      icon.className = "my-app__icon";
      if (app.icon.type === "image") {
        const img = document.createElement("img");
        img.src = app.icon.value;
        img.alt = "";
        icon.appendChild(img);
      } else {
        icon.textContent = app.icon.value;
      }

      const text = document.createElement("span");
      const name = document.createElement("span");
      name.className = "my-app__name";
      name.textContent = app.name;
      const url = document.createElement("span");
      url.className = "my-app__url";
      url.textContent = app.url;
      text.append(name, url);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "my-app__del";
      del.setAttribute("aria-label", t("notes.delete"));
      del.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><use href="#i-trash"></use></svg>';
      del.addEventListener("click", () => removeApp(app.id));

      li.append(icon, text, del);
      ui.myAppsList.appendChild(li);
    });
    if (ui.myAppsEmpty) ui.myAppsEmpty.hidden = state.apps.length > 0;
  }

  /* ---------- Halal web ---------- */

  function renderHalalLinks() {
    if (!ui.halalLinks) return;
    ui.halalLinks.innerHTML = HALAL_LINKS.map((link) =>
      '<a class="halal-link" href="' + link.url + '" target="_blank" rel="noopener noreferrer">' +
      '<span class="halal-link__icon"><svg class="ico" viewBox="0 0 24 24"><use href="#' + link.icon + '"></use></svg></span>' +
      '<span><span class="halal-link__name">' + escapeHtml(t(link.key)) + '</span><span class="halal-link__domain">' + link.domain + "</span></span>" +
      '<svg class="ico halal-link__arrow" viewBox="0 0 24 24"><use href="#i-external"></use></svg>' +
      "</a>"
    ).join("");
  }

  function isBlockedHalal(value) {
    const normalized = String(value).toLowerCase();
    if (BLOCKED_DOMAINS.some((domain) => normalized.includes(domain))) return true;
    return BLOCKED_PATTERN.test(normalized);
  }

  function showHalalError() {
    ui.halalError.textContent = t("halal.blocked");
    ui.halalError.hidden = false;
  }

  function handleHalalSearch(event) {
    if (event) event.preventDefault();
    const value = ui.halalInput.value.trim();
    ui.halalError.hidden = true;
    if (!value) return;
    if (isBlockedHalal(value)) {
      showHalalError();
      haptic(20);
      return;
    }

    let url;
    if (/^intent:/i.test(value)) {
      showHalalError();
      return;
    }
    if (/^https?:\/\//i.test(value)) {
      try {
        const parsed = new URL(value);
        if (isBlockedHalal(parsed.hostname)) {
          showHalalError();
          return;
        }
        url = parsed.href;
      } catch (e) {
        showHalalError();
        return;
      }
    } else if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(value)) {
      if (isBlockedHalal(value)) {
        showHalalError();
        return;
      }
      url = "https://" + value;
    } else {
      url = "https://duckduckgo.com/?q=" + encodeURIComponent(value) + "&kp=1&kl=" + (lang() === "ru" ? "ru-ru" : "us-en");
    }

    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = url;
    haptic(8);
  }

  /* ---------- Install ---------- */

  async function triggerInstall() {
    if (isStandalone()) {
      showToast(t("install.already"));
      return;
    }
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice && choice.outcome === "accepted") {
          showToast(t("install.done"));
          renderLauncher();
        }
      } catch (e) {
        deferredPrompt = null;
        openSheet("install");
      }
      return;
    }
    openSheet("install");
  }

  function onInstallNow() {
    if (isStandalone()) {
      showToast(t("install.already"));
      return;
    }
    if (deferredPrompt) {
      triggerInstall();
    } else {
      showToast(t("install.manualShort"));
    }
  }

  /* ---------- Settings ---------- */

  function buildSettingsOptions() {
    const cityOptions = Object.keys(CITIES).map((id) => {
      const c = CITIES[id];
      return '<option value="' + id + '">' + escapeHtml(c[lang()] || c.ru) + "</option>";
    });
    if (state.customCity) {
      cityOptions.push('<option value="custom">' + escapeHtml(t("settings.customCity")) + "</option>");
    }
    ui.citySelect.innerHTML = cityOptions.join("");
    ui.citySelect.value = state.settings.city;

    ui.methodSelect.innerHTML = Object.keys(METHODS).map((id) => {
      const m = METHODS[id];
      return '<option value="' + id + '">' + escapeHtml(m[lang()] || m.ru) + "</option>";
    }).join("");
    ui.methodSelect.value = state.settings.method;
  }

  function renderSegments() {
    $$("#madhabSeg button").forEach((btn) => {
      btn.textContent = btn.dataset.value === "shafi" ? t("settings.shafi") : t("settings.hanafi");
      btn.classList.toggle("is-active", btn.dataset.value === state.settings.madhab);
      btn.setAttribute("aria-pressed", String(btn.dataset.value === state.settings.madhab));
    });
    $$("#langSeg button").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.value === lang());
      btn.setAttribute("aria-pressed", String(btn.dataset.value === lang()));
    });
  }

  function renderWallpapers() {
    ui.wallpaperList.innerHTML = WALLPAPERS.map((w, i) =>
      '<button class="wall-pick' + (i === state.settings.wall ? " is-active" : "") + '" type="button" data-wall="' + i + '" aria-label="' + escapeHtml(w[lang()]) + '" aria-pressed="' + (i === state.settings.wall) + '">' +
      '<span class="wall-pick__thumb"></span>' +
      '<span class="wall-pick__name">' + escapeHtml(w[lang()]) + "</span>" +
      "</button>"
    ).join("");

    if (state.customWall) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wall-pick wall-pick--custom" + (state.settings.wall === 5 ? " is-active" : "");
      button.dataset.wall = "5";
      button.setAttribute("aria-label", CUSTOM_WALL_LABEL[lang()]);
      button.setAttribute("aria-pressed", String(state.settings.wall === 5));
      const thumb = document.createElement("span");
      thumb.className = "wall-pick__thumb";
      thumb.style.backgroundImage = 'url("' + state.customWall.sharp + '")';
      const name = document.createElement("span");
      name.className = "wall-pick__name";
      name.textContent = CUSTOM_WALL_LABEL[lang()];
      button.append(thumb, name);
      ui.wallpaperList.appendChild(button);
    }
    updateWallControls();
  }

  function updateWallControls() {
    if (!ui.wallRemoveBtn) return;
    ui.wallRemoveBtn.hidden = !state.customWall;
  }

  function applyWallpaper() {
    let wall = state.settings.wall;
    if (wall === 5 && !state.customWall) wall = 0;
    state.settings.wall = wall;
    document.body.dataset.wall = String(wall);
    if (wall === 5 && state.customWall) {
      document.body.style.setProperty("--wall", 'url("' + state.customWall.sharp + '")');
      document.body.style.setProperty("--wall-blur", 'url("' + state.customWall.blur + '")');
    } else {
      document.body.style.removeProperty("--wall");
      document.body.style.removeProperty("--wall-blur");
    }
    updateWallControls();
  }

  function processWallFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast(t("settings.wallError"));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast(t("settings.wallError"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxW = 900;
          const maxH = 1600;
          const scale = Math.min(1, maxW / img.width, maxH / img.height);
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const sharp = canvas.toDataURL("image/jpeg", 0.84);

          const small = document.createElement("canvas");
          small.width = Math.max(1, Math.round(width / 12));
          small.height = Math.max(1, Math.round(height / 12));
          const sctx = small.getContext("2d");
          sctx.imageSmoothingEnabled = true;
          sctx.drawImage(canvas, 0, 0, small.width, small.height);

          const blurCanvas = document.createElement("canvas");
          blurCanvas.width = width;
          blurCanvas.height = height;
          const bctx = blurCanvas.getContext("2d");
          bctx.imageSmoothingEnabled = true;
          bctx.drawImage(small, 0, 0, width, height);
          const blur = blurCanvas.toDataURL("image/jpeg", 0.72);

          state.customWall = { sharp, blur };
          state.settings.wall = 5;
          save();
          applyWallpaper();
          renderWallpapers();
          showToast(t("settings.wallSaved"));
          haptic(12);
        } catch (e) {
          showToast(t("settings.wallError"));
        }
        ui.wallFile.value = "";
      };
      img.onerror = () => {
        showToast(t("settings.wallError"));
        ui.wallFile.value = "";
      };
      img.src = reader.result;
    };
    reader.onerror = () => showToast(t("settings.wallError"));
    reader.readAsDataURL(file);
  }

  function removeCustomWall() {
    state.customWall = null;
    if (state.settings.wall === 5) state.settings.wall = 0;
    save();
    applyWallpaper();
    renderWallpapers();
    showToast(t("settings.wallRemoved"));
    haptic(10);
  }

  function renderSettingsState() {
    ui.clock24Toggle.checked = state.settings.clock24;
    ui.soundToggle.checked = state.settings.sound;
    ui.hapticsToggle.checked = state.settings.haptics;
    ui.citySelect.value = state.settings.city;
    ui.methodSelect.value = state.settings.method;
    $$("#madhabSeg button").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.value === state.settings.madhab));
    $$("#langSeg button").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.value === lang()));
  }

  function isStandalone() {
    try {
      return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    } catch (e) {
      return false;
    }
  }

  function updateInstallUI() {
    if (isStandalone()) {
      ui.installBtn.hidden = true;
      ui.installHint.hidden = true;
      return;
    }
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    ui.installHint.textContent = ios ? t("settings.installIos") : t("settings.installAndroid");
  }

  /* ---------- Navigation ---------- */

  function setTransforms(dragPx, animate) {
    $$(".screen").forEach((el, i) => {
      const base = (i - current) * 100;
      el.style.transform = "translate3d(calc(" + base + "% + " + (dragPx || 0) + "px), 0, 0)";
    });
  }

  function updatePager() {
    $$(".pager__dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      dot.setAttribute("aria-selected", String(i === current));
    });
  }

  function updateDock() {
    $$(".dock__item[data-go]").forEach((item) => {
      item.classList.toggle("is-active", Number(item.dataset.go) === current);
    });
    ui.notesDockBtn.classList.toggle("is-active", !!(activeSheet && activeSheet.name === "notes"));
  }

  function goTo(index, options) {
    const target = clamp(Number(index) || 0, 0, 2);
    const opts = options || {};
    const changed = target !== current;
    current = target;
    document.body.dataset.screen = String(current);
    document.body.dataset.soft = current === 0 ? "0" : "1";

    $$(".screen").forEach((el, i) => {
      if (i === current) {
        el.removeAttribute("inert");
        el.setAttribute("aria-hidden", "false");
      } else {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
      }
    });

    ui.screens.classList.remove("is-dragging");
    setTransforms(0, changed);
    updatePager();
    updateDock();

    if (current === 1 || current === 2) {
      const now = nowInCity();
      const info = getNextInfo(now);
      updateNextCard(info);
    }
    if (current === 2) renderCounter();

    if (changed && !opts.silent) {
      haptic(6);
    }
  }

  /* ---------- Sheets ---------- */

  function openSheet(name) {
    const sheets = {
      settings: ui.settingsSheet,
      notes: ui.notesSheet,
      halal: ui.halalSheet,
      add: ui.addSheet,
      install: ui.installSheet,
    };
    const sheet = sheets[name];
    if (!sheet) return;
    if (activeSheet && activeSheet.sheet === sheet) return;
    if (activeSheet) {
      activeSheet.sheet.classList.remove("is-open");
      activeSheet.sheet.setAttribute("aria-hidden", "true");
    }
    activeSheet = { name, sheet, lastFocus: document.activeElement };

    if (name === "settings") {
      buildSettingsOptions();
      renderSegments();
      renderWallpapers();
      renderSettingsState();
      updateInstallUI();
    }
    if (name === "notes") {
      renderNotes();
    }
    if (name === "halal") {
      renderHalalLinks();
      ui.halalError.hidden = true;
    }
    if (name === "add") {
      renderMyApps();
      if (!ui.appNameInput.value && !ui.appUrlInput.value) resetAppForm();
    }

    ui.scrim.classList.add("is-open");
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    updateDock();

    setTimeout(() => {
      const focusTarget = sheet.querySelector("[data-close]");
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }, 380);
  }

  function closeSheet() {
    if (!activeSheet) return;
    const { sheet, lastFocus } = activeSheet;
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    ui.scrim.classList.remove("is-open");
    activeSheet = null;
    updateDock();
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  /* ---------- Toast ---------- */

  function showToast(message, options) {
    const opts = options || {};
    clearTimeout(toastTimer);
    ui.toastMsg.textContent = message;
    if (opts.action) {
      ui.toastAction.hidden = false;
      ui.toastAction.textContent = opts.action;
      ui.toastAction.onclick = () => {
        ui.toast.classList.remove("is-show");
        if (typeof opts.onAction === "function") opts.onAction();
      };
    } else {
      ui.toastAction.hidden = true;
      ui.toastAction.onclick = null;
    }
    ui.toast.classList.add("is-show");
    toastTimer = setTimeout(() => {
      ui.toast.classList.remove("is-show");
    }, opts.duration || 2800);
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    document.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const go = event.target.closest("[data-go]");
      if (go) {
        goTo(go.dataset.go);
        return;
      }
      const close = event.target.closest("[data-close]");
      if (close) {
        closeSheet();
        return;
      }
      if (event.target === ui.scrim) closeSheet();
    });

    ui.settingsBtn.addEventListener("click", () => openSheet("settings"));
    ui.notesDockBtn.addEventListener("click", () => openSheet("notes"));
    ui.homeBtn.addEventListener("click", () => goTo(0));

    ui.launcherGrid.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      haptic(6);
      if (button.dataset.app) {
        const app = state.apps.find((item) => item.id === button.dataset.app);
        openCustomApp(app);
        return;
      }
      switch (button.dataset.action) {
        case "prayers":
          goTo(1);
          break;
        case "zikr":
          goTo(2);
          break;
        case "notes":
          openSheet("notes");
          break;
        case "halal":
          openSheet("halal");
          break;
        case "add":
          openSheet("add");
          break;
        case "install":
          triggerInstall();
          break;
        default:
          break;
      }
    });

    ui.tapBtn.addEventListener("click", tapZikr);
    ui.resetZikr.addEventListener("click", resetZikr);

    ui.pager.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-go]");
      if (dot) goTo(dot.dataset.go);
    });

    // ---- swipe / drag ----
    ui.screens.addEventListener("pointerdown", (event) => {
      if (activeSheet) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      drag = {
        id: event.pointerId,
        x0: event.clientX,
        y0: event.clientY,
        dx: 0,
        axis: null,
        t0: performance.now(),
      };
    });

    window.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const rawDx = event.clientX - drag.x0;
      const rawDy = event.clientY - drag.y0;

      if (!drag.axis) {
        if (Math.abs(rawDx) > 7 && Math.abs(rawDx) > Math.abs(rawDy) * 1.15) {
          drag.axis = "x";
          ui.screens.classList.add("is-dragging");
          try {
            ui.screens.setPointerCapture(event.pointerId);
          } catch (e) {
            /* ignore */
          }
        } else if (Math.abs(rawDy) > 9) {
          drag.axis = "y";
          return;
        }
      }
      if (drag.axis !== "x") return;

      let shift = rawDx;
      if ((current === 0 && rawDx > 0) || (current === 2 && rawDx < 0)) shift = rawDx * 0.28;
      drag.dx = shift;
      setTransforms(shift, false);
      if (event.cancelable) event.preventDefault();
    }, { passive: false });

    function endDrag(event) {
      if (!drag) return;
      if (event && event.pointerId !== drag.id) return;
      const width = ui.screens.clientWidth || 390;
      const elapsed = Math.max(1, performance.now() - drag.t0);
      const velocity = Math.abs(drag.dx) / elapsed;
      const moved = Math.abs(drag.dx);
      let target = current;

      if (drag.axis === "x") {
        const threshold = width * 0.2;
        if (drag.dx < -threshold || (drag.dx < -28 && velocity > 0.45)) target = current + 1;
        else if (drag.dx > threshold || (drag.dx > 28 && velocity > 0.45)) target = current - 1;
      }

      if (moved > 8) suppressClickUntil = Date.now() + 120;
      ui.screens.classList.remove("is-dragging");
      drag = null;
      if (target !== current) goTo(target);
      else setTransforms(0, true);
    }

    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    ui.screens.addEventListener("wheel", (event) => {
      if (activeSheet) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const now = Date.now();
      if (now < wheelLock) return;
      if (Math.abs(event.deltaX) > 24) {
        wheelLock = now + 650;
        goTo(current + (event.deltaX > 0 ? 1 : -1));
      }
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (activeSheet) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeSheet();
          return;
        }
        if (event.key === "Tab") {
          const focusables = Array.from(activeSheet.sheet.querySelectorAll(
            'button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )).filter((el) => el.offsetParent !== null || el === document.activeElement);
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(current - 1);
      } else if (["1", "2", "3"].includes(event.key)) {
        goTo(Number(event.key) - 1);
      } else if ((event.key === " " || event.key === "Enter") && current === 2 &&
        (document.activeElement === document.body || document.activeElement === ui.screens)) {
        event.preventDefault();
        tapZikr();
      }
    });

    // ---- settings ----
    ui.citySelect.addEventListener("change", () => {
      state.settings.city = ui.citySelect.value;
      save();
      dayMemo.clear();
      refreshAll(true);
      renderCounter();
    });

    ui.methodSelect.addEventListener("change", () => {
      state.settings.method = ui.methodSelect.value;
      save();
      dayMemo.clear();
      refreshAll(true);
    });

    ui.madhabSeg.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-value]");
      if (!btn) return;
      state.settings.madhab = btn.dataset.value;
      save();
      dayMemo.clear();
      renderSegments();
      refreshAll(true);
      haptic(6);
    });

    ui.langSeg.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-value]");
      if (!btn || btn.dataset.value === lang()) return;
      state.settings.lang = btn.dataset.value;
      save();
      renderAll();
    });

    ui.wallpaperList.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-wall]");
      if (!btn) return;
      state.settings.wall = Number(btn.dataset.wall);
      applyWallpaper();
      save();
      renderWallpapers();
      haptic(6);
      beep(520, 0.05, 0.03);
    });

    ui.wallUploadBtn.addEventListener("click", () => ui.wallFile.click());
    ui.wallFile.addEventListener("change", () => {
      const file = ui.wallFile.files && ui.wallFile.files[0];
      if (file) processWallFile(file);
    });
    ui.wallRemoveBtn.addEventListener("click", removeCustomWall);
    ui.wallBtn.addEventListener("click", () => {
      openSheet("settings");
      setTimeout(() => {
        const body = ui.settingsSheet.querySelector(".sheet__body");
        const group = $("#appearanceGroup");
        if (body && group) {
          body.scrollTop += group.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
        }
      }, 430);
    });

    ui.clock24Toggle.addEventListener("change", () => {
      state.settings.clock24 = ui.clock24Toggle.checked;
      save();
      refreshAll(true);
    });
    ui.soundToggle.addEventListener("change", () => {
      state.settings.sound = ui.soundToggle.checked;
      save();
      if (state.settings.sound) beep(620, 0.08, 0.04);
    });
    ui.hapticsToggle.addEventListener("change", () => {
      state.settings.haptics = ui.hapticsToggle.checked;
      save();
      if (state.settings.haptics) haptic(12);
    });

    ui.geoBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast(t("settings.geoFail"));
        return;
      }
      ui.geoBtn.disabled = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          ui.geoBtn.disabled = false;
          let tz = "UTC";
          try {
            tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          } catch (e) {
            tz = "UTC";
          }
          state.customCity = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            tz,
            offset: -new Date().getTimezoneOffset() / 60,
          };
          state.settings.city = "custom";
          save();
          offsetCache.clear();
          dayMemo.clear();
          buildSettingsOptions();
          refreshAll(true);
          renderCityLabels();
          showToast(t("settings.geoOk"));
        },
        () => {
          ui.geoBtn.disabled = false;
          showToast(t("settings.geoFail"));
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
      );
    });

    ui.installBtn.addEventListener("click", triggerInstall);
    ui.installNowBtn.addEventListener("click", onInstallNow);

    ui.resetAll.addEventListener("click", () => {
      if (!resetArmed) {
        resetArmed = true;
        ui.resetAll.textContent = t("settings.resetConfirm");
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          resetArmed = false;
          ui.resetAll.textContent = t("settings.resetAll");
        }, 4000);
        return;
      }
      clearTimeout(resetTimer);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
      location.reload();
    });

    // ---- notes ----
    ui.addNote.addEventListener("click", () => startEdit(null));
    ui.noteCancel.addEventListener("click", hideEditor);
    ui.noteEditor.addEventListener("submit", saveNote);

    // ---- apps ----
    ui.appForm.addEventListener("submit", addApp);
    ui.iconPicker.addEventListener("click", (event) => {
      const pick = event.target.closest(".icon-pick[data-emoji]");
      if (!pick) return;
      pendingIcon = { type: "emoji", value: pick.dataset.emoji };
      $$(".icon-pick", ui.iconPicker).forEach((el) => el.classList.remove("is-active"));
      pick.classList.add("is-active");
      setIconPreview();
    });
    ui.appIconFile.addEventListener("change", () => {
      const file = ui.appIconFile.files && ui.appIconFile.files[0];
      if (file) processIconFile(file);
    });

    // ---- halal web ----
    ui.halalForm.addEventListener("submit", handleHalalSearch);
    ui.halalInput.addEventListener("input", () => {
      ui.halalError.hidden = true;
    });

    ui.scrim.addEventListener("click", closeSheet);

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredPrompt = event;
    });
    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      renderLauncher();
      closeSheet();
      updateInstallUI();
      showToast(t("install.done"));
    });

    // Refresh when the tab becomes visible again.
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        tick(nowInCity(), true);
      }
    });

    window.addEventListener("resize", () => {
      setTransforms(0, false);
    });
  }

  /* ---------- Boot ---------- */

  function initialScreen() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("screen") || (window.location.hash || "").replace("#", "");
    if (value === "notes") return 3;
    const map = { home: 0, prayers: 1, zikr: 2, schedule: 1, counter: 2 };
    if (value && map[value] !== undefined) return map[value];
    const num = Number(value);
    if (Number.isInteger(num) && num >= 0 && num <= 2) return num;
    return 0;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(window.location.protocol)) return; // file:// has no SW support
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* offline caching is a bonus, not a requirement */
      });
    });
  }

  function init() {
    state = loadState();
    cacheDom();
    document.body.dataset.wall = String(state.settings.wall);
    goTo(0, { silent: true });
    bindEvents();
    renderAll();

    const start = initialScreen();
    if (start === 3) {
      openSheet("notes");
    } else {
      goTo(start, { silent: true });
    }

    // First minute tick happens immediately; then once a second for the clock.
    tick(nowInCity(), true);
    setInterval(() => tick(), 1000);
    registerServiceWorker();

    // Small debugging surface (handy for browser tests, harmless in production).
    window.__islamCat = {
      state: () => state,
      computeDayTimes,
      getNextInfo,
      getCity,
      nowInCity,
      goTo,
      formatTime,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
