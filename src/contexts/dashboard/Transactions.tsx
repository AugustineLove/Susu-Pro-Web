import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '../../data/mockData';
import { useCustomers } from './Customers';
import { useStats } from './DashboardStat';
import { companyId, userRole } from '../../constants/appConstants';

export type TransactionType = {
  transaction_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  transaction_date: string;
  account_number: string;
  customer_name: string;
  customer_phone: string;
  staff_name: string;
  account_type: string;
  status: string;
  unique_code: string;
};

type TransactionContextType = {
  transactions: TransactionType[];
  customerTransactions: TransactionType[];
  loading: boolean;
  fetchCustomerTransactions: (customerId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<boolean | undefined>;
  approveTransaction: (transactionId: string, messageData: {}) => Promise<boolean | undefined>;
  rejectTransaction: (transactionId: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);


export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { customers, refreshCustomers } = useCustomers();
  const { refreshStats } = useStats();
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/all/${companyId}`);
      const json = await res.json();

      if (json.status === 'success') {
        setTransactions(json.data);
        } else {
        console.error('Failed to fetch transactions:', json.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/customer/${customerId}`);
      const json = await res.json();
      if (json.status === 'success') {
        setCustomerTransactions(json.data);
        console.log(`Fetched customer transactions: ${json.data}`);
      } else {
        console.error('Failed to fetch customer transactions:', json.message);
      }
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) =>{
    try {
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      const json = await res.json();
      console.log('Add transaction response:', json);

      if (json.status === 'success') {
        await fetchTransactions();
        await refreshCustomers();
        await refreshStats();
        return true;
      }
      else if(json.status === 'insufficient_balance'){
        console.log('Insufficient balance for transaction');
        alert('Insufficient balance for this transaction');
        return false;
      } 
      else {
        console.error('Failed to add transaction:', json.message);
        return false;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  };

  const sendMessage = async (messageData: {}) => {
    try {
      const res = await fetch('https://susu-pro-backend.onrender.com/api/messages/send-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      const json = await res.json();

      if (json.status === 'success') {
        console.log('Message sent successfully:', json);
      } else {
        console.error('Failed to send message:', json.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  const approveTransaction = async (transactionId: string, messageData: {}) => {
  try {
    setLoading(true);
    const res = await fetch(
      `https://susu-pro-backend.onrender.com/api/transactions/${transactionId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const json = await res.json();

    if (json.status === 'success') {
      await fetchTransactions();
      await refreshCustomers();
      
        await sendMessage(messageData);
      await refreshStats();
      console.log('Transaction approved:', json);
      return true;
    } else {
      console.error('Transaction approval failed:', json);
      return false; 
    }
  } catch (error) {
    console.error('Error approving transaction:', error);
      } finally {
    setLoading(false);
  }
};


  const rejectTransaction = async( transactionId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/${transactionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();

      if (json.status === 'success') {
        setTransactions(prev => prev.map(tx =>
          tx.transaction_id === transactionId ? { ...tx, status: 'rejected' } : tx
        ));
        console.log('Transaction rejected:', json);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, customerTransactions, loading, refreshTransactions: fetchTransactions, addTransaction, approveTransaction, fetchCustomerTransactions, rejectTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
