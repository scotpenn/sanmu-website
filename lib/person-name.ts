const CJK_RE = /^[\p{Script=Han}·]+$/u;

/** 报名表的姓 + 名 → 写入 Notion「姓名」/ 邮件称呼. 中文连写(王小明), 其他按「名 姓」(Ming Wang). */
export function joinPersonName(lastName: string, firstName: string): string {
  if (CJK_RE.test(lastName) && CJK_RE.test(firstName)) return lastName + firstName;
  return `${firstName} ${lastName}`;
}
