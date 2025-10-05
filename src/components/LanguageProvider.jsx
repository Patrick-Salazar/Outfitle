import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    appName: "Outfitle",
    appTagline: "YOUR VIRTUAL WARDROBE",
    myWardrobe: "MY WARDROBE",
    styleAI: "STYLE AI",
    analytics: "ANALYTICS",
    budget: "BUDGET",
    reminders: "REMINDERS",
    donate: "DONATE",
    addItem: "ADD ITEM",
    signOut: "Sign Out",
    wardrobeTitle: "Your Wardrobe",
    allItems: "ALL ITEMS",
    hats: "HATS",
    tops: "TOPS",
    dresses: "DRESSES",
    pants: "PANTS",
    jackets: "JACKETS",
    outerwear: "OUTERWEAR",
    shoes: "SHOES",
    handbags: "HANDBAGS",
  },
  zh_TW: {
    appName: "Outfitle",
    appTagline: "您的虛擬衣櫥",
    myWardrobe: "我的衣櫥",
    styleAI: "風格AI",
    analytics: "數據分析",
    budget: "預算",
    reminders: "提醒",
    donate: "捐贈",
    addItem: "新增單品",
    signOut: "登出",
    wardrobeTitle: "您的衣櫥",
    allItems: "全部單品",
    hats: "帽子",
    tops: "上衣",
    dresses: "洋裝",
    pants: "褲子",
    jackets: "外套",
    outerwear: "大衣",
    shoes: "鞋子",
    handbags: "手提包",
  },
  zh_CN: {
    appName: "Outfitle",
    appTagline: "您的虚拟衣橱",
    myWardrobe: "我的衣橱",
    styleAI: "风格AI",
    analytics: "数据分析",
    budget: "预算",
    reminders: "提醒",
    donate: "捐赠",
    addItem: "添加单品",
    signOut: "登出",
    wardrobeTitle: "您的衣橱",
    allItems: "全部单品",
    hats: "帽子",
    tops: "上衣",
    dresses: "连衣裙",
    pants: "裤子",
    jackets: "外套",
    outerwear: "大衣",
    shoes: "鞋子",
    handbags: "手提包",
  },
  fr: {
    appName: "Outfitle",
    appTagline: "VOTRE GARDE-ROBE VIRTUELLE",
    myWardrobe: "MA GARDE-ROBE",
    styleAI: "STYLE IA",
    analytics: "ANALYTIQUE",
    budget: "BUDGET",
    reminders: "RAPPELS",
    donate: "DON",
    addItem: "AJOUTER",
    signOut: "Déconnexion",
    wardrobeTitle: "Votre Garde-robe",
    allItems: "TOUS",
    hats: "CHAPEAUX",
    tops: "HAUTS",
    dresses: "ROBES",
    pants: "PANTALONS",
    jackets: "VESTES",
    outerwear: "MANTEAUX",
    shoes: "CHAUSSURES",
    handbags: "SACS",
  },
  es: {
    appName: "Outfitle",
    appTagline: "TU ARMARIO VIRTUAL",
    myWardrobe: "MI ARMARIO",
    styleAI: "ESTILO IA",
    analytics: "ANÁLISIS",
    budget: "PRESUPUESTO",
    reminders: "RECORDATORIOS",
    donate: "DONAR",
    addItem: "AÑADIR",
    signOut: "Cerrar Sesión",
    wardrobeTitle: "Tu Armario",
    allItems: "TODO",
    hats: "SOMBREROS",
    tops: "CAMISAS",
    dresses: "VESTIDOS",
    pants: "PANTALONES",
    jackets: "CHAQUETAS",
    outerwear: "ABRIGOS",
    shoes: "ZAPATOS",
    handbags: "BOLSOS",
  },
  ja: {
    appName: "Outfitle",
    appTagline: "あなたのバーチャルワードローブ",
    myWardrobe: "マイワードローブ",
    styleAI: "スタイルAI",
    analytics: "分析",
    budget: "予算",
    reminders: "リマインダー",
    donate: "寄付",
    addItem: "アイテム追加",
    signOut: "ログアウト",
    wardrobeTitle: "あなたのワードローブ",
    allItems: "すべて",
    hats: "帽子",
    tops: "トップス",
    dresses: "ドレス",
    pants: "パンツ",
    jackets: "ジャケット",
    outerwear: "アウター",
    shoes: "靴",
    handbags: "バッグ",
  },
  ko: {
    appName: "Outfitle",
    appTagline: "나만의 가상 옷장",
    myWardrobe: "내 옷장",
    styleAI: "스타일 AI",
    analytics: "분석",
    budget: "예산",
    reminders: "알림",
    donate: "기부",
    addItem: "아이템 추가",
    signOut: "로그아웃",
    wardrobeTitle: "내 옷장",
    allItems: "전체",
    hats: "모자",
    tops: "상의",
    dresses: "드레스",
    pants: "바지",
    jackets: "재킷",
    outerwear: "아우터",
    shoes: "신발",
    handbags: "가방",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("outfitle_language");
    if (saved) return saved;
    
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh-tw") || browserLang.startsWith("zh-hk")) return "zh_TW";
    if (browserLang.startsWith("zh")) return "zh_CN";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("ja")) return "ja";
    if (browserLang.startsWith("ko")) return "ko";
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("outfitle_language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}