// 加拿大身后事中英术语对照表数据.
//
// 定义分两层:
//   def*  = 权威定义编译 —— 主要来源: 加拿大联邦政府官方说明(canada.ca)、
//           安大略省殡葬监管局(BAO)官方术语表、BC 省《遗嘱、遗产与继承法》(WESA)
//           框架下的司法定义、世界卫生组织(WHO)。翻译成中文, 不在页面放外链。
//   note* = 三木 16 年实务经验的白话提示(可选), 页面上以浅色小字呈现。
//
// 简繁不是机械转换: hant/defHant/noteHant 按港台移民的习惯用词单独撰写
// (平安紙 / 骨灰龕位 / 墳場 / 紓緩治療 等), 与简体是两套词汇体系。

export type GlossaryTerm = {
  /** 英文术语 */
  en: string;
  /** 简体中文名称 */
  hans: string;
  /** 繁体中文名称 (港台习惯用词) */
  hant: string;
  /** 简体权威定义(编译) */
  defHans: string;
  /** 繁体权威定义(独立措辞) */
  defHant: string;
  /** 简体白话提示 */
  noteHans?: string;
  /** 繁体白话提示 */
  noteHant?: string;
  /** 相关 blog 内链 (href 不带 locale 前缀) */
  related?: { href: string; hans: string; hant: string };
};

export type GlossarySection = {
  id: string;
  titleEn: string;
  titleHans: string;
  titleHant: string;
  terms: GlossaryTerm[];
};

export const GLOSSARY_SECTIONS: GlossarySection[] = [
  {
    id: "legal",
    titleEn: "Legal & Documents",
    titleHans: "法律与文件",
    titleHant: "法律與文件",
    terms: [
      {
        en: "Will",
        hans: "遗嘱",
        hant: "遺囑（平安紙）",
        defHans:
          "在立遗嘱人身故后生效的法律文件，写明其遗产如何分配、由谁负责执行。加拿大由各省继承法（如 BC 省 WESA）规定有效遗嘱的形式要求。",
        defHant:
          "在立遺囑人身故後生效的法律文件，訂明其遺產如何分配、由誰負責執行，香港俗稱「平安紙」。加拿大由各省繼承法（如 BC 省 WESA）規定有效遺囑的形式要求。",
        noteHans: "各省要求不同，签署前先核对所在省的规定。",
        noteHant: "各省要求不同，簽署前先核對所在省的規定。",
        related: {
          href: "/blog/canada-will-8-pitfalls",
          hans: "加拿大遗嘱的 8 个大坑",
          hant: "加拿大遺囑的 8 個大坑",
        },
      },
      {
        en: "Executor",
        hans: "遗嘱执行人",
        hant: "遺囑執行人",
        defHans:
          "遗嘱中指定、负责收集遗产、清偿债务并按遗嘱条款分配财产的法定遗产代表人。",
        defHant:
          "遺囑中指定、負責收集遺產、清償債務並按遺囑條款分配財產的法定遺產代表人。",
        noteHans: "报税、卖房、关账户都由这个人签字推进，选人比选律师更重要。",
        noteHant: "報稅、賣樓、關戶口都由這個人簽字推進，選人比選律師更重要。",
        related: {
          href: "/blog/canada-will-4-things-before-lawyer",
          hans: "见律师前必须想清楚的 4 件事",
          hant: "見律師前必須想清楚的 4 件事",
        },
      },
      {
        en: "Probate",
        hans: "遗嘱认证",
        hant: "遺囑認證",
        defHans:
          "由省高等法院确认遗嘱有效、并正式授权执行人处理遗产的司法程序（BC 省由省最高法院依 WESA 办理）。",
        defHant:
          "由省高等法院確認遺囑有效、並正式授權執行人處理遺產的司法程序（BC 省由省最高法院依 WESA 辦理）。",
        noteHans: "银行等机构通常要看到认证文件才放行大额资产。",
        noteHant: "銀行等機構通常要見到認證文件才放行大額資產。",
      },
      {
        en: "Estate",
        hans: "遗产",
        hant: "遺產",
        defHans: "一个人身故时名下全部财产与负债的法律总称。",
        defHant: "一個人身故時名下全部財產與負債的法律總稱。",
        noteHans: "房产、存款、投资、保险、债务都算在内。",
        noteHant: "物業、存款、投資、保險、債務都計算在內。",
      },
      {
        en: "Beneficiary",
        hans: "受益人",
        hant: "受益人",
        defHans:
          "依据遗嘱、保险合同或注册账户（如 RRSP/TFSA）的指定，有权获得相应财产或赔付的人。",
        defHant:
          "依據遺囑、保險合約或註冊帳戶（如 RRSP/TFSA）的指定，有權獲得相應財產或賠付的人。",
        noteHans: "受益人指定要定期核对是否最新，尤其再婚或添丁之后。",
        noteHant: "受益人指定要定期核對是否最新，尤其再婚或添丁之後。",
      },
      {
        en: "Intestate",
        hans: "无遗嘱身故",
        hant: "無遺囑身故",
        defHans:
          "未留下有效遗嘱而身故的法律状态；遗产将按所在省继承法的法定顺序分配。",
        defHant:
          "未留下有效遺囑而離世的法律狀態；遺產將按所在省繼承法的法定順序分配。",
        noteHans: "分配结果不一定符合本人意愿，办理周期也明显更长。",
        noteHant: "分配結果未必符合本人意願，辦理周期亦明顯更長。",
      },
      {
        en: "Power of Attorney (POA)",
        hans: "授权书",
        hant: "持久授權書",
        defHans:
          "授权他人在本人在世期间代为处理财务与法律事务的法律文件（各省另有持续性/持久授权书制度）。",
        defHant:
          "授權他人在本人在生期間代為處理財務與法律事務的法律文件（各省另有持續性／持久授權書制度）。",
        noteHans: "人过世后授权书随即失效，之后的事由遗嘱执行人接手——很多家属在这一步扑空。",
        noteHant: "人離世後授權書隨即失效，之後的事由遺囑執行人接手——很多家屬在這一步撲空。",
      },
      {
        en: "Trust",
        hans: "信托",
        hant: "信託",
        defHans:
          "由受托人依信托条款为受益人持有并管理财产的法律关系。",
        defHant:
          "由受託人依信託條款為受益人持有並管理財產的法律關係。",
        noteHans: "常用于遗产规划和照顾有特殊需要的家人。",
        noteHant: "常用於遺產規劃和照顧有特殊需要的家人。",
      },
      {
        en: "Guardian",
        hans: "监护人",
        hant: "監護人",
        defHans:
          "遗嘱中为未成年子女指定、在父母身故后依法承担照护责任的人。",
        defHant:
          "遺囑中為未成年子女指定、在父母身故後依法承擔照護責任的人。",
        noteHans: "有未成年孩子的家庭立遗嘱时最不该跳过的一栏。",
        noteHant: "有未成年孩子的家庭立遺囑時最不該跳過的一欄。",
      },
      {
        en: "Death Certificate",
        hans: "死亡证明",
        hant: "死亡證明書",
        defHans:
          "由省生命统计部门（Vital Statistics）签发的官方死亡登记证明。",
        defHant:
          "由省生命統計部門（Vital Statistics）簽發的官方死亡登記證明。",
        noteHans: "银行、保险、政府福利几乎都要它，建议一次申请多份正本。",
        noteHant: "銀行、保險、政府福利幾乎都要它，建議一次申請多份正本。",
        related: {
          href: "/blog/golden-24-hours-after-death-canada",
          hans: "突然离世后的黄金 24 小时",
          hant: "突然離世後的黃金 24 小時",
        },
      },
      {
        en: "Funeral Director's Statement of Death",
        hans: "殡仪馆死亡声明",
        hant: "殯儀館死亡聲明",
        defHans:
          "由持牌殡仪馆出具的死亡声明文件，多数机构接受其作为死亡证明使用。",
        defHant:
          "由持牌殯儀館出具的死亡聲明文件，大多數機構接受其作為死亡證明使用。",
        noteHans: "比政府版证明更快拿到，可先用它启动各项手续。",
        noteHant: "比政府版證明更快取得，可先用它啟動各項手續。",
      },
      {
        en: "Burial Permit",
        hans: "安葬许可",
        hant: "安葬許可",
        defHans:
          "依省生命统计法规，在遗体下葬或火化前必须取得的处置许可文件。",
        defHant:
          "依省生命統計法規，在遺體下葬或火化前必須取得的處置許可文件。",
        noteHans: "通常由殡仪馆代办，家属不需要自己跑。",
        noteHant: "通常由殯儀館代辦，家屬不需要自己跑。",
      },
    ],
  },
  {
    id: "funeral",
    titleEn: "Funeral & Places",
    titleHans: "葬礼流程与场所",
    titleHant: "葬禮流程與場所",
    terms: [
      {
        en: "Funeral Home",
        hans: "殡仪馆",
        hant: "殯儀館",
        defHans:
          "持牌提供遗体照护与预备、殡仪协调及相关仪式服务的机构（安省 BAO 对 funeral services 的定义范围）。",
        defHant:
          "持牌提供遺體照護與預備、殯儀協調及相關儀式服務的機構（安省 BAO 對 funeral services 的定義範圍）。",
        noteHans: "加拿大殡仪馆多为私营，价格差异大，可以比价。",
        noteHant: "加拿大殯儀館多為私營，價格差異大，可以格價。",
        related: {
          href: "/blog/canada-funeral-cost-breakdown",
          hans: "加拿大葬礼费用真实拆账",
          hant: "加拿大葬禮費用真實拆賬",
        },
      },
      {
        en: "Funeral Director",
        hans: "殡葬师",
        hant: "殯葬師（禮儀師）",
        defHans:
          "依省殡葬法规持牌、负责遗体处理与葬礼统筹的专业人员。",
        defHant:
          "依省殯葬法規持牌、負責遺體處理與葬禮統籌的專業人員。",
        noteHans: "就是三木干了 16 年的这份工作。",
        noteHant: "就是三木做了 16 年的這份工作。",
      },
      {
        en: "Visitation / Viewing",
        hans: "瞻仰告别",
        hant: "瞻仰遺容",
        defHans:
          "在葬礼前安排亲友到场向遗体告别的正式时段。",
        defHant:
          "在葬禮前安排親友到場向遺體告別的正式時段。",
        noteHans: "通常在殡仪馆的告别室进行。",
        noteHant: "通常在殯儀館的告別室進行。",
      },
      {
        en: "Wake",
        hans: "守灵",
        hant: "守靈",
        defHans: "亲友聚集守候、陪伴逝者的传统仪式。",
        defHant: "親友聚集守候、陪伴逝者的傳統儀式。",
        noteHans: "在加拿大常与 Visitation 合并为同一场合。",
        noteHant: "在加拿大常與 Visitation 合併為同一場合。",
      },
      {
        en: "Funeral Service",
        hans: "葬礼",
        hant: "葬禮",
        defHans:
          "与逝者死亡相关、且遗体在场的仪式或礼式（BAO 官方定义编译）。",
        defHant:
          "與逝者死亡相關、且遺體在場的儀式或禮式（BAO 官方定義編譯）。",
        noteHans: "之后接火化或落葬。",
        noteHant: "之後接火化或落葬。",
      },
      {
        en: "Memorial Service",
        hans: "追思会",
        hant: "追思會",
        defHans: "遗体不在场举行的追悼仪式。",
        defHant: "遺體不在場舉行的追悼儀式。",
        noteHans: "时间地点灵活，火化后再办也完全可以。",
        noteHant: "時間地點靈活，火化後再辦也完全可以。",
      },
      {
        en: "Celebration of Life",
        hans: "生命庆典",
        hant: "生命慶典",
        defHans:
          "以纪念与回忆为主题的追思聚会，形式较传统葬礼轻松。",
        defHant:
          "以紀念與回憶為主題的追思聚會，形式較傳統葬禮輕鬆。",
        noteHans: "西式常见，穿着和流程都不拘一格。",
        noteHant: "西式常見，衣著和流程都不拘一格。",
      },
      {
        en: "Cremation",
        hans: "火葬（火化）",
        hant: "火化",
        defHans: "以高温将遗体化为骨殖并处理成骨灰的遗体处置方式。",
        defHant: "以高溫將遺體化為骨殖並處理成骨灰的遺體處置方式。",
        noteHans: "目前加拿大华人家庭最常见的选择。",
        noteHant: "目前加拿大華人家庭最常見的選擇。",
      },
      {
        en: "Burial",
        hans: "土葬",
        hant: "土葬",
        defHans: "将遗体安放于墓穴土中的遗体处置方式。",
        defHant: "將遺體安放於墓穴土中的遺體處置方式。",
        noteHans: "在加拿大合法且常见，但整体费用通常高于火化。",
        noteHant: "在加拿大合法而常見，但整體費用通常高於火化。",
      },
      {
        en: "Interment",
        hans: "落葬（安葬）",
        hant: "落葬",
        defHans:
          "将人类遗体或骨灰安放入墓穴、墓室或龕位的行为（BAO 官方定义编译）。",
        defHant:
          "將人類遺體或骨灰安放入墓穴、墓室或龕位的行為（BAO 官方定義編譯）。",
        noteHans: "墓园在这一步会收走火化证明。",
        noteHant: "墳場在這一步會收走火化證明。",
      },
      {
        en: "Interment Rights",
        hans: "墓地使用权",
        hant: "墓地使用權",
        defHans:
          "要求或指示将遗体／骨灰安放于某一穴位、或从该穴位迁出的权利（BAO 官方定义编译）。",
        defHant:
          "要求或指示將遺體／骨灰安放於某一穴位、或從該穴位遷出的權利（BAO 官方定義編譯）。",
        noteHans: "在加拿大「买墓地」买到的就是这个权利，土地本身仍属墓园。",
        noteHant: "在加拿大「買墓地」買到的就是這個權利，土地本身仍屬墳場。",
      },
      {
        en: "Casket / Coffin",
        hans: "棺材",
        hant: "棺木",
        defHans: "用于安放及告别遗体的专用棺具，属殡葬用品（funeral supplies）。",
        defHant: "用於安放及告別遺體的專用棺具，屬殯葬用品（funeral supplies）。",
        noteHans: "价格跨度极大，火化用的简易棺完全合规。",
        noteHant: "價錢跨度極大，火化用的簡易棺完全合規。",
      },
      {
        en: "Urn",
        hans: "骨灰盒",
        hant: "骨灰盅（骨灰甕）",
        defHans: "火化后用于盛放骨灰的容器。",
        defHant: "火化後用於盛放骨灰的容器。",
        noteHans: "跨国携带建议木质或硬纸材质，金属容器过安检容易被拦。",
        noteHant: "跨國攜帶建議木質或硬紙材質，金屬容器過安檢容易被攔。",
      },
      {
        en: "Columbarium",
        hans: "骨灰安置所",
        hant: "骨灰龕堂",
        defHans:
          "设有多个龕位、用于集中安放骨灰的建筑或构筑物。",
        defHant:
          "設有多個龕位、用於集中安放骨灰的建築或構築物。",
        noteHans: "按格位出售使用权。",
        noteHant: "按龕位出售使用權。",
      },
      {
        en: "Niche",
        hans: "骨灰格位",
        hant: "骨灰龕位",
        defHans:
          "骨灰安置建筑中安放骨灰容器的独立格位（BAO 将其归入 lot 的定义范围）。",
        defHant:
          "龕堂中安放骨灰盅的獨立格位（BAO 將其歸入 lot 的定義範圍）。",
        noteHans: "位置和层高不同价格差异明显。",
        noteHant: "位置和層高不同價錢差異明顯。",
      },
      {
        en: "Cemetery",
        hans: "墓地（公墓）",
        hant: "墳場",
        defHans:
          "依省法规注册、用于安葬人类遗体或骨灰的场地。",
        defHant:
          "依省法規註冊、用於安葬人類遺體或骨灰的場地。",
        noteHans: "华人聚居城市多有华人区段，习俗上更贴近。",
        noteHant: "華人聚居城市多設華人區段，習俗上更貼近。",
        related: {
          href: "/blog/canada-cemetery-6-investment-traps",
          hans: "加拿大墓地的 6 大陷阱",
          hant: "加拿大墓地的 6 大陷阱",
        },
      },
      {
        en: "Plot / Lot",
        hans: "墓穴",
        hant: "墓穴（穴位）",
        defHans:
          "墓园中已安葬或预留安葬用的区块，包括墓穴、墓室及骨灰龕位（BAO「lot」官方定义编译）。",
        defHant:
          "墳場中已安葬或預留安葬用的區塊，包括墓穴、墓室及骨灰龕位（BAO「lot」官方定義編譯）。",
        noteHans: "买之前先弄清是单人、双人还是家庭穴位。",
        noteHant: "買之前先弄清是單人、雙人還是家庭穴位。",
      },
      {
        en: "Headstone / Grave Marker",
        hans: "墓碑",
        hant: "墓碑",
        defHans: "设于墓位、镌刻逝者信息的纪念碑石，属殡葬用品。",
        defHant: "設於墓位、鐫刻逝者資料的紀念碑石，屬殯葬用品。",
        noteHans: "墓园对材质、尺寸甚至颜色常有规定，下单刻碑前先核对园区要求。",
        noteHant: "墳場對材質、尺寸甚至顏色常有規定，落單刻碑前先核對園區要求。",
      },
      {
        en: "Embalming",
        hans: "遗体防腐",
        hant: "遺體防腐",
        defHans:
          "以冷藏以外的方式对遗体全部或局部进行防腐与消毒的处理（BAO 官方定义编译）。",
        defHant:
          "以冷藏以外的方式對遺體全部或局部進行防腐與消毒的處理（BAO 官方定義編譯）。",
        noteHans: "非必须项目，除非需要开棺瞻仰或长途运送。",
        noteHant: "非必須項目，除非需要開棺瞻仰或長途運送。",
      },
      {
        en: "Repatriation of Remains",
        hans: "遗体／骨灰运返",
        hant: "遺體／骨灰運返",
        defHans:
          "将遗体或骨灰跨境运返原籍国或目的地国的安排，须符合两国出入境及检疫规定。",
        defHant:
          "將遺體或骨灰跨境運返原籍國或目的地國的安排，須符合兩國出入境及檢疫規定。",
        noteHans: "文件、海关、航空公司三关都要提前确认。",
        noteHant: "文件、海關、航空公司三關都要提前確認。",
        related: {
          href: "/blog/bring-ashes-back-to-canada",
          hans: "带骨灰回加拿大分步指南",
          hant: "帶骨灰回加拿大分步指南",
        },
      },
      {
        en: "Pre-arranged Funeral / Pre-need",
        hans: "生前契约",
        hant: "生前契約（預辦身後事）",
        defHans:
          "在本人在世时预先约定身后殡葬服务、用品或遗体运送的安排（BAO「pre-arrangement」官方定义编译）。",
        defHant:
          "在本人在生時預先約定身後殯儀服務、用品或遺體運送的安排（BAO「pre-arrangement」官方定義編譯）。",
        noteHans: "签约前重点看资金托管和退款条款。",
        noteHant: "簽約前重點看資金託管和退款條款。",
      },
      {
        en: "Green Burial",
        hans: "环保葬",
        hant: "環保葬",
        defHans:
          "不做防腐、使用可降解棺具、以自然方式安葬的环保葬式。",
        defHant:
          "不做防腐、使用可降解棺木、以自然方式安葬的環保葬式。",
        noteHans: "在加拿大逐渐增多。",
        noteHant: "在加拿大逐漸增多。",
      },
      {
        en: "Scattering of Ashes",
        hans: "撒灰",
        hant: "撒灰",
        defHans:
          "将骨灰撒放于陆地或水域的处置方式，须遵守联邦、省及市镇的相关法规。",
        defHant:
          "將骨灰撒放於陸地或水域的處置方式，須遵守聯邦、省及市鎮的相關法規。",
        noteHans: "在公园等公共场所私自撒放并不合法。",
        noteHant: "在公園等公共場所私自撒放並不合法。",
      },
    ],
  },
  {
    id: "benefits",
    titleEn: "Benefits & Money",
    titleHans: "政府福利与钱",
    titleHant: "政府福利與錢",
    terms: [
      {
        en: "CPP Death Benefit",
        hans: "CPP 死亡补助",
        hant: "CPP 死亡補助",
        defHans:
          "加拿大退休金计划（CPP）向已故供款人的遗产或其他合资格申请人发放的一次性补助（canada.ca 官方定义编译）。",
        defHant:
          "加拿大退休金計劃（CPP）向已故供款人的遺產或其他合資格申請人發放的一次性補助（canada.ca 官方定義編譯）。",
        noteHans: "需要主动申请，不会自动到账。",
        noteHant: "需要主動申請，不會自動到帳。",
        related: {
          href: "/blog/canada-cpp-3-survivor-benefits-traps",
          hans: "CPP 身后 3 笔钱完整避坑",
          hant: "CPP 身後 3 筆錢完整避坑",
        },
      },
      {
        en: "CPP Survivor's Pension",
        hans: "CPP 遗属抚恤金",
        hant: "CPP 遺屬撫恤金",
        defHans:
          "按月发放给已故 CPP 供款人法定配偶或同居伴侣的抚恤金（canada.ca 官方定义编译）。",
        defHant:
          "按月發放給已故 CPP 供款人法定配偶或同居伴侶的撫恤金（canada.ca 官方定義編譯）。",
        noteHans: "官方明确提示：尽快申请，拖延可能损失可领月份。",
        noteHant: "官方明確提示：盡快申請，拖延可能損失可領月份。",
        related: {
          href: "/blog/canada-funeral-benefits-11-pitfalls",
          hans: "加拿大丧葬福利 11 个大坑",
          hant: "加拿大喪葬福利 11 個大坑",
        },
      },
      {
        en: "CPP Children's Benefit",
        hans: "CPP 子女抚恤金",
        hant: "CPP 子女撫恤金",
        defHans:
          "发放给已故供款人受抚养子女的按月补助——未成年子女，或 18-25 岁全日制在读子女。",
        defHant:
          "發放給已故供款人受撫養子女的按月補助——未成年子女，或 18-25 歲全日制在讀子女。",
        noteHans: "很多家庭不知道有这笔钱。",
        noteHant: "很多家庭不知道有這筆錢。",
      },
      {
        en: "OAS (Old Age Security)",
        hans: "老人金",
        hant: "老人金（高齡保障金）",
        defHans:
          "加拿大政府向 65 岁及以上、符合居住年限条件者发放的联邦养老金。",
        defHant:
          "加拿大政府向 65 歲及以上、符合居住年限條件者發放的聯邦養老金。",
        noteHans: "领取人身故后家属要及时通知停发，多领的会被追回。",
        noteHant: "領取人身故後家屬要及時通知停發，多領的會被追回。",
      },
      {
        en: "Probate Fee / Estate Administration Tax",
        hans: "遗产认证费",
        hant: "遺產認證費",
        defHans:
          "法院办理遗嘱认证时按遗产价值收取的费用或税项，各省名称与费率不同。",
        defHant:
          "法院辦理遺囑認證時按遺產價值收取的費用或稅項，各省名稱與費率不同。",
        noteHans: "加拿大没有「遗产税」——这笔认证费是最常被误解的一笔钱。",
        noteHant: "加拿大沒有「遺產稅」——這筆認證費是最常被誤解的一筆錢。",
      },
      {
        en: "Final Tax Return",
        hans: "最终报税",
        hant: "最終報稅",
        defHans:
          "逝者生前最后一个纳税年度的个人所得税申报，由遗产代表人负责向加拿大税务局（CRA）提交。",
        defHant:
          "逝者生前最後一個納稅年度的個人所得稅申報，由遺產代表人負責向加拿大稅務局（CRA）提交。",
        noteHans: "有法定期限，逾期有罚息。",
        noteHant: "有法定期限，逾期有罰息。",
      },
      {
        en: "Life Insurance",
        hans: "人寿保险",
        hant: "人壽保險",
        defHans:
          "被保险人身故后，保险公司按合同向指定受益人给付保险金的保险产品。",
        defHant:
          "受保人身故後，保險公司按合約向指定受益人給付保險金的保險產品。",
        noteHans: "理赔通常绕过遗嘱直接付给受益人，速度快于走遗产程序。",
        noteHant: "理賠通常繞過遺囑直接付給受益人，速度快過走遺產程序。",
      },
      {
        en: "Allowance for the Survivor",
        hans: "遗属津贴",
        hant: "遺屬津貼",
        defHans:
          "面向 60-64 岁、低收入且丧偶未再婚人士的联邦津贴（canada.ca 官方项目）。",
        defHant:
          "面向 60-64 歲、低收入且喪偶未再婚人士的聯邦津貼（canada.ca 官方項目）。",
        noteHans: "符合条件也要主动申请。",
        noteHant: "符合條件也要主動申請。",
      },
    ],
  },
  {
    id: "medical",
    titleEn: "Medical & End-of-Life",
    titleHans: "医疗与临终",
    titleHant: "醫療與臨終",
    terms: [
      {
        en: "Palliative Care",
        hans: "舒缓治疗",
        hant: "紓緩治療",
        defHans:
          "通过预防和缓解痛苦，改善面对危及生命疾病的患者及其家人生活质量的照护方式（世界卫生组织定义编译）。",
        defHant:
          "透過預防和緩解痛苦，改善面對危及生命疾病的患者及其家人生活質素的照護方式（世界衛生組織定義編譯）。",
        noteHans: "不等于「放弃治疗」。",
        noteHant: "不等於「放棄治療」。",
      },
      {
        en: "Hospice",
        hans: "安宁疗护（临终关怀院）",
        hant: "寧養院（善終服務）",
        defHans:
          "为临终阶段患者提供以舒适与尊严为核心的住院式或居家照护的机构与服务。",
        defHant:
          "為臨終階段患者提供以舒適與尊嚴為核心的住院式或居家照護的機構與服務。",
        noteHans: "重点是陪伴，不是治疗。",
        noteHant: "重點是陪伴，不是治療。",
      },
      {
        en: "Advance Directive / Living Will",
        hans: "预立医疗指示",
        hant: "預設醫療指示",
        defHans:
          "在本人具备决策能力时预先作出的书面医疗指示，用于将来无法表达意愿时指导医疗决定。",
        defHant:
          "在本人具備決策能力時預先作出的書面醫療指示，用於將來無法表達意願時指導醫療決定。",
        noteHans: "写清接受或拒绝哪些处置、由谁替你做决定。",
        noteHant: "寫清接受或拒絕哪些處置、由誰替你作決定。",
      },
      {
        en: "DNR (Do Not Resuscitate)",
        hans: "放弃心肺复苏指示",
        hant: "不作心肺復甦術指示",
        defHans:
          "指示医护人员在患者心跳或呼吸停止时不实施心肺复苏的正式医疗指令。",
        defHant:
          "指示醫護人員在患者心跳或呼吸停止時不施行心肺復甦的正式醫療指令。",
        noteHans: "需按所在省的正式表格签署才有效。",
        noteHant: "需按所在省的正式表格簽署才有效。",
      },
      {
        en: "MAID (Medical Assistance in Dying)",
        hans: "医疗协助死亡",
        hant: "醫療協助死亡",
        defHans:
          "加拿大《刑法》框架下合法的医疗协助死亡制度，须经法定的多重资格评估与申请程序（加拿大卫生部官方项目）。",
        defHant:
          "加拿大《刑法》框架下合法的醫療協助死亡制度，須經法定的多重資格評估與申請程序（加拿大衛生部官方項目）。",
      },
      {
        en: "Next of Kin",
        hans: "最近亲属",
        hant: "最近親屬",
        defHans:
          "法律与机构惯例中与逝者或患者关系最近的亲属，是医院和官方机构默认的第一联系与确认人。",
        defHant:
          "法律與機構慣例中與逝者或患者關係最近的親屬，是醫院和官方機構默認的第一聯繫與確認人。",
        noteHans: "独居人士尤其要提前想好登记谁。",
        noteHant: "獨居人士尤其要提前想好登記誰。",
      },
      {
        en: "Coroner",
        hans: "验尸官",
        hant: "死因裁判官（加拿大稱 Coroner）",
        defHans:
          "依省法负责调查非自然、突发不明或无人在场死亡的独立官员（如 BC Coroners Service）。",
        defHant:
          "依省法負責調查非自然、突發不明或無人在場死亡的獨立官員（如 BC Coroners Service）。",
        noteHans: "调查期间遗体和证件的流程都会变慢，属正常程序。",
        noteHant: "調查期間遺體和證件的流程都會變慢，屬正常程序。",
      },
      {
        en: "Autopsy",
        hans: "尸检",
        hant: "驗屍",
        defHans:
          "为查明死因与疾病状况而由法医对遗体进行的医学检查。",
        defHant:
          "為查明死因與疾病狀況而由法醫對遺體進行的醫學檢查。",
        noteHans: "通常在 Coroner 要求下进行，家属一般无需付费。",
        noteHant: "通常在 Coroner 要求下進行，家屬一般無需付費。",
      },
    ],
  },
];
