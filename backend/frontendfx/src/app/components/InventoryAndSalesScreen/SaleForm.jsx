// SaleForm.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../../config';
import { getAccessToken } from '../../utils/googleSheetsAuth';
import { X } from 'lucide-react';

const SPREADSHEET_ID = '1D3ALn06h-ZUNqYqv1R4ee_htgh7SZBZ5PvK1yVu2X-8';
const SHEET_NAME = 'Sheet1';

const SaleForm = ({ inventoryData, userState, onSuccess, onError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [saleItems, setSaleItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showProductList, setShowProductList] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({ productId: '', quantitySold: 1 });
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const printReceiptRef = useRef(null);

  // Clear notification after 3 seconds
  useEffect(() => {
    let timer;
    if (notification.message) {
      timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
    return () => clearTimeout(timer);
  }, [notification]);

  // Filter products based on search term
  const filteredProducts = inventoryData.filter(item =>
    item.product && (
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productId.toString().includes(searchTerm)
    ) && item.closedStock > 0
  );

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleSelectProduct = (item) => {
    setCurrentSelection({
      productId: item.productId.toString(),
      quantitySold: 1
    });
    setShowProductList(false);
  };

  const handleAddItem = () => {
    const product = inventoryData.find(i => i.productId === parseInt(currentSelection.productId, 10));
    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }

    if (product.closedStock < currentSelection.quantitySold) {
      showNotification('Insufficient stock', 'error');
      return;
    }

    const existingItemIndex = saleItems.findIndex(i => i.productId === currentSelection.productId);
    if (existingItemIndex >= 0) {
      const totalQuantity = saleItems[existingItemIndex].quantitySold + currentSelection.quantitySold;
      if (totalQuantity > product.closedStock) {
        showNotification('Insufficient stock for combined quantity', 'error');
        return;
      }
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantitySold = totalQuantity;
      setSaleItems(updatedItems);
    } else {
      setSaleItems([...saleItems, { ...currentSelection }]);
    }

    setCurrentSelection({ productId: '', quantitySold: 1 });
  };

  const handleRemoveItem = (productId) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  // Function to append sale data to Google Sheets using the service account access token
  const writeSaleToGoogleSheet = async (saleData) => {
    try {
      const accessToken = await getAccessToken();

      // Check and update header row if needed
      const headerRange = `${SHEET_NAME}!1:1`;
      const headers = [
        'Timestamp',
        'User Name',
        'Store Name',
        'Product Name',
        'Price Sold At',
        'Quantity Sold',
        'Total Amount',
        'Profit',
      ];

      // Get the header row
      let response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${headerRange}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const headerResult = await response.json();
      const headerValues = headerResult.values;
      const isEmptyHeader =
        !headerValues ||
        headerValues.length === 0 ||
        headerValues[0].join('').trim() === '';

      if (isEmptyHeader) {
        // Write headers if empty
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${headerRange}?valueInputOption=RAW`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values: [headers] }),
          }
        );
        console.log('Header row updated.');
      }

      // Append sale data
      const appendRange = `${SHEET_NAME}!A:H`;
      const requestBody = {
        values: [
          [
            new Date().toISOString(),
            saleData.userName,
            saleData.storeName,
            saleData.productName,
            saleData.priceSoldAt,
            saleData.quantitySold,
            saleData.totalAmount,
            saleData.profit,
          ],
        ],
      };

      response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${appendRange}:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
      const appendResult = await response.json();
      console.log(`Appended data:`, appendResult);
    } catch (error) {
      console.error('Error appending sale data to Google Sheet:', error);
      // Optionally notify the user of the error
    }
  };

  const handleRecordSale = async () => {
    if (saleItems.length === 0) {
      showNotification('No sale items added', 'error');
      return;
    }
    if (!userState.storeIds || userState.storeIds.length === 0) {
      showNotification('No store ID available', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const storeId = userState.storeIds[0];
      const payload = {
        sales: saleItems.map(item => ({
          productId: parseInt(item.productId, 10),
          quantitySold: parseInt(item.quantitySold, 10)
        })),
        userName: userState.username,
      };

      const response = await fetch(`${API_URL}/api/stores/${storeId}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || `Error recording sale (${response.status})`;
        } catch (e) {
          errorMessage = `Error recording sale: ${responseText || response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Generate receipt data
      const receiptItems = saleItems.map((item) => {
        const productItem = inventoryData.find(
          (i) => i.productId === parseInt(item.productId, 10)
        );
        const price = productItem?.product.afterSalePrice || 0;
        return {
          productId: item.productId,
          productName: productItem?.product.name || 'Unknown Product',
          quantity: item.quantitySold,
          price,
          total: price * item.quantitySold,
        };
      });
      const totalAmount = receiptItems.reduce((sum, i) => sum + i.total, 0);
      const receiptDataObj = {
        userName: userState.username,
        storeName: inventoryData[0]?.store?.name || 'Store',
        date: new Date().toLocaleString(),
        items: receiptItems,
        totalAmount,
      };

      setReceiptData(receiptDataObj);
      showNotification('Sale recorded successfully', 'success');
      setSaleItems([]);
      
      // Show receipt popup
      setShowReceiptModal(true);

      // For each sale item, log the data to Google Sheets
      receiptItems.forEach((item) => {
        writeSaleToGoogleSheet({
          userName: userState.username,
          storeName: receiptDataObj.storeName,
          productName: item.productName,
          priceSoldAt: item.price,
          quantitySold: item.quantity,
          totalAmount: item.total,
          profit: item.total - item.price * item.quantity,
        });
      });
    } catch (error) {
      console.error('Error recording sale', error);
      showNotification(error.message || 'Failed to record sale. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = printReceiptRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Add styling to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
              background: #fff;
            }
            .receipt {
              max-width: 300px;
              margin: 0 auto;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              border-top: 1px solid #000;
              font-weight: bold;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const PrintableReceipt = ({ receiptData }) => {
    if (!receiptData) return null;
    return (
      <div ref={printReceiptRef} className="receipt-content text-black">
        <div className="receipt-header">
          <h3 className="text-lg font-bold text-black">Sales Receipt</h3>
          <p className="text-sm text-black">{receiptData.date}</p>
          <p className="text-sm text-black">{receiptData.storeName}</p>
          <p className="text-sm text-black">Served by: {receiptData.userName}</p>
        </div>
        <table className="min-w-full mt-4">
          <thead>
            <tr className="text-left text-sm text-black">
              <th className="py-1 text-black">Item</th>
              <th className="py-1 text-black">Qty</th>
              <th className="py-1 text-right text-black">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm text-black">
            {receiptData.items.map((item, index) => (
              <tr key={index}>
                <td className="py-1 text-black">{item.productName}</td>
                <td className="py-1 text-black">{item.quantity}</td>
                <td className="py-1 text-right text-black">K{item.total.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2" className="py-2 font-bold text-black">Total</td>
              <td className="py-2 text-right font-bold text-black">K{receiptData.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center mt-4">
          <p className="text-sm text-black">Thank you for your purchase!</p>
        </div>
      </div>
    );
  };

  // Receipt Modal
  const ReceiptModal = () => {
    if (!showReceiptModal || !receiptData) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          className="absolute inset-0 bg-gray-900 bg-opacity-75"
          onClick={() => setShowReceiptModal(false)}
        ></div>
        <div className="bg-white rounded-lg shadow-lg p-6 relative z-10 w-full max-w-md">
          <button 
            onClick={() => setShowReceiptModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          <PrintableReceipt receiptData={receiptData} />
          
          <div className="flex justify-center mt-6">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-lg shadow-md overflow-hidden p-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <AnimatePresence>
        {notification.message && (
          <motion.div
            className={`absolute top-2 right-2 p-3 rounded-md shadow-lg ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white font-medium z-10 max-w-xs`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-lg font-semibold text-green-300 mb-4">Record Multiple Sales</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-100 mb-1">Search Products</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowProductList(true);
          }}
          onFocus={() => setShowProductList(true)}
          placeholder="Search by product name or ID..."
          className="w-full px-3 py-2 border border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 bg-gray-700 text-gray-100"
        />
      </div>
      {showProductList && searchTerm && filteredProducts.length > 0 && (
        <div className="max-h-60 overflow-y-auto border border-gray-500 rounded-md mb-4">
          {filteredProducts.map((item) => (
            <div
              key={item.productId}
              className="cursor-pointer hover:bg-gray-600 px-3 py-2 flex justify-between items-center"
              onClick={() => handleSelectProduct(item)}
            >              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm">[{item.productId}]</span>
                <span className="text-gray-100">{item.product.name}</span>
                <span className="text-gray-400 text-sm">(Stock: {item.total - item.sold - item.damages})</span>
              </div>
              <span className="text-gray-100">
                K{item.product.afterSalePrice != null ? item.product.afterSalePrice.toFixed(2) : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )}
      {currentSelection.productId && (
        <div className="mb-4 p-2 border border-gray-500 rounded">
          <p className="text-gray-100">
            Selected: [{currentSelection.productId}] {" "}
            {inventoryData.find(
              (i) => i.productId === parseInt(currentSelection.productId, 10)
            )?.product.name}
          </p>
          <label className="block text-sm font-medium text-gray-100">Quantity</label>
          <input
            type="number"
            min="1"
            max={
              inventoryData.find(
                (i) => i.productId === parseInt(currentSelection.productId, 10)
              )?.closedStock || 1
            }
            value={currentSelection.quantitySold}
            onChange={(e) =>
              setCurrentSelection({
                ...currentSelection,
                quantitySold: parseInt(e.target.value, 10) || 1,
              })
            }
            className="w-full px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500 bg-gray-700 text-gray-100"
          />
          <button onClick={handleAddItem} className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
            Add Item
          </button>
        </div>
      )}
      {saleItems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-gray-100 font-medium mb-2">Sale Items:</h3>
          <ul>
            {saleItems.map((item, index) => {
              const prod = inventoryData.find(
                (i) => i.productId === parseInt(item.productId, 10)
              );
              return (
                <li key={index} className="text-gray-100 flex justify-between items-center mb-1 border-b border-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-sm">[{item.productId}]</span>
                    <span>{prod?.product.name} - Qty: {item.quantitySold}</span>
                  </div>
                  <button onClick={() => handleRemoveItem(item.productId)} className="text-red-400">
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <button
        onClick={handleRecordSale}
        disabled={isSubmitting || saleItems.length === 0}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Record Sale'}
      </button>
      
      {/* Receipt Modal */}
      <ReceiptModal />
    </motion.div>
  );
};

export default SaleForm;
