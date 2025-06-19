// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();
export { AuthContext }; // <-- 👈 NECESARIO para usar useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [token, setToken] = useState(null); // <-- nuevo estado

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          setToken(token);
          localStorage.setItem('token', token); // ✅ guardar en localStorage

          const res = await fetch('https://overtime-ddyl.onrender.com/api/usuarios/mi-perfil', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();
          setRol(data.rol);
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      } else {
        setToken(null);
        setRol(null);
        localStorage.removeItem('token'); // ✅ limpiar al cerrar sesión
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <AuthContext.Provider value={{ user, rol, token }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
