import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import MainLayout from './components/layout/MainLayout';

// Sayfalarımızı içe aktarıyoruz
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import RequestsPage from './pages/RequestsPage';
import VolunteersPage from './pages/VolunteersPage';
import ExercisesPage from './pages/ExercisesPage';
import ReportsPage from './pages/ReportsPage';

// Korumalı Rota (HOC) bileşenlerimiz
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HERKESE AÇIK ROTALAR */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* KORUMALI ROTALAR — ProtectedRoute → MainLayout → Sayfalar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            {/* Herkes girebilir (giriş yapmış) */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/reports" element={<ReportsPage />} />

            {/* Sadece admin girebilir */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/simulation" element={<ExercisesPage />} />
            </Route>

            {/* Admin + STK girebilir */}
            <Route element={<RoleRoute allowedRoles={['admin', 'stk']} />}>
              {/* İleride eklenecek: <Route path="/stk-panel" element={<StkPanel />} /> */}
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
