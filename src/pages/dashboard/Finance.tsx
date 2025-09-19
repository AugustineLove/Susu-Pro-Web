import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Receipt, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Eye,
  Banknote,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
// import { Asset, Budget, Expense } from '../../data/mockData';
import { useFinance } from '../../contexts/dashboard/Finance';
import { companyId, formatDate } from '../../constants/appConstants';
import { Asset, Budget, Expense } from '../../data/mockData';


interface FinanceData{
  expenses: Expense[];
  assets: Asset[];
  budgets: Budget[];
}

interface FormDataState {
  name?: string;
  category?: string;
  description?: string;
  amount?: number;
  value?: number;
  type?: string;
  date?: string;
  depreciation_rate?: string;
  purchase_date?: string;
  allocated?: number;
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: FormDataState, company_id: string) => void;
  formData: FormDataState;
  onFormChange: (field: keyof FormDataState, value: string) => void;
  loading: boolean;
}

 // Add Expense Modal
  const ExpenseModal: React.FC<ModalProps> = ({ show, onClose, onSubmit, formData, onFormChange, loading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Expense</h3>
          <button 
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <form className="space-y-4"  onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData, companyId); 
        }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              name ="description"
              value={formData.description}
              onChange={e => onFormChange('description', e.target.value )}
              type="text"
              placeholder="Enter expense description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              value={formData.amount || ''}
              onChange={e => onFormChange('amount', e.target.value )}
              type="number"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={e => onFormChange('category',  e.target.value )}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option value="Operations">Operations</option>
              <option value="Technology">Technology</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              value={formData.date}
              onChange={e => onFormChange('date', e.target.value )}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding expense...
                </div>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
const AssetModal: React.FC<ModalProps>  = ({ show, onClose, onSubmit, formData, onFormChange, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Add New Asset</h3>
        <button 
          onClick={() => onClose()}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData, companyId); 
        }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
          <input
            value={formData.name}
            onChange={e => onFormChange('name', e.target.value )}
            type="text"
            placeholder="Enter asset name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
           value={formData.category}
              onChange={e => onFormChange('category', e.target.value )}
              >
            <option>Select type</option>
            <option>Real Estate</option>
            <option>Technology</option>
            <option>Transportation</option>
            <option>Equipment</option>
            <option>Furniture</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <input
            value={formData.value}
            onChange={e => onFormChange('value', e.target.value )}
            type="number"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
          <input
            value={formData.date}
            onChange={e => onFormChange('date', e.target.value )}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Annual Depreciation (%)</label>
          <input
            value={formData.depreciation_rate}
            onChange={e => onFormChange('depreciation_rate', e.target.value )}
            type="number"
            placeholder="5"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => onClose()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
             {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding asset...
                </div>
              ) : (
                'Add Asset'
              )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const BudgetModal = ({ show, onClose, onSubmit, formData, onFormChange, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Add New Budget</h3>
        <button 
          onClick={() => onClose()}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData, companyId); 
        }}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount of float</label>
          <input
            value={formData.allocated}
            required
            onChange={e => onFormChange('allocated', e.target.value )}
            type="number"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
          <input
            value={formData.date}
            onChange={e => onFormChange('date', e.target.value )}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => onClose()}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
             {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding budget...
                </div>
              ) : (
                'Add Budget'
              )}
          </button>
        </div>
      </form>
    </div>
  </div>
);





// Main Component
const FinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [ showBudgetModal, setShowBudgetModal ] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const { data, fetchFinanceData, addExpense, addAsset, addBudget, loading } = useFinance();
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");


    useEffect(() => {
      fetchFinanceData();
    }, [companyId]);

  const expenses = data?.expenses || [];
  const assets = data?.assets || [];
  const budgets = data?.budgets || [];
  const uniqueCategories = ["All Categories", ...new Set(expenses.map(e => e.category))];
  const uniqueStatuses = ["All Status", ...new Set(expenses.map(e => e.status))];


  const filteredExpenses = expenses.filter((e) => {
  const description = (e.description || "").toLowerCase();
  const category = (e.category || "").toLowerCase();
  const status = (e.status || "").toLowerCase();
  const term = (searchTerm || "").toLowerCase();

  const matchesSearch =
    description.includes(term) || category.includes(term) || status.includes(term);

  const matchesCategory =
    categoryFilter === "All Categories" || e.category === categoryFilter;

  const matchesStatus =
    statusFilter === "All Status" || e.status === statusFilter;

  return matchesSearch && matchesCategory && matchesStatus;
});


const defaultExpenseFormData: FormDataState = {
  name: "",
  category: "",
  description: "",
  amount: 0,
  value: 0,
  type: "expense",
  date: new Date().toISOString().split("T")[0], 
};

const defaultAssetFormData: FormDataState = {
  name: "",
  category: "",
  description: "",
  amount: 0,
  value: 0,
  type: "asset",
  depreciation_rate: "",
  date: new Date().toISOString().split("T")[0], 
};

const defaultBudgetFormData: FormDataState = {
  allocated: 0,
  date: new Date().toISOString().split("T")[0], 
};

  const [expenseFormData, setExpenseFormData] = useState<FormDataState>(defaultExpenseFormData);
  const [assetFormData, setAssetFormData] = useState<FormDataState>({defaultAssetFormData});
  const [budgetFormData, setBudgetFormData] = useState<FormDataState>({defaultBudgetFormData});

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    amount: '',
    depreciation: '',
    value: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    company_id: companyId,
    created_by: ''
  });

  const submitExpense = async  (formData: FormDataState, company_id: string) => {
    try {
      const { description, amount, date, category } = formData;
      const expenseData = { description, amount, date, category };
      await addExpense(company_id, { status: "approved", type: "expense", ...expenseData });
      setExpenseFormData(defaultExpenseFormData);
      setShowExpenseModal(false);
    } catch (error) {
      console.log(error);
    }
  }  
  const submitAsset = async (formData: FormDataState, company_id: string) => {
    try {
      console.log(`Form data: ${JSON.stringify(formData)}`);
      const { name, value, category, date, depreciation_rate } = formData;
      const assetData = { name, category, value, date, depreciation_rate };
      await addAsset(company_id, { status: "active", type: "asset", ...assetData });
      setExpenseFormData(defaultAssetFormData);
      setShowAssetModal(false);
    } catch (error) {
      console.log(error);
    }
  }  
  const submitBudget = async (formData: FormDataState, company_id: string) => {
    try {
      const { allocated, date } = formData;
      const budgetData = {allocated, date };
      await addBudget(company_id, { ...budgetData });
      setShowBudgetModal(false); 
      setBudgetFormData(defaultBudgetFormData);
    } catch (error) {
      console.log(error);
    }
  }  

  // Overview Tab Component
  const OverviewTab = () => {
  const totalExpenses = expenses.reduce((sum, e) => Number(sum) + (Number(e.amount) || 0), 0);
  const totalAssets = assets.reduce((sum, a) => Number(sum) + (Number(a.value) || 0), 0);
  const budgetAllocated = budgets.reduce((sum, b) => Number(sum) + (Number(b.allocated) || 0), 0);
  const budgetSpent = budgets.reduce((sum, b) => Number(sum) + (Number(b.spent) || 0), 0);
  console.log(`Budget spent: ${budgetSpent}`);
  const budgetUtilization = budgetAllocated > 0 ? (budgetSpent / budgetAllocated) * 100 : 0;
  const monthlySavings = totalAssets - totalExpenses; // or however you want to compute it

     return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Total Expenses */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
        <h3 className="text-2xl font-bold text-gray-900">
        ¢{totalExpenses.toLocaleString()}
        </h3>
        {/* <div className="flex items-center mt-2">
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          <span className="text-sm text-red-500">vs last month</span>
        </div> */}
      </div>
      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
        <Banknote className="w-6 h-6 text-red-600" />
      </div>
    </div>
  </div>

  {/* Total Assets */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">Total Assets</p>
        <h3 className="text-2xl font-bold text-gray-900">
         ¢{totalAssets.toLocaleString()}
        </h3>
        {/* <div className="flex items-center mt-2">
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-500">asset growth</span>
        </div> */}
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Building2 className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>

  {/* Budget Utilization */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">Budget Utilization</p>
        <h3 className="text-2xl font-bold text-gray-900">
          {budgetUtilization.toFixed(0)}%
        </h3>
        <div className="flex items-center mt-2">
          <span className="text-sm text-yellow-600">
            ¢{budgetSpent.toLocaleString()} of ${budgetAllocated.toLocaleString()} used
          </span>
        </div>
      </div>
      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
        <PieChart className="w-6 h-6 text-yellow-600" />
      </div>
    </div>
  </div>

  {/* Monthly Savings */}
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">Monthly Savings</p>
        <h3 className="text-2xl font-bold text-gray-900">
          ¢{monthlySavings.toLocaleString()}
        </h3>
        {/* <div className="flex items-center mt-2">
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-500">vs target</span>
        </div> */}
      </div>
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>
</div>


      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-4">
          {expenses.slice(0, 5).map((expense: any) => (
            <div key={expense.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.category} • {expense.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">-¢{expense.amount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full `}>
                  {formatDate(expense.expense_date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  }
  // Expenses Tab Component
  const ExpensesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Expense Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track and manage company expenses</p>
        </div>
        <button 
          onClick={() => setShowExpenseModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          
         <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {uniqueCategories.map((cat, i) => (
            <option key={i}>{cat}</option>
          ))}
        </select>

        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {uniqueStatuses.map((st, i) => (
            <option key={i}>{st}</option>
          ))}
        </select>

          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.map((expense: any) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Receipt className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{expense.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">¢{expense.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(expense.expense_date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                      expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Assets Tab Component
const AssetsTab = () => {
  // ✅ Compute summary from assets
  const totalAssetValue = assets.reduce((sum: number, a: any) => Number(sum) + (Number(a.value) || 0), 0);

  const activeAssets = assets.filter((a: any) => a.status === "active").length;

  const annualDepreciation = assets.reduce((sum: number, a: any) => {
    if (a.depreciation_rate) {
      return sum + ((a.value || 0) * (a.depreciation_rate / 100));
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Asset Management</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and track company assets</p>
        </div>
        <button
          onClick={() => setShowAssetModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Asset Value</p>
              <h3 className="text-xl font-bold text-gray-900">
                ¢{totalAssetValue.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Assets</p>
              <h3 className="text-xl font-bold text-gray-900">{activeAssets}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Depreciation</p>
              <h3 className="text-xl font-bold text-gray-900">
                ¢{annualDepreciation.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Depreciation</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset: any) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{asset.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{asset.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ¢{(asset.value || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(asset.purchase_date)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {asset.depreciation_rate ? `${asset.depreciation_rate}% / year` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        asset.status === "active"
                          ? "bg-green-100 text-green-700"
                          : asset.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

 
const BudgetTab = () => {
   const totalAllocated = budgets.reduce((sum, b) => Number(sum) + Number(b.allocated), 0);
  const totalSpent = budgets.reduce((sum, b) => Number(sum) + Number(b.spent), 0);
  const totalRemaining = totalAllocated - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Budget Planning</h2>
          <p className="text-sm text-gray-600 mt-1">
            Plan and monitor departmental budgets
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          onClick={() => setShowBudgetModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Allocated</h3>
            {/* <DollarSign className="w-5 h-5 text-green-600" /> */}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₵{totalAllocated.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
            <Receipt className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₵{totalSpent.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {totalAllocated > 0
              ? `${Math.round((totalSpent / totalAllocated) * 100)}% of budget used`
              : "No budget yet"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Remaining</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₵{totalRemaining.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 mt-2">
            {totalAllocated > 0
              ? `${Math.round((totalRemaining / totalAllocated) * 100)}% remaining`
              : "No budget yet"}
          </p>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Budget by Category
        </h3>
        <div className="space-y-6">
          {budgets.length === 0 ? (
            <p className="text-gray-500 text-sm">No budgets set yet.</p>
          ) : (
            budgets.map((budget) => {
              const percentage = budget.allocated
                ? Math.round((budget.spent / budget.allocated) * 100)
                : 0;
              const remaining = budget.allocated - budget.spent;

              return (
                <div
                  key={budget.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      {formatDate(budget.date)}
                    </h4>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        ₵{budget.spent.toLocaleString()} / ₵
                        {budget.allocated.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{percentage}% used</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        percentage > 80
                          ? "bg-red-500"
                          : percentage > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Remaining: ₵{remaining.toLocaleString()}</span>
                    <span>
                      {remaining < 0
                        ? "Over budget"
                        : percentage > 80
                        ? "Approaching limit"
                        : "On track"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  )};  // Reports Tab Component
  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Reports</h2>
          <p className="text-sm text-gray-600 mt-1">Generate and view financial reports</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Custom Range</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Expense Report', description: 'Detailed expense breakdown by category and time', icon: Receipt, color: 'blue' },
          { title: 'Asset Depreciation', description: 'Asset value changes and depreciation schedule', icon: Building2, color: 'purple' },
          { title: 'Budget Analysis', description: 'Budget vs actual spending analysis', icon: PieChart, color: 'green' },
          { title: 'Cash Flow', description: 'Cash inflows and outflows over time', icon: TrendingUp, color: 'orange' },
          { title: 'P&L Statement', description: 'Profit and loss statement for the period', icon: BarChart3, color: 'red' },
          { title: 'Financial Summary', description: 'Executive summary of financial position', icon: DollarSign, color: 'indigo' }
        ].map((report, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-12 h-12 ${
              report.color === 'blue' ? 'bg-blue-100' :
              report.color === 'purple' ? 'bg-purple-100' :
              report.color === 'green' ? 'bg-green-100' :
              report.color === 'orange' ? 'bg-orange-100' :
              report.color === 'red' ? 'bg-red-100' :
              'bg-indigo-100'
            } rounded-lg flex items-center justify-center mb-4`}>
              <report.icon className={`w-6 h-6 ${
                report.color === 'blue' ? 'text-blue-600' :
                report.color === 'purple' ? 'text-purple-600' :
                report.color === 'green' ? 'text-green-600' :
                report.color === 'orange' ? 'text-orange-600' :
                report.color === 'red' ? 'text-red-600' :
                'text-indigo-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className={`w-full ${
              report.color === 'blue' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' :
              report.color === 'purple' ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' :
              report.color === 'green' ? 'bg-green-50 text-green-600 hover:bg-green-100' :
              report.color === 'orange' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' :
              report.color === 'red' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
              'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            } py-2 px-4 rounded-lg transition-colors text-sm font-medium`}>
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h3>
        <div className="space-y-4">
          {[
            { name: 'Monthly Expense Report - September 2024', date: '2024-09-15', type: 'Expense Report', status: 'completed' },
            { name: 'Q3 Asset Depreciation Report', date: '2024-09-12', type: 'Asset Report', status: 'completed' },
            { name: 'Budget Analysis - Q3 2024', date: '2024-09-10', type: 'Budget Report', status: 'processing' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{report.name}</p>
                  <p className="text-xs text-gray-500">{report.type} • {report.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {report.status}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage expenses, assets, and budgets</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'expenses', label: 'Expenses', icon: Banknote },
            { id: 'assets', label: 'Assets', icon: Building2 },
            { id: 'budget', label: 'Budget', icon: PieChart },
            // { id: 'reports', label: 'Reports', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'assets' && <AssetsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>

      {/* Modals */}
      {showExpenseModal && <ExpenseModal
  show={showExpenseModal}
  onClose={() => setShowExpenseModal(false)}
  onSubmit={submitExpense}
  formData={expenseFormData}
  onFormChange={(field, value) =>
    setExpenseFormData(prev => ({ ...prev, [field]: value }))
  }
  loading={loading}
/>}

      {showAssetModal && <AssetModal
  show={showAssetModal}
  onClose={() => setShowAssetModal(false)}
  onSubmit={submitAsset}
  formData={assetFormData}
  onFormChange={(field, value) =>
    setAssetFormData(prev => ({ ...prev, [field]: value }))
  }
  loading={loading}
/>}
      {showBudgetModal && <BudgetModal
  show={showBudgetModal}
  onClose={() => setShowBudgetModal(false)}
  onSubmit={submitBudget}
  formData={budgetFormData}
  onFormChange={(field, value) =>
    setBudgetFormData(prev => ({ ...prev, [field]: value }))
  }
  loading={loading}
/>}
</div>
  );

  
};

export default FinancialDashboard;