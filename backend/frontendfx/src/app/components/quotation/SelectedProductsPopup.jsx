import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Trash2, X } from 'lucide-react';

const SelectedProductsPopup = ({ 
  isOpen, 
  onClose, 
  selectedProducts, 
  onRemoveProduct, 
  onQuantityChange,
  onPrint,
  total,
  customerInfo
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Popup Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Selected Products</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-6 sm:hidden">
              {selectedProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-2xl font-bold text-white">{product.name}</div>
                    <button
                      onClick={() => onRemoveProduct(index)}
                      className="text-red-400 hover:text-red-300 p-3 -mt-2 -mr-2"
                    >
                      <Trash2 className="h-7 w-7" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center">
                      <label htmlFor={`quantity-${index}`} className="text-xl text-gray-200 mr-4">Quantity:</label>
                      <input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => onQuantityChange(index, parseInt(e.target.value))}
                        className="w-32 px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-lg text-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="text-xl text-gray-200">
                      <span className="text-gray-400">Unit Price:</span> K{product.afterSalePrice.toFixed(2)}
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      <span className="text-gray-400">Total:</span> K{(product.afterSalePrice * product.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <table className="hidden sm:table min-w-full">
              <thead>
                <tr className="text-gray-100 text-left border-b-2 border-gray-600">
                  <th className="px-6 py-4 text-lg font-bold">Name</th>
                  <th className="px-6 py-4 text-lg font-bold">Quantity</th>
                  <th className="px-6 py-4 text-lg font-bold">Unit Price</th>
                  <th className="px-6 py-4 text-lg font-bold">Total</th>
                  <th className="px-6 py-4 text-lg font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-100">
                {selectedProducts.map((product, index) => (
                  <tr key={`${product.id}-${index}`} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="px-6 py-4 text-lg font-medium">{product.name}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => onQuantityChange(index, parseInt(e.target.value))}
                        className="w-32 px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-lg text-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-6 py-4 text-lg">K{product.afterSalePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xl font-bold text-green-400">K{(product.afterSalePrice * product.quantity).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onRemoveProduct(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="h-6 w-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer with Generate Button */}
          <div className="border-t border-gray-700 p-6 bg-gray-800 sticky bottom-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-3xl font-bold text-green-400">Total: K{total.toFixed(2)}</div>
              <button
                onClick={onPrint}
                disabled={selectedProducts.length === 0 || !customerInfo.name}
                className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                title={selectedProducts.length === 0 ? "Add products to generate quote" : !customerInfo.name ? "Enter customer name to generate quote" : "Generate quotation"}
              >
                <Printer className="h-6 w-6 mr-3" />
                Generate Quote
              </button>
            </div>
            {(selectedProducts.length === 0 || !customerInfo.name) && (
              <div className="text-center text-sm text-yellow-400 mt-2">
                {selectedProducts.length === 0 ? "Add products to generate quote" : "Enter customer name to generate quote"}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SelectedProductsPopup;
