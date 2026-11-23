# AGENT_HANDOFF.md

Документ для передачи контекста между чатами Cursor. Детали требований и плана — в [PROJECT.md](./PROJECT.md) и [PLAN.md](./PLAN.md). Границы MVP — в [MVP-SCOPE.md](./MVP-SCOPE.md).

**Обновлено:** 2026-11-19 (по истории диалога; сверить с репозиторием при продолжении).

---

## Кратко о проекте

**GoNext** — офлайн мобильное приложение «Дневник туриста» (React Native, Expo SDK 58, Expo Router, React Native Paper 6 alpha, локальный SQLite). Рабочая папка: `c:\Cursor\GoNext`.

Язык UI: русский. Коммиты — по-русски. Команды в PowerShell. Перед завершением задач: `npx tsc --noEmit`, `npx expo lint`.

---

## Текущая задача и этап PLAN.md

- **Этап 3 (Места)** — **требует проверки** (код есть, приёмка на устройстве не подтверждена; мешала ошибка SQLite в Expo Go).
- **После проверки этапа 3:** плановый следующий этап — **4 — «Поездки»** (PLAN.md §4.2).
- **PLAN.md** в шапке (строка про «демо Home») **устарела** — не ориентироваться на неё; опираться на этот файл и структуру `src/`.

---

## Выполнено

| Этап | Статус | Кратко |
|------|--------|--------|
| 0 | Готово | [MVP-SCOPE.md](./MVP-SCOPE.md), 10 фраз, чеклист in/out |
| 1 | Готово | Меню GoNext, маршруты, `ScreenShell`, заглушки → частично заменены |
| 2 | Готово | `expo-sqlite`, миграция v1, репозитории, `SQLiteProvider` |
| 3 | **Требует проверки** | В репозитории: CRUD/UI «Места» (`places/*`, утилиты карт); на телефоне не принят |
| 7 | Частично | Экран `/phrases` уже показывает 10 фраз из константы (без доработки по этапу 7 формально) |
| 4–6, 8–9 | Не сделано | Поездки, следующее место, фото, полировка, приёмка |

Дополнительно в этом чате (не по PLAN): минимальный демо-Home заменён; туннель ngrok; `metro.config.js` для web+SQLite; приветствие менялось на «Алексей» (сейчас главное меню, не демо).

---

## Осталось (MVP)

По [PLAN.md](./PLAN.md): **проверить и закрыть этап 3**; затем этапы **4** (Поездки), **5** (Следующее место), **6** (фото), **7** (довести «Выражения» по чеклисту этапа), **8**, **9**. Этап 10 — вне MVP.

Экраны-заглушки: `src/app/trips/*`, `src/app/next-place.tsx` (текст про будущие этапы).

---

## Важные файлы

| Область | Пути |
|---------|------|
| Маршруты | `src/app/` (`index`, `places/*`, `trips/*`, `next-place`, `phrases`, `settings`, `_layout.tsx`) |
| Корень / БД | `src/db/migrate.ts`, `constants.ts`, `rows.ts`, `json.ts` |
| Репозитории | `src/repositories/places.ts`, `trips.ts`, `tripPlaces.ts` |
| Типы | `src/types/entities.ts` |
| UI-обёртки | `src/components/ScreenShell.tsx`, `RootNavigator.tsx` |
| Утилиты | `src/utils/coordinates.ts`, `maps.ts` |
| Фразы | `src/constants/travelPhrases.ts` |
| Metro (web) | `metro.config.js` |
| Конфиг Expo | `app.json` (плагины: router, material-design-icons, splash, expo-sqlite) |

**Заметка:** в репозитории есть `assets/backgrounds/gonext-bg.png` — в переписке интеграция в UI не описана; **проверить**, подключён ли фон в коде.

---

## Технические решения

- Навигация: один `Stack`, `headerShown: false`, общий `Appbar` в `ScreenShell`.
- SQLite: `SQLiteProvider` + `onInit={migrateDatabase}` в `_layout.tsx`; БД `gonext.db`, `PRAGMA user_version = 1`.
- Координаты: `latitude` / `longitude` в БД; UI — «широта/долгота (DD)».
- Фото: JSON-массив путей в `photos_json`; галерея — этап 6, на экране места заглушка.
- Paper v6: у `Button` режим `tonal` (не `contained`); у `TextInput` — `variant="outlined"` (не `mode`).
- Туннель: для ngrok без аккаунта Expo — `npx expo start --tunnel ngrok`; `@expo/ngrok` в **devDependencies** (глобальная установка на Windows с кириллицей в профиле ломается).
- Официальный туннель: `npx expo login` → `npx expo start --tunnel`.

---

## Требования пользователя (из диалога)

- Отвечать по-русски; примеры команд — PowerShell.
- Коммиты только по явной просьбе.
- Разработка по [PROJECT.md](./PROJECT.md) и [PLAN.md](./PLAN.md); AGENTS.md в корне — правила Expo.
- Телефон и ПК часто в **разных сетях** — нужен туннель (ngrok).
- Пользователь **Алексей** (имя упоминалось в раннем демо; актуальный UI — меню GoNext).

---

## Известные проблемы и нерешённое

1. **`Cannot find native module 'ExpoSQLite'`** на Android в Expo Go при успешном `Android Bundled`. Пользователь сообщал: Client **58.0.5**, Supported SDK **58**. Выполнено на ПК: `npx expo install --fix` → **expo ~58.0.25**. **Не подтверждено**, что ошибка исчезла после перезапуска и очистки кэша.
   - Сопутствующие WARN «missing default export» — каскад от падения `_layout`.
   - Если не помогает: обновить Expo Go до **58.0.7**, очистить данные приложения; запасной путь — **development build** (EAS).
2. **Web:** без `metro.config.js` был чёрный экран (wasm); с конфигом — меню открывается.
3. **Туннель:** если в терминале нет `Android Bundled` — телефон не достучался до Metro (сеть/ngrok), не версия SDK.
4. Плагин `@react-native-vector-icons/material-design-icons` в `app.json` — для нативных сборок; в Expo Go иконки Paper часто через Expo, но плагин оставлен.

---

## Противоречия / что сверить

- [PLAN.md](./PLAN.md) вводный абзац не отражает текущий код.
- Этап 7 в плане «не начат», но `/phrases` уже с полным списком — при завершении этапа 7 отметить в плане или handoff.
- **Этап 3 не закрыт:** приёмка на реальном устройстве (сценарии PLAN.md этап 3) не выполнена или не зафиксирована.

---

## Конкретный следующий шаг

1. **Проверить этап 3** на телефоне (или web): запуск без `ExpoSQLite`, CRUD мест, карта, удаление — по чеклисту PLAN.md этап 3.
2. Убедиться, что приложение **стабильно стартует** (SQLite / Expo Go или dev build).
3. После закрытия этапа 3 — **PLAN.md этап 4**: UI поездок поверх `repositories/trips.ts` и `tripPlaces.ts`.
4. Не переделывать этапы 0–2 без запроса; этап 3 при провале приёмки — доработать, не считать завершённым.

---

## PROMPT FOR NEW CURSOR CHAT

```text
Ты продолжаешь проект GoNext (c:\Cursor\GoNext) — офлайн «Дневник туриста» на Expo SDK 58, Expo Router, React Native Paper 6, expo-sqlite.

Обязательно в начале работы:
1. Прочитай AGENT_HANDOFF.md, PROJECT.md и PLAN.md (не доверяй устаревшей шапке PLAN.md про «демо Home»).
2. Просмотри package.json, src/app/_layout.tsx и состояние экранов в src/app/.
3. Учти AGENTS.md и пользовательские правила: русский язык, PowerShell, коммиты только по запросу, npx expo install для нативных пакетов, перед завершением — npx tsc --noEmit и npx expo lint.

Контекст из handoff:
- Этапы 0–2 закрыты; этап 3 (Места) — код есть, но **требует проверки** на устройстве, не считать готовым.
- Экран /phrases частично закрывает этап 7.
- После приёмки этапа 3 — этап 4 (Поездки). Заглушки: src/app/trips/*, next-place.tsx.
- Есть нерешённый риск: ExpoSQLite в Expo Go на Android — сверить, работает ли сейчас; при необходимости EAS development build.
- Туннель для телефона в другой сети: npx expo start --tunnel ngrok --clear (@expo/ngrok в devDependencies).
- В assets/backgrounds/gonext-bg.png — проверь, используется ли в UI.

Задача: сначала помоги проверить/закрыть этап 3, если пользователь не указал иначе; затем этап 4. Этапы 0–2 не переделывать без запроса. Не выдумывай факты; при сомнениях проверь репозиторий.
```