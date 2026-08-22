/**
 * 生成活动确认信里的 .ics 日历附件 (RFC 5545).
 *
 * 刻意保持零依赖 + 纯函数, 这样能用 `node --test --experimental-strip-types` 直接单测.
 * 时间一律输出 UTC 绝对时间, 避开 VTIMEZONE 和时区库 —— 日历客户端自己转成本地时间显示.
 */

const DOMAIN = "sanmu.ca";
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

export type IcsEvent = {
  /** 稳定标识, 通常用 event slug. 同一活动重发不会在日历里变成两条 */
  uid: string;
  title: string;
  description: string;
  location: string | null;
  url: string;
  /** ISO 字符串; 纯日期(YYYY-MM-DD)会输出为全天事件 */
  start: string;
  end: string | null;
  /** 仅为可测性存在, 生产调用不传 */
  now?: Date;
};

/** RFC 5545 3.3.11: TEXT 值里的 \ ; , 和换行要转义, 冒号不用 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** 2026-09-27T17:00:00.000Z → 20260927T170000Z */
function utcStamp(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`;
}

/** 2026-07-26 → 20260726 */
function dateStamp(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

/** 全天事件的 DTEND 是排他的, 要取次日 */
function nextDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * RFC 5545 3.1: 单行超过 75 字节要折行, 续行以一个空格开头.
 * 按 UTF-8 字节数算, 且按码点推进, 保证不把汉字劈成两半.
 */
function foldLine(line: string): string {
  if (Buffer.byteLength(line, "utf8") <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75; // 续行开头的空格占 1 字节, 所以正文只剩 74
  for (const ch of line) {
    const size = Buffer.byteLength(ch, "utf8");
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
      limit = 74;
    }
    current += ch;
    bytes += size;
  }
  if (current) parts.push(current);
  return parts.join("\r\n ");
}

export function buildEventIcs(event: IcsEvent): string {
  const allDay = DATE_ONLY.test(event.start);

  let dtStart: string;
  let dtEnd: string;
  if (allDay) {
    const endDate = event.end && DATE_ONLY.test(event.end) ? event.end : event.start;
    dtStart = `DTSTART;VALUE=DATE:${dateStamp(event.start)}`;
    dtEnd = `DTEND;VALUE=DATE:${dateStamp(nextDay(endDate))}`;
  } else {
    const start = new Date(event.start);
    const end = event.end
      ? new Date(event.end)
      : new Date(start.getTime() + DEFAULT_DURATION_MS);
    dtStart = `DTSTART:${utcStamp(start)}`;
    dtEnd = `DTEND:${utcStamp(end)}`;
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Sanmu Media//sanmu.ca//ZH`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@${DOMAIN}`,
    `DTSTAMP:${utcStamp(event.now ?? new Date())}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
