import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { mockWithdrawals, Withdrawal } from '../../data/mockData';
import { useStats } from '../../contexts/dashboard/DashboardStat';
import { useTransactions } from '../../contexts/dashboard/Transactions';
import { toast } from 'react-hot-toast';
import { companyName } from '../../constants/appConstants';

const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(mockWithdrawals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { stats } = useStats();
  const [isApproving, setIsApproving] = useState(false);
  const { transactions, approveTransaction, rejectTransaction } = useTransactions();
  const withdrawalTransactions = transactions.filter(tx => tx.type === 'withdrawal');
  // Filter withdrawals
  const filteredWithdrawals = withdrawalTransactions.filter(withdrawal => {
    const matchesSearch = withdrawal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.description?.toLowerCase().includes(searchTerm.toLowerCase()) || withdrawal.unique_code?.toLocaleLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const pendingWithdrawals = transactions.filter(w => w.status === 'pending');
  const approvedWithdrawals = transactions.filter(w => w.status === 'approved' || w.status === 'completed');
  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  const totalApprovedAmount = approvedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
  
  const now = new Date();
const currentMonth = now.getMonth(); // 0-indexed: Jan = 0
const currentYear = now.getFullYear();

const approvedWithdrawalsThisMonth = transactions.filter(w => {
  const date = new Date(w.transaction_date);
  const isApproved = w.status === 'approved';
  return (
    isApproved &&
    date.getMonth() === currentMonth &&
    date.getFullYear() === currentYear
  );
});

const makeSuSuProName = (companyName: string) => {
  if (!companyName || typeof companyName !== 'string') return 'SuSuPro';

  // Get words (handles extra spaces, punctuation, hyphens)
  const words = companyName
    .trim()
    .split(/[\s\-_.]+/g)                // split on space, hyphen, underscore, dot
    .filter(Boolean);

  // Collect initials (letters only), uppercase
  const initials = words
    .map(w => (w.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/)?.[0] || '')) // first letter (incl. accents)
    .join('')
    .toUpperCase();

  return `${initials}SuSu`;
}


  const handleApproveClick = async (withdrawaId: string, customerPhone: string, customerName: string, withdrawalAmount: string) => {
    if (isApproving) return;

    setIsApproving(true);
    const toastId = toast.loading('Approving transaction...');
    console.log(`Toast Id: ${toastId}`);
   try {
  const approvalSuccess = await approveTransaction(withdrawaId, {
    messageTo: customerPhone,
    message: `Hello ${customerName} you have withdrawn an amount of GHS${withdrawalAmount}.00.`,
    messageFrom: makeSuSuProName(companyName),
  });

  console.log("Approval status", approvalSuccess);

  if (approvalSuccess) {
    toast.success("Transaction approved successfully!", { id: toastId });
  } else {
    toast.error(approvalSuccess.body.message, { id: toastId });
  }
} catch (error) {
  console.error(error);
  toast.error("Something went wrong while approving transaction.", { id: toastId });
}

  };

  const handleReject = (withdrawalId: string) => {
    if (window.confirm('Are you sure you want to reject this withdrawal request?')) {
      setWithdrawals(withdrawals.map(w => 
        w.id === withdrawalId 
          ? { ...w, status: 'rejected', approvalDate: new Date().toISOString().split('T')[0], approvedBy: 'John Doe' }
          : w
      ));
    }
  };

  const handleComplete = (withdrawalId: string) => {
    setWithdrawals(withdrawals.map(w => 
      w.id === withdrawalId 
        ? { ...w, status: 'completed' }
        : w
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
          <p className="text-gray-600">Manage client withdrawal requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">¢{totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved This Month</p>
              <p className="text-2xl font-bold text-green-600">{approvedWithdrawalsThisMonth.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-green-600">¢{totalApprovedAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by code, client name or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
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
                  Request Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.transaction_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {withdrawal.customer_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{withdrawal.customer_name}</div>
                        <p className='text-[10px]'>Staff: {withdrawal.staff_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      ¢{withdrawal.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(withdrawal.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={withdrawal.unique_code}>
                      {withdrawal.unique_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-1 capitalize">{withdrawal.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {withdrawal.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveClick(withdrawal.transaction_id, withdrawal.customer_phone, withdrawal.customer_name, withdrawal.amount.toLocaleString())}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectTransaction(withdrawal.transaction_id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : withdrawal.status === 'approved' ? (
                      <button
                        onClick={() => handleComplete(withdrawal.transaction_id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <div className="text-gray-400 text-xs">
                        {withdrawal.transaction_date && (
                          <div>
                            {withdrawal.status === 'rejected' ? 'Rejected' : 'Approved'} on{' '}
                            {new Date(withdrawal.transaction_date).toLocaleDateString()}
                          </div>
                        )}
                        {withdrawal.staff_name && (
                          <div className="text-gray-400">by {withdrawal.staff_name}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredWithdrawals.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria' 
              : 'No withdrawal requests have been made yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
