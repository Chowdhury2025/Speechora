import React from 'react';
import { ShoppingCart, Printer } from 'lucide-react';

const CartSummary = ({ selectedItems, onPrint }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">      <button
        onClick={onPrint}
        className="flex items-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-full text-xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {selectedItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {selectedItems}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Items</span>
          <Printer className="h-5 w-5" />
        </div>
      </button>
    </div>
  );
};

export default CartSummary;
