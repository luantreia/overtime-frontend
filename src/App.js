import './App.css';
import logo from './logo.png';
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from './context/Authcontext'; 

import Jugadores from './pages/Jugadores';
import AgregarJugador from './components/modals/ModalJugador/AgregarJugador';
import AgregarEquipo from './components/modals/ModalEquipo/AgregarEquipo';
import Login from './components/user/Login';
import Equipos from './pages/Equipos';
import Registro from './components/user/Registro';

function App() {
  const [activo, setActivo] = useState('jugadores');
  const { user, rol } = useAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log('Usuario desconectado'))
      .catch((error) => console.error('Error al desconectar', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div>
          <button className="button" onClick={() => setActivo('jugadores')}>Jugadores</button>
          <button className="button" onClick={() => setActivo('equipos')}>Equipos</button>

          {user && (
            <>
              {rol === 'admin' && (
                <>
                  <button className="button" onClick={() => setActivo('AgregarJugador')}>Anotar Jugador</button>
                  <button className="button" onClick={() => setActivo('AgregarEquipo')}>Anotar Equipo</button>
                </>
              )}
              <button className="button" onClick={handleLogout}>Cerrar sesión</button>
            </>
          )}

          {!user && (
            <div>
              <button className="button" onClick={() => setActivo('login')}>Iniciar sesión</button>
              <button className="button" onClick={() => setActivo('registro')}>Registrarse</button>
            </div>
          )}
        </div>
      </header>

      <div>
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
