// src/App.js
import './App.css';
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from "./components/layout/Navbar";
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy loaded components
const Jugadores = lazy(() => import('./pages/Jugadores'));
const Equipos = lazy(() => import('./pages/Equipos'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Login = lazy(() => import('./components/user/Login'));
const Registro = lazy(() => import('./components/user/Registro'));
// Nota: Los componentes de agregar se eliminaron porque ya no se usan
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Partidos = lazy(() => import('./pages/Partidos'));
// Nota: Los componentes de agregar se eliminaron porque ya no se usan
const Organizaciones = lazy(() => import('./pages/Organizaciones'));
const Competencias = lazy(() => import('./pages/Competencias'));
// Nota: Los componentes de agregar se eliminaron porque ya no se usan
const PanelAdmin = lazy(() => import('./components/features/admin/AdminDashboard'));
const OpcionesAvanzadas = lazy(() => import('./pages/admin/OpcionesAvanzadas'));

// Loading fallback component
const LoadingFallback = () => <LoadingSpinner size="large" message="Cargando aplicación..." />;

function App() {
  return (
    <div className="App">
      <NavBar />

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/equipos" element={<Equipos />} />
          {/* Nota: Rutas de agregar eliminadas porque ya no se usan */}
          <Route path="/competencias" element={<Competencias />} />
          {/* Nota: Ruta de agregar competencia eliminada porque ya no se usa */}
          <Route path="/organizaciones" element={<Organizaciones />} />
          <Route path="/partidos" element={<Partidos />} />
          {/* Nota: Ruta de agregar partido eliminada porque ya no se usa */}
          {/* Nota: Ruta de agregar organizacion eliminada porque ya no se usa */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/admin" element={<PanelAdmin />} />
          <Route path="/admin/opciones" element={<OpcionesAvanzadas />} />

          {/* Agrega más rutas según lo que necesites */}
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
