# AGENT_HANDOFF.md

Документ для передачи контекста между чатами Cursor. Детали требований и плана — в [PROJECT.md](./PROJECT.md) и [PLAN.md](./PLAN.md). Границы MVP — в [MVP-SCOPE.md](./MVP-SCOPE.md).

**Обновлено:** 2026-11-26 (сверено с репозиторием и диалогом).

---

## Кратко о проекте

**GoNext** — офлайн мобильное приложение «Дневник туриста» (React Native, Expo SDK 58, Expo Router, React Native Paper 6 alpha, локальный SQLite). Рабочая папка: `c:\Cursor\GoNext`.

Язык UI: русский. Коммиты — по-русски. Команды в PowerShell. Перед завершением задач: `npx tsc --noEmit`, `npx expo lint`.

---

## Текущая задача и этап PLAN.md

- **Плановый фокус:** этап **9** — сквозная приёмка MVP на телефоне (чеклист в README). Этапы **7–8** закрыты по коду.
- **Этапы 3–6** приняты пользователем на телефоне (Expo Go), **2026-11-26**.
- **PLAN.md** в шапке (про «демо Home») **устарела** — ориентироваться на этот файл и `src/app/`.

---

## Выполнено

| Этап | Статус | Кратко |
|------|--------|--------|
| 0 | Готово | [MVP-SCOPE.md](./MVP-SCOPE.md) |
| 1 | Готово | Меню GoNext, маршруты, `ScreenShell`, все основные экраны заведены |
| 2 | Готово | `expo-sqlite`, миграция v1, репозитории, `DatabaseProvider` |
| 3 | Готово (приёмка в Expo Go) | `places/index`, `form`, `[id]`; координаты **одним полем**; «На карте»; FAB с учётом safe area |
| 4 | Готово (приёмка в Expo Go) | `trips/index`, `form`, `[id]` — маршрут, текущая поездка, заметки визита |
| 5 | Готово (приёмка в Expo Go) | `/next-place` — текущая поездка, навигатор, отметка посещения |
| 6 | Готово (приёмка в Expo Go) | `PhotoGallery`, галерея и камера на телефоне **работают** (подтвердил пользователь 2026-11-26) |
| 7 | Готово (код) | `/phrases` — 10 фраз из `travelPhrases.ts`, проверка длины; приёмка на телефоне — по чеклисту этапа 9 |
| 8 | Готово (код) | `settings.tsx`: о приложении, офлайн, SDK, счётчики БД; `expo-doctor` — без замечаний |
| 9 | Частично | Чеклист в README; сквозной прогон на телефоне — за пользователем |

---

## Осталось (MVP)

По [PLAN.md](./PLAN.md): **7**; **8**; **9**. Этап 10 — вне MVP.

Заглушек в основных экранах **нет**. `settings.tsx` — минимальный экран «О приложении» без сброса БД.

---

## Важные файлы

| Область | Пути |
|---------|------|
| Маршруты | `src/app/` (`index`, `places/*`, `trips/*`, `next-place`, `phrases`, `settings`, `_layout.tsx`) |
| БД | `src/db/migrate.ts`, `constants.ts`, `rows.ts`, `json.ts` |
| Репозитории | `src/repositories/places.ts`, `trips.ts`, `tripPlaces.ts` |
| Фото | `src/photos/storage.ts`, `picker.ts`; `src/components/PhotoGallery.tsx` |
| SQLite / web | `src/components/DatabaseProvider.tsx` |
| Типы | `src/types/entities.ts` |
| UI | `src/components/ScreenShell.tsx`, `RootNavigator.tsx` |
| Утилиты | `src/utils/coordinates.ts`, `maps.ts`, `dates.ts` |
| Фразы | `src/constants/travelPhrases.ts`, `src/constants/screen.ts` |
| Metro (web) | `metro.config.js` |
| Конфиг | `app.json` (плагины: router, icons, splash, sqlite, **image-picker**) |
| Заметки пользователя | [FOR_ME.md](./FOR_ME.md) |

**Фон:** `assets/backgrounds/gonext-bg.png` — **в UI не подключён**.

---

## Технические решения (актуальные)

- Навигация: один `Stack`, `headerShown: false`, `ScreenShell` + Paper `Appbar`.
- SQLite: `DatabaseProvider` с **`useSuspense`**, на web — отложенная инициализация (`document`); `PaperProvider` **снаружи** `DatabaseProvider`.
- **Web:** из `app.json` убран `"web.output": "server"` (SSR ломал Paper/SQLite). Для отладки web — `metro.config.js` (wasm + COOP/COEP).
- Координаты: в БД `latitude`/`longitude`; в форме **одна строка** `широта, долгота` (`parseOptionalCoordinatePair`).
- Карты: `openPlaceOnMap` — на web всегда HTTPS Google Maps; `openPlaceInNavigator` для маршрута.
- Фото: относительные пути в `photos_json`; файлы в `documentDirectory` + `gonext-photos/{places|trip-visits}/{id}/`; копирование с **fallback base64** для Android `content://`.
- FAB: `fabBottomInset` / `listBottomInsetForFab` в `screen.ts` (+ запас **48dp** на Android, если safe area = 0).
- Paper v6: `Button` — `tonal`/`filled`; `TextInput` — `variant="outlined"`.
- Туннель (ПК и телефон в разных сетях): `npx expo start --tunnel ngrok --clear` (`@expo/ngrok` в devDependencies).
- Пакеты SDK 58 (пример): `expo ~58.0.26`, `expo-sqlite ~58.0.18`, `expo-image-picker`, `expo-file-system`.

---

## Требования пользователя (из диалога)

- Русский язык; PowerShell; коммиты **только по запросу**.
- Разные сети ПК/телефона → **ngrok-туннель**.
- **Expo Go:** сканер QR часто даёт «scan failed» → **ручной URL** из строки `Metro:` в терминале или QR с `http://localhost:8081` на ПК.
- USB-вариант: `npx expo start --localhost --clear` + `adb reverse tcp:8081 tcp:8081`, в Expo Go: `exp://127.0.0.1:8081`.
- Пользователь **Алексей**; актуальный UI — меню **GoNext**, не демо-Home.

---

## Известные проблемы и нерешённое

1. **ExpoSQLite** в Expo Go на Android — в старых сессиях; после `expo install --fix` статус на устройстве **не зафиксирован**. Запас: dev build (EAS).
2. **Web SQLite:** Fast Refresh → OPFS `createSyncAccessHandle` — **F5**; экран ошибки с «Обновить страницу».
3. **QR в Expo Go:** предпочитать ручной `exps://…` или QR с веб-страницы Metro.
4. Плагин `expo-image-picker` в `app.json` — для **своей** сборки; в **Expo Go** права настраиваются для приложения **Expo Go**.
5. **Фото на web** в MVP не поддерживается (подсказка в picker); целевая платформа — телефон.

---

## Противоречия / что сверить

- [PLAN.md](./PLAN.md) вводный абзац и таблица этапов **отстают** от кода (реализованы 3–6).
- Этап 9: финальная приёмка MVP на устройстве пользователем ещё не зафиксирована в этом файле.
- Этапы **3–6** приняты пользователем на телефоне (2026-11-26).

---

## Конкретный следующий шаг

1. **Этап 9** — сквозной прогон чеклиста из [README.md](./README.md) на телефоне (Expo Go); при багах — точечные правки.
2. После приёмки этапа 9 — отметить в этом файле и при необходимости обновить FOR_ME.
3. Этап 10 и фон `gonext-bg.png` — вне MVP, только по запросу.

---

## PROMPT FOR NEW CURSOR CHAT

```text
Ты продолжаешь проект GoNext (c:\Cursor\GoNext) — офлайн «Дневник туриста» на Expo SDK 58, Expo Router, React Native Paper 6, expo-sqlite.

Обязательно в начале работы:
1. Прочитай AGENT_HANDOFF.md, PROJECT.md и PLAN.md (не доверяй устаревшей шапке PLAN.md про «демо Home»).
2. Просмотри package.json, src/app/_layout.tsx, src/components/DatabaseProvider.tsx и экраны в src/app/.
3. Учти AGENTS.md и пользовательские правила: русский язык, PowerShell, коммиты только по запросу, npx expo install для нативных пакетов, перед завершением — npx tsc --noEmit и npx expo lint.

Контекст из handoff:
- Этапы **0–6** закрыты (приёмка 3–6 на телефоне в Expo Go подтверждена пользователем 2026-11-26).
- Следующий плановый объём: этап 7 (довести «Выражения»), 8 (настройки/полировка), 9 (сквозная приёмка MVP).
- /phrases частично закрывает этап 7.
- Туннель для разных сетей: npx expo start --tunnel ngrok --clear. QR часто не работает — ручной Metro URL (exps://…).
- Web: без web.output server; SQLite через DatabaseProvider + useSuspense.
- assets/backgrounds/gonext-bg.png в UI не используется.

Задача: по умолчанию — этапы 7–9; не переделывай 0–2 без запроса; не выдумывай факты, сверяй репозиторий.
```