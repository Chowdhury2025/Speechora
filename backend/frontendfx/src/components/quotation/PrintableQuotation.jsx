import React, { useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

const PrintableQuotation = ({ products, customerInfo, systemSettings, onBack }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = content.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React functionality
  };

  const today = new Date().toLocaleDateString();
  const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
  const total = products.reduce(
    (sum, product) => sum + product.afterSalePrice * product.quantity,
    0
  );

  return (    <div className="p-6">      
      <div className="mb-6 flex justify-between gap-4">
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <button 
            onClick={onBack}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote
          </button>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Quote
        </button>
      </div>

      <div ref={printRef} className="bg-white p-8 max-w-4xl mx-auto">        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{systemSettings?.companyName}</h1>
          <p className="text-gray-700">{systemSettings?.address}</p>
          <p className="text-gray-700">Tel: {systemSettings?.contact}</p>
          <p className="text-gray-700">Email: {systemSettings?.email}</p>
          <p className="text-gray-700"> "" ERP</p>
          {systemSettings?.vatNumber && (
            <p className="text-gray-700">VAT Number: {systemSettings.vatNumber}</p>
          )}
          {systemSettings?.registrationNumber && (
            <p className="text-gray-700">Registration No: {systemSettings.registrationNumber}</p>
          )}
        </div>

        {/* Quote Info */}
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold mb-2">Quote To:</h2>
            <p className="text-gray-700">{customerInfo.name}</p>
            {customerInfo.contact && <p className="text-gray-700">{customerInfo.contact}</p>}
            {customerInfo.email && <p className="text-gray-700">{customerInfo.email}</p>}
          </div>
          <div className="text-right">
            <h3 className="font-bold">Quotation #: {quoteNumber}</h3>
            <p className="text-gray-700">Date: {today}</p>
            <p className="text-gray-700">Valid for: 30 days</p>
            <p className="text-gray-700">Currency: {systemSettings?.currency}</p>
          </div>
        </div>

        {/* Products Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">
                  <div>{product.name}</div>
                  <div className="text-sm text-gray-600">
                    {product.brand && `Brand: ${product.brand}`}
                    {product.category && ` | Category: ${product.category}`}
                  </div>
                </td>                <td className="text-right py-2">{product.quantity}</td>
                <td className="text-right py-2">K{product.afterSalePrice.toFixed(2)}</td>
                <td className="text-right py-2">
                  K{(product.afterSalePrice * product.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300">
              <td colSpan="3" className="text-right py-4 font-bold">
                Total:
              </td>              <td className="text-right py-4 font-bold">
                K {total.toFixed(2)}
              </td>
            </tr>
            </tfoot>
        </table>

        {/* Footer */}
        {systemSettings?.footer && (
          <div className="mt-8 pt-4 border-t border-gray-300">
            <p className="text-gray-700 whitespace-pre-wrap">{systemSettings.footer}</p>
          </div>
        )}        {/* Terms and Notes */}
        <div className="mt-8 mb-8">
          <h3 className="font-bold mb-3">Terms & Conditions:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>This quotation is valid for 30 days from the date of issue.</li>
            <li>Prices are subject to change without prior notice.</li>
            <li>Payment terms to be discussed upon confirmation of order.</li>
            <li>Delivery timeline will be confirmed upon order placement.</li>
          </ul>
        </div>

        {/* Signature Section */}
        <div className="mt-16 flex justify-between">
          <div>
            <div className="border-t border-gray-400 w-48 mt-16 pt-2">
              <p className="text-sm text-gray-600">Customer Signature</p>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 w-48 mt-16 pt-2">
              <p className="text-sm text-gray-600">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-16 pt-4 border-t border-gray-200">
          <p className="font-medium mb-2">Thank you for your business!</p>
          <p>{systemSettings?.companyName}</p>
          <p>{systemSettings?.address}</p>
          <p>Tel: {systemSettings?.contact} | Email: {systemSettings?.email}</p>
          {systemSettings?.website && <p> "" ""</p>}
        </div>
      </div>
    </div>
  );
};

export default PrintableQuotation;
