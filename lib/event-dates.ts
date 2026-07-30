import type { Locale } from "@/lib/i18n";

export const EVENT_TIME_ZONE = "America/Vancouver";

function hasTime(iso: string): boolean {
  return iso.includes("T");
}

function weekdayLabel(day: number, locale: Locale): string {
  const labels =
    locale === "zh-Hant"
      ? ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
      : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return labels[day] ?? "";
}

function dateOnlyParts(isoDate: string) {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return { year, month, day };
}

function zonedParts(isoDateTime: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(isoDateTime));
  const get = (type: string) =>
    (parts.find((part) => part.type === type)?.value ?? "").trim();
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function formatDateParts(
  parts: { year: number; month: number; day: number },
  locale: Locale,
): string {
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
  return `${parts.year} 年 ${parts.month} 月 ${parts.day} 日（${weekdayLabel(weekday, locale)}）`;
}

function sameDate(
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number },
): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatEventDateLabel(
  startISO: string,
  endISO: string | null | undefined,
  locale: Locale,
): string {
  if (!startISO) return "";

  if (!hasTime(startISO)) {
    return formatDateParts(dateOnlyParts(startISO), locale);
  }

  const start = zonedParts(startISO);
  const startLabel = `${formatDateParts(start, locale)}${start.hour}:${start.minute}`;
  if (!endISO || !hasTime(endISO)) return startLabel;

  const end = zonedParts(endISO);
  if (sameDate(start, end)) {
    return `${formatDateParts(start, locale)}${start.hour}:${start.minute}-${end.hour}:${end.minute}`;
  }

  return `${startLabel} - ${formatDateParts(end, locale)} ${end.hour}:${end.minute}`;
}

function vancouverDateString(iso: string): string {
  if (!hasTime(iso)) return iso.slice(0, 10);
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: EVENT_TIME_ZONE,
  });
}

export function isEventPast(
  startISO: string,
  endISO?: string | null,
  now: Date = new Date(),
): boolean {
  if (!startISO) return false;
  const today = now.toLocaleDateString("en-CA", {
    timeZone: EVENT_TIME_ZONE,
  });
  return vancouverDateString(endISO || startISO) < today;
}
