export type DateParseResult =
  | { ok: true; value: string | null }
  | { ok: false; message: string };

/** Дата для отображения: `2026-11-20` → `20.11.2026`. */
export function formatDateDisplay(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const datePart = iso.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) {
    return iso;
  }
  const [, y, m, d] = match;
  return `${d}.${m}.${y}`;
}

export function formatTripDateRange(start: string | null, end: string | null): string {
  if (!start && !end) {
    return 'Без дат';
  }
  if (start && end) {
    return `${formatDateDisplay(start)} — ${formatDateDisplay(end)}`;
  }
  if (start) {
    return `с ${formatDateDisplay(start)}`;
  }
  return `до ${formatDateDisplay(end)}`;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Пустое поле или `YYYY-MM-DD` / `DD.MM.YYYY` → ISO-дата `YYYY-MM-DD` или `null`. */
export function parseOptionalIsoDate(input: string): DateParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  let year: number;
  let month: number;
  let day: number;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const ruMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
    if (!ruMatch) {
      return {
        ok: false,
        message: 'Дата: ГГГГ-ММ-ДД или ДД.ММ.ГГГГ (или пусто).',
      };
    }
    day = Number(ruMatch[1]);
    month = Number(ruMatch[2]);
    year = Number(ruMatch[3]);
  }

  if (!isValidCalendarDate(year, month, day)) {
    return { ok: false, message: 'Некорректная дата.' };
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return { ok: true, value: `${year}-${mm}-${dd}` };
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}