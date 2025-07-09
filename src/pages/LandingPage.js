import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAVBAR_HEIGHT = '140px';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Detectamos si hay usuario autenticado

  if (user) {
    // LANDING PARA USUARIOS LOGUEADOS
    return (
      <div
        className="flex flex-col justify-center items-center bg-white p-5 text-center"
        style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT})` }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          ¡Hola {user.displayName || user.email || 'usuario'}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Accedé rápidamente a tus partidos, equipos y competencias.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate('/partidos')}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition"
          >
            Ver Partidos
          </button>
          <button
            onClick={() => navigate('/competencias')}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-md transition"
          >
            Ver Competencias
          </button>
          <button
            onClick={() => navigate('/equipos')}
            className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-md transition"
          >
            Ver Equipos
          </button>
        </div>
      </div>
    );
  }

  // LANDING PARA VISITANTES
  return (
    <div
      className="flex flex-col justify-center items-center bg-gray-100 p-5 text-center"
      style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT})` }}
    >
      <h1 className="text-5xl font-extrabold text-gray-800 mb-2 sm:text-6xl md:text-7xl">
        Bienvenido a OVERTIME
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto sm:text-xl md:text-2xl">
        La forma más fácil de anotar y seguir tus partidos de dodgeball.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/registro')}
          className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105"
        >
          Registrarse
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
