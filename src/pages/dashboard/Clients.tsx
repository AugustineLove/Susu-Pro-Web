import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, MoreVertical } from 'lucide-react';
import { mockClients, Client, Customer, Account } from '../../data/mockData';
import { useStats } from '../../contexts/dashboard/DashboardStat';
import { useCustomers } from '../../contexts/dashboard/Customers';
import { ClientModal } from './Components/clientModal';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false); 
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const {stats} = useStats();
  const { customers, loading, addCustomer, refreshCustomers, deleteCustomer } = useCustomers(); // ✅ correct
  const uniqueLocations = Array.from(new Set(customers.map(c => c.location)));


  const filteredClients = customers.filter(customer => {
  const name = customer.name?.toLowerCase() || '';
  const email = customer.email?.toLowerCase() || '';
  const phone = customer.phone_number || '';

  const matchesSearch =
    name.includes(searchTerm.toLowerCase()) ||
    email.includes(searchTerm.toLowerCase()) ||
    phone.includes(searchTerm);

  const matchesLocation =
    statusFilter === 'all' || customer.location === statusFilter;

  return matchesSearch && matchesLocation;
});


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
        setShowAddModal(false);
      };

  const handleEditClient = (updatedClient: Customer) => {
    setClients(clients.map(client =>
      client.id === updatedClient.id ? updatedClient : client
    ));
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600">Manage your susu clients and their information</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

       {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className='flex'><p className="inline-block w-[50px] text-sm text-gray-600">Males</p><p className="text-sm text-gray-600">Females</p></div>
              <div className='flex'>
                <p className="inline-block w-[50px] text-2xl font-bold text-green-600">
                {customers.filter(customer => customer.gender?.toLowerCase() === 'male').length}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(customer => customer.gender?.toLowerCase() === 'female').length}
              </p>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                ₵{stats?.totalBalance.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Contribution</p>
              <p className="text-2xl font-bold text-teal-600">
                ₵{(clients.reduce((sum, c) => sum + 0, 0) / clients.length).toFixed(0)}
              </p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-teal-600" />
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
                placeholder="Search clients by name, email, or phone..."
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
                <option value="all">All</option>
                {
                   uniqueLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location || 'Unknown'}
                  </option>
                ))
                }
              </select>
            </div>
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
              {filteredClients.map((customer) => (
                <tr key={customer.customer_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone_number}</div>
                  </td>
                  
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₵{customer.total_balance_across_all_accounts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-sm rounded-full `}>
                      {customer.location ? customer.location : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(customer.date_of_registration).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full`}>
                      {customer.location ? customer.daily_rate : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingClient(customer)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCustomer(customer.customer_id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};

export default Clients;