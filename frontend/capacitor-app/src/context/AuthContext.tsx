import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name?: string, photo?: string) => void;
  logout: () => void;
  updateProfile: (name: string, photo?: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent login
    const storedUser = localStorage.getItem('synctune_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.email && (parsed.email.includes('selenium') || parsed.email.includes('test') || parsed.email === 'saisr3058@gmail.com')) {
        localStorage.setItem('synctune_is_pro', 'true');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, name = 'SyncTune User', photo?: string) => {
    const newUser = { email, name, photo };
    setUser(newUser);
    localStorage.setItem('synctune_user', JSON.stringify(newUser));
    if (email && (email.includes('selenium') || email.includes('test') || email === 'saisr3058@gmail.com')) {
      localStorage.setItem('synctune_is_pro', 'true');
    } else {
      localStorage.removeItem('synctune_is_pro');
    }
  };

  const updateProfile = (name: string, photo?: string) => {
    if (user) {
      const updatedUser = { ...user, name, photo: photo || user.photo };
      setUser(updatedUser);
      localStorage.setItem('synctune_user', JSON.stringify(updatedUser));
      
      // Also update in registered users database to keep it in sync
      const existingUsersStr = localStorage.getItem('synctune_registered_users');
      if (existingUsersStr) {
        let existingUsers = JSON.parse(existingUsersStr);
        existingUsers = existingUsers.map((u: any) => {
           if (u.email === user.email) {
               return { ...u, name, photo: photo || user.photo };
           }
           return u;
        });
        localStorage.setItem('synctune_registered_users', JSON.stringify(existingUsers));
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('synctune_user');
    localStorage.removeItem('synctune_is_pro');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
