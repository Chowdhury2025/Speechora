import React from 'react';
import { X, Printer, Trash2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Selected Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 gap-6">
            {selectedProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="bg-gray-700 p-6 rounded-lg shadow border border-gray-600"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xl font-bold text-white">{product.name}</div>
                  <button
                    onClick={() => onRemoveProduct(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center">
                    <label htmlFor={`popup-quantity-${index}`} className="text-lg text-gray-200 mr-4">
                      Quantity:
                    </label>
                    <input
                      id={`popup-quantity-${index}`}
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => onQuantityChange(index, parseInt(e.target.value))}
                      className="w-32 px-4 py-2 bg-gray-600 border-2 border-gray-500 rounded-lg text-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>                  <div className="text-lg text-gray-200">
                    <span className="text-gray-400">Unit Price:</span> K{product.afterSalePrice.toFixed(2)}
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    <span className="text-gray-400">Total:</span> K{(product.afterSalePrice * product.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">            <div className="text-2xl font-bold text-green-400">
              Total: K {total.toFixed(2)}
            </div>
            <button
              onClick={onPrint}
              disabled={selectedProducts.length === 0 || !customerInfo.name}
              className="flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title={selectedProducts.length === 0 ? "Add products to generate quote" : !customerInfo.name ? "Enter customer name to generate quote" : "Generate quotation"}
            >
              <Printer className="h-5 w-5 mr-2" />
              Generate Quote
            </button>
          </div>
          {(selectedProducts.length === 0 || !customerInfo.name) && (
            <p className="text-center text-yellow-400 mt-4">
              {selectedProducts.length === 0 
                ? "Add products to generate quote" 
                : "Enter customer name to generate quote"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedProductsPopup;
