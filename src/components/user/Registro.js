// src/components/auth/Registro.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../ui/FormComponents/ErrorMessage';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);
    try {
      await register(nombre.trim(), email, password);

      setMensaje('¡Registro exitoso! Redirigiendo...');
      setNombre('');
      setEmail('');
      setPassword('');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      let displayError = 'Error al registrar la cuenta.';
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('registrado')) displayError = '❌ El correo electrónico ya está registrado.';
      else if (msg.includes('password')) displayError = '❌ La contraseña debe tener al menos 6 caracteres.';
      else displayError = `❌ ${err.message}`;
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/dodgeball-hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          ¡Crea tu cuenta!
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Registrate y comenzá a seguir tus partidos y equipos.
        </p>

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
          />

          {error && <ErrorMessage mensaje={error} className="mt-2 text-center text-red-600" />}
          {mensaje && <p className="mt-2 text-center text-green-600 font-medium">{mensaje}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            ¿Ya tenés cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Registro;
