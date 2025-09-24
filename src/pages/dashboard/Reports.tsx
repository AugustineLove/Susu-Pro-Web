import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, PiggyBank, FileText, BarChart3, Filter } from 'lucide-react';
import { useStats } from '../../contexts/dashboard/DashboardStat';
import { useTransactions } from '../../contexts/dashboard/Transactions';
import { useCustomers } from '../../contexts/dashboard/Customers';
import { companyId } from '../../constants/appConstants';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [exportFormat, setExportFormat] = useState('pdf');

  const { stats } = useStats();
  const { transactions } = useTransactions();
  const { customers } = useCustomers();

  // Calculate metrics from real data
  const totalClients = customers.length;
  const activeClients = customers.filter(c => c.company_id === companyId).length;
  const contributions = transactions.filter(t =>  t.type === 'deposit');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed' || t.status ==='approved');
  const totalContributions = contributions.reduce((sum, t) => Number(sum) + Number(t.amount), 0);
  const totalWithdrawals = withdrawals.reduce((sum, t) => Number(sum) + Number(t.amount), 0);
  const totalBalance = stats?.totalBalance || totalContributions - totalWithdrawals;

  const reportTypes = [
    { id: 'overview', name: 'Business Overview', description: 'Comprehensive summary', icon: BarChart3 },
    { id: 'contributions', name: 'Contributions Report', description: 'Contribution analysis', icon: PiggyBank },
    { id: 'clients', name: 'Client Analysis', description: 'Client demographics', icon: Users },
    { id: 'financial', name: 'Financial Summary', description: 'Income and balances', icon: TrendingUp }
  ];

  const handleExport = () => alert(`Exporting ${selectedReport} as ${exportFormat.toUpperCase()}`);
  const handleGenerate = () => alert(`Generating ${selectedReport} for ${dateRange}`);

  // Get monthly data from transactions
  const getMonthlyData = () => {
    const months: { [key: string]: number } = {};
    contributions.forEach(t => {
      const month = new Date(t.transaction_date).toLocaleDateString('en', { month: 'short' });
      months[month] = (months[month] || 0) + Number(t.amount);
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  };

  const monthlyData = getMonthlyData();
  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  type StatusColor = 'green' | 'yellow' | 'red';
  const colorClassMap = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

 const statusItems = [
    {
      status: 'Approved',
      count: transactions.filter(t => t.status === 'approved').length,
      color: 'green' as StatusColor,
    },
    {
      status: 'Completed',
      count: transactions.filter(t => t.status === 'completed').length,
      color: 'green' as StatusColor,
    },
    {
      status: 'Pending',
      count: transactions.filter(t => t.status === 'pending').length,
      color: 'yellow' as StatusColor,
    },
    {
      status: 'Rejected',
      count: transactions.filter(t => t.status === 'rejected').length,
      color: 'red' as StatusColor,
    },
  ]
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports and analyze your data</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
          <button onClick={handleGenerate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              {reportTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: totalClients, detail: `${activeClients} active`, icon: Users, color: 'indigo', bg: 'indigo-100' },
          { label: 'Overall Contributions', value: `${totalContributions.toLocaleString()}`, detail: '↑ Growth', icon: PiggyBank, color: 'green', bg: 'green-100' },
          { label: 'Current Balance', value: `${totalBalance.toLocaleString()}`, detail: 'Available', icon: TrendingUp, color: 'blue', bg: 'blue-100' },
          { label: 'Total Withdrawals', value: `${totalWithdrawals.toLocaleString()}`, detail: 'Completed', icon: Download, color: 'orange', bg: 'orange-100' }
        ].map((metric, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">¢{metric.value}</p>
                <p className={`text-sm text-${metric.color}-600 mt-1`}>{metric.detail}</p>
              </div>
              <div className={`bg-${metric.bg} p-3 rounded-lg`}>
                <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((type) => (
          <div key={type.id} onClick={() => setSelectedReport(type.id)}
               className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-colors ${
                 selectedReport === type.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
               }`}>
            <div className={`p-3 rounded-lg mb-4 ${selectedReport === type.id ? 'bg-indigo-100' : 'bg-gray-100'}`}>
              <type.icon className={`h-8 w-8 ${selectedReport === type.id ? 'text-indigo-600' : 'text-gray-600'}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Monthly Contributions</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {monthlyData.map((data, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{data.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-gradient-to-r from-indigo-600 to-teal-600 h-4 rounded-full transition-all duration-1000"
                     style={{ width: `${(data.amount / maxAmount) * 100}%` }}></div>
              </div>
              <div className="w-20 text-sm font-medium text-gray-900 text-right">¢{data.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Contributing Clients</h3>
          <div className="space-y-4">
            {customers
              .sort((a, b) => (b.total_balance_across_all_accounts || 0) - (a.total_balance_across_all_accounts || 0))
              .slice(0, 5)
              .map((client, idx) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-500">#{idx + 1}</div>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-xs">
                        {client.name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{client.name || 'Unknown'}</div>
                  </div>
                  <div className="text-sm font-semibold">¢{(client.total_balance_across_all_accounts || 0).toLocaleString()}</div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Status</h3>
          <div className="space-y-4">
            {statusItems.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.status}</span>
                  <span className="text-sm text-gray-600">{item.count} transactions</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 w-full">
                  <div
                    className={`${colorClassMap[item.color]} h-2 rounded-full`}
                    style={{ width: `${(item.count / transactions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;