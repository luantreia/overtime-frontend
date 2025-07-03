// src/App.js
import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from "./components/layout/Navbar";
import Jugadores from './pages/Jugadores';
import Equipos from './pages/Equipos';
import Perfil from './pages/Perfil';
import Login from './components/user/Login';
import Registro from './components/user/Registro';
import AgregarJugador from './components/modals/ModalJugador/AgregarJugador';
import AgregarEquipo from './components/modals/ModalEquipo/AgregarEquipo';
import LandingPage from './pages/LandingPage';
import Partidos from './pages/Partidos';
import AgregarPartido from './components/modals/ModalPartido/AgregarPartido';
import AgregarOrganizacion from './components/modals/ModalOrganizacion/AgregarOrganizacion';
import Organizaciones from './pages/Organizaciones';
import Competencias from './pages/Competencias';
import FormularioCompetencia from './components/modals/ModalCompetencia/agregarCompetencia';

function App() {
  return (
    <div className="App">
      <NavBar />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/agregar-jugadores-multiple" element={<AgregarJugador />} />
        <Route path="/agregar-equipo" element={<AgregarEquipo />} />
        <Route path="/agregar-partido" element={<AgregarPartido />} />
        {/*<Route path="/agregar-organizacion" element={<AgregarOrganizacion />} />*/} 
        <Route path="/competencias" element={<Competencias />} />                       
        <Route path="/agregar-competencia" element={<FormularioCompetencia />} />
        <Route path="/organizaciones" element={<Organizaciones />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Agrega más rutas según lo que necesites */}
      </Routes>
    </div>
  );
}

export default App;
