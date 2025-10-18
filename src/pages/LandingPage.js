import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NAVBAR_HEIGHT = '140px';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Detectamos si hay usuario autenticado

  if (user) {

    // LANDING PARA USUARIOS LOGUEADOS
return (
  <div
    className="relative flex flex-col justify-center items-center text-center bg-cover bg-center px-4 sm:px-6"
    style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`, backgroundImage: "url('/images/dodgeball-hero.jpg')" }}
  >
    {/* Overlay oscuro */}
    <div className="absolute inset-0 bg-black/50" />

    {/* Contenido */}
    <motion.div
      className="relative z-10 text-white px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl font-extrabold mb-4 sm:text-6xl md:text-7xl drop-shadow-lg"
      >
        ¡Hola {user.displayName || user.email || 'jugador'}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-base sm:text-lg md:text-xl mb-8 text-white/90 px-2 sm:px-0"
      >
        Accedé rápidamente a tus partidos, equipos y competencias.  
        ¡Gestioná tu temporada como un profesional!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row flex-wrap justify-center gap-4"
      >
        <button
          onClick={() => navigate('/partidos')}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg font-semibold transition transform hover:scale-105"
        >
          Ver Partidos
        </button>
        <button
          onClick={() => navigate('/competencias')}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg font-semibold transition transform hover:scale-105"
        >
          Ver Competencias
        </button>
        <button
          onClick={() => navigate('/equipos')}
          className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg font-semibold transition transform hover:scale-105"
        >
          Ver Equipos
        </button>
      </motion.div>
    </motion.div>
  </div>
);


  }

  // LANDING PARA VISITANTES
  return (
    
    <div
      className="relative w-full h-[calc(100vh-140px)] flex flex-col justify-center items-center text-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/dodgeball-hero.jpg')" }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido */}
      <div className="relative z-10 text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold mb-4 sm:text-6xl md:text-7xl drop-shadow-lg"
        >
          Viví cada partido con OVERTIME
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-white/90"
        >
          Registrá jugadas, analizá estadísticas y seguí la acción de tu equipo en tiempo real.  
          Todo, desde una sola app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={() => navigate('/registro')}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg"
          >
            Crear mi cuenta gratis
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-lg"
          >
            Ya tengo una cuenta
          </button>
        </motion.div>
      </div>
    </div>

  );
};

export default LandingPage;
