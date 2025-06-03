import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_URL } from "../../../config"; 

const DailyOrders = () => {
  const [dailyOrdersData, setDailyOrdersData] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/overviewapi/a/listorders`);
        const data = await res.json();
        if (data.orders) {
          const orders = data.orders;
          const dailyCounts = {};

          orders.forEach((order) => {
            // Format the date as MM/DD (adjust locale/options as needed)
            const date = new Date(order.requestedAt).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
            });
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });

          // Convert the object to an array of { date, orders } objects
          const dailyDataArray = Object.keys(dailyCounts).map((date) => ({
            date,
            orders: dailyCounts[date],
          }));

          // Sort the data by date (if necessary)
          dailyDataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

          setDailyOrdersData(dailyDataArray);
        }
      } catch (error) {
        console.error("Error fetching orders for daily orders chart:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Daily Orders</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={dailyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DailyOrders;
