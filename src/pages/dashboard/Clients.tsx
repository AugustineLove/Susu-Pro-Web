import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, MoreVertical, Users, TrendingUp, Calendar, Download } from 'lucide-react';
import { mockClients, Client, Customer, Account } from '../../data/mockData';
import { useStats } from '../../contexts/dashboard/DashboardStat';
import { useCustomers } from '../../contexts/dashboard/Customers';
import { ClientModal } from './Components/clientModal';
import { useNavigate } from 'react-router-dom';
import DeleteCustomerModal from '../../components/deleteComfirmationModal';
import { userPermissions } from '../../constants/appConstants';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false); 
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const { stats } = useStats();
  const { customers, customerLoading, addCustomer, editCustomer, refreshCustomers, deleteCustomer } = useCustomers();
  
  const navigate = useNavigate();

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique values for filters
  const uniqueLocations = useMemo(() => 
    Array.from(new Set(customers.map(c => c.location).filter(Boolean))), 
    [customers]
  );
  
  const uniqueStaff = useMemo(() => 
    Array.from(new Set(customers.map(c => c.registered_by_name).filter(Boolean))), 
    [customers]
  );

  // Enhanced filtering logic
  const filteredClients = useMemo(() => {
    return customers.filter(customer => {
      const name = customer.name?.toLowerCase() || '';
      const email = customer.email?.toLowerCase() || '';
      const phone = customer.phone_number || '';
      const account = customer.account_number || '';

      // Search filter
      const matchesSearch = searchTerm === '' || 
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) || 
        account.includes(searchTerm) ||
        phone.includes(searchTerm);

      // Location filter
      const matchesLocation = locationFilter === 'all' || customer.location === locationFilter;

      // Staff filter
      const matchesStaff = staffFilter === 'all' || customer.registered_by_name === staffFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== 'all') {
        const customerDate = new Date(customer.date_of_registration);
        const now = new Date();
        
        switch (dateRangeFilter) {
          case 'last_week':
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = customerDate >= lastWeek;
            break;
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            matchesDateRange = customerDate >= lastMonth;
            break;
          case 'last_3_months':
            const last3Months = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            matchesDateRange = customerDate >= last3Months;
            break;
          case 'this_year':
            matchesDateRange = customerDate.getFullYear() === now.getFullYear();
            break;
        }
      }

      return matchesSearch && matchesLocation && matchesStaff && matchesDateRange;
    });
  }, [customers, searchTerm, locationFilter, staffFilter, dateRangeFilter]);

  // Enhanced statistics calculations
  const filteredStats = useMemo(() => {
    const totalCustomers = filteredClients.length;
    const maleCount = filteredClients.filter(c => c.gender?.toLowerCase() === 'male').length;
    const femaleCount = filteredClients.filter(c => c.gender?.toLowerCase() === 'female').length;
    
    const totalBalance = filteredClients.reduce((sum, customer) => 
      sum + (parseFloat(customer.total_balance_across_all_accounts) || 0), 0
    );
    
    const avgDailyRate = totalCustomers > 0 ? 
      filteredClients.reduce((sum, customer) => 
        sum + (parseFloat(customer.daily_rate) || 0), 0
      ) / totalCustomers : 0;

    const activeCustomersCount = filteredClients.filter(customer => {
      // Consider a customer active if they've registered in the last 90 days
      const registrationDate = new Date(customer.date_of_registration);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      return registrationDate >= ninetyDaysAgo;
    }).length;

    return {
      totalCustomers,
      maleCount,
      femaleCount,
      totalBalance,
      avgDailyRate,
      activeCustomersCount
    };
  }, [filteredClients]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('all');
    setStaffFilter('all');
    setDateRangeFilter('all');
  };

  // Export filtered data
  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Account Number', 'Balance', 'Location', 'Registered By', 'Join Date', 'Daily Rate'].join(','),
      ...filteredClients.map(customer => [
        customer.name,
        customer.email,
        customer.phone_number,
        customer.account_number,
        customer.total_balance_across_all_accounts,
        customer.location,
        customer.registered_by_name,
        new Date(customer.date_of_registration).toLocaleDateString(),
        customer.daily_rate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleDeleteConfirm = async (customerId: string) => {
    setIsDeleting(true);
    
    try {
      console.log(`Deleting customer id: ${selectedCustomer?.customer_id}`);
      deleteCustomer(selectedCustomer?.customer_id);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      console.log('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddClient = (newClient: Omit<Customer, 'id'>) => {
    const companyJSON = localStorage.getItem('susupro_company');
    const company = companyJSON ? JSON.parse(companyJSON) : null;
    const companyId = company?.id;

    const client: Customer = {
      ...newClient,
      company_id: companyId,
    };
    console.log('Adding new client:', client);
    addCustomer(client, '');
    refreshCustomers();
    setShowAddModal(false);
  };

  const handleEditClient = (updatedClient: Customer) => {
    editCustomer(updatedClient);
    refreshCustomers();
    !customerLoading ? setEditingClient(null) : null;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || locationFilter !== 'all' || staffFilter !== 'all' || dateRangeFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">
            Manage your susu clients and their information
            {hasActiveFilters && (
              <span className="ml-2 text-sm text-indigo-600">
                ({filteredStats.totalCustomers} of {customers.length} clients shown)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          {userPermissions.CUSTOMER_CREATE && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStats.totalCustomers}</p>
              <p className="text-xs text-gray-500 mt-1">
                Active: {filteredStats.activeCustomersCount}
              </p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className='flex gap-4'>
                <div>
                  <p className="text-xs text-gray-600">Males</p>
                  <p className="text-xl font-bold text-blue-600">{filteredStats.maleCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Females</p>
                  <p className="text-xl font-bold text-pink-600">{filteredStats.femaleCount}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gender Distribution
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ¢{filteredStats.totalBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Across all accounts
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Daily Rate</p>
              <p className="text-2xl font-bold text-teal-600">
                ¢{filteredStats.avgDailyRate.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Per customer
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or account number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Staff Filter */}
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Staff</option>
              {uniqueStaff.map((staff, index) => (
                <option key={index} value={staff}>
                  {staff}
                </option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="this_year">This Year</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No clients found</p>
                      <p className="text-sm">
                        {hasActiveFilters 
                          ? "Try adjusting your filters or search terms" 
                          : "Get started by adding your first client"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((customer) => (
                  <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.account_number}</div>
                          <div className='text-xs text-gray-400'>Staff: {customer.registered_by_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className="text-green-600">
                        ¢{parseFloat(customer.total_balance_across_all_accounts || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                        {customer.location || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(customer.date_of_registration).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        ¢{parseFloat(customer.daily_rate || '0').toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {userPermissions.MANAGE_STAFF && (
                          <button
                            onClick={() => setEditingClient(customer)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {userPermissions.MANAGE_STAFF && (
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          onClick={() => navigate(`customer-details/${customer.customer_id}`)}
                          title="View details"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Client Modal */}
      {(showAddModal || editingClient) && (
        <ClientModal
          account={{} as Account}
          client={editingClient}
          onSave={editingClient ? handleEditClient : handleAddClient}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
        />
      )}

      {/* Delete Modal */}
      {selectedCustomer && (
        <DeleteCustomerModal
          customer={selectedCustomer}
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          iscustomerLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default Clients;