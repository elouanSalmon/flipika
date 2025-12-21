import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { AlertCircle, Zap } from "lucide-react";
import "../components/Header.css"; // Ensure we have access to logo styles if needed, or we rely on index.css
import Footer from "../components/Footer";

const Login = () => {
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      let errorMessage = "Une erreur est survenue lors de la connexion.";
      let code: string | undefined;
      if (typeof err === "object" && err !== null && "code" in err) {
        code = (err as { code?: string }).code;
      }
      if (code === "auth/configuration-not-found") {
        errorMessage =
          "Configuration Firebase manquante. Vérifiez la console Firebase.";
      } else if (code === "auth/popup-closed-by-user") {
        errorMessage = "La fenêtre de connexion a été fermée.";
      } else if (code === "auth/operation-not-allowed") {
        errorMessage = "La connexion Google n'est pas activée dans Firebase.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-connected min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-bg-secondary)]">
      {/* Page Header */}
      <header className="h-16 glass border-b border-[var(--color-border)] backdrop-blur-md">
        <div className="content-container h-full flex items-center justify-between">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <Zap size={20} />
            </div>
            <div className="logo-content">
              <span className="logo-text gradient-text text-xl">Flipika</span>
              <span className="logo-subtitle text-xs">Access</span>
            </div>
          </Link>
          <span className="text-xs text-[var(--color-text-muted)]">
            Secure Environment
          </span>
        </div>
      </header>
      {/* Background Gradients using CSS variables */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "var(--gradient-primary)",
            opacity: 0.1,
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "40vw",
            height: "40vw",
            borderRadius: "50%",
            background: "var(--color-secondary)",
            opacity: 0.1,
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md p-8 glass rounded-2xl relative z-10 flex flex-col items-center"
        >
          <div className="text-center mb-8">
            <p className="text-secondary">
              Cockpit d'optimisation IA pour Google Ads
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Google Button - Custom styling but consistent sizing */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn btn-outline"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Page Footer identical to landing */}
      <Footer />
    </div>
  );
};

export default Login;
