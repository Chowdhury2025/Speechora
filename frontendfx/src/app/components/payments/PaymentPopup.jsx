import React, { useState } from 'react';

const PaymentPopup = ({ isOpen, onClose, amount, planName }) => {
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isOpen) return null;

  const detectProvider = (number) => {
    const prefix = number.substring(0, 3);
    if (prefix === '095' || prefix === '095') return 'ZAMTEL';
    if (prefix === '096' || prefix === '076') return 'MTN';
    if (prefix === '097' || prefix === '077') return 'AIRTEL';
    return '';
  };

  const handlePhoneNumberChange = (e) => {
    const number = e.target.value;
    setPhoneNumber(number);
    setSelectedProvider(detectProvider(number));
  };

  const handlePayment = () => {
    // Simulate payment processing
    alert(`Payment of K${amount} processed successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pay for {planName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-lg font-semibold text-center">Amount: K{amount}</p>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex mb-4 border-b">          <button
            className={`py-2 px-4 ${paymentMethod === 'mobile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setPaymentMethod('mobile')}
          >
            Mobile Money
          </button>
          <button            className={`py-2 px-4 ${paymentMethod === 'card' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setPaymentMethod('card')}
          >
            Card
          </button>
        </div>

        {paymentMethod === 'mobile' ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="Enter phone number"
                className="w-full p-2 border rounded"
              />
            </div>
            {selectedProvider && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Provider detected:</p>
                <div className="flex items-center gap-2 mt-1">                  <img
                    src={`/images/${selectedProvider.toLowerCase()}.png`}
                    alt={selectedProvider}
                    className="h-8"
                  />
                  <span>{selectedProvider}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <img src="/images/visa.png" alt="Visa" className="h-8" />
              <img src="/images/mastercard.png" alt="Mastercard" className="h-8" />
            </div>
          </div>
        )}

        <button
          onClick={handlePayment}
          className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPopup;
