import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";
import { 
  GraduationCap,
  Lock,
  Mail, 
  ArrowRight, 
  Moon, 
  Sun,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Brain,
  Award
} from "lucide-react";
import { Language, translations } from "../types";

interface LoginProps {
  onLoginSuccess: (email: string, uid: string) => void;
  language: Language;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Login({
  onLoginSuccess,
  language,
  darkMode,
  setDarkMode
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const t = translations[language];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Por favor, digite seu e-mail.");
      return;
    }
    if (!password) {
      setError("Por favor, digite sua senha.");
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        // Local mode fallback
        const mockUid = "user-" + btoa(email).slice(0, 12);
        onLoginSuccess(email, mockUid);
        return;
      }

      if (isRegistering) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpErr) throw signUpErr;
        if (data.user) {
          onLoginSuccess(data.user.email || email, data.user.id);
        } else {
          setError("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        }
      } else {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) throw signInErr;
        if (data.user) {
          onLoginSuccess(data.user.email || email, data.user.id);
        }
      }
    } catch (err: any) {
      console.error("[Supabase Auth Error]", err);
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials")) {
        setError("E-mail ou senha incorretos. Se ainda não tem uma conta, clique em 'Cadastre-se' abaixo.");
      } else if (msg.includes("User already registered")) {
        setError("Este e-mail já está cadastrado.");
      } else if (msg.includes("Password should be at least")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(msg || "Falha na autenticação. Verifique os dados digitados.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? "bg-black text-slate-100" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Left Panel: Hero Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 p-12 flex-col justify-between relative overflow-hidden text-white border-r border-slate-800">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        
        {/* Brand */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-10 w-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">
            Portal <span className="text-sky-400">Estudos</span>
          </h1>
        </div>

        {/* Hero Central Content */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-300">
            <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
            <span>Plataforma Inteligente para ENARE & Residências</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Sua aprovação na residência começa aqui.
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Acesse materiais didáticos de alto nível, simulados com IA, flashcards de repetição espaçada e roteiros de estudo personalizados de Enfermagem.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <Brain className="h-5 w-5 text-sky-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Resumos com IA</p>
                <p className="text-slate-400 text-[11px]">Gerados via Gemini</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 border border-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <Award className="h-5 w-5 text-purple-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Simulados ENARE</p>
                <p className="text-slate-400 text-[11px]">Questões comentadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center space-x-6 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Dados 100% Protegidos</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            <span>Foco em Enfermagem</span>
          </span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16">
        
        {/* Header Toggles */}
        <div className="flex justify-between items-center mb-8">
          <div className="lg:hidden flex items-center space-x-2">
            <div className="h-9 w-9 bg-sky-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-bold tracking-tight text-lg">
              Portal <span className="text-sky-600">Estudos</span>
            </span>
          </div>

          <div className="ml-auto">
            <button
              id="login-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                darkMode 
                  ? "border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400" 
                  : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-xs"
              }`}
              title={darkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 font-mono">
              {isRegistering ? "Novo Cadastro" : "Acesso de Alunos"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight mt-1">
              {isRegistering ? "Crie sua conta" : "Bem-vindo de volta!"}
            </h2>
            <p className={`text-xs sm:text-sm mt-1.5 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {isRegistering 
                ? "Cadastre-se com seu e-mail para desbloquear a plataforma"
                : t.loginSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-xl font-medium flex items-center space-x-3.5 animate-slide-up">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400" htmlFor="login-email">
                {t.emailLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enfermagem@estudos.com.br"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-none ${
                    darkMode 
                      ? "bg-slate-900/80 border-slate-800 focus:border-sky-500 focus:bg-slate-900 text-slate-100" 
                      : "bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="login-password">
                  {t.passwordLabel}
                </label>
                {!isRegistering && (
                  <a 
                    id="link-forgot-pw"
                    href="#forgot" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Função de redefinição enviada para o suporte do portal.");
                    }}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    {t.forgotPassword}
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-none ${
                    darkMode 
                      ? "bg-slate-900/80 border-slate-800 focus:border-sky-500 focus:bg-slate-900 text-slate-100" 
                      : "bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 text-slate-800"
                  }`}
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-sky-600/20 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
            >
              <span>
                {loading 
                  ? "Entrando..." 
                  : (isRegistering ? "Criar Conta e Estudar" : t.loginBtn)}
              </span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
                className={`text-xs font-bold transition-colors ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-500"}`}
              >
                {isRegistering 
                  ? "Já possui cadastro? Faça Login" 
                  : "Ainda não tem conta? Cadastre-se gratuitamente"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
            &copy; {new Date().getFullYear()} Portal de Estudos Enfermagem • ENARE
          </p>
        </div>
      </div>

    </div>
  );
}
