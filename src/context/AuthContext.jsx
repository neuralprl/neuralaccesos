import React, { createContext, useContext, useState } from 'react';
import { USERS } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(USERS[0]);

  const switchUser = (userId) => {
    const selected = USERS.find(u => u.id === parseInt(userId));
    if (selected) setUser(selected);
  };

  return (
    <AuthContext.Provider value={{ user, switchUser, allUsers: USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
