import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Staff {
    id: string;
  staff_id: string;
  full_name: string;
  email: string;
  role?: string;
  phone_number?: string;
  created_at?: string;
  company_id: string;
  // Add other fields as needed
}

interface StaffContextType {
  staffList: Staff[];
  loading: boolean;
  refreshStaff: () => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const companyJSON = localStorage.getItem("susupro_company");
      const company = companyJSON ? JSON.parse(companyJSON) : null;
      const companyId = company?.id;

      if (!companyId) {
        console.warn("Company ID not found in localStorage");
        return;
      }

      const res = await fetch(`https://susu-pro-backend.onrender.com/api/staff/?company_id=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched staff data:', data);
        setStaffList(data.data);
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch staff:", errorText);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <StaffContext.Provider value={{ staffList, loading, refreshStaff: fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};
