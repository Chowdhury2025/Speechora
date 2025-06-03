import React from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';

const CartSummary = ({ selectedItems, total, onPrint }) => {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.button
        onClick={onPrint}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center gap-3 hover:bg-blue-700 transition-colors relative"
      >
        <Printer size={24} />
        {selectedItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {selectedItems}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
};

export default CartSummary;
