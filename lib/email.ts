import { Resend } from "resend";
import { readFile } from "fs/promises";
import path from "path";

const FROM = "三木有话说 <shouhou@sanmu.ca>";
const REPLY_TO = "info@sanmu.ca";
const PDF_PATH = path.join(process.cwd(), "private", "handbook-v2.7.pdf");

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 未设置");
  return new Resend(key);
}

function emailText(name: string): string {
  return `${name}，您好：

这是您索取的《身后事安心手册》v2.7 —— 8 份文档、80+ 页、针对加拿大场景。附件 PDF 请查收。

这份手册是我做殡葬师 16 年里，看到家属反复踩的坑、被错误信息坑过的钱、错过的政府福利窗口，整理成的清单、模板和流程图。希望您永远用不到，但需要时它已经在您抽屉里。

手册内容仅供参考，不构成法律 / 医疗 / 金融建议，具体事务请咨询持牌专业人士。

有任何问题，直接回复这封邮件即可，我会亲自看。

三木`;
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
