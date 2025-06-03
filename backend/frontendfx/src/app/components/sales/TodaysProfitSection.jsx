import React from 'react';
import { motion } from "framer-motion";

const TodaysProfitSection = ({ todaySalesProfit }) => {
  return (
    <motion.div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        Today's Sales Profit
      </h3>
      <p className="text-green-400 text-lg font-bold">
        K {todaySalesProfit.toFixed(2)}
      </p>
    </motion.div>
  );
};

export default TodaysProfitSection;