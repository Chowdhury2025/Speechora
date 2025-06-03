import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import axios from 'axios';
import { API_URL } from '../../../config';

const SalesOverviewChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/overview/monthly-sales`);
        setSalesData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching monthly sales data:', err);
        setError('Failed to load sales data');
        setLoading(false);
      }
    };

    fetchMonthlySales();
  }, []);

  if (loading) {
    return (
      <motion.div 
        className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview (Last 12 Months)</h2>
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
        transition={{ delay: 0.2 }}
      >
        <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview (Last 12 Months)</h2>
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
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview (Last 12 Months)</h2>

      <div className='h-80'>
        {salesData.length > 0 ? (
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
              <XAxis dataKey={"name"} stroke='#9ca3af' />
              <YAxis 
                stroke='#9ca3af'
                tickFormatter={(value) => `K${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ color: "#E5E7EB" }}
                formatter={(value) => [`K${value.toLocaleString()}`, 'Sales']}
              />
              <Line
                type='monotone'
                dataKey='sales'
                name='Monthly Sales'
                stroke='#6366F1'
                strokeWidth={3}
                dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, strokeWidth: 2 }}
              />
            </LineChart>
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

export default SalesOverviewChart;