export function parseStringArrayJson(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function stringifyStringArray(values: string[]): string {
  return JSON.stringify(values);
}

export function boolFromSql(value: number): boolean {
  return value === 1;
}

export function boolToSql(value: boolean): number {
  return value ? 1 : 0;
}