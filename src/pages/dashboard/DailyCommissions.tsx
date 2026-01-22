import { useLocation } from "react-router-dom";
import { formatDate } from "../../constants/appConstants";
import { useTransactions } from "../../contexts/dashboard/Transactions";
import { useMemo } from "react";

export const CommissionDay = () => {
  const { state } = useLocation();
  const { transactions, totals, approveTransaction, refreshTransactions, rejectTransaction } = useTransactions();
  const date = state?.date;  

  const commissions = useMemo(() => {
  if (!date) return [];

  return transactions
    .filter(t => {
      if (t.type !== "commission" || t.status === "reversed") return false;
      if (!t.transaction_date) return false;

      const txDate = new Date(t.transaction_date)
        .toISOString()
        .split("T")[0];

      return txDate === date;
    })
    .sort(
      (a, b) =>
        new Date(b.transaction_date) - new Date(a.transaction_date)
    );
}, [transactions, date]);

  if (!commissions) return <p>No data available</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Commissions for {formatDate(state?.date)}
      </h2>

      {commissions.map(c => (
        <div key={c.id} className="p-4 border rounded-lg">
          <div>
            <p className="font-medium">₵{Number(c.amount).toLocaleString()}</p>
            <p>{c.customer_name}</p>
          </div>
          <p className="text-xs text-gray-500">
            Ref: {c.description || "—"} | Status: {c.status} 
          </p>
        </div>
      ))}
    </div>
  );
};
