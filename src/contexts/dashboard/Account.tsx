import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account } from '../../data/mockData';

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (newAccount: Omit<Account, 'id' | 'created_at'>) => Promise<boolean>;
  refreshAccounts: (customerId: string) => Promise<Account>;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async (customerId: string) => {
    setLoading(true);
    try {
        const res = await fetch(`https://susu-pro-backend.onrender.com/api/accounts/customer/${customerId}`);
      if (!res.ok) {
        const errorText = await res.text();
        return;
      }
      const data = await res.json();
      setAccounts(data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async(newAccount: Omit<Account, 'id' | 'created_at'>)=>{
      try {
        console.log('Adding account for customer');
        const res = await fetch('https://susu-pro-backend.onrender.com/api/accounts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify(newAccount),
        });
        if (res.ok){
          const added = await res.json();
          console.log('Added account', added);
          return true;
        }  
        return false;
      } catch (error) {
        console.log('Error: ', error);
        return false;
      }
    }

  return (
    <AccountsContext.Provider value={{ accounts, loading, refreshAccounts: fetchAccounts, addAccount, setAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
};
