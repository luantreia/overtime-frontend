// src/hooks/useUserRole.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const useUserRole = () => {
  const { user, rol } = useContext(AuthContext);
  const uid = user?.uid || null;
  return { rol, uid };
};

export default useUserRole;
