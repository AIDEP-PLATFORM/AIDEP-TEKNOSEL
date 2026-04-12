import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle,
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
import type { User as AuthUser } from "../../stores/authStore";

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 56 : -56, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -56 : 56,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  /* Adım 1 */
  const [fullName, setFullName] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  /* Adım 2 — yalnızca STK (ngo) */
  const [city, setCity] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const validateStep1 = (): string | null => {
    if (!fullName.trim() || fullName.trim().length < 2)
      return "Ad Soyad en az 2 karakter olmalıdır.";
    if (!/^\d{11}$/.test(tcNo))
      return "TC Kimlik No 11 haneli rakam olmalıdır.";
    if (!/^\+?[\d\s\-]{10,15}$/.test(phone))
      return "Geçerli bir telefon numarası giriniz.";
    if (!email.trim()) return "E-posta adresi zorunludur.";
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!organization.trim()) return "STK kurum adı zorunludur.";
    if (password.length < 8) return "Şifre en az 8 karakter olmalıdır.";
    if (password !== passConfirm) return "Şifreler eşleşmiyor.";
    return null;
  };

  const goNext = () => {
    setError(null);
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setDir(1);
    setStep(2);
  };

  const goBack = () => {
    setError(null);
    setDir(-1);
    setStep(1);
  };

  const handleRegister = async () => {
    setError(null);
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        email,
        password,
        phone,
        tc_no: tcNo,
        full_name: fullName,
        role: "ngo" as const,
        organization: organization.trim(),
        ...(city.trim() ? { city: city.trim() } : {}),
      };
      const { data: tokens } = await axiosInstance.post<{
        access_token: string;
        refresh_token: string;
      }>(authEndpoints.register, payload);
      const { data: user } = await axiosInstance.get<AuthUser>(
        authEndpoints.me,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        },
      );
      setAuth(user, tokens.access_token, tokens.refresh_token);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Kayıt sırasında bir hata oluştu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const LeftPanel = () => (
    <div className="auth-left">
      <div className="auth-left-logo">
        <div className="auth-left-logo-icon">
          <Shield size={22} color="white" />
        </div>
        <div className="auth-left-logo-text">
          <span className="auth-left-logo-name">AIDEP</span>
          <span className="auth-left-logo-sub">Afet Yönetim Sistemi</span>
        </div>
      </div>

      <div className="auth-left-body">
        <div>
          <h1 className="auth-left-heading">
            STK olarak
            <br />
            <span>web paneline kayıt.</span>
          </h1>
          <p className="auth-left-desc">
            Bu kayıt formu yalnızca sivil toplum kuruluşu yetkilileri içindir.
            Gönüllü ve vatandaş işlemleri mobil uygulama üzerinden yapılır.
          </p>
        </div>
        <div className="auth-left-features">
          <div className="auth-left-feature">
            <div className="auth-left-feature-dot auth-left-feature-dot--red">
              <Activity size={13} />
            </div>
            <div>
              <div className="auth-left-feature-title">Operasyon özeti</div>
              <div className="auth-left-feature-sub">
                Talepler ve harita üzerinden kurumsal takip
              </div>
            </div>
          </div>
          <div className="auth-left-feature">
            <div className="auth-left-feature-dot auth-left-feature-dot--blue">
              <MapPin size={13} />
            </div>
            <div>
              <div className="auth-left-feature-title">Coğrafi görünüm</div>
              <div className="auth-left-feature-sub">
                Hasar ve rota katmanlarıyla koordinasyon
              </div>
            </div>
          </div>
          <div className="auth-left-feature">
            <div className="auth-left-feature-dot auth-left-feature-dot--green">
              <Building2 size={13} />
            </div>
            <div>
              <div className="auth-left-feature-title">Kurum profili</div>
              <div className="auth-left-feature-sub">
                STK adı ve yetkili bilgileri güvenli şekilde saklanır
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-left-footer">
        © 2025 AIDEP Platform · Tüm hakları saklıdır.
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <LeftPanel />
        <div className="auth-right">
          <motion.div
            className="auth-success-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <CheckCircle size={48} color="#10b981" />
            </motion.div>
            <h2>Kayıt başarılı</h2>
            <p>STK hesabınız oluşturuldu. Panele yönlendiriliyorsunuz...</p>
            <div className="auth-progress-bar">
              <motion.div
                className="auth-progress-fill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <LeftPanel />

      <div className="auth-right">
        <motion.div
          className="auth-right-inner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ maxWidth: 440 }}
        >
          <div>
            <h2 className="auth-right-title">STK kaydı</h2>
            <p className="auth-right-subtitle">
              Kurum yetkilisi olarak hesap oluşturun.
            </p>
          </div>

          <div className="auth-steps">
            <div className={`auth-step-circle ${step >= 1 ? "active" : ""}`}>
              1
            </div>
            <div className={`auth-step-line ${step === 2 ? "filled" : ""}`} />
            <div className={`auth-step-circle ${step === 2 ? "active" : ""}`}>
              2
            </div>
          </div>

          <div className="auth-card" style={{ overflow: "hidden" }}>
            <AnimatePresence mode="wait" custom={dir}>
              {step === 1 ? (
                <motion.div
                  key="s1"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className="auth-card-header">
                    <h2>Yetkili bilgileri</h2>
                    <p>STK hesabı için kimlik bilgilerinizi girin.</p>
                  </div>

                  <div className="auth-fields">
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Ad Soyad"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                    />

                    <input
                      className="auth-input"
                      type="text"
                      placeholder="TC Kimlik Numarası (11 hane)"
                      value={tcNo}
                      onChange={(e) =>
                        setTcNo(e.target.value.replace(/\D/g, "").slice(0, 11))
                      }
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                    />

                    <input
                      className="auth-input"
                      type="tel"
                      placeholder="Telefon (ör. +90 555 000 0000)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                    />

                    <input
                      className="auth-input"
                      type="email"
                      placeholder="E-posta adresi"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && goNext()}
                    />

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

                    <motion.button
                      className="auth-btn"
                      onClick={goNext}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.975 }}
                    >
                      Devam →
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="s2"
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <div className="auth-card-header">
                    <h2>Kurum ve güvenlik</h2>
                    <p>STK adı, şehir ve şifre bilgilerinizi belirleyin.</p>
                  </div>

                  <div className="auth-fields">
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="STK / kurum adı (zorunlu)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />

                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Şehir (opsiyonel)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />

                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Şifre (en az 8 karakter)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type={showPass2 ? "text" : "password"}
                        placeholder="Şifreyi onayla"
                        value={passConfirm}
                        onChange={(e) => setPassConfirm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPass2((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

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

                    <div className="auth-btn-row">
                      <motion.button
                        className="auth-btn auth-btn--ghost"
                        onClick={goBack}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.975 }}
                      >
                        ← Geri
                      </motion.button>
                      <motion.button
                        className="auth-btn"
                        onClick={handleRegister}
                        disabled={isLoading}
                        style={{ flex: 1 }}
                        whileHover={{ scale: isLoading ? 1 : 1.015 }}
                        whileTap={{ scale: isLoading ? 1 : 0.975 }}
                      >
                        {isLoading ? (
                          <span className="auth-spinner" />
                        ) : (
                          "Kayıt ol"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="auth-card-footer" style={{ marginTop: 8 }}>
              <span>
                Zaten hesabınız var mı?{" "}
                <Link to="/login" className="auth-link">
                  Giriş yapın
                </Link>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
