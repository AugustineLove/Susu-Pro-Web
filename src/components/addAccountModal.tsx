import React, { useState, useEffect } from 'react';
import { X, Plus, PiggyBank, Wallet, CreditCard, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { Customer } from '../data/mockData';
import { companyId, userUUID } from '../constants/appConstants';

type account_type = 'susu' | 'savings' | 'loan';

export interface AccountFormData {
  customer_id: string;
  account_type: account_type;
  accountName: string;
  description: string;
  created_by: string;
  company_id: string;
  // Susu specific
  susuAmount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  susuDuration?: number; // in months
  startDate?: string;
  daily_rate?: number;
  // Savings specific
  minimumBalance?: number;
  interestRate?: number;
  // Loan specific
  initial_deposit?: number;
  interestRateLoan?: number;
  loanTerm?: number; // in months
  collateral?: string;
  guarantor?: string;
  created_by_type: string;
}

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: AccountFormData) => void;
  customer: Customer;
  isLoading?: boolean;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  customer,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    customer_id: customer.id || '',
    created_by: userUUID,
    company_id: companyId,
    account_type: 'susu',
    accountName: '',
    description: '',
    daily_rate: 0,
    created_by_type: userUUID === companyId ? 'company' : 'staff'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customer_id: customer.id || '',
        account_type: 'susu',
        accountName: '',
        description: '',
        created_by: userUUID,
        company_id: companyId,
        created_by_type: userUUID === companyId ? 'company' : 'staff'
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof AccountFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    console.log(`Form data: ${JSON.stringify(formData)}`)
    // Common validations
    if (!formData.customer_id) newErrors.customer_id = 'Please select a customer';
    
    // Type-specific validations
    switch (formData.account_type) {
      case 'susu':
        if (!formData.daily_rate || formData.daily_rate <= 0) {
          newErrors.daily_rate = 'Daily rate must be greater than 0';
        }
        if (!formData.frequency) newErrors.frequency = 'Please select frequency';
        break;

      case 'savings':
        if (!formData.initial_deposit || formData.initial_deposit < 0) {
          newErrors.initial_deposit = 'Initial deposit must be 0 or greater';
        }
        if (!formData.minimumBalance || formData.minimumBalance < 0) {
          newErrors.minimumBalance = 'Minimum balance must be 0 or greater';
        }
        if (formData.interestRate && (formData.interestRate < 0 || formData.interestRate > 100)) {
          newErrors.interestRate = 'Interest rate must be between 0 and 100';
        }
        break;

      case 'loan':
        if (!formData.initial_deposit || formData.initial_deposit <= 0) {
          newErrors.initial_deposit = 'Loan amount must be greater than 0';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getAccountIcon = (type: account_type) => {
    switch (type) {
      case 'susu': return <PiggyBank className="h-5 w-5" />;
      case 'savings': return <Wallet className="h-5 w-5" />;
      case 'loan': return <CreditCard className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: account_type) => {
    switch (type) {
      case 'susu': return 'bg-green-100 text-green-800 border-green-200';
      case 'savings': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'loan': return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add New Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Customer: {customer.name}
              </label>
              {/* <select
                value={formData.customer_id}
                onChange={(e) => handleInputChange('customer_id', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.customer_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.email && `(${customer.email})`}
                  </option>
                ))}
              </select> */}
              {/* {errors.customer_id && <p className="text-red-600 text-sm mt-1">{errors.customer_id}</p>} */}
            </div>

            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Account Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['susu', 'savings', 'loan'] as account_type[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('account_type', type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.account_type === type
                        ? getAccountColor(type)
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-center">
                      {getAccountIcon(type)}
                      <span className="text-sm font-medium capitalize mt-2">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            

            {/* Type-specific fields */}
            {formData.account_type === 'susu' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 flex items-center">
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Susu Account Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Daily Rate (¢) *
                    </label>
                    <input
                      type="number"
                      value={formData.daily_rate || ''}
                      onChange={(e) => handleInputChange('daily_rate', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.susuAmount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.susuAmount && <p className="text-red-600 text-sm mt-1">{errors.susuAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                    <select
                      value={formData.frequency || ''}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.frequency ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="">Select frequency</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {errors.frequency && <p className="text-red-600 text-sm mt-1">{errors.frequency}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Deposit (¢) *
                    </label>
                    <input
                      type="number"
                      value={formData.initial_deposit || ''}
                      onChange={(e) => handleInputChange('initial_deposit', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.initial_deposit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    </div>
                  </div>
              </div>
            )}

            {formData.account_type === 'savings' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Savings Account Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Deposit (¢) *
                    </label>
                    <input
                      type="number"
                      value={formData.initial_deposit || ''}
                      onChange={(e) => handleInputChange('initial_deposit', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.initial_deposit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.initial_deposit && <p className="text-red-600 text-sm mt-1">{errors.initial_deposit}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Balance (¢) *
                    </label>
                    <input
                      type="number"
                      value={formData.minimumBalance || ''}
                      onChange={(e) => handleInputChange('minimumBalance', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.minimumBalance ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.minimumBalance && <p className="text-red-600 text-sm mt-1">{errors.minimumBalance}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate (% per year)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate || ''}
                    onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value))}
                    placeholder="2.5"
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.interestRate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.interestRate && <p className="text-red-600 text-sm mt-1">{errors.interestRate}</p>}
                </div>
              </div>
            )}

            {formData.account_type === 'loan' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Loan Account Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Deposit (¢) *
                    </label>
                    <input
                      type="number"
                      value={formData.initial_deposit || ''}
                      onChange={(e) => handleInputChange('initial_deposit', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.initial_deposit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.initial_deposit && <p className="text-red-600 text-sm mt-1">{errors.initial_deposit}</p>}
                  </div>

                  </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional notes or description (optional)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;