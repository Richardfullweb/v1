import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
    import { auth } from '../firebase';
    import { onAuthStateChanged, User } from 'firebase/auth';

    interface AuthContextProps {
      currentUser: User | null;
    }

    const AuthContext = createContext<AuthContextProps>({
      currentUser: null,
    });

    interface AuthProviderProps {
      children: ReactNode;
    }

    export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [currentUser, setCurrentUser] = useState<User | null>(null);

      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
        });

        return () => unsubscribe();
      }, []);

      const value: AuthContextProps = {
        currentUser,
      };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      return useContext(AuthContext);
    };
