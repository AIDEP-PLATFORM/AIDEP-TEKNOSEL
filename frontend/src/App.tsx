import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfalarımızı içe aktarıyoruz
import Home from './pages/Home';
import Login from './pages/Login';
import LiveMap from './pages/LiveMap';
import Simulation from './pages/Simulation';
import Unauthorized from './pages/Unauthorized';

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

        {/* KORUMALI ROTALAR (ProtectedRoute ile sarmalanmış) */}
        {/* Sadece giriş yapanların göreceği rotalar için bir şemsiye açtık */}
        <Route element={<ProtectedRoute />}>
          
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<LiveMap />} />

          {/* Sadece spesifik ROLÜ olanların girebileceği alt rotalar */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/simulation" element={<Simulation />} />
          </Route>
          
          {/* Diyelim ki STK sayfasına hem admin hem stk girebilir */}
          <Route element={<RoleRoute allowedRoles={['admin', 'stk']} />}>
            {/* O sayfa tasarlanınca buraya eklenecek, örn: <Route path="/stk-panel" element={<StkPanel />} /> */}
          </Route>

        </Route>

        {/* Yanlış Linke Tıklanırsa Anasayfaya Atsın */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
