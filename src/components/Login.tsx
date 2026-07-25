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
  Brain,
  Award,
  Clock,
  Target,
  Zap
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
        setError("E-mail ou senha incorretos. Se ainda não tem uma conta, clique na aba 'Criar Conta' acima.");
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
    <div className="min-h-screen flex bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Background Animated Glow Spheres */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Panel: Luxury Hero Showcase (Desktop) */}
      <div className="hidden lg:flex lg:w-7/12 p-16 flex-col justify-between relative z-10 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">
              Portal de Estudos <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">Eyshila Caxias</span>
            </h1>
            <span className="text-[11px] font-extrabold text-indigo-400 tracking-widest uppercase font-mono block">
              ENARE • RESIDÊNCIA ENFERMAGEM 2026/2027
            </span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div className="space-y-8 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-xs font-black text-indigo-300 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-spin" />
            <span>Plataforma Inteligente de Alta Performance</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Sua aprovação no <span className="bg-gradient-to-r from-white via-indigo-100 to-teal-200 bg-clip-text text-transparent">ENARE 2026/2027</span> começa aqui.
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Materiais didáticos científicos, simulados com inteligência artificial, caderno de erros automatizado e acompanhamento de nota de corte para hospitais de residência.
          </p>

          {/* ENARE Target Date Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600/30 text-indigo-300 rounded-xl border border-indigo-500/40">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-mono block">CONCURSO ENARE 2026/2027</span>
                <span className="text-xs font-bold text-white">Prova Objetiva: 13 de Setembro de 2026</span>
              </div>
            </div>
            <span className="text-[11px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full font-mono">
              Oficial MEC/EBSERH
            </span>
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5">
              <Brain className="h-5 w-5 text-indigo-400" />
              <p className="font-extrabold text-xs text-white">Resumos & Questões com IA</p>
              <p className="text-[11px] text-slate-400">Fundamentação COFEN 736/2024</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1.5">
              <Award className="h-5 w-5 text-teal-400" />
              <p className="font-extrabold text-xs text-white">Simulador de Nota de Corte</p>
              <p className="text-[11px] text-slate-400">EBSERH, USP, UNIFESP, INCA</p>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center space-x-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Dados 100% Protegidos</span>
          </span>
          <span className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
            <span>Foco Exclusivo em Enfermagem</span>
          </span>
        </div>
      </div>

      {/* Right Panel: Luxury Auth Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between p-6 sm:p-12 relative z-10 my-auto">
        
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Mobile Top Branding */}
          <div className="lg:hidden flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-black text-white">Portal Eyshila Caxias</h1>
                <span className="text-[10px] font-bold text-indigo-400 font-mono">ENARE ENFERMAGEM</span>
              </div>
            </div>
          </div>

          {/* Form Luxury Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
            
            {/* Header & Tab Switcher */}
            <div className="space-y-4">
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    !isRegistering 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Entrar na Conta
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isRegistering 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Criar Conta Grátis
                </button>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {isRegistering ? "Crie sua conta de estudante" : "Bem-vindo(a) de volta!"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {isRegistering 
                    ? "Digite seu e-mail e senha para desbloquear o portal" 
                    : "Acesse seus simulados, resumos e desempenho"}
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-4 rounded-2xl font-medium flex items-center space-x-3 animate-fade-in">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider mb-1.5 text-slate-400 font-mono" htmlFor="login-email">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enfermagem@estudos.com.br"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-xs sm:text-sm font-medium text-white transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono" htmlFor="login-password">
                    {t.passwordLabel}
                  </label>
                  {!isRegistering && (
                    <a 
                      id="link-forgot-pw"
                      href="#forgot" 
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Instruções de recuperação enviadas para o seu e-mail.");
                      }}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {t.forgotPassword}
                    </a>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-xs sm:text-sm font-medium text-white transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 hover:opacity-95 text-white font-black py-4 px-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 text-xs sm:text-sm cursor-pointer mt-2"
              >
                <span>
                  {loading 
                    ? "Acessando Plataforma..." 
                    : (isRegistering ? "Criar Conta & Iniciar Estudos" : "Entrar no Portal")}
                </span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>

          {/* Footer Copyright */}
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 font-mono">
              &copy; {new Date().getFullYear()} Portal de Estudos Enfermagem • ENARE
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
