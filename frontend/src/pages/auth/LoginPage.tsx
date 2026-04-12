import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Building2,
  Eye,
  EyeOff,
  MapPin,
  Shield,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../core/api/axiosInstance";
import { authEndpoints } from "../../core/api/endpoints";
import { useAuthStore } from "../../stores/authStore";
import type { User } from "../../stores/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("E-posta ve şifre zorunludur.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data: tokens } = await axiosInstance.post<{
        access_token: string;
        refresh_token: string;
      }>(authEndpoints.login, { email, password });
      const { data: user } = await axiosInstance.get<User>(authEndpoints.me, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      setAuth(user, tokens.access_token, tokens.refresh_token);
      navigate("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "E-posta veya şifre hatalı.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Gradient arka plan orb'ları */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* ── SOL PANEL ──────────────────────────────────────────────────── */}
      <div className="auth-left">
        {/* Logo */}
        <div className="auth-left-logo">
          <div className="auth-left-logo-icon">
            <Shield size={22} color="white" />
          </div>
          <div className="auth-left-logo-text">
            <span className="auth-left-logo-name">AIDEP</span>
            <span className="auth-left-logo-sub">Afet Yönetim Sistemi</span>
          </div>
        </div>

        {/* Orta içerik */}
        <div className="auth-left-body">
          <div>
            <h1 className="auth-left-heading">
              Afet müdahalesini
              <br />
              <span>koordine edin.</span>
            </h1>
            <p className="auth-left-desc">
              STK yetkilileri için web paneli: hasar takibi, talepler ve harita
              üzerinden kurumsal koordinasyon. Gönüllü işlemleri mobil
              uygulamada.
            </p>
          </div>

          <div className="auth-left-features">
            <div className="auth-left-feature">
              <div className="auth-left-feature-dot auth-left-feature-dot--red">
                <Activity size={13} />
              </div>
              <div>
                <div className="auth-left-feature-title">
                  Canlı Hasar Takibi
                </div>
                <div className="auth-left-feature-sub">
                  AI destekli YOLOv8 ile otomatik hasar sınıflandırması
                </div>
              </div>
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-dot auth-left-feature-dot--blue">
                <MapPin size={13} />
              </div>
              <div>
                <div className="auth-left-feature-title">
                  Coğrafi Harita Görünümü
                </div>
                <div className="auth-left-feature-sub">
                  PostGIS destekli gerçek zamanlı konum izleme
                </div>
              </div>
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-dot auth-left-feature-dot--green">
                <Building2 size={13} />
              </div>
              <div>
                <div className="auth-left-feature-title">
                  Kurumsal koordinasyon
                </div>
                <div className="auth-left-feature-sub">
                  STK hesabınızla talep ve saha görünümü
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          © 2025 AIDEP Platform · Tüm hakları saklıdır.
        </div>
      </div>

      {/* ── SAĞ PANEL ──────────────────────────────────────────────────── */}
      <div className="auth-right">
        <motion.div
          className="auth-right-inner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <div>
            <h2 className="auth-right-title">Giriş Yap</h2>
            <p className="auth-right-subtitle">
              Hesabınıza erişmek için kimlik bilgilerinizi girin.
            </p>
          </div>

          <div className="auth-card">
            <div className="auth-fields">
              {/* Email */}
              <input
                className="auth-input"
                type="email"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="email"
              />

              {/* Şifre */}
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Hata */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="auth-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <AlertTriangle size={14} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buton */}
              <motion.button
                className="auth-btn"
                onClick={handleLogin}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.015 }}
                whileTap={{ scale: isLoading ? 1 : 0.975 }}
              >
                {isLoading ? <span className="auth-spinner" /> : "Giriş Yap"}
              </motion.button>
            </div>

            <div className="auth-card-footer">
              <span>
                Hesabınız yok mu?{" "}
                <Link to="/register" className="auth-link">
                  Kayıt Ol
                </Link>
              </span>
              <Link to="/forgot-password" className="auth-link">
                Şifremi unuttum
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
