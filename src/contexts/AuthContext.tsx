import React, { createContext, useContext, useState, useEffect } from 'react';
import { companyJSON } from '../constants/appConstants';
import { Company } from '../data/mockData';


interface AuthContextType {
  company: Company | null;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; companyId?: string; success: boolean }>;
  signUp: (companyData: Omit<Company, 'id'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyJSON) {
      setCompany(JSON.parse(companyJSON));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ requires2FA?: boolean; companyId?: string; success: boolean }> => {
    setIsLoading(true);
    const token = localStorage.getItem('susupro_token') || '';
    try {
      const response = await fetch('https://susu-pro-backend.onrender.com/api/auth/login-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log(`Login successful for company: ${JSON.stringify(data.data)}`);
      if (response.ok) {
        const companyData = data.data;
        const token = data.token;
        setCompany(companyData);
        localStorage.setItem('susupro_company', JSON.stringify(companyData));
        localStorage.setItem('susupro_token', token);

        if (companyData.two_factor_enabled) {
          // If 2FA is enabled, return the company data
          return { requires2FA: true, companyId: companyData.id, success: true };
        }
        console.log(`state of 2fa: ${companyData.two_factor_enabled}`);

        return { success: true };
      } else {
        console.error('Login failed:', data.message);
        return { success: false };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (companyData: Omit<Company, 'id'>): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch('https://susu-pro-backend.onrender.com/api/companies/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful signup
        return { success: true, message: data };
      } else {
        console.error('Signup failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'An error occurred during signup.' };
    } finally {
      setIsLoading(false);
    }
  }

  const logout = () => {
    setCompany(null);
    localStorage.removeItem('susupro_company');
    localStorage.removeItem('susupro_token');
    window.location.reload();
   };

  return (
    <AuthContext.Provider value={{ company, login, signUp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
