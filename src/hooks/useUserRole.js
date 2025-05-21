// src/hooks/useUserRole.js
import { useContext } from 'react';
import { useAuth } from '../context/Authcontext';

const useUserRole = () => {
  const { user, rol } = useContext(useAuth);
  const uid = user?.uid || null;
  return { rol, uid };
};

export default useUserRole;
