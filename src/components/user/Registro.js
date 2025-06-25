import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '../../firebase';

// Assuming ErrorMessage will remain a component if you want to reuse its specific styling/logic
import ErrorMessage from '../common/FormComponents/ErrorMessage';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await getIdToken(user);

      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          rol: 'lector', // Default role for new registrations
          nombre: nombre.trim(),
          _id: user.uid
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        // If an account already exists with the email but user tries to register again,
        // Firebase handles this, but backend might also return an error if
        // the user already exists in your DB even if Firebase allows registration (unlikely scenario with proper setup)
        throw new Error(errorData.error || 'Error al guardar el usuario en la base de datos.');
      }

      setMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setNombre('');
      setEmail('');
      setPassword('');
    } catch (err) {
      // More user-friendly Firebase error messages
      let displayError = 'Error al registrar la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        displayError = '❌ El correo electrónico ya está registrado. Por favor, usa otro o inicia sesión.';
      } else if (err.code === 'auth/invalid-email') {
        displayError = '❌ El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        displayError = '❌ La contraseña debe tener al menos 6 caracteres.';
      } else {
        displayError = `❌ ${err.message}`; // Fallback for other errors
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Registrar Cuenta</h2>

        {/* Nombre Input */}
        <div>
          <label htmlFor="nombre" className="sr-only">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Correo Input */}
        <div>
          <label htmlFor="email" className="sr-only">Correo</label>
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Contraseña Input */}
        <div>
          <label htmlFor="password" className="sr-only">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password" // Use 'new-password' for registration forms
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {/* Error and Success Messages */}
        {error && <ErrorMessage mensaje={error} className="mt-4 text-center text-red-600" />}
        {mensaje && <p className="mt-4 text-center text-green-600 font-medium">{mensaje}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-lg font-semibold rounded-md transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}`}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default Registro;