/**
 * 事务信(手册 / 活动确认)的发件地址.
 *
 * 单独成文件是为了跨 server/client 边界: lib/email.ts 依赖 Resend 与 fs,
 * 客户端组件引不动, 而报名成功页要把这个地址显示给用户去垃圾箱里找。
 *
 * 改 Resend 发件域名时只改这一行 —— 但记得同步 Resend 后台的域名验证与
 * DNS 记录, 代码改了而域名没验证会直接发信失败。
 */
export const SENDER_EMAIL = "shouhou@updates.sanmu.ca";
