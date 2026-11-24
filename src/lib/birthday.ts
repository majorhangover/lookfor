const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const pad = (n: number) => String(n).padStart(2, "0");

function validDay(month: number, day: number) {
  return month >= 1 && month <= 12 && day >= 1 && day <= new Date(2000, month, 0).getDate();
}

/**
 * Turn whatever was typed or suggested into a stored birthday:
 * "MM-DD" when the day is known, "MM" when only the month is. No year is kept.
 * Understands "11-24", "24/11", "24 Nov", "November 24th", "today", "tomorrow",
 * a month name, and the older "YYYY-MM" format. Returns null if it can't tell.
 */
export function normaliseBirthday(input: string, now = new Date(), allowRelative = true): string | null {
  const s = input.trim().toLowerCase().replace(/(\d)(st|nd|rd|th)\b/g, "$1").replace(/,/g, " ");
  if (!s) return "";
  if (allowRelative && (s === "today" || s === "tomorrow")) {
    const d = new Date(now);
    if (s === "tomorrow") d.setDate(d.getDate() + 1);
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  let m = /^(\d{1,2})-(\d{1,2})$/.exec(s); // MM-DD
  if (m && validDay(+m[1], +m[2])) return `${pad(+m[1])}-${pad(+m[2])}`;
  m = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(s); // YYYY-MM or YYYY-MM-DD
  if (m && +m[2] >= 1 && +m[2] <= 12) return m[3] && validDay(+m[2], +m[3]) ? `${pad(+m[2])}-${pad(+m[3])}` : pad(+m[2]);
  m = /^(\d{1,2})[/.](\d{1,2})(?:[/.]\d{2,4})?$/.exec(s); // DD/MM(/YYYY), UK order
  if (m && validDay(+m[2], +m[1])) return `${pad(+m[2])}-${pad(+m[1])}`;
  const monthIn = (word: string) => MONTHS.findIndex((x) => word.startsWith(x)) + 1;
  m = /^(\d{1,2})\s+(?:of\s+)?([a-z]+)(?:\s+\d{4})?$/.exec(s); // 24 Nov
  if (m && monthIn(m[2]) && validDay(monthIn(m[2]), +m[1])) return `${pad(monthIn(m[2]))}-${pad(+m[1])}`;
  m = /^([a-z]+)\s+(\d{1,2})(?:\s+\d{4})?$/.exec(s); // November 24
  if (m && monthIn(m[1]) && validDay(monthIn(m[1]), +m[2])) return `${pad(monthIn(m[1]))}-${pad(+m[2])}`;
  m = /^([a-z]+)$/.exec(s); // November
  if (m && monthIn(m[1])) return pad(monthIn(m[1]));
  m = /^(\d{1,2})$/.exec(s); // month number
  if (m && +m[1] >= 1 && +m[1] <= 12) return pad(+m[1]);
  return null;
}

/** "24 November", or "November" when only the month is known. */
export function formatBirthday(stored: string): string {
  // Saved values are never relative: an old "today" must not move with the calendar.
  const v = normaliseBirthday(stored, new Date(), false);
  if (!v) return stored;
  const [month, day] = v.split("-").map(Number);
  const name = new Date(2000, month - 1, 1).toLocaleString("en-GB", { month: "long" });
  return day ? `${day} ${name}` : name;
}

/** Days until the next birthday (0 = today), or months when only the month is known. */
export function nextBirthday(stored: string, now = new Date()): { daysAway: number | null; monthsAway: number } | null {
  const v = normaliseBirthday(stored, now, false);
  if (!v) return null;
  const [month, day] = v.split("-").map(Number);
  const monthsAway = (month - 1 - now.getMonth() + 12) % 12;
  if (!day) return { daysAway: null, monthsAway };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), month - 1, day);
  if (next < today) next = new Date(now.getFullYear() + 1, month - 1, day);
  return { daysAway: Math.round((next.getTime() - today.getTime()) / 86400000), monthsAway };
}

/** The year from a typed date of birth such as "24/11/2015" or "24 Nov 2015", or "" if none. */
export function birthYearFrom(input: string, now = new Date()): string {
  const m = /\b(19\d{2}|20\d{2})\b/.exec(input);
  if (!m) return "";
  return +m[1] <= now.getFullYear() ? m[1] : "";
}

/** Age today from a year of birth and a stored "MM-DD" birthday (month-only counts as the 1st). */
export function ageFrom(birthYear: string | undefined, stored: string, now = new Date()): number | null {
  if (!birthYear) return null;
  const v = normaliseBirthday(stored, now, false);
  let age = now.getFullYear() - +birthYear;
  if (v) {
    const [month, day] = v.split("-").map(Number);
    if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < (day || 1))) age -= 1;
  }
  return age >= 0 && age < 130 ? age : null;
}

/** The age to show: worked out from the date of birth when we have the year, otherwise as typed. */
export function displayAge(p: { age: string; birthday: string; birthYear?: string }, now = new Date()): string {
  const a = ageFrom(p.birthYear, p.birthday, now);
  return a === null ? p.age : String(a);
}
