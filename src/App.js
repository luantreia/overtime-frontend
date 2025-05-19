// src/App.js
import './App.css';
import React, { useState } from 'react';

import { useAuth } from './context/Authcontext'; 

import NavBar from './components/layout/Navbar';

import Jugadores from './pages/Jugadores';
import Equipos from './pages/Equipos';
import AgregarJugador from './components/modals/ModalJugador/AgregarJugador';
import AgregarJugadoresMultiple from './components/modals/ModalJugador/AgregarJugadoresMultiples';
import AgregarEquipo from './components/modals/ModalEquipo/AgregarEquipo';
import Login from './components/user/Login';
import Registro from './components/user/Registro';

function App() {
  const [activo, setActivo] = useState('jugadores');
  const { user } = useAuth();

  return (
    <div className="App">
      <NavBar setActivo={setActivo} />

      <div>
        {activo === 'AgregarJugadoresMultiple' && <AgregarJugadoresMultiple />}
        {activo === 'jugadores' && <Jugadores />}
        {activo === 'equipos' && <Equipos />}
        {activo === 'AgregarJugador' && <AgregarJugador />}
        {activo === 'AgregarEquipo' && <AgregarEquipo />}
        {activo === 'login' && <Login />}
        {activo === 'registro' && <Registro />}
      </div>
    </div>
  );
}

export default App;
