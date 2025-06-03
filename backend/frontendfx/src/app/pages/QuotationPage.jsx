import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';
import Header from '../components/common/Header';
import QuotationTemplate from '../components/quotation/QuotationTemplate';
import CartSummary from '../components/quotation/CartSummary';
import SelectedProductsPopup from '../components/quotation/SelectedProductsPopup';
import { API_URL } from '../../config';



const QuotationPage = () => {
  const [companyInfo, setCompanyInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSelectedProducts, setShowSelectedProducts] = useState(false);
  const [quotationData, setQuotationData] = useState({
    date: new Date().toLocaleDateString(),
    quotationNumber: `QT-${Date.now()}`,
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(), // 30 days validity
    customerName: '',
    customerAddress: '',
    customerContact: '',
    items: [],
    selectedItems: new Set(),
    taxRate: 16 // Default tax rate
  });

  const printRef = useRef();

  // Fetch system settings for company info
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching system settings...');
    fetch(`${API_URL}/api/system/settings`)
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error('Failed to fetch company information');
        }
        return res.json();
      })
      .then(settings => {
        console.log('Received company settings:', settings);
        setCompanyInfo(settings);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching company info:', err);
        setError('Failed to load company information. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  // Form state for new item
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  });
  const handleAddItem = (e) => {
    e.preventDefault();
    setQuotationData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(), // Generate a unique ID
        description: quotationData.newItem?.description || '',
        quantity: quotationData.newItem?.quantity || 1,
        unitPrice: quotationData.newItem?.unitPrice || 0
      }]
    }));
    setQuotationData(prev => ({ ...prev, newItem: { description: '', quantity: 1, unitPrice: 0 } }));
  };

  const handleRemoveItem = (index) => {
    setQuotationData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleToggleItem = (index) => {
    setQuotationData(prev => {
      const newSelectedItems = new Set(prev.selectedItems);
      if (newSelectedItems.has(index)) {
        newSelectedItems.delete(index);
      } else {
        newSelectedItems.add(index);
      }
      return { ...prev, selectedItems: newSelectedItems };
    });
  };

  const getSelectedItems = () => {
    return quotationData.items.filter((_, index) => quotationData.selectedItems.has(index));
  };

  const handlePrint = () => {
    // Create a temporary data object with only selected items
    const printData = {
      ...quotationData,
      items: getSelectedItems()
    };
    setQuotationData(printData);
    window.print();
  };

  const getSelectedItemsCount = () => {
    return quotationData.selectedItems.size;
  };

  const getSelectedItemsTotal = () => {
    const selectedItems = quotationData.items.filter((_, index) => quotationData.selectedItems.has(index));
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal * (1 + quotationData.taxRate / 100);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Create Quotation" />
      <CartSummary 
        selectedItems={getSelectedItemsCount()}
        onPrint={() => setShowSelectedProducts(true)}
      />
      <SelectedProductsPopup 
        isOpen={showSelectedProducts}
        onClose={() => setShowSelectedProducts(false)}
        selectedProducts={quotationData.items.map(item => ({
          id: item.id,
          name: item.description,
          quantity: item.quantity,
          afterSalePrice: item.unitPrice,
        }))}
        onRemoveProduct={handleRemoveItem}
        onQuantityChange={(index, quantity) => {
          setQuotationData(prev => {
            const newItems = [...prev.items];
            if (newItems[index]) {
              newItems[index] = { ...newItems[index], quantity };
            }
            return { ...prev, items: newItems };
          });
        }}
        onPrint={handlePrint}
        total={getSelectedItemsTotal()}
        customerInfo={{ name: quotationData.customerName }}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="mb-8 space-y-6">
          {/* Customer Info Form */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={quotationData.customerName}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Address</label>
                <input
                  type="text"
                  value={quotationData.customerAddress}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Contact</label>
                <input
                  type="text"
                  value={quotationData.customerContact}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, customerContact: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                />
              </div>
            </div>
          </motion.div>

          {/* Add Item Form */}
          <motion.div
            className="bg-gray-800 p-6 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Add Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={quotationData.newItem?.description}
                  onChange={(e) => setQuotationData(prev => ({ ...prev, newItem: { ...prev.newItem, description: e.target.value } }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quotationData.newItem?.quantity}
                    onChange={(e) => setQuotationData(prev => ({ ...prev, newItem: { ...prev.newItem, quantity: parseInt(e.target.value) || 1 } }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={quotationData.newItem?.unitPrice}
                    onChange={(e) => setQuotationData(prev => ({ ...prev, newItem: { ...prev.newItem, unitPrice: parseFloat(e.target.value) || 0 } }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
              >
                Add Item
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QuotationPage;
