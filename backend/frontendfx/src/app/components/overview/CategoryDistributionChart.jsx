import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from 'axios';
import { API_URL } from '../../../config';

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const SalesByStoreChart = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/overview/sales-by-store`);
        setStoreData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching store sales data:', err);
        setError('Failed to load sales data');
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  if (loading) {
    return (
      <motion.div 
        className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales by Store</h2>
        <div className='h-80 flex items-center justify-center'>
          <p className='text-gray-400'>Loading data...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales by Store</h2>
        <div className='h-80 flex items-center justify-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales by Store</h2>
      <div className='h-80'>
        {storeData.length > 0 ? (
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <PieChart>
              <Pie
                data={storeData}
                cx={"50%"}
                cy={"50%"}
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {storeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <p className='text-gray-400'>No sales data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};



export default SalesByStoreChart;