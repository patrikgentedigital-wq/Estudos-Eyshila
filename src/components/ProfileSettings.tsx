import React, { useState } from "react";
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Check, 
  Save, 
  Tag, 
  X,
  Lock,
  BellRing
} from "lucide-react";
import { Language, UserProfile, translations } from "../types";

interface ProfileSettingsProps {
  language: Language;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function ProfileSettings({
  language,
  profile,
  onSaveProfile
}: ProfileSettingsProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [institution, setInstitution] = useState(profile.institution);
  const [residencyYear, setResidencyYear] = useState(profile.residencyYear);
  const [focusAreas, setFocusAreas] = useState<string[]>(profile.focusAreas);
  const [notifications, setNotifications] = useState(profile.notifications);
  
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const t = translations[language];

  const availableTags = [
    "Cardiologia", "Pediatria", "Urgência e Emergência", "UTI Adulto", 
    "Neonatologia", "Bioética", "Legislação COFEN", "Neurologia", 
    "Anatomia", "Farmacologia"
  ];

  const handleToggleTag = (tag: string) => {
    if (focusAreas.includes(tag)) {
      setFocusAreas(focusAreas.filter(t => t !== tag));
    } else {
      setFocusAreas([...focusAreas, tag]);
    }
  };

  const [avatar, setAvatar] = useState(profile.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updated: UserProfile = {
      ...profile,
      firstName,
      lastName,
      email,
      institution,
      residencyYear,
      focusAreas,
      notifications,
      avatar
    };

    onSaveProfile(updated);
    triggerToast("Alterações salvas com sucesso! ✓", "success");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      triggerToast("Por favor, preencha todos os campos de senha.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("A nova senha e a confirmação não coincidem.", "error");
      return;
    }

    // Success
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Sua senha foi atualizada com sucesso! ✓", "success");
  };

  const triggerToast = (msg: string, type: "success" | "error") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Toast Alert floating */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center space-x-3 text-xs font-bold animate-fade-in ${
          toastType === "success" 
            ? "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-500"
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${toastType === "success" ? "bg-sky-500 animate-ping" : "bg-rose-500"}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {t.navSettings}
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
          Gerencie suas informações cadastrais, áreas de foco nos estudos e notificações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Profile Form & Specializations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Personal Info Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-5 flex items-center space-x-2">
              <User className="h-4.5 w-4.5 text-sky-500" />
              <span>Informações Pessoais</span>
            </h3>

            <form onSubmit={handleSaveChanges} className="space-y-5">
              {/* Profile Avatar Editor */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                <div className="relative group shrink-0">
                  <img
                    src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 shadow-md"
                  />
                  <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-[8px] font-extrabold uppercase text-center p-1 leading-tight select-none">
                    <span>Alterar</span>
                    <span>Foto</span>
                    <input
                      id="settings-avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    Foto de Perfil
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                    Selecione um arquivo de imagem para atualizar sua foto de perfil na barra lateral.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nome</label>
                  <input
                    id="settings-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Sobrenome</label>
                  <input
                    id="settings-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{t.emailLabel}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="settings-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Instituição de Ensino</label>
                  <input
                    id="settings-institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Foco de Estudos</label>
                  <select
                    id="settings-residency-year"
                    value={residencyYear}
                    onChange={(e) => setResidencyYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-sky-500 font-semibold"
                  >
                    <option value="Foco: ENARE Enfermeiro">Foco: ENARE Enfermeiro</option>
                    <option value="Foco: Residências Gerais">Foco: Residências Gerais</option>
                    <option value="Foco: Concursos Públicos">Foco: Concursos Públicos</option>
                  </select>
                </div>
              </div>

              {/* Tag specializations block */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="block text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Áreas de Estudo Recomendadas (Interesse)</span>
                </span>
                
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const active = focusAreas.includes(tag);
                    return (
                      <button
                        key={tag}
                        id={`btn-tag-${tag}`}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                          active 
                            ? "bg-sky-600 border-transparent text-white shadow-xs" 
                            : "bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        {tag} {active ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  id="btn-save-profile-details"
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-sky-600/10 transition-all flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar Perfil</span>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right 1 Col: Security Panel & Notifications */}
        <div className="space-y-8">
          
          {/* Security / Password reset */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-5 flex items-center space-x-2">
              <Lock className="h-4.5 w-4.5 text-sky-500" />
              <span>Senha de Acesso</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Senha Atual</label>
                <input
                  id="pw-old"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nova Senha</label>
                <input
                  id="pw-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirmar Nova Senha</label>
                <input
                  id="pw-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
                />
              </div>

              <button
                id="btn-update-password"
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
              >
                Atualizar Senha
              </button>
            </form>
          </div>

          {/* Notification preferences */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <BellRing className="h-4.5 w-4.5 text-sky-500" />
              <span>Notificações</span>
            </h3>

            <div className="space-y-4 pt-1">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Lembretes de Estudos</span>
                  <p className="text-[10px] text-slate-400">Diário, alertando lições em progresso.</p>
                </div>
                <input
                  id="notif-reminders"
                  type="checkbox"
                  checked={notifications.reminders}
                  onChange={(e) => setNotifications({ ...notifications, reminders: e.target.checked })}
                  className="h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Prazos de Simulados</span>
                  <p className="text-[10px] text-slate-400">Avisar proximidade de simulados semanais.</p>
                </div>
                <input
                  id="notif-deadlines"
                  type="checkbox"
                  checked={notifications.deadlines}
                  onChange={(e) => setNotifications({ ...notifications, deadlines: e.target.checked })}
                  className="h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </div>

              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Flashcards Masterizados</span>
                  <p className="text-[10px] text-slate-400">Notificar quando você alcançar metas de memorização.</p>
                </div>
                <input
                  id="notif-approvals"
                  type="checkbox"
                  checked={notifications.approvals}
                  onChange={(e) => setNotifications({ ...notifications, approvals: e.target.checked })}
                  className="h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
