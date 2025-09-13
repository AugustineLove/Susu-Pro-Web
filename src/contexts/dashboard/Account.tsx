import React, { createContext, useContext, useEffect, useState } from 'react';

// Account interface (adjust to match your actual account structure)
interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  created_at: string;
  customer_id: string;
  // Add more fields as needed
}

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  refreshAccounts: (customerId: string) => void;
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
        console.log('Fetching accounts for customer ID:', customerId);
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/accounts/customer/${customerId}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch accounts:', errorText);
        return;
      }
      const data = await res.json();
      console.log('Fetched accounts:', data);
      setAccounts(data.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountsContext.Provider value={{ accounts, loading, refreshAccounts: fetchAccounts, setAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
};
