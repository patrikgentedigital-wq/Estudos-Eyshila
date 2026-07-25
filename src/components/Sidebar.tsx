import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Globe, 
  Moon, 
  Sun,
  GraduationCap,
  Sparkles,
  Compass,
  CreditCard
} from "lucide-react";
import { Tab, Language, translations, UserProfile } from "../types";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  language: Language;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  profile: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  language,
  darkMode,
  setDarkMode,
  profile,
  onLogout
}: SidebarProps) {
  const t = translations[language];

  const menuItems = [
    { id: "dashboard" as Tab, label: t.navDashboard, icon: LayoutDashboard },
    { id: "roadmap" as Tab, label: t.navRoadmap, icon: Compass },
    { id: "modules" as Tab, label: t.navModules, icon: BookOpen },
    { id: "exams" as Tab, label: t.navExams, icon: Award },
    { id: "flashcards" as Tab, label: t.navFlashcards, icon: CreditCard },
    { id: "performance" as Tab, label: t.navPerformance, icon: TrendingUp },
    { id: "ai-study" as Tab, label: t.navAiStudy, icon: Sparkles },
  ];

  return (
    <aside 
      id="app-sidebar"
      className="h-full w-64 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 transition-colors duration-300 pt-12 lg:pt-4"
    >
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 mb-1">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-base font-display font-black tracking-tight leading-snug">
            Portal de Estudos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              Eyshila Caxias
            </span>
          </h1>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/90 mt-1">
          ENARE • RESIDÊNCIA ENFERMAGEM
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xs">
        <div className="flex items-center space-x-3">
          <img
            src={profile.avatar}
            alt={profile.firstName}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full border-2 border-indigo-500/60 object-cover shadow-md shadow-indigo-500/10"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-extrabold text-slate-100 truncate">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-emerald-400/90 font-bold truncate">
                {profile.residencyYear}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold shadow-lg shadow-indigo-500/25 scale-[1.02]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <IconComponent className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Start Quiz CTA inside Navigation */}
        <div className="pt-4 px-1">
          <button
            id="sidebar-cta-quiz"
            onClick={() => setActiveTab("exams")}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white transition-all py-3 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <span>✨ {t.startQuizBtn}</span>
          </button>
        </div>
      </nav>

      {/* Quick Utilities: Theme Toggle */}
      <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-end">
        {/* Theme switcher */}
        <button
          id="btn-theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
          title={darkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>

      {/* Bottom Settings and Logout Links */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          id="nav-link-settings"
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === "settings"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>{t.navSettings}</span>
        </button>

        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{t.logoutBtn}</span>
        </button>
      </div>
    </aside>
  );
}
