import { Resend } from "resend";
import { readFile } from "fs/promises";
import path from "path";

// 从已在 Resend 验证的子域名 updates.sanmu.ca 发信(根域名 sanmu.ca 未验证);
// 回信地址仍是 info@sanmu.ca(Reply-To 无需域名验证)。
const FROM = "三木有话说 <shouhou@updates.sanmu.ca>";
const REPLY_TO = "info@sanmu.ca";
const PDF_PATH = path.join(process.cwd(), "private", "handbook-v2.7.pdf");

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 未设置");
  return new Resend(key);
}

function emailText(name: string): string {
  return `${name}，您好：

我是三木有话说频道的小助理 Sunny，感谢您观看我们的 YouTube 视频！很高兴我们的内容对您有帮助。

关于您询问的身后事规划，我们给您准备了一份《身后事安心手册》，里面包含了遗嘱模板、政府福利申请指南等实用信息，都在附件里了，请查收。

在您收到《手册》后，请务必回到视频的评论区里留言说已收到。因为您在评论区的回复，会有机会帮助更多需要这份免费《手册》的人们。

这是一个通用的资料包，但请注意每个人的情况不同，建议您在使用前咨询专业的法律顾问，确保符合您所在地区的具体法律要求。

如果您觉得我们的内容有价值，也希望您能订阅我们的频道并留下评论，这对我们非常重要！

如果您就在大温居住的话，也可以直接给三木打电话咨询，他的手机是 778-828-6881。

请注意：本邮件由系统自动发送，请勿直接回复本邮件。如需联系我们，请发送邮件至 info@sanmu.ca。

祝好！

Sunny · 三木有话说 频道小助理

📞 电话/Phone: 778-828-6881
✉️ 邮箱/Email: info@sanmu.ca
💬 微信/WeChat: yyds3mu
📱 WhatsApp/LINE: 778-828-6881
🎥 YouTube: 三木有话说 @yyds3mu

温馨提示：以上为官方联系方式，请勿轻信其他渠道，谨防诈骗。`;
}

/** 发送带 PDF 附件的手册邮件. 失败会抛错(主路径, 由调用方处理). */
export async function sendHandbookEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  const pdf = await readFile(PDF_PATH);
  const { error } = await getResend().emails.send({
    from: FROM,
    to: [params.to],
    replyTo: REPLY_TO,
    subject: "您的《身后事安心手册》v2.7 来了",
    text: emailText(params.name),
    attachments: [{ filename: "身后事安心手册-v2.7.pdf", content: pdf }],
  });
  if (error) throw new Error(`Resend 发送失败: ${error.message}`);
}
