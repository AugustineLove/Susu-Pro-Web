import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { formatDate } from "../../constants/appConstants";
import { Budget } from "../../data/mockData";
import { useFloatActivity } from "../../contexts/dashboard/FloatActivity";

const BudgetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const budget = state?.budget as Budget;

  const { activities, loading, fetchFloatActivity } = useFloatActivity();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "withdrawal" | "expense">(
    "all"
  );

  useEffect(() => {
    if (id) fetchFloatActivity(id);
  }, [id]);

  const filteredActivities = activities.filter((item) => {
    const text =
      item.customer_name ||
      item.recorded_staff_name ||
      item.expense_staff_name ||
      item.mobile_banker_name ||
      item.withdrawal_staff_name ||
      item.expense_description ||
      "";

    const matchesSearch = text
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || item.source_type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    if (type === "withdrawal")
      return "bg-red-100 text-red-700";
    if (type === "expense")
      return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const getRemainingColor = (remaining: number) => {
    if (remaining > 5000) return "text-green-600 font-semibold";
    if (remaining > 1000) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Float Activity
      </h1>

      {/* FLOAT SUMMARY */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Date Allocated</p>
            <p className="font-semibold">{formatDate(budget.date)}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Total Allocated</p>
            <p className="text-emerald-600 font-semibold">
              ₵{budget.allocated.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Used Amount</p>
            <p className="text-blue-600 font-semibold">
              ₵{budget.spent.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Float Balance</p>
            <p className={getRemainingColor(Number(budget.remaining))}>
              ₵{budget.remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer, staff, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as any)
          }
          className="w-full md:w-1/5 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All</option>
          <option value="withdrawal">Withdrawals</option>
          <option value="expense">Expenses</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 text-indigo-700 text-xs uppercase">
            <tr>
              <th className="p-4">Staff</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Type</th>
              <th className="p-4">Description</th>
              <th className="p-4">Customer</th>
              {/* <th className="p-4">Date</th> */}
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Loading float activity...
                </td>
              </tr>
            ) : filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No activity found.
                </td>
              </tr>
            ) : (
              filteredActivities.map((item) => (
                <tr
                  key={item.movement_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 flex align-center">
                    {item.recorded_staff_name ||
                      item.expense_staff_name ||
                      "—"}
                  </td>
                  <td className="p-4 font-semibold">
                    ₵{Number(item.amount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                        item.source_type
                      )}`}
                    >
                      {item.source_type}
                    </span>
                  </td>

                  <td className="p-4 text-gray-500">
                    {item.expense_description || "—"}
                  </td>

                  <td className="p-4">
                    {item.customer_name || "—"}
                  </td>

                  {/* <td className="p-4 text-gray-600">
                    {new Date(item.created_at).toLocaleString()}
                  </td> */}
                  <td className="p-4">
                    {item.transaction_status || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetDetails;
