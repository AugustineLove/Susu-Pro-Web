import React, { useState } from 'react';
import { Search, Plus, Calendar, Filter, Download, PiggyBank, Eye } from 'lucide-react';
import { mockContributions, mockClients, Contribution, Transaction } from '../../data/mockData';
import { useTransactions } from '../../contexts/dashboard/Transactions';
import { useStats } from '../../contexts/dashboard/DashboardStat';
import { TransactionModal } from './Components/transactionModal';

const Contributions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { transactions } = useTransactions();
  const { stats } = useStats();
  // Filter contributions
  const filteredContributions = transactions.filter(contribution => {
    const matchesSearch = contribution.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contribution.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const contributionDate = new Date(contribution.transaction_date);
      const now = new Date();
      const daysDiff = (now.getTime() - contributionDate.getTime()) / (1000 * 3600 * 24);
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff < 1;
          break;
        case 'week':
          matchesDate = daysDiff < 7;
          break;
        case 'month':
          matchesDate = daysDiff < 30;
          break;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const totalAmount = transactions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingAmount = transactions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const thisMonthAmount = transactions
    .filter(c => {
      const contributionDate = new Date(c.transaction_date);
      const now = new Date();
      return contributionDate.getMonth() === now.getMonth() && 
             contributionDate.getFullYear() === now.getFullYear() &&
             c.status === 'completed';
    })
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const handleAddContribution = (newContribution: Omit<Contribution, 'id'>) => {
    const contribution: Contribution = {
      ...newContribution,
      id: (transactions.length + 1).toString()
    };
    // setTransactions([...transactions, contribution]);
    setShowAddModal(false);
  };

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
      const companyJSON = localStorage.getItem('susupro_company');
        const company = companyJSON ? JSON.parse(companyJSON) : null;
        const companyId = company?.id;
  
        const transaction: Transaction = {
          ...newTransaction,
          company_id: companyId,
        };
        console.log('Adding new transaction:', transaction);
        
        setShowAddModal(false);
        setShowTransactionModal(false);
        setEditingTransaction(null);
      };
  
      const handleEditTransaction = (updatedTransaction: Transaction) => {
        
        setEditingTransaction(null);
      };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-blue-100 text-blue-800';
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800';
      case 'mobile_money':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMethod = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      case 'cash':
        return 'Cash';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-600">Track and manage all client contributions</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Log Contribution
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalBalance}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <PiggyBank className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">${thisMonthAmount.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Amount</p>
              <p className="text-2xl font-bold text-teal-600">
                ${Math.round(totalAmount / transactions.filter(c => c.status === 'completed').length || 1).toLocaleString()}
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <PiggyBank className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions.map((contribution) => (
                <tr key={contribution.transaction_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {contribution.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{contribution.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      ${contribution.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(contribution.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(contribution.status)}`}>
                      {formatMethod(contribution.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contribution.status)}`}>
                      {contribution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {contribution.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contribution Modal */}
      {showAddModal && (
        <TransactionModal
          transaction={editingTransaction}
          onSave={editingTransaction ? handleEditTransaction : handleAddTransaction}
          onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
};


export default Contributions;
