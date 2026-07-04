import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "fil";

type Dict = Record<string, string>;

const en: Dict = {
  app_name: "PathFinder AI",
  tagline: "Your career & education compass for the Philippines.",
  hero_sub: "Get personalized study, training, and career paths — grounded in official Philippine sources.",
  cta_start: "Find my path",
  cta_login: "Log in",
  cta_signup: "Sign up",
  nav_home: "Home",
  nav_about: "About",
  nav_help: "Help",
  nav_login: "Login",
  nav_signup: "Sign up",
  nav_find: "Find My Path",
  nav_saved: "My Saved Plans",
  nav_chat: "Chat History",
  nav_logout: "Log out",
  lang_toggle: "Filipino",
  dark: "Dark",
  light: "Light",
  disclaimer: "Guidance only — verify details directly with institutions before applying.",
  save_plan: "Save plan",
  export_pdf: "Export / Print",
  eligibility: "Eligibility check",
  paths_title: "3 Recommended paths",
  compare_title: "Side-by-side comparison",
  deadlines_title: "Deadlines & application periods",
  next: "Next",
  back: "Back",
  submit: "Get my paths",
  loading: "Analyzing your profile against DOLE, CHED, TESDA, and industry data…",
  q_status: "What is your current status?",
  q_skills: "What are your key skills & strengths?",
  q_hobbies: "Your hobbies & talents?",
  q_plan: "What's your next plan or goal?",
  q_target: "Any target career or field?",
  q_mode: "Preferred study or work mode?",
  q_budget: "Budget range (PHP / year)?",
  q_location: "Full location (Region → Province → City)?",
  region: "Region",
  province: "Province",
  city: "City / Municipality",
  no_saved: "You have no saved plans yet.",
};

const fil: Dict = {
  app_name: "PathFinder AI",
  tagline: "Ang gabay mo sa karera at edukasyon sa Pilipinas.",
  hero_sub: "Kunin ang personalized na landas sa pag-aaral, training, at karera — batay sa opisyal na Philippine sources.",
  cta_start: "Hanapin ang landas ko",
  cta_login: "Mag-log in",
  cta_signup: "Mag-sign up",
  nav_home: "Home",
  nav_about: "Tungkol",
  nav_help: "Tulong",
  nav_login: "Log in",
  nav_signup: "Sign up",
  nav_find: "Hanapin ang Landas",
  nav_saved: "Mga Naka-save",
  nav_chat: "Kasaysayan ng Chat",
  nav_logout: "Mag-log out",
  lang_toggle: "English",
  dark: "Madilim",
  light: "Maliwanag",
  disclaimer: "Gabay lamang — palaging kumpirmahin sa institusyon bago mag-apply.",
  save_plan: "I-save ang plano",
  export_pdf: "I-export / Print",
  eligibility: "Pagsusuri ng eligibility",
  paths_title: "3 Inirerekomendang landas",
  compare_title: "Paghahambing",
  deadlines_title: "Mga deadline at application period",
  next: "Susunod",
  back: "Bumalik",
  submit: "Kunin ang aking landas",
  loading: "Sinusuri ang iyong profile gamit ang datos ng DOLE, CHED, TESDA…",
  q_status: "Ano ang iyong kasalukuyang katayuan?",
  q_skills: "Mga pangunahing kasanayan at lakas mo?",
  q_hobbies: "Mga libangan at talento mo?",
  q_plan: "Ano ang iyong susunod na plano o layunin?",
  q_target: "May target na karera o field ka ba?",
  q_mode: "Ano ang gusto mong mode ng pag-aaral o trabaho?",
  q_budget: "Range ng badyet (PHP / taon)?",
  q_location: "Buong lokasyon (Rehiyon → Probinsya → Lungsod)?",
  region: "Rehiyon",
  province: "Probinsya",
  city: "Lungsod / Munisipyo",
  no_saved: "Wala ka pang naka-save na plano.",
};

const dicts: Record<Lang, Dict> = { en, fil };

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("pf-lang") as Lang | null) : null;
    if (saved === "en" || saved === "fil") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("pf-lang", l);
  };

  const t = (k: string) => dicts[lang][k] ?? dicts.en[k] ?? k;
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);