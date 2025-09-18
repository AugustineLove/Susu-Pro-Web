import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import HowItWorks from './pages/public/HowItWorks';
import Features from './pages/public/Features';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import Clients from './pages/dashboard/Clients';
import Contributions from './pages/dashboard/Contributions';
import Withdrawals from './pages/dashboard/Withdrawals';
import Reports from './pages/dashboard/Reports';
import Settings from './pages/dashboard/Settings';
import SignUp from './pages/auth/SignUp';
import { StatsProvider } from './contexts/dashboard/DashboardStat';
import { CustomersProvider } from './contexts/dashboard/Customers';
import { TransactionProvider } from './contexts/dashboard/Transactions';
import AllTransactions from './pages/dashboard/Components/ViewAllTransactions';
import { StaffProvider } from './contexts/dashboard/Staff';
import { AccountsProvider } from './contexts/dashboard/Account';
import TwoFactorPage from './pages/auth/TwoFactor';
import { Toaster } from 'react-hot-toast';
import ChatList from './pages/dashboard/ChatList';
import Chat from './pages/dashboard/ChatList';
import FinancialDashboard from './pages/dashboard/Finance';
import { FinanceProvider } from './contexts/dashboard/Finance';

function App() {
  return (
    <AuthProvider>
       <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/two-factor" element={<TwoFactorPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <StatsProvider>
                <CustomersProvider>
                  <TransactionProvider>
                    <StaffProvider>
                      <AccountsProvider>
                        <FinanceProvider>
                          <DashboardLayout />
                        </FinanceProvider>
                      </AccountsProvider>
                    </StaffProvider>
                  </TransactionProvider>
                </CustomersProvider>
              </StatsProvider>
            </ProtectedRoute>
          }>
            <Route index element={<Overview />} />
            <Route path="clients" element={<Clients />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="all-transactions" element={<AllTransactions />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="chat" element={<Chat />} />
            <Route path="expenses" element={<FinancialDashboard />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;