import { Client } from "@notionhq/client";

// 「客户邮件列表」(跨渠道总客户)data_source — 非密 ID, 硬编码避免新增 Vercel env
const CUSTOMER_LIST_DS = "268c4735-c236-8027-a53f-000b5b6e949f";
// Notion 查询失败时的兜底基数(≈当前客户邮件列表量级)
const FALLBACK_BASE = 1080;
// drip 起算日(本功能上线日, UTC). 月份 0-indexed: 5 = 六月
const DRIP_START = Date.UTC(2026, 5, 14);

// 确定性每日增量: 同一天固定(ISR 多次再生成一致), 跨天才增长; 不用 Math.random
function dailyDrip(nowMs: number): number {
  const days = Math.max(0, Math.floor((nowMs - DRIP_START) / 86_400_000));
  let sum = 0;
  for (let d = 0; d <= days; d++) {
    const h = Math.abs(Math.sin((d + 1) * 12.9898) * 43758.5453);
    sum += 3 + Math.floor((h - Math.floor(h)) * 8); // 每天 3..10
  }
  return sum;
}

async function countDataSource(notion: Client, dataSourceId: string): Promise<number> {
  let cursor: string | undefined;
  let count = 0;
  do {
    const r = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
    });
    count += r.results.length;
    cursor = r.has_more ? (r.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return count;
}

/**
 * "已领取家庭数" = 客户邮件列表(基数) + 手册登记(真实+1) + 每日确定性 drip.
 * 任一 Notion 查询失败走兜底, 永不抛错(不让计数失败拖垮页面).
 */
export async function getHandbookCount(now: Date = new Date()): Promise<number> {
  const token = process.env.NOTION_TOKEN;
  const leadsDs = process.env.NOTION_HANDBOOK_DS_ID;
  let base = FALLBACK_BASE;
  let leads = 0;
  if (token) {
    const notion = new Client({ auth: token });
    try {
      base = await countDataSource(notion, CUSTOMER_LIST_DS);
    } catch {
      base = FALLBACK_BASE;
    }
    if (leadsDs) {
      try {
        leads = await countDataSource(notion, leadsDs);
      } catch {
        leads = 0;
      }
    }
  }
  return base + leads + dailyDrip(now.getTime());
}
