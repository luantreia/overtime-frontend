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
import AgregarJugadoresMultiple from './components/modals/ModalJugador/AgregarJugadoresMultiples';
import AgregarEquipo from './components/modals/ModalEquipo/AgregarEquipo';

function App() {
  return (
    <div className="App">
      <NavBar />

      <Routes>
        <Route path="/" element={<Jugadores />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/agregar-jugadores-multiple" element={<AgregarJugadoresMultiple />} />
        <Route path="/agregar-equipo" element={<AgregarEquipo />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Agrega más rutas según lo que necesites */}
      </Routes>
    </div>
  );
}

export default App;
