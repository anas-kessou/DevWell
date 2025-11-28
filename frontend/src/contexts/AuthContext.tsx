import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, type UserProfile } from '../api/authApi';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const token = authApi.getToken();
      if (token) {
        try {
          const response = await authApi.getProfile();
          setUser(response.user);
        } catch (error) {
          // Token invalid or expired
          authApi.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const signOut = async () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
