import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '../../firebase';


const Registro = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await getIdToken(user);

      // POST a tu backend para registrar en MongoDB
      const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: user.email,
          rol: 'lector' // o lo que necesites como rol por defecto
        })
      });

      if (res.ok) {
        setMensaje('¡Registro exitoso! Ahora puedes iniciar sesión.');
      } else {
        const errorData = await res.json();
        setMensaje('Error al registrar en DB: ' + errorData.error);
      }
    } catch (error) {
      setMensaje('Error al registrar: ' + error.message);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleRegister} className="form">
        <h2>Registrar Cuenta</h2>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="button-submit">Registrarse</button>
        {mensaje && <p>{mensaje}</p>}
      </form>
    </div>
  );
};

export default Registro;
