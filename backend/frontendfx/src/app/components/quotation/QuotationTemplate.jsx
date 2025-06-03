import React from 'react';
import { motion } from 'framer-motion';

const QuotationTemplate = ({ 
  quotationData, 
  companyInfo, 
  onPrint,
  onToggleItem,
  onRemoveItem,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="bg-white text-black p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600">Loading company information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white text-black p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black p-8 rounded-lg shadow-lg">
      {/* Company Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{companyInfo.businessName || 'Company Name'}</h1>
        <p>{companyInfo.address || 'Company Address'}</p>
        <p>TPN: {companyInfo.tpn || 'Tax Payer Number'}</p>
        <p>Contact: {companyInfo.contact || 'Contact Info'}</p>
      </div>

      {/* Quotation Info */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold mb-2">QUOTATION</h2>
          <p>Date: {quotationData.date}</p>
          <p>Quotation #: {quotationData.quotationNumber}</p>
          <p>Valid Until: {quotationData.validUntil}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">To:</h3>
          <p>{quotationData.customerName}</p>
          <p>{quotationData.customerAddress}</p>
          <p>{quotationData.customerContact}</p>
        </div>
      </div>      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Select</th>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Quantity</th>
            <th className="text-right py-2">Unit Price</th>
            <th className="text-right py-2">Total</th>
            <th className="text-right py-2">Actions</th>
          </tr>
        </thead>        <tbody>
          {quotationData.items.map((item, index) => (
            <tr 
              key={index} 
              className={`border-b border-gray-200 transition-all duration-200 cursor-pointer ${
                quotationData.selectedItems.has(index) 
                  ? 'bg-blue-100 shadow-md scale-[1.01]' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onToggleItem(index)}
            >
              <td className="py-2">
                <input
                  type="checkbox"
                  checked={quotationData.selectedItems.has(index)}
                  onChange={() => onToggleItem(index)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110"
                />
              </td>
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">K{item.unitPrice.toFixed(2)}</td>
              <td className="text-right py-2">K{(item.quantity * item.unitPrice).toFixed(2)}</td>
              <td className="text-right py-2">
                <button
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="text-right py-2 font-bold">Subtotal:</td>
            <td className="text-right py-2">K{quotationData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3" className="text-right py-2 font-bold">Tax ({quotationData.taxRate}%):</td>
            <td className="text-right py-2">K{((quotationData.taxRate / 100) * quotationData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)).toFixed(2)}</td>
          </tr>
          <tr className="font-bold">
            <td colSpan="3" className="text-right py-2">Total:</td>
            <td className="text-right py-2">K{(quotationData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * (1 + quotationData.taxRate / 100)).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Terms and Notes */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">Terms and Conditions:</h3>
        <p className="whitespace-pre-line">{companyInfo.Terms_and_conditions || 'No terms specified'}</p>
      </div>    </div>
  );
};

export default QuotationTemplate;
