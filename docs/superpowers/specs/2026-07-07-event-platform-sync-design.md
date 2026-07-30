# 活动发布工具 + Eventbrite 同步 · 设计与现状

日期: 2026-07-07

目标: 把活动发布固定为 Notion -> sanmu.ca -> 外部分发的单一流程。Notion 是唯一 source of record; `sanmu.ca` 是官方活动页和主引流目标; Eventbrite 只做活动发现、外链和品牌分发。

## 已定决策

| 项 | 决策 |
|---|---|
| 活动 SoR | Notion Events 库 `d5b3cb57-7b27-4acd-b936-ae2ca6f275f1` |
| 官网路径 | `https://www.sanmu.ca/events/{slug}`; 繁体页为 `/zh-Hant/events/{slug}` |
| 发布时间 | v1 手动命令, 不上 cron |
| 活动时间 | Notion `日期` 必须是带 start/end datetime 的 date range, 同日活动允许 |
| 外部语言 | Eventbrite 创建 1 个活动；标题用简体主标题, 描述增加英文可读信息 |
| Eventbrite ticket | 允许创建 1 个免费票种, 因 Eventbrite live 发布强制要求 ticket |
| sanmu.ca 链接 | 必须出现在 Eventbrite 活动描述中文段、英文段、ticket 描述里 |
| 平台字段 | Eventbrite 状态 + ID + URL + 错误 + 同步时间 |
| Luma | API 需要订阅, v1 移除 |

注意: 允许 Eventbrite 免费 ticket 后, Eventbrite 页面本身会有 RSVP/取票入口, 因此它不再是严格意义上的“sanmu.ca 唯一报名入口”。当前业务取舍是: 保留 sanmu.ca 为官方入口和外链目标, 同时用 Eventbrite ticket 满足平台 live 发布要求。

## 当前 SOP

1. 在 Notion Events 库创建/更新简体和繁体两条活动记录, 同一 `Slug`。
2. `日期` 必须包含开始和结束时间, 例如 `2026-07-26T11:00:00-07:00` 到 `2026-07-26T19:00:00-07:00`。
3. 先 dry-run:

```bash
npm run events:publish -- --slug <event-slug> --dry-run
```

4. 检查 payload 里 Eventbrite 活动描述和 ticket 描述都含 `https://www.sanmu.ca/events/{slug}`。
5. 真实发布:

```bash
npm run events:publish -- --slug <event-slug>
```

6. 脚本会:
   - 校验 Notion 同步字段;
   - 读取该 slug 的简体/繁体页面;
   - 优先复用已有 `Eventbrite ID`, 防止重复建活动;
   - 创建/复用 Eventbrite 活动;
   - 确保至少有一个免费 ticket class;
   - 调用 Eventbrite publish endpoint;
   - 回写两个 Notion locale 页面里的 Eventbrite ID/URL/状态/错误/同步时间。

## 平台事实

### Eventbrite

- `POST https://www.eventbriteapi.com/v3/organizations/{org_id}/events/` 可以创建活动 draft。
- `POST https://www.eventbriteapi.com/v3/events/{event_id}/publish/` 发布 live 时必须已有 ticket class; 否则返回 `event.tickets - MISSING`。
- Eventbrite datetime 的 `utc` 字段必须是 `YYYY-MM-DDThh:mm:ssZ`, 不能带 JavaScript 默认的 `.000Z`。
- `event.locale: "zh_CN"` 会被 Eventbrite API 拒绝, v1 不传 locale。
- 当前脚本创建免费票:
  - `name`: `免费入场 / RSVP`
  - `free`: `true`
  - `quantity_total`: `2000`
  - `description`: `官方活动页 / Official event page: https://www.sanmu.ca/events/{slug}`
  - `sales_end`: 活动结束时间

### Luma

- 由于 API 访问需要订阅, 当前活动发布工具不接入 Luma。
- 后续只有在 Luma 免费/低成本 API 能稳定创建 external event, 且业务上仍然值得维护时, 才重新评估。

### 论坛

- 论坛和本地中文信息站暂不做 API 自动发布。
- Vansky 有 `社团活动` 分类、`发个人免费广告`/`发商业广告`入口, 也有论坛 `活动专区`; 更适合做半自动发布包。
- 未找到 Vansky/VanPeople/Westca/YorkBBS 的公开发帖 API。网页自动发帖会受账号、验证码、版规和反垃圾策略影响, 不适合作为可靠 SOP。
- 后续如果要做, 优先加 `events:forum-kit`: 从 Notion 生成标题、正文、短版、标签、图片 URL、sanmu.ca 链接, 由运营人员人工贴到论坛。

## Notion 字段

Events 库需要这些字段:

| 字段 | 类型 | 选项/说明 |
|---|---|---|
| 平台同步状态 | select | 不发布 / 待同步 / 已同步 / 部分失败 / 失败 |
| Eventbrite ID | rich_text | 平台返回 id |
| Eventbrite URL | url | Eventbrite event URL |
| Eventbrite 同步状态 | select | 未同步 / 已同步 / 失败 |
| 平台同步错误 | rich_text | 最近一次同步错误摘要 |
| 平台同步时间 | date | 最近一次同步完成时间 |

Luma 字段已经删除, 不要再加回 v1。

## 环境变量

| 变量 | 用途 |
|---|---|
| NOTION_TOKEN | 读取/回写 Events 库 |
| EVENTBRITE_TOKEN | Eventbrite personal/OAuth token；脚本也兼容 `EVENTBRITE_API_KEY` 和既有 `Eventbrite_API_Key` |
| EVENTBRITE_ORG_ID | 可选；账号下只有一个 organization 时自动读取 |
| EVENTBRITE_API_BASE_URL | 可选, 默认 `https://www.eventbriteapi.com` |

当前已验证账号下 organization:

| Organization | ID |
|---|---|
| Sanmu Media | `3007509900725` |

## 2026 泼水节发布记录

| 项 | 值 |
|---|---|
| Slug | `vancouver-water-splashing-festival-2026` |
| 官网 | `https://www.sanmu.ca/events/vancouver-water-splashing-festival-2026` |
| Eventbrite ID | `1993496889861` |
| Eventbrite URL | `https://www.eventbrite.ca/e/2026-18-tickets-1993496889861` |
| Eventbrite status | `live` |
| Ticket ID | `3440703179` |
| Ticket name | `免费入场 / RSVP` |
| Ticket free | `true` |
| Ticket quantity | `2000` |
| Notion zh-Hans page | `396c4735-c236-8168-bb95-cc5548e38a8d` |
| Notion zh-Hant page | `396c4735-c236-8138-bdb0-dfa402443630` |
| Notion sync status | 两个 locale 页面均为 `已同步`, 错误字段为空 |

API 复核结果:

- Eventbrite event status: `live`
- Eventbrite event description contains `sanmu.ca`: yes
- Eventbrite ticket description contains `sanmu.ca`: yes

## 验收

- 缺 `--slug`、Notion 找不到活动、缺 start/end datetime、缺同步字段时, 命令直接失败并说明原因。
- `--dry-run` 输出 Eventbrite event payload, 且 event description 中必须出现 `https://www.sanmu.ca/events/{slug}`。
- Eventbrite ticket payload 必须包含 `sanmu.ca` 链接。
- Eventbrite 已有 ID 时, 重跑不重复创建活动。
- 成功后回写 Eventbrite ID/URL/状态、总状态和同步时间。
- 失败时保留已创建的 Eventbrite ID/URL, 总状态为 `失败`, 错误写入 `平台同步错误`。
- 官网活动列表/详情页能显示 Notion date range 的时间段。
