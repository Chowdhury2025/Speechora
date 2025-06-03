import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import axios from 'axios';
import { API_URL } from '../../../config';

const SalesByStoreBarChart = () => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/overview/sales-by-store-detailed`);
        setStoreData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching store sales data:', err);
        setError('Failed to load store sales data');
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
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Performance by Store</h2>
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
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Performance by Store</h2>
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
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Performance by Store</h2>
      <div className='h-80'>
        {storeData.length > 0 ? (
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <BarChart
              data={storeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value, name) => {
                  if (name === 'sales') return [`$${value.toLocaleString()}`, 'Sales Amount'];
                  if (name === 'profit') return [`$${value.toLocaleString()}`, 'Profit'];
                  return [value, 'Quantity Sold'];
                }}
              />
              <Legend wrapperStyle={{ color: '#E5E7EB' }} />
              <Bar dataKey="sales" name="Sales" fill="#6366F1" />
              <Bar dataKey="profit" name="Profit" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <p className='text-gray-400'>No store sales data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesByStoreBarChart;