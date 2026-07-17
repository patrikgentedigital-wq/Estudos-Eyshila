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
      className="h-full w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-colors duration-300 pt-12 lg:pt-4"
    >
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 mb-1">
          <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">
            Portal <span className="text-sky-500">Estudos</span>
          </h1>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Portal de Estudos Enfermagem
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <img
            src={profile.avatar}
            alt={profile.firstName}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full border-2 border-sky-500 object-cover shadow-inner"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-200 truncate">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs text-slate-400 truncate font-mono">
              {profile.residencyYear}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sky-600 text-white shadow-md shadow-sky-950/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Start Quiz CTA inside Navigation */}
        <div className="pt-4 px-1">
          <button
            id="sidebar-cta-quiz"
            onClick={() => setActiveTab("exams")}
            className="w-full bg-slate-800 hover:bg-sky-700 hover:text-white text-sky-400 border border-sky-500/20 hover:border-transparent transition-all py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <span>✨ {t.startQuizBtn}</span>
          </button>
        </div>
      </nav>

      {/* Quick Utilities: Theme Toggle */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/20 flex items-center justify-end">
        {/* Theme switcher */}
        <button
          id="btn-theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title={darkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {darkMode ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-slate-400" />
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
