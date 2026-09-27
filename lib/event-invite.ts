// 名额已满后给个别客户开的私密报名链接: /events/<slug>/invite?code=<EVENT_INVITE_CODE>
// 口令只放在 Vercel 环境变量里 (仓库是公开的, 不能写死在代码里).
export function isValidEventInvite(code: string | null | undefined): boolean {
  const expected = process.env.EVENT_INVITE_CODE;
  return Boolean(expected) && code === expected;
}
