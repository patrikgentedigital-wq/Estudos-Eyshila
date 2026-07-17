import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app, isFirebaseConfigured } from "../firebase";
import { 
  GraduationCap,
  Lock,
  Mail, 
  ArrowRight, 
  Globe, 
  Moon, 
  Sun,
  ShieldCheck,
  UserCheck,
  Sparkles
} from "lucide-react";
import { Language, translations } from "../types";
import { IMAGES } from "../data";

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
      if (!isFirebaseConfigured) {
        throw new Error("auth/api-key-not-valid");
      }
      const authInstance = getAuth(app);
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(authInstance, email, password);
      }
      
      const user = userCredential.user;
      onLoginSuccess(user.email || email, user.uid);
    } catch (err: any) {
      console.error(err);
      if (!isFirebaseConfigured || err.message === "auth/api-key-not-valid" || err.code?.includes("api-key-not-valid")) {
        if (!isFirebaseConfigured) {
          setError("Firebase não configurado. Vá nas Configurações da aplicação (ícone da engrenagem ⚙️) para configurar seu banco.");
        } else {
          setError("A chave de API do Firebase é inválida. Verifique se você copiou corretamente (sem cortar letras no final).");
        }
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("E-mail ou senha incorretos. Se ainda não tem uma conta, use o botão 'Cadastre-se' abaixo.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está cadastrado.");
      } else if (err.code === 'auth/weak-password') {
        setError("A senha é muito fraca. Use pelo menos 6 caracteres.");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("Autenticação não ativada. Ative o método 'E-mail/Senha' no Firebase Console > Authentication > Sign-in method.");
      } else {
        setError(`Falha na autenticação: ${err.code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? "bg-black text-slate-100" : "bg-slate-100 text-slate-800"}`}>
      
      {/* Centered Form Container */}
      <div className="w-full max-w-md flex flex-col justify-between p-8 md:p-12">
        
        {/* Top Header Row with Lang/Theme toggles */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <div className="bg-sky-600 text-white p-2 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-semibold tracking-tight text-xl">Portal <span className="text-sky-600 font-bold">Estudos</span></span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            <button
              id="login-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full border transition-all ${
                darkMode 
                  ? "border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-400" 
                  : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div>
            <h2 className="text-4xl font-display font-extrabold tracking-tight mt-4">
              Portal <span className="text-sky-600">Estudos</span>
            </h2>
            <p className={`text-sm mt-2 font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              {isRegistering 
                ? "Cadastre-se para iniciar seus estudos"
                : t.loginSubtitle}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs p-3.5 rounded-lg font-medium flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" htmlFor="login-email">
                {t.emailLabel}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@estudos.com.br"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    darkMode 
                      ? "bg-slate-900/60 border-slate-800 focus:border-sky-500 focus:bg-slate-900" 
                      : "bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider" htmlFor="login-password">
                  {t.passwordLabel}
                </label>
                { !isRegistering && (
                  <a 
                    id="link-forgot-pw"
                    href="#forgot" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Função de redefinição de senha não implementada neste ambiente.");
                    }}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    {t.forgotPassword}
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium transition-all outline-none ${
                    darkMode 
                      ? "bg-slate-900/60 border-slate-800 focus:border-sky-500 focus:bg-slate-900" 
                      : "bg-white border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  }`}
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-sky-600/20 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>
                {loading 
                  ? "Carregando..." 
                  : (isRegistering ? "Criar Conta" : t.loginBtn)}
              </span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className={`text-xs font-bold transition-colors ${darkMode ? "text-sky-400 hover:text-sky-300" : "text-sky-600 hover:text-sky-500"}`}
              >
                {isRegistering 
                  ? "Já tem uma conta? Faça Login" 
                  : "Não tem uma conta? Cadastre-se"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-700" : "text-slate-300"}`}>
            &copy; {new Date().getFullYear()} Portal de Estudos
          </p>
        </div>
      </div>

    </div>
  );
}
