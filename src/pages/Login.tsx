import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, BarChart3, Zap, Shield, Sparkles, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const Login = () => {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { t: tSeo } = useTranslation('seo');

  useEffect(() => {
    if (currentUser) {
      navigate("/app/reports");
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      console.error("Login Error:", err);
      let errorMessage = t('auth.login.error');
      let code: string | undefined;
      if (typeof err === "object" && err !== null && "code" in err) {
        code = (err as { code?: string }).code;
      }
      if (code === "auth/configuration-not-found") {
        errorMessage = t('auth.login.configError');
      } else if (code === "auth/popup-closed-by-user") {
        errorMessage = t('auth.login.popupError');
      } else if (code === "auth/operation-not-allowed") {
        errorMessage = t('auth.login.disabledError');
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for the "Wall of Cards" on the right - STRICT PRIMARY BLUE THEME
  const mockCards = [
    { title: "Rapport Mensuel", subtitle: "Google Ads • Octobre", icon: <BarChart3 size={20} />, color: "bg-[#1963D5]" },
    { title: "Audit Performance", subtitle: "Analyse IA", icon: <Zap size={20} />, color: "bg-[#1963D5]" },
    { title: "Note Stratégique", subtitle: "Q4 2025", icon: <FileText size={20} />, color: "bg-[#1963D5]" },
    { title: "Campagne Black Friday", subtitle: "Conversion +15%", icon: <Sparkles size={20} />, color: "bg-[#1963D5]" },
    { title: "Review Hebdomadaire", subtitle: "Client: Nike", icon: <BarChart3 size={20} />, color: "bg-[#1963D5]" },
    { title: "Opportunités IA", subtitle: "Recommandations", icon: <Zap size={20} />, color: "bg-[#1963D5]" },
  ];

  const benefits = [
    { text: t('auth.benefits.reports'), icon: <Zap size={18} className="text-[#1963D5]" /> },
    { text: t('auth.benefits.ai'), icon: <Sparkles size={18} className="text-[#1963D5]" /> },
    { text: t('auth.benefits.security'), icon: <Shield size={18} className="text-[#1963D5]" /> },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-black font-sans">
      <SEO
        title={tSeo('login.title')}
        description={tSeo('login.description')}
        keywords={tSeo('login.keywords')}
        canonicalPath="/login"
      />
      {/* Main content - takes full viewport height */}
      <div className="min-h-screen w-full flex relative">

        {/* LEFT COLUMN - LOGIN */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-between p-8 lg:p-12 xl:p-16 relative z-10 bg-gradient-to-br from-primary-50/50 via-white to-primary-50/30 dark:from-black dark:to-neutral-900 border-r border-neutral-100 dark:border-white/10 text-neutral-900 dark:text-neutral-200">

          {/* Minimal Header - Logo + Language */}
          <div className="flex items-center justify-between w-full mb-8">
            <Logo />
            <LanguageSwitcher />
          </div>

          {/* Main Content */}
          <div className="flex flex-col max-w-sm w-full mx-auto space-y-8 relative z-20 flex-1 justify-center">

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-200">
                {t('auth.login.title')}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                {t('auth.login.subtitle')} <br className="hidden lg:block" />
                <span className="text-primary font-medium">{t('auth.login.subtitle2')}</span>
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-[#1963D5] hover:bg-[#0741e0] text-white font-medium transition-all duration-200 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="bg-white p-1 rounded-full">
                      <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-4 h-4"
                      />
                    </div>
                    <span className="text-base">{t('auth.login.google')}</span>
                    <ArrowRight size={18} className="opacity-60 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4 py-4">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-black"></div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('auth.benefits.title')}</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-black"></div>
              </div>

              {/* Reassurance/Benefits */}
              <div className="space-y-4 pt-2">
                {benefits.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-white dark:bg-black flex items-center justify-center border border-neutral-100 dark:border-white/10 shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Reassurance text (Footer handled by PublicLayout) */}
          <div className="text-xs text-neutral-400 dark:text-neutral-400 relative z-20 mt-8">
            {t('auth.footer.rights')}
          </div>
        </div>

        {/* RIGHT COLUMN - VISUAL WALL */}
        <div className="hidden lg:flex w-[55%] xl:w-[60%] items-center justify-center relative bg-[#F8FAFC] dark:bg-black overflow-hidden">

          {/* Subtle Background Gradients - Blue nuance only */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />

          {/* Masonry Grid Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(#6b6e77 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          </div>

          {/* Tilted Card Wall Container */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'perspective(2000px) rotateX(15deg) rotateY(-15deg) rotateZ(6deg) translateX(10%) translateY(-5%)',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="grid grid-cols-2 gap-8 p-8 min-w-[1000px]">
              {/* Generated Mock Cards */}
              {mockCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (idx * 0.1), duration: 0.8, ease: "easeOut" }}
                  className="p-6 bg-white dark:bg-black rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-neutral-200/60 dark:border-white/10 flex flex-col gap-6 backdrop-blur-xl hover:scale-[1.02] transition-transform duration-500 will-change-transform"
                >
                  {/* Fake Image Content */}
                  <div className="h-40 w-full bg-neutral-50 dark:bg-black rounded-2xl overflow-hidden relative group border border-neutral-100 dark:border-white/10">
                    <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl ${card.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                      {card.icon}
                    </div>

                    {/* Abstract UI content */}
                    <div className="absolute top-20 left-4 right-4 space-y-3 opacity-60">
                      <div className="h-2 w-3/4 bg-neutral-200 dark:bg-black rounded-full"></div>
                      <div className="h-2 w-1/2 bg-neutral-200 dark:bg-black rounded-full"></div>
                      <div className="flex gap-2 mt-4">
                        <div className="h-12 w-1/3 bg-primary-100/50 dark:bg-primary-900/20 rounded-lg"></div>
                        <div className="h-12 w-1/3 bg-indigo-100/50 dark:bg-indigo-900/20 rounded-lg"></div>
                        <div className="h-12 w-1/3 bg-sky-100/50 dark:bg-sky-900/20 rounded-lg"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-200 leading-tight">{card.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-500">{card.subtitle}</p>
                      <div className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-50 text-primary dark:bg-primary-900/30 dark:text-primary-light">Success</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Overlay to fade out edges - top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-[#F8FAFC] dark:from-black dark:to-black opacity-60" />
        </div>

        {/* Floating Orbs - Blue Lights */}
        <motion.div
          className="floating-orb orb-1"
          style={{ zIndex: 11 }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="floating-orb orb-2"
          style={{ zIndex: 11 }}
          animate={{
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Footer - appears when user scrolls down */}
      <Footer />
    </div>
  );
};

export default Login;
