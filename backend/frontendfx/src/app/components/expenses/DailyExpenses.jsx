import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { API_URL } from "../../../config";

const DailyExpenses = ({ selectedStore, selectedUser }) => {
  const [chartData, setChartData] = useState([]);

  const fetchDailyExpenses = async () => {
    try {
      let url = `${API_URL}/api/expv1/expenses/daily`;
      if (selectedStore !== "All") url += `?storeName=${selectedStore}`;
      if (selectedUser !== "All")
        url += `${selectedStore !== "All" ? "&" : "?"}userId=${selectedUser}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setChartData(data.data);
      }
    } catch (error) {
      console.error("Error fetching daily expenses:", error);
    }
  };

  useEffect(() => {
    fetchDailyExpenses();
  }, [selectedStore, selectedUser]);

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">
        Daily Expenses
      </h2>
      <div style={{ height: "400px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `K${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value) => [`K${value.toLocaleString()}`, "Expense Amount"]}
                labelStyle={{ color: "#E5E7EB" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#FCD34D"
                strokeWidth={2}
                dot={{ fill: "#FCD34D", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Daily Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No expense data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyExpenses;
