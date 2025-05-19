import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
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
          setRol(data.rol); // "admin" o "lector"
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      } else {
        setRol(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, rol }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
