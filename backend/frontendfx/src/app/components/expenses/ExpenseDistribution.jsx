import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { API_URL } from "../../../config";

const COLORS = [
  "#6366F1",   // Indigo
  "#8B5CF6",   // Purple
  "#EC4899",   // Pink
  "#10B981",   // Emerald
  "#F59E0B",   // Amber
  "#EF4444",   // Red
  "#3B82F6",   // Blue
  "#6EE7B7",   // Teal
  "#4B5563",   // Gray
  "#8B5CF6"    // Purple
];

const ExpenseDistribution = ({ selectedStore, selectedUser }) => {
  const [chartData, setChartData] = useState([]);

  const fetchDistribution = async () => {
    try {      let url = `${API_URL}/api/expv1/expenses/distribution`;
      if (selectedStore !== "All") url += `?storeName=${selectedStore}`;
      if (selectedUser !== "All") url += `${selectedStore !== "All" ? "&" : "?"}userId=${selectedUser}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {        // Data is already in the correct format from the API
        setChartData(data.data);
      }
    } catch (error) {
      console.error("Error fetching expense distribution:", error);
    }
  };

  useEffect(() => {
    fetchDistribution();
  }, [selectedStore, selectedUser]);

  return (
    <motion.div
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">Expense Distribution by Category</h2>
      <div style={{ height: "400px" }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value) => [`K${value.toLocaleString()}`, 'Expense Amount']}
              />
              <Legend />
            </PieChart>
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

export default ExpenseDistribution;
