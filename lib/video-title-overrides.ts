// 繁体视频标题的人工覆盖表 (key = YouTube video_id).
//
// 视频标题原文来自 YouTube, 是简体. 繁体站默认用 toTraditional() 机器转繁,
// 对绝大多数标题没问题, 但"一对多"简体字和专有名词偶有误判.
// 在这里手工修正这些个例即可. 校对发现新错误时, 往下加一行.
//
// 注意: 这个文件不会被 refresh:videos 脚本覆盖, 是安全的人工层.
export const VIDEO_TITLE_OVERRIDES: Record<string, string> = {
  // "复活"=restore 应为 復活, 机器误转成 複活 (复制/复杂之意)
  Eff5kdJTBRU: "AI 能復活親人？前提是你得給家人留點“料”",
  // "姜昆"是相声演员的人名, 姜不应转成薑(生姜)
  K5eRvjn45Uo:
    "🇨🇦我與姜昆老師🇺🇸 #加拿大生活 #姜昆 #郭德綱 #溫哥華三木 @yyds3mu #老藝術家",
};
