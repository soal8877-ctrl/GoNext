/** Фиксированный список для экрана «Выражения» (MVP-SCOPE.md). */
export type TravelPhrase = {
  en: string;
  ru: string;
};

export const TRAVEL_PHRASES: TravelPhrase[] = [
  { en: 'Hello!', ru: 'Здравствуйте!' },
  { en: 'Thank you.', ru: 'Спасибо.' },
  { en: 'Excuse me.', ru: 'Извините.' },
  { en: 'Where is the bathroom?', ru: 'Где туалет?' },
  { en: 'How much does it cost?', ru: 'Сколько это стоит?' },
  { en: 'I need help.', ru: 'Мне нужна помощь.' },
  { en: "I don't understand.", ru: 'Я не понимаю.' },
  { en: 'Could you speak more slowly?', ru: 'Не могли бы вы говорить медленнее?' },
  { en: 'Where is the train station?', ru: 'Где вокзал?' },
  { en: 'Goodbye!', ru: 'До свидания!' },
];