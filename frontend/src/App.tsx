import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Layout
import MainLayout from "./components/layout/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import EarthquakePage from "./pages/EarthquakePage";
import ExercisesPage from "./pages/ExercisesPage";
import MapPage from "./pages/MapPage";
import ReportsPage from "./pages/ReportsPage";
import RequestsPage from "./pages/RequestsPage";
import Unauthorized from "./pages/Unauthorized";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
// Auth sayfaları
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import StkCoordinationPage from "./pages/stk/StkCoordinationPage";
import StkOrganizationPage from "./pages/stk/StkOrganizationPage";

// Korumalı Rota (HOC) bileşenlerimiz
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HERKESE AÇIK ROTALAR */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* KORUMALI ROTALAR — ProtectedRoute → MainLayout → Sayfalar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Herkes girebilir (giriş yapmış) */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/earthquakes" element={<EarthquakePage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/organization" element={<StkOrganizationPage />} />
            <Route path="/coordination" element={<StkCoordinationPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Sadece admin girebilir */}
            <Route element={<RoleRoute allowedRoles={["admin"]} />}>
              <Route path="/simulation" element={<ExercisesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Yanlış URL → Anasayfa */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
