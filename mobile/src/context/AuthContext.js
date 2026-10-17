import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginRequest, registerRequest, meRequest } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('sportbuddy_token');
        if (token) {
          const data = await meRequest();
          setUser(data.user);
        }
      } catch (err) {
        await AsyncStorage.removeItem('sportbuddy_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await loginRequest({ email, password });
    await AsyncStorage.setItem('sportbuddy_token', data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    await AsyncStorage.setItem('sportbuddy_token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('sportbuddy_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
