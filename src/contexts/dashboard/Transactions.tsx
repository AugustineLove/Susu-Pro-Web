import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Commission, Transaction } from '../../data/mockData';
import { useCustomers } from './Customers';
import { useStats } from './DashboardStat';
import { companyId } from '../../constants/appConstants';

export type TransactionType = {
  transaction_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'commission';
  description: string;
  transaction_date: string;
  account_number: string;
  customer_name: string;
  customer_phone: string;
  staff_name: string;
  account_type: string;
  status: string;
  account_id?: string;
  unique_code: string;
};

export type TransactionTotals = {
  totalDeposits: number;
  totalWithdrawals: number;
  totalCommissions: number;
  totalPendingDeposits: number;
  totalPendingWithdrawals: number;
  totalApprovedDeposits: number;
  totalApprovedWithdrawals: number;
  totalRejectedTransactions: number;
  netBalance: number;
  transactionCount: number;
};

type TransactionContextType = {
  transactions: TransactionType[];
  customerTransactions: TransactionType[];
  loading: boolean;
  error: string | null;
  totals: TransactionTotals;
  deductCommission: (newCommission: Commission) => Promise<boolean>;
  deleteTransaction: (transactionId: string) => Promise<boolean>;
  fetchCustomerTransactions: (customerId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addTransaction: (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<boolean>;
  approveTransaction: (transactionId: string, messageData: Record<string, any>) => Promise<boolean>;
  rejectTransaction: (transactionId: string) => Promise<boolean>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

const calculateTotals = (transactions: TransactionType[]): TransactionTotals => {
  const totals: TransactionTotals = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalCommissions: 0,
    totalPendingDeposits: 0,
    totalPendingWithdrawals: 0,
    totalApprovedDeposits: 0,
    totalApprovedWithdrawals: 0,
    totalRejectedTransactions: 0,
    netBalance: 0,
    transactionCount: transactions.length,
  };

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const status = tx.status?.toLowerCase() || '';
    const type = tx.type?.toLowerCase() || '';

    // Total by type
    if (type === 'deposit') {
      totals.totalDeposits += amount;
      
      if (status === 'approved') {
        totals.totalApprovedDeposits += amount;
      } else if (status === 'pending') {
        totals.totalPendingDeposits += amount;
      }
    } else if (type === 'withdrawal') {
      totals.totalWithdrawals += amount;
      
      if (status === 'approved') {
        totals.totalApprovedWithdrawals += amount;
      } else if (status === 'pending') {
        totals.totalPendingWithdrawals += amount;
      }
    } else if (type === 'commission') {
      totals.totalCommissions += amount;
    }

    // Rejected transactions
    if (status === 'rejected') {
      totals.totalRejectedTransactions += amount;
    }
  });

  // Calculate net balance (deposits - withdrawals - commissions)
  totals.netBalance = totals.totalApprovedDeposits - totals.totalApprovedWithdrawals - totals.totalCommissions;

  return totals;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<TransactionTotals>(calculateTotals([]));

  const { customers, refreshCustomers } = useCustomers();
  const { refreshStats } = useStats();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/all/${companyId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        setTransactions(json.data);
        setTotals(calculateTotals(json.data));
      } else {
        throw new Error(json.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching transactions:', errorMessage);
      setError(errorMessage);
      setTransactions([]);
      setTotals(calculateTotals([]));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchCustomerTransactions = useCallback(async (customerId: string) => {
    if (!customerId) {
      console.error('Customer ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/customer/${customerId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      
      if (json.status === 'success' && Array.isArray(json.data)) {
        setCustomerTransactions(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch customer transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching customer transactions:', errorMessage);
      setError(errorMessage);
      setCustomerTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id' | 'created_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success') {
        await Promise.all([
          fetchTransactions(),
          refreshCustomers(),
          refreshStats(),
        ]);
        return true;
      } else if (json.status === 'insufficient_balance') {
        setError('Insufficient balance for this transaction');
        alert('Insufficient balance for this transaction');
        return false;
      } else {
        throw new Error(json.message || 'Failed to add transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error adding transaction:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, refreshCustomers, refreshStats]);

  const deductCommission = useCallback(async (newCommission: Commission): Promise<boolean> => {
    const accountId = newCommission.account_id;
    
    if (!accountId) {
      console.error('Account ID is required for commission deduction');
      setError('Account ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/commission/${accountId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCommission),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success') {
        await Promise.all([
          fetchTransactions(),
          refreshCustomers(),
          refreshStats(),
        ]);
        return true;
      } else {
        throw new Error(json.message || 'Failed to deduct commission');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error deducting commission:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, refreshCustomers, refreshStats]);

  const deleteTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    if (!transactionId) {
      console.error('Transaction ID is required');
      setError('Transaction ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`https://susu-pro-backend.onrender.com/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      await fetchTransactions();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error deleting transaction:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, companyId]);

  const sendMessage = useCallback(async (messageData: Record<string, any>): Promise<boolean> => {
    try {
      const res = await fetch('https://susu-pro-backend.onrender.com/api/messages/send-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success') {
        return true;
      } else {
        throw new Error(json.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, []);

  const approveTransaction = useCallback(async (
    transactionId: string,
    messageData: Record<string, any>
  ): Promise<boolean> => {
    if (!transactionId) {
      console.error('Transaction ID is required');
      setError('Transaction ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `https://susu-pro-backend.onrender.com/api/transactions/${transactionId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success') {
        await Promise.all([
          fetchTransactions(),
          refreshCustomers(),
          refreshStats(),
        ]);
        
        // Send message (don't block on failure)
        if (messageData && Object.keys(messageData).length > 0) {
          sendMessage(messageData).catch(err => 
            console.warn('Message sending failed but transaction was approved:', err)
          );
        }
        
        return true;
      } else {
        throw new Error(json.message || 'Transaction approval failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error approving transaction:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions, refreshCustomers, refreshStats, sendMessage]);

  const rejectTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    if (!transactionId) {
      console.error('Transaction ID is required');
      setError('Transaction ID is required');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `https://susu-pro-backend.onrender.com/api/transactions/${transactionId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (json.status === 'success') {
        setTransactions(prev =>
          prev.map(tx =>
            tx.transaction_id === transactionId ? { ...tx, status: 'rejected' } : tx
          )
        );
        // Recalculate totals after status update
        setTotals(calculateTotals(transactions));
        return true;
      } else {
        throw new Error(json.message || 'Transaction rejection failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error rejecting transaction:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const value: TransactionContextType = {
    transactions,
    customerTransactions,
    loading,
    error,
    totals,
    deductCommission,
    deleteTransaction,
    fetchCustomerTransactions,
    refreshTransactions: fetchTransactions,
    addTransaction,
    approveTransaction,
    rejectTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};