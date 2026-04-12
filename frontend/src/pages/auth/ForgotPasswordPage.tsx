import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Lock, KeyRound, MailCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../core/api/axiosInstance';
import { authEndpoints } from '../../core/api/endpoints';

/* ── Sol Panel ──────────────────────────────────────────────────────────
   Hesap güvenliği temasıyla branding                                    */
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
          Hesabınız<br />
          <span>güvende.</span>
        </h1>
        <p className="auth-left-desc">
          Şifrenizi unutmanız durumunda kayıtlı e-posta adresinize
          güvenli bir sıfırlama bağlantısı gönderilir.
        </p>
      </div>

      <div className="auth-left-features">
        <div className="auth-left-feature">
          <div className="auth-left-feature-dot auth-left-feature-dot--red">
            <Lock size={13} />
          </div>
          <div>
            <div className="auth-left-feature-title">Şifreli Bağlantı</div>
            <div className="auth-left-feature-sub">Sıfırlama bağlantısı tek kullanımlık ve zaman sınırlıdır</div>
          </div>
        </div>
        <div className="auth-left-feature">
          <div className="auth-left-feature-dot auth-left-feature-dot--blue">
            <MailCheck size={13} />
          </div>
          <div>
            <div className="auth-left-feature-title">E-posta Doğrulama</div>
            <div className="auth-left-feature-sub">Yalnızca kayıtlı e-posta adresinize gönderilir</div>
          </div>
        </div>
        <div className="auth-left-feature">
          <div className="auth-left-feature-dot auth-left-feature-dot--green">
            <KeyRound size={13} />
          </div>
          <div>
            <div className="auth-left-feature-title">Güvenli Sıfırlama</div>
            <div className="auth-left-feature-sub">bcrypt ile şifrelenmiş yeni parola anında aktif olur</div>
          </div>
        </div>
      </div>
    </div>

    <div className="auth-left-footer">
      © 2025 AIDEP Platform · Tüm hakları saklıdır.
    </div>
  </div>
);

/* ── Ana Bileşen ────────────────────────────────────────────────────── */
const ForgotPasswordPage = () => {
  const [email,     setEmail]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [sent,      setSent]      = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { setError('E-posta adresi zorunludur.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta adresi giriniz.'); return; }

    setIsLoading(true);
    setError(null);

    try {
      await axiosInstance.post(authEndpoints.forgotPassword, { email });
    } catch {
      /* Güvenlik gereği: hata olsa bile başarılı göster */
    } finally {
      setIsLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="auth-page">
      {/* Gradient arka plan orb'ları */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <LeftPanel />

      {/* ── SAĞ PANEL ──────────────────────────────────────────────── */}
      <div className="auth-right">
        <motion.div
          className="auth-right-inner"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Başlık */}
          <div>
            <h2 className="auth-right-title">Şifremi Unuttum</h2>
            <p className="auth-right-subtitle">
              {sent
                ? 'Sıfırlama bağlantısı gönderildi.'
                : 'Kayıtlı e-posta adresinizi girin.'}
            </p>
          </div>

          {/* Kart */}
          <div className="auth-card">
            <AnimatePresence mode="wait">

              {/* ── Gönderilmedi: Form ─────────────────────────── */}
              {!sent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="auth-card-header">
                    <h2>Şifre Sıfırlama</h2>
                    <p>
                      E-posta adresinizi girin, size güvenli bir
                      sıfırlama bağlantısı gönderelim.
                    </p>
                  </div>

                  <div className="auth-fields">
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="E-posta adresi"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                      autoComplete="email"
                      autoFocus
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className="auth-error"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                        >
                          <AlertTriangle size={14} />{error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      className="auth-btn"
                      onClick={handleReset}
                      disabled={isLoading}
                      whileHover={{ scale: isLoading ? 1 : 1.015 }}
                      whileTap={{ scale: isLoading ? 1 : 0.975 }}
                    >
                      {isLoading
                        ? <span className="auth-spinner" />
                        : 'Sıfırlama Bağlantısı Gönder'}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (

                /* ── Gönderildi: Başarı durumu ─────────────────── */
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* İkon */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
                    >
                      <div className="forgot-sent-icon">
                        <MailCheck size={30} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Metin */}
                  <div className="auth-card-header" style={{ marginBottom: 16 }}>
                    <h2>Bağlantı Gönderildi</h2>
                    <p>
                      <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong>{' '}
                      adresine sıfırlama bağlantısı gönderildi.
                      Gelen kutunuzu ve spam klasörünü kontrol edin.
                    </p>
                  </div>

                  {/* Bilgi kutusu */}
                  <div className="forgot-info-box">
                    <div className="forgot-info-dot" />
                    <span>Bağlantı 15 dakika geçerlidir.</span>
                  </div>

                  {/* Tekrar gönder */}
                  <motion.button
                    className="auth-btn"
                    style={{ marginTop: 16 }}
                    onClick={() => { setSent(false); setEmail(''); }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.975 }}
                  >
                    Farklı e-posta ile tekrar dene
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Geri dön */}
            <div className="auth-card-footer" style={{ marginTop: 16, justifyContent: 'center' }}>
              <Link to="/login" className="forgot-back-link">
                <ArrowLeft size={13} />
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
