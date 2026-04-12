import { motion } from "framer-motion";
import { ArrowLeft, Building2, ShieldOff, Smartphone } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const Unauthorized = () => {
  const { user, logout } = useAuthStore();
  const role = user?.role;
  const isCitizen = role === "citizen";
  const isVolunteer = role === "volunteer";

  const title = isCitizen
    ? "Mobil uygulama gerekli"
    : isVolunteer
      ? "Web yalnızca STK içindir"
      : "403 — Yetkisiz erişim";

  const description = isCitizen
    ? "Vatandaş hesapları yalnızca mobil uygulama üzerinden kullanılabilir. Web platformu sivil toplum kuruluşu yetkilileri ve sistem yöneticileri içindir."
    : isVolunteer
      ? "Gönüllü kayıt ve saha işlemleri mobil uygulama üzerinden yapılır. Web arayüzü STK yetkililerine özeldir."
      : "Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.";

  const IconVisual = isCitizen ? (
    <Smartphone size={30} />
  ) : isVolunteer ? (
    <Building2 size={30} />
  ) : (
    <ShieldOff size={30} />
  );

  const iconBg = isCitizen
    ? "rgba(59,130,246,0.12)"
    : isVolunteer
      ? "rgba(16,185,129,0.12)"
      : "rgba(229,62,62,0.12)";
  const iconBorder = isCitizen
    ? "rgba(59,130,246,0.3)"
    : isVolunteer
      ? "rgba(16,185,129,0.3)"
      : "rgba(229,62,62,0.3)";
  const iconColor = isCitizen ? "#93c5fd" : isVolunteer ? "#6ee7b7" : "#fca5a5";
  const iconShadow = isCitizen
    ? "0 0 28px rgba(59,130,246,0.18)"
    : isVolunteer
      ? "0 0 28px rgba(16,185,129,0.18)"
      : "0 0 28px rgba(229,62,62,0.18)";

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: "100%", maxWidth: 440 }}
        >
          <div className="auth-card" style={{ textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: 0.1,
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: iconBg,
                  border: `1.5px solid ${iconBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: iconColor,
                  boxShadow: iconShadow,
                }}
              >
                {IconVisual}
              </div>
            </motion.div>

            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: 8,
              }}
            >
              {title}
            </h2>

            <p
              style={{
                fontSize: "0.83rem",
                color: "rgba(255,255,255,0.42)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              {description}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isCitizen && (
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noreferrer"
                  className="auth-btn"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Smartphone size={16} />
                  Mobil uygulamayı indir
                </a>
              )}
              {isVolunteer && (
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noreferrer"
                  className="auth-btn"
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Smartphone size={16} />
                  Gönüllü uygulamasına git
                </a>
              )}
              <button
                className="auth-btn auth-btn--ghost"
                style={{ width: "100%" }}
                type="button"
                onClick={() => logout()}
              >
                <ArrowLeft size={14} style={{ marginRight: 6 }} />
                Çıkış yap
              </button>
            </div>

            <div
              className="auth-card-footer"
              style={{ marginTop: 16, justifyContent: "center" }}
            >
              <Link to="/login" className="auth-link">
                Farklı hesapla giriş yap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Unauthorized;
