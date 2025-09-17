import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '../../data/mockData';
import { useCustomers } from './Customers';
import { useStats } from './DashboardStat';

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
  status: string;
  unique_code: string;
};

type TransactionContextType = {
  transactions: TransactionType[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  approveTransaction: (transactionId: string, messageData: {}) => Promise<boolean>;
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
  const [loading, setLoading] = useState<boolean>(true);
  const { customers, refreshCustomers } = useCustomers();
  const { refreshStats } = useStats();
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const companyId = JSON.parse(localStorage.getItem('susupro_company')!)?.id;
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/all/${companyId}`);
      const json = await res.json();

      if (json.status === 'success') {
        setTransactions(json.data);
        console.log(`Fetched transactions: ${json.data}`);
        } else {
        console.error('Failed to fetch transactions:', json.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

      if (json.status === 'success') {
        await fetchTransactions();
        await refreshCustomers();
        await refreshStats();
      }
      else if(json.status === 'insufficient_balance'){
        console.log('Insufficient balance for transaction');
        alert('Insufficient balance for this transaction');
      } 
      else {
        console.error('Failed to add transaction:', json.message);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
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
      console.warn('Transaction approval failed:', json);
      return false; 
    }
  } catch (error) {
    console.error('Error approving transaction:', error);
    return false;
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
    <TransactionContext.Provider value={{ transactions, loading, refreshTransactions: fetchTransactions, addTransaction, approveTransaction, rejectTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
};
