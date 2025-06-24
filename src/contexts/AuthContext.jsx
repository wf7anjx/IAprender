import React, { createContext, useContext, useEffect, useState } from 'react';
import FirebaseWebService from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    const unsubscribe = FirebaseWebService.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        await loadUserProgress();
      } else {
        setUserProgress({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProgress = async () => {
    try {
      const progress = await FirebaseWebService.getUserProgress();
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      await FirebaseWebService.signInWithEmail(email, password);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      console.log("AuthContext: Attempting signUp for", email);
      await FirebaseWebService.signUpWithEmail(email, password, displayName);
      console.log("AuthContext: signUp successful for", email);
    } catch (error) {
      console.error("AuthContext: signUp failed for", email, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await FirebaseWebService.signOut();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = async () => {
    await loadUserProgress();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    userProgress,
    refreshProgress,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

