import logo from './logo.png';
import './App.css';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import Partidos from './pages/Partidos';
import Jugadores from './pages/Jugadores';
import Equipos from './pages/Equipos';
import Ligas from './pages/Ligas';
import AgregarJugador from './components/models/AgregarJugador';
import AgregarEquipo from './components/models/AgregarEquipo';
import Login from './components/user/Login';
import Registro from './components/user/Registro';
import Minigame from './components/Minigame';

function App() {
  const [activo, setActivo] = useState('jugadores');
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setUser(user);

    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/usuarios', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setRol(data.rol); // puede ser "admin" o "lector"
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
      }
    } else {
      setRol(null); // limpiar rol si el usuario se desloguea
    }
  });

  return () => unsubscribe();
}, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        console.log('Usuario desconectado');
      })
      .catch((error) => console.error('Error al desconectar', error));
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <div>
          <button className="button" onClick={() => setActivo('Minigame')}>Minigame</button>
          <button className="button" onClick={() => setActivo('jugadores')}>Jugadores</button>
          <button className="button" onClick={() => setActivo('partidos')}>Partidos</button>
          <button className="button" onClick={() => setActivo('equipos')}>Equipos</button>
          <button className="button" onClick={() => setActivo('ligas')}>Ligas</button>

          {/* Mostrar botón solo si el usuario está autenticado */}
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


          {/* Agregar botones de inicio de sesión o registro */}
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
      {activo === 'partidos' && <Partidos />}
      {activo === 'equipos' && <Equipos />}
      {activo === 'ligas' && <Ligas />}
      {activo === 'AgregarJugador' && <AgregarJugador />}
      {activo === 'AgregarEquipo' && <AgregarEquipo />}
      {activo === 'login' && <Login />}
      {activo === 'registro' && <Registro />}
      </div>
    </div>
  );
}

export default App;
