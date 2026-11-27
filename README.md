# GoNext

Офлайн мобильное приложение **«Дневник туриста»**: справочник мест, планирование поездок, отметки посещений, фото, экран «Следующее место» и шпаргалка из 10 английских фраз.

Стек: **Expo SDK 58**, **Expo Router**, **React Native Paper 6**, **expo-sqlite**. Данные только на устройстве.

Подробнее: [PROJECT.md](./PROJECT.md), план этапов — [PLAN.md](./PLAN.md), границы MVP — [MVP-SCOPE.md](./MVP-SCOPE.md).

## Требования

- Node.js (LTS)
- Телефон с **Expo Go** (Android / iOS) или эмулятор
- Для разных сетей ПК и телефона — туннель ngrok (см. ниже)

## Запуск (PowerShell)

```powershell
cd c:\Cursor\GoNext
npm install
npx expo start
```

Откройте проект в Expo Go (QR или ручной URL из строки `Metro:` в терминале).

### Туннель (ПК и телефон в разных сетях)

```powershell
npx expo start --tunnel ngrok --clear
```

Если сканер QR в Expo Go выдаёт ошибку — введите вручную адрес вида `exps://…` из вывода Metro или откройте QR со страницы `http://localhost:8081` на ПК.

### USB (Android)

```powershell
npx expo start --localhost --clear
adb reverse tcp:8081 tcp:8081
```

В Expo Go: `exp://127.0.0.1:8081`.

### Web (только отладка UI)

```powershell
npx expo start --web
```

SQLite на web может требовать полное обновление страницы (F5) после Fast Refresh. Фото на web в MVP не поддерживаются — целевая платформа телефон.

## Проверка перед релизом / приёмкой

```powershell
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

## Чеклист приёмки MVP (этап 9)

1. Создать 3 места → открыть одно на карте (нужны координаты).
2. Создать поездку, добавить 4 места, изменить порядок.
3. Назначить поездку текущей → «Следующее место» показывает первое невизитированное.
4. Отметить посещение, заметку и фото → «Следующее место» переключается.
5. «Выражения» — 10 пар EN/RU, без сети.
6. Перезапуск приложения — данные на месте.

## Структура

- `src/app/` — маршруты Expo Router (экраны)
- `src/db/`, `src/repositories/` — SQLite и доступ к данным
- `src/constants/travelPhrases.ts` — 10 фраз для «Выражений»
- `src/photos/` — локальное хранение снимков

Передача контекста между сессиями Cursor: [AGENT_HANDOFF.md](./AGENT_HANDOFF.md).