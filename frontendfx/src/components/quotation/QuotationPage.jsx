import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { Printer, Plus, Trash2, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import PrintableQuotation from './PrintableQuotation';
import CartSummary from './CartSummary';
import SelectedProductsPopup from './SelectedProductsPopup';

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/A/listproducts`);
    if (!response.data || !response.data.products) {
      throw new Error('No products found');
    }
    // Ensure all required fields exist
    const products = response.data.products.map(product => ({
      id: product.id || 0,
      name: product.name || 'Unnamed Product',
      category: product.category || 'Uncategorized',
      brand: product.brand || 'No Brand',
      afterSalePrice: product.afterSalePrice || 0
    }));
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error.response?.data?.error || error.response?.data?.message || 'Failed to fetch products';
  }
};

const fetchSystemSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/system/settings`);
    if (!response.data) {
      throw new Error('No system settings found');
    }
    // Extract and validate all available fields from response
    return {
      companyName: response.data.businessName || 'Company Name',
      address: response.data.businessAddress || response.data.address || 'Company Address',
      contact: response.data.businessPhone || response.data.phone || 'Contact Info',
      email: response.data.businessEmail || response.data.emailEmail || response.data.adminEmail || 'company@example.com',
     
      vatNumber: response.data.vatNumber || response.data.vat || '',
      registrationNumber: response.data.registrationNumber || response.data.regNo || '',
      currency: response.data.currency || 'ZMK',
      footer: response.data.quotationFooter || response.data.invoiceFooter || ''
    };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Failed to fetch system settings';
    // Don't throw error, use default values instead
    return {
      companyName: 'Company Name',
      address: 'Company Address',
      contact: 'Contact Info',
      email: 'company@example.com',
       
      vatNumber: '',
      registrationNumber: '',
      currency: 'ZMK',
      footer: ''
    };
  }
};

const QuotationPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showSelectedProducts, setShowSelectedProducts] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    contact: '',
    email: ''
  });
  const [showPrintView, setShowPrintView] = useState(false);
  const [products, setProducts] = useState([]);
  const [systemSettings, setSystemSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, settingsData] = await Promise.all([
          fetchProducts(),
          fetchSystemSettings()
        ]);
        setProducts(productsData || []);
        setSystemSettings(settingsData);
      } catch (err) {
        setError(err.message || 'Failed to load data');
        // Keep any existing data to allow partial functionality
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error state
  if (error && (!products.length || !systemSettings)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchText.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddProduct = (product) => {
    // Smooth scroll to selected products on mobile
    if (window.innerWidth < 640) {
      const selectedProductsSection = document.getElementById('selected-products');
      if (selectedProductsSection) {
        selectedProductsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
  };

  const handleRemoveProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updated = [...selectedProducts];
    updated[index].quantity = newQuantity;
    setSelectedProducts(updated);
  };

  const handlePrint = () => {
    setShowPrintView(true);
  };

  if (showPrintView) {
    return (
      <PrintableQuotation
        products={selectedProducts}
        customerInfo={customerInfo}
        systemSettings={systemSettings}
        onBack={() => setShowPrintView(false)}
      />
    );
  }

  const total = selectedProducts.reduce(
    (sum, product) => sum + product.afterSalePrice * product.quantity,
    0
  );
  return (
    <div className="p-3 sm:p-6 bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-white text-center sm:text-left mb-4 sm:mb-0">Create Quotation</h1>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center sm:justify-start bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      
      <CartSummary 
        selectedItems={selectedProducts.length}
        onPrint={() => setShowSelectedProducts(true)}
      />
      
      <SelectedProductsPopup 
        isOpen={showSelectedProducts}
        onClose={() => setShowSelectedProducts(false)}
        selectedProducts={selectedProducts}
        onRemoveProduct={handleRemoveProduct}
        onQuantityChange={handleQuantityChange}
        onPrint={handlePrint}
        total={total}
        customerInfo={customerInfo}
      />

      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-xl text-white">Loading data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Error</h2>
              <button
                onClick={() => setError(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            </div>
            <p className="text-lg text-gray-300 text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Customer Information */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="customerName" className="block text-gray-100 text-xl mb-2">Customer Name</label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-gray-100 text-xl mb-2">Contact Number</label>
                <input
                  id="contactNumber"
                  type="text"
                  placeholder="Enter contact number"
                  value={customerInfo.contact}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-100 text-xl mb-2">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mb-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">Products</h2>
            <div className="mb-6 relative">
              <label htmlFor="searchProducts" className="block text-gray-100 text-xl mb-2">Search Products</label>
              <div className="relative">
                <input
                  id="searchProducts"
                  type="text"
                  placeholder="Search by product name, category, or brand"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-700 border-2 border-gray-600 rounded-lg text-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              </div>
            </div>        <div className="overflow-x-auto">
              {/* Mobile Product Cards */}
              <div className="grid grid-cols-1 gap-6 sm:hidden">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                    <div className="text-2xl font-bold text-white mb-3">{product.name}</div>
                    <div className="text-xl text-gray-200 mb-2">
                      <span className="text-gray-400">Category:</span> {product.category || 'N/A'}
                    </div>
                    <div className="text-xl text-gray-200 mb-4">
                      <span className="text-gray-400">Brand:</span> {product.brand || 'N/A'}
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-4">K{product.afterSalePrice.toFixed(2)}</div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-full flex items-center justify-center bg-blue-600 text-white px-6 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    >
                      <Plus className="h-6 w-6 mr-3" />
                      Add to Quote
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table */}
              <table className="hidden sm:table min-w-full">
                <thead>
                  <tr className="text-gray-100 text-left border-b-2 border-gray-600">
                    <th className="px-6 py-4 text-lg font-bold">Name</th>
                    <th className="px-6 py-4 text-lg font-bold">Category</th>
                    <th className="px-6 py-4 text-lg font-bold">Brand</th>
                    <th className="px-6 py-4 text-lg font-bold">Price</th>
                    <th className="px-6 py-4 text-lg font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-6 py-4 text-lg font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-lg">{product.category}</td>
                      <td className="px-6 py-4 text-lg">{product.brand}</td>
                      <td className="px-6 py-4 text-xl font-bold text-green-400">K {product.afterSalePrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleAddProduct(product)}
                          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add to Quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>      {/* Selected Products */}
          <div className="bg-gray-800 rounded-lg shadow-lg">
            {/* Sticky header for mobile */}
            <div className="sticky top-0 z-10 bg-gray-800 p-4 sm:p-6 border-b border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-2xl font-bold text-white mb-4 sm:mb-0">Selected Products</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto gap-4">
                  <span className="text-3xl font-bold text-green-400">Total: K {total.toFixed(2)}</span>
                  <div className="relative w-full sm:w-auto">
                    <button
                      onClick={handlePrint}
                      disabled={selectedProducts.length === 0 || !customerInfo.name}
                      className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      title={selectedProducts.length === 0 ? "Add products to generate quote" : !customerInfo.name ? "Enter customer name to generate quote" : "Generate quotation"}
                    >
                      <Printer className="h-6 w-6 mr-3" />
                      Generate Quote
                    </button>
                    {(selectedProducts.length === 0 || !customerInfo.name) && (
                      <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-yellow-400">
                        {selectedProducts.length === 0 ? "Add products to generate quote" : "Enter customer name to generate quote"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                {/* Mobile Selected Products */}
                <div className="grid grid-cols-1 gap-6 sm:hidden">
                  {selectedProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-2xl font-bold text-white">{product.name}</div>
                        <button
                          onClick={() => handleRemoveProduct(index)}
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
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                            className="w-32 px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-lg text-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="text-xl text-gray-200">                          <span className="text-gray-400">Unit Price:</span> K {product.afterSalePrice.toFixed(2)}
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          <span className="text-gray-400">Total:</span> K {(product.afterSalePrice * product.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                {/* <table className="hidden sm:table min-w-full">
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
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                            className="w-32 px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-lg text-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>                        <td className="px-6 py-4 text-lg">K {product.afterSalePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-xl font-bold text-green-400">K {(product.afterSalePrice * product.quantity).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveProduct(index)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table> */}
              </div>
            </div>
          </div>

          <CartSummary 
            products={selectedProducts}
            onRemoveProduct={handleRemoveProduct}
            onQuantityChange={handleQuantityChange}
            onPrint={handlePrint}
            customerInfo={customerInfo}
            total={total}
            isLoading={isLoading}
            error={error}
          />

          {/* Loading and Error States */}
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
              <div className="text-center">
                <div className="loader"></div>
                <p className="mt-4 text-xl text-white">Loading data, please wait...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
              <div className="bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Error</h2>
                  <button
                    onClick={() => setError(null)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                </div>
                <p className="text-lg text-gray-300 text-center mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuotationPage;
