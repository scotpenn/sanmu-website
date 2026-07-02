// 加拿大身后事中英术语对照表数据.
// 简繁不是机械转换: hant/defHant 按港台移民的习惯用词单独撰写
// (平安紙 / 骨灰龕位 / 墳場 / 紓緩治療 等), 与简体是两套词汇体系.

export type GlossaryTerm = {
  /** 英文术语 */
  en: string;
  /** 简体中文名称 */
  hans: string;
  /** 繁体中文名称 (港台习惯用词) */
  hant: string;
  /** 简体释义 */
  defHans: string;
  /** 繁体释义 (独立措辞) */
  defHant: string;
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
          "写明身后财产如何分配、由谁执行的法律文件。加拿大各省对有效遗嘱的形式要求不同，签署前建议核对所在省的规定。",
        defHant:
          "訂明身後財產如何分配、由誰執行的法律文件，香港俗稱「平安紙」。加拿大各省對有效遺囑的形式要求不同，簽署前建議核對所在省的規定。",
      },
      {
        en: "Executor",
        hans: "遗嘱执行人",
        hant: "遺囑執行人",
        defHans:
          "遗嘱里指定、负责替逝者办理遗产事务的人——报税、清偿债务、分配财产都由这个人签字推进。",
        defHant:
          "遺囑裡指定、負責替逝者辦理遺產事務的人——報稅、清償債務、分配財產都由這個人簽字推進。",
      },
      {
        en: "Probate",
        hans: "遗嘱认证",
        hant: "遺囑認證",
        defHans:
          "法院确认遗嘱有效、正式授权执行人处理遗产的司法程序。银行等机构通常要看到认证文件才放行大额资产。",
        defHant:
          "法院確認遺囑有效、正式授權執行人處理遺產的司法程序。銀行等機構通常要見到認證文件才放行大額資產。",
      },
      {
        en: "Estate",
        hans: "遗产",
        hant: "遺產",
        defHans: "逝者名下全部资产与负债的总称：房产、存款、投资、保险、债务都算在内。",
        defHant: "逝者名下全部資產與負債的總稱：物業、存款、投資、保險、債務都計算在內。",
      },
      {
        en: "Beneficiary",
        hans: "受益人",
        hant: "受益人",
        defHans: "在遗嘱、保险或注册账户（如 RRSP/TFSA）里指定接收资产的人。",
        defHant: "在遺囑、保險或註冊帳戶（如 RRSP/TFSA）裡指定接收資產的人。",
      },
      {
        en: "Intestate",
        hans: "无遗嘱身故",
        hant: "無遺囑身故",
        defHans:
          "没留下有效遗嘱就去世。财产将按所在省的法定顺序分配，不一定符合本人意愿，办理周期也明显更长。",
        defHant:
          "沒留下有效遺囑就離世。財產將按所在省的法定順序分配，未必符合本人意願，辦理周期亦明顯更長。",
      },
      {
        en: "Power of Attorney (POA)",
        hans: "授权书",
        hant: "持久授權書",
        defHans:
          "授权他人在你在世但无法处理事务时，替你做财务或法律决定。注意：人过世后授权书随即失效，之后的事由遗嘱执行人接手。",
        defHant:
          "授權他人在你在生但無法處理事務時，替你作財務或法律決定。注意：人離世後授權書隨即失效，之後的事由遺囑執行人接手。",
      },
      {
        en: "Trust",
        hans: "信托",
        hant: "信託",
        defHans: "把资产交由受托人按约定条款管理和分配的法律安排，常用于遗产规划和照顾特殊需要的家人。",
        defHant: "把資產交由受託人按約定條款管理和分配的法律安排，常用於遺產規劃和照顧有特殊需要的家人。",
      },
      {
        en: "Guardian",
        hans: "监护人",
        hant: "監護人",
        defHans: "遗嘱里为未成年子女指定的照护人。有未成年孩子的家庭立遗嘱时最不该跳过的一栏。",
        defHant: "遺囑裡為未成年子女指定的照護人。有未成年孩子的家庭立遺囑時最不該跳過的一欄。",
      },
      {
        en: "Death Certificate",
        hans: "死亡证明",
        hant: "死亡證明書",
        defHans:
          "政府签发的官方死亡记录。银行、保险、政府福利申请几乎都要它，建议一次申请多份正本。",
        defHant:
          "政府簽發的官方死亡記錄。銀行、保險、政府福利申請幾乎都要它，建議一次申請多份正本。",
      },
      {
        en: "Funeral Director's Statement of Death",
        hans: "殡仪馆死亡声明",
        hant: "殯儀館死亡聲明",
        defHans:
          "由殡仪馆出具的死亡证明文件，多数机构接受，而且比政府版证明更快拿到，可先用它启动各项手续。",
        defHant:
          "由殯儀館出具的死亡證明文件，大多數機構接受，而且比政府版證明更快取得，可先用它啟動各項手續。",
      },
      {
        en: "Burial Permit",
        hans: "安葬许可",
        hant: "安葬許可",
        defHans: "下葬或火化前必须取得的许可文件，通常由殡仪馆代办，家属不需要自己跑。",
        defHant: "下葬或火化前必須取得的許可文件，通常由殯儀館代辦，家屬不需要自己跑。",
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
        defHans: "承办遗体接运、告别仪式、火化或土葬安排的机构。加拿大殡仪馆多为私营，价格差异大，可以比价。",
        defHant: "承辦遺體接運、告別儀式、火化或土葬安排的機構。加拿大殯儀館多為私營，價格差異大，可以格價。",
      },
      {
        en: "Funeral Director",
        hans: "殡葬师",
        hant: "殯葬師（禮儀師）",
        defHans: "持牌负责整场身后事安排的专业人员——就是三木干了 16 年的这份工作。",
        defHant: "持牌負責整場身後事安排的專業人員——就是三木做了 16 年的這份工作。",
      },
      {
        en: "Visitation / Viewing",
        hans: "瞻仰告别",
        hant: "瞻仰遺容",
        defHans: "葬礼前开放亲友向遗体告别的时段，通常在殡仪馆的告别室进行。",
        defHant: "葬禮前開放親友向遺體告別的時段，通常在殯儀館的告別室進行。",
      },
      {
        en: "Wake",
        hans: "守灵",
        hant: "守靈",
        defHans: "亲友聚集陪伴逝者的传统仪式。在加拿大常与 Visitation 合并为同一场合。",
        defHant: "親友聚集陪伴逝者的傳統儀式。在加拿大常與 Visitation 合併為同一場合。",
      },
      {
        en: "Funeral Service",
        hans: "葬礼",
        hant: "葬禮",
        defHans: "遗体在场的正式告别仪式，之后接火化或落葬。",
        defHant: "遺體在場的正式告別儀式，之後接火化或落葬。",
      },
      {
        en: "Memorial Service",
        hans: "追思会",
        hant: "追思會",
        defHans: "遗体不在场的纪念仪式，时间地点都灵活，火化后再办也完全可以。",
        defHant: "遺體不在場的紀念儀式，時間地點都靈活，火化後再辦也完全可以。",
      },
      {
        en: "Celebration of Life",
        hans: "生命庆典",
        hant: "生命慶典",
        defHans: "西式追思的常见形式，氛围偏温暖回忆而非哀悼，穿着和流程都比传统葬礼轻松。",
        defHant: "西式追思的常見形式，氣氛偏溫暖回憶而非哀悼，衣著和流程都比傳統葬禮輕鬆。",
      },
      {
        en: "Cremation",
        hans: "火葬（火化）",
        hant: "火化",
        defHans: "目前加拿大华人家庭最常见的选择。火化后骨灰可安放龕位、下葬或按规定撒放。",
        defHant: "目前加拿大華人家庭最常見的選擇。火化後骨灰可安放龕位、下葬或按規定撒放。",
      },
      {
        en: "Burial",
        hans: "土葬",
        hant: "土葬",
        defHans: "遗体直接下葬。在加拿大合法且常见，但整体费用通常高于火化。",
        defHant: "遺體直接下葬。在加拿大合法而常見，但整體費用通常高於火化。",
      },
      {
        en: "Interment",
        hans: "落葬（安葬）",
        hant: "落葬",
        defHans: "把棺木或骨灰正式安放进墓穴或龕位的环节。墓园在这一步会收走火化证明。",
        defHant: "把棺木或骨灰正式安放進墓穴或龕位的環節。墳場在這一步會收走火化證明。",
      },
      {
        en: "Interment Rights",
        hans: "墓地使用权",
        hant: "墓地使用權",
        defHans:
          "在加拿大「买墓地」买到的其实是安葬使用权，土地本身仍属墓园。转让和退还都有省级规定管着。",
        defHant:
          "在加拿大「買墓地」買到的其實是安葬使用權，土地本身仍屬墳場。轉讓和退還都有省級規定管束。",
      },
      {
        en: "Casket / Coffin",
        hans: "棺材",
        hant: "棺木",
        defHans: "价格跨度极大的一项开销，从几百到数万加币都有。火化用的简易棺完全合规。",
        defHant: "價格跨度極大的一項開銷，由幾百到數萬加幣都有。火化用的簡易棺完全合規。",
      },
      {
        en: "Urn",
        hans: "骨灰盒",
        hant: "骨灰盅（骨灰甕）",
        defHans: "安放骨灰的容器。跨国携带时建议木质或硬纸材质，金属容器过安检容易被拦。",
        defHant: "安放骨灰的容器。跨國攜帶時建議木質或硬紙材質，金屬容器過安檢容易被攔。",
      },
      {
        en: "Columbarium",
        hans: "骨灰安置所",
        hant: "骨灰龕堂",
        defHans: "集中安放骨灰的建筑或墙体，按格位出售使用权。",
        defHant: "集中安放骨灰的建築或牆體，按龕位出售使用權。",
      },
      {
        en: "Niche",
        hans: "骨灰格位",
        hant: "骨灰龕位",
        defHans: "安置所里安放单个或多个骨灰盒的格子，位置和层高不同价格差异明显。",
        defHant: "龕堂裡安放單個或多個骨灰盅的格子，位置和層高不同價錢差異明顯。",
      },
      {
        en: "Cemetery",
        hans: "墓地（公墓）",
        hant: "墳場",
        defHans: "提供土葬墓穴和骨灰安置的园区。华人聚居城市多有华人区段，习俗上更贴近。",
        defHant: "提供土葬墓穴和骨灰安置的園區。華人聚居城市多設華人區段，習俗上更貼近。",
      },
      {
        en: "Plot",
        hans: "墓穴",
        hant: "墓穴（穴位）",
        defHans: "墓园里的单个安葬位置。买之前先弄清是单人、双人还是家庭穴位。",
        defHant: "墳場裡的單個安葬位置。買之前先弄清是單人、雙人還是家庭穴位。",
      },
      {
        en: "Headstone / Grave Marker",
        hans: "墓碑",
        hant: "墓碑",
        defHans: "墓园对材质、尺寸甚至颜色常有规定，下单刻碑前务必先核对园区要求。",
        defHant: "墳場對材質、尺寸甚至顏色常有規定，落單刻碑前務必先核對園區要求。",
      },
      {
        en: "Embalming",
        hans: "遗体防腐",
        hant: "遺體防腐",
        defHans: "非必须项目。除非需要开棺瞻仰或长途运送，法律上大多数情况可以不做。",
        defHant: "非必須項目。除非需要開棺瞻仰或長途運送，法律上大多數情況可以不做。",
      },
      {
        en: "Repatriation of Remains",
        hans: "遗体／骨灰运返",
        hant: "遺體／骨灰運返",
        defHans: "跨国运送遗体或骨灰的统称。文件、海关、航空公司三关都要提前确认。",
        defHant: "跨國運送遺體或骨灰的統稱。文件、海關、航空公司三關都要提前確認。",
      },
      {
        en: "Pre-arranged Funeral / Pre-need",
        hans: "生前契约",
        hant: "生前契約（預辦身後事）",
        defHans: "生前与殡仪馆预先约定并锁定身后事安排和价格。签约前重点看资金托管和退款条款。",
        defHant: "生前與殯儀館預先約定並鎖定身後事安排和價錢。簽約前重點看資金託管和退款條款。",
      },
      {
        en: "Green Burial",
        hans: "环保葬",
        hant: "環保葬",
        defHans: "不防腐、可降解棺材、不立传统墓碑的安葬方式，在加拿大逐渐增多。",
        defHant: "不防腐、可降解棺木、不立傳統墓碑的安葬方式，在加拿大逐漸增多。",
      },
      {
        en: "Scattering of Ashes",
        hans: "撒灰",
        hant: "撒灰",
        defHans: "加拿大对撒放骨灰的地点有明确规定，在公园等公共场所私自撒放并不合法。",
        defHant: "加拿大對撒放骨灰的地點有明確規定，在公園等公共場所私自撒放並不合法。",
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
        defHans: "加拿大退休金计划发放的一次性身故补助，需要主动申请，不会自动到账。",
        defHant: "加拿大退休金計劃發放的一次性身故補助，需要主動申請，不會自動到帳。",
      },
      {
        en: "CPP Survivor's Pension",
        hans: "CPP 遗属抚恤金",
        hant: "CPP 遺屬撫恤金",
        defHans: "按月发给在世配偶或同居伴侣的抚恤金，金额与逝者供款记录和遗属年龄相关。",
        defHant: "按月發給在世配偶或同居伴侶的撫恤金，金額與逝者供款記錄和遺屬年齡相關。",
      },
      {
        en: "CPP Children's Benefit",
        hans: "CPP 子女抚恤金",
        hant: "CPP 子女撫恤金",
        defHans: "发给逝者未成年子女（或在读的 18-25 岁子女）的按月抚恤金，很多家庭不知道有这笔钱。",
        defHant: "發給逝者未成年子女（或在讀的 18-25 歲子女）的按月撫恤金，很多家庭不知道有這筆錢。",
      },
      {
        en: "OAS (Old Age Security)",
        hans: "老人金",
        hant: "老人金（高齡保障金）",
        defHans: "65 岁起的联邦养老金。领取人身故后家属要及时通知停发，多领的会被追回。",
        defHant: "65 歲起的聯邦養老金。領取人身故後家屬要及時通知停發，多領的會被追回。",
      },
      {
        en: "Probate Fee / Estate Administration Tax",
        hans: "遗产认证费",
        hant: "遺產認證費",
        defHans:
          "加拿大没有「遗产税」，但多数省份按遗产规模收认证费，各省叫法和费率不同——这是最常被误解的一笔钱。",
        defHant:
          "加拿大沒有「遺產稅」，但多數省份按遺產規模收認證費，各省叫法和費率不同——這是最常被誤解的一筆錢。",
      },
      {
        en: "Final Tax Return",
        hans: "最终报税",
        hant: "最終報稅",
        defHans: "逝者名下最后一次个人报税，由遗嘱执行人负责申报，有法定期限。",
        defHant: "逝者名下最後一次個人報稅，由遺囑執行人負責申報，有法定期限。",
      },
      {
        en: "Life Insurance",
        hans: "人寿保险",
        hant: "人壽保險",
        defHans: "理赔通常绕过遗嘱直接付给指定受益人，速度快于走遗产程序，记得核对受益人信息是否最新。",
        defHant: "理賠通常繞過遺囑直接付給指定受益人，速度快過走遺產程序，記得核對受益人資料是否最新。",
      },
      {
        en: "Survivor's Allowance",
        hans: "遗属津贴",
        hant: "遺屬津貼",
        defHans: "针对 60-64 岁低收入丧偶人士的联邦津贴，符合条件也要主动申请。",
        defHant: "針對 60-64 歲低收入喪偶人士的聯邦津貼，符合條件也要主動申請。",
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
        defHans: "重病后期以减轻痛苦、提升生活质量为目标的照护，不等于「放弃治疗」。",
        defHant: "重病後期以減輕痛苦、提升生活質素為目標的照護，不等於「放棄治療」。",
      },
      {
        en: "Hospice",
        hans: "安宁疗护（临终关怀院）",
        hant: "寧養院（善終服務）",
        defHans: "为临终阶段提供住院式或居家照护的机构与服务，重点是陪伴与尊严。",
        defHant: "為臨終階段提供住院式或居家照護的機構與服務，重點是陪伴與尊嚴。",
      },
      {
        en: "Advance Directive / Living Will",
        hans: "预立医疗指示",
        hant: "預設醫療指示",
        defHans: "在意识清醒时写明：将来无法表达意愿时，接受或拒绝哪些医疗处置、由谁替你做决定。",
        defHant: "在意識清醒時寫明：將來無法表達意願時，接受或拒絕哪些醫療處置、由誰替你作決定。",
      },
      {
        en: "DNR (Do Not Resuscitate)",
        hans: "放弃心肺复苏指示",
        hant: "不作心肺復甦術指示",
        defHans: "明确指示医护人员在心跳呼吸停止时不进行心肺复苏。需按所在省的正式表格签署才有效。",
        defHant: "明確指示醫護人員在心跳呼吸停止時不進行心肺復甦。需按所在省的正式表格簽署才有效。",
      },
      {
        en: "MAID (Medical Assistance in Dying)",
        hans: "医疗协助死亡",
        hant: "醫療協助死亡",
        defHans: "加拿大合法的医疗协助死亡制度，有严格的资格评估和申请程序。",
        defHant: "加拿大合法的醫療協助死亡制度，有嚴格的資格評估和申請程序。",
      },
      {
        en: "Next of Kin",
        hans: "最近亲属",
        hant: "最近親屬",
        defHans: "医院和官方机构联系与确认事项时默认的第一顺位家属，独居人士尤其要提前想好登记谁。",
        defHant: "醫院和官方機構聯繫與確認事項時默認的第一順位家屬，獨居人士尤其要提前想好登記誰。",
      },
      {
        en: "Coroner",
        hans: "验尸官",
        hant: "死因裁判官（加拿大稱 Coroner）",
        defHans: "意外、突发或原因不明的死亡由 Coroner 介入调查，期间遗体和证件的流程都会变慢，属正常程序。",
        defHant: "意外、突發或原因不明的死亡由 Coroner 介入調查，期間遺體和證件的流程都會變慢，屬正常程序。",
      },
      {
        en: "Autopsy",
        hans: "尸检",
        hant: "驗屍",
        defHans: "由法医进行的死因检查，通常在 Coroner 要求下进行，家属一般无需付费。",
        defHant: "由法醫進行的死因檢查，通常在 Coroner 要求下進行，家屬一般無需付費。",
      },
    ],
  },
];
