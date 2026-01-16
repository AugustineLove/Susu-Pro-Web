import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account } from '../../data/mockData';
import { companyId } from '../../constants/appConstants';

interface AccountsContextType {
  accounts: Account[];
  customerLoans: Account[];
  companyLoans: Account[];
  loading: boolean;
  loadingLoans: boolean;
  addAccount: (newAccount: Omit<Account, 'id' | 'created_at'>) => Promise<boolean>;
  refreshAccounts: (customerId: string) => void;
  fetchLoanAccounts: (companyId: string) => void;
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
  const [customerLoans, setCustomerLoans] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyLoans, setCompanyLoans] = useState<Account[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);


  const fetchAllCompanyLoans = async (companyId: string) => {

  setLoadingLoans(true);

  try {

    const res = await fetch(
      `https://susu-pro-backend.onrender.com/api/loans/all/${companyId}`
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Loan fetch error:", errorText);
      setCompanyLoans([]);
      return;
    }

    const data = await res.json();

    console.log(`Company loans: ${data}`);

    setCompanyLoans(
      Array.isArray(data?.data) ? data.data : []
    );

  } catch (error) {

    console.error("Error fetching company loans:", error);

    setCompanyLoans([]);

  } finally {
    setLoadingLoans(false);
  }

};



  const fetchAccounts = async (customerId: string) => {
    setLoading(true);
    console.log(`Fetching accounts for customer ID: ${customerId}`);
    try {
        const res = await fetch(`http://localhost:5000/api/accounts/customer/${customerId}`);
      if (!res.ok) {
        const errorText = await res.text();
        return;
      }
      const data = await res.json();
      console.log(data);
        setAccounts(
      Array.isArray(data?.data)
        ? data.data
        : []
    );
     setCustomerLoans(
          Array.isArray(data?.data.loans) ? data.data.loans : []
        )
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

    useEffect(() => {
    fetchAllCompanyLoans(companyId);
    }, []);


  return (
    <AccountsContext.Provider value={{ accounts, customerLoans, companyLoans, loading, loadingLoans, refreshAccounts: fetchAccounts, addAccount, setAccounts, fetchLoanAccounts: fetchAllCompanyLoans }}>
      {children}
    </AccountsContext.Provider>
  );
};
