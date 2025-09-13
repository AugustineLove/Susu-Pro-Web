import React, { createContext, useContext, useEffect, useState } from 'react';
import { Account } from '../../data/mockData';
import { companyId } from '../../constants/appConstants';

// Define the customer structure
export interface Customer {
  company_id?: string;
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  registered_by_name?: string;
  created_at: string; // ISO date string
  location: string; // Optional field
  daily_rate: string;
  total_balance: string;
  total_transactions: string;
  id_card?: string; 
  next_of_kin?: string;
  date_of_registration?: string; 
  gender?: string; // Optional field
  registered_by: string;
  customer_id?: string;
  total_balance_across_all_accounts?: string; // Optional field for total balance across all accounts

  // Add other fields if needed
}

interface CustomersContextType {
  customers: Customer[];
  loading: boolean;
  refreshCustomers: () => Promise<void>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
   addCustomer: (newCustomer: Omit<Customer, 'id' | 'created_at'>, account: string) => Promise<void>;
   deleteCustomer: (customer_id: string) => Promise<void>;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const useCustomers = () => {
  const context = useContext(CustomersContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  return context;
};

export const CustomersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const companyJSON = localStorage.getItem('susupro_company');
      const company = companyJSON ? JSON.parse(companyJSON) : null;
      const companyId = company?.id;

      if (!companyId) {
        console.warn('Company ID not found in localStorage');
        return;
      }

      const res = await fetch(`https://susu-pro-backend.onrender.com/api/customers/company/${companyId}`);

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched customers:', data);
        setCustomers(data.data); // assumes backend response: { data: [...] }
      } else {
        const errText = await res.text();
        console.error('Failed to fetch customers:', errText);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
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
      }  

    } catch (error) {
      console.log('Error: ', error);
    }
  }

  const addCustomer = async (newCustomer: Omit<Customer, 'id' | 'created_at'>, account_type:string) => {
    try {
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/customers/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      console.log('Account in the addCustomer function: ', account_type);

      if (res.ok) {
        const added = await res.json();
        console.log('Added customer:', added);
        console.log('Trying to add account: ', account_type)
        await addAccount({
          'account_type': account_type,
          'created_by': newCustomer.registered_by,
          'customer_id': added.data.id,
          'company_id': companyId,
          'balance': 0,

        })
        await fetchCustomers();
      } else {
        const errorText = await res.text();
        console.error('Failed to add customer:', errorText);
      }
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      console.log('Deleting customer: ', customerId);
      const res = await fetch('https://susu-pro-backend.onrender.com/api/customers/delete', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'customer_id': customerId
        })
      });
      console.log('Deleting account for: ', customerId);
      if(res.ok){
        const deleted = await res.json();
        console.log(deleted);
        await fetchCustomers();
      } else{
        const errorText = await res.text();
        console.error('Failed to delete customer: ', errorText);
      }
    } catch (error) {
      console.log('Error deleting customer: ', error);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, loading, refreshCustomers: fetchCustomers, setCustomers, addCustomer, deleteCustomer  }}>
      {children}
    </CustomersContext.Provider>
  );
};
