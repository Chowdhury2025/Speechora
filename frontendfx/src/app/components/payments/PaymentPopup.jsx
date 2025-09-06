import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../../config'

const PaymentPopup = ({ isOpen, onClose, amount, planName }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('mobile');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [finalAmount, setFinalAmount] = useState(amount || 0);

  // Update finalAmount when amount prop changes
  React.useEffect(() => {
    if (amount !== undefined && amount !== null) {
      setFinalAmount(amount);
      // Reset promo code states when amount changes
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoCode('');
      setPromoError('');
    }
  }, [amount]);

  // Early returns should come after all hooks
  if (!isOpen) return null;

  // Safety check for amount
  if (amount === undefined || amount === null) {
    return null;
  }

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

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const response = await fetch(`${API_URL}/api/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setPromoApplied(true);
        setPromoDiscount(data.discount);
        const discountAmount = (amount * data.discount) / 100;
        setFinalAmount(amount - discountAmount);
        setPromoError('');
      } else {
        setPromoError(data.error || 'Invalid promo code');
        setPromoApplied(false);
        setPromoDiscount(0);
        setFinalAmount(amount);
      }
    } catch (error) {
      setPromoError('Failed to validate promo code');
      setPromoApplied(false);
      setPromoDiscount(0);
      setFinalAmount(amount);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError('');
    setFinalAmount(amount);
  };

  const handlePayment = async () => {
    // Get user authentication token
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      alert('Please log in to make a purchase');
      navigate('/login');
      return;
    }

    let paymentAmount = finalAmount;
    
    // If promo code is applied, use the apply endpoint to increment usage
    if (promoApplied) {
      try {
        const response = await fetch(`${API_URL}/api/promocodes/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: promoCode.trim() }),
        });

        const data = await response.json();
        
        if (response.ok) {
          paymentAmount = data.finalPrice;
        } else {
          alert(`Promo code error: ${data.error}`);
          return;
        }
      } catch (error) {
        alert('Failed to apply promo code');
        return;
      }
    }

    try {
      // Call the backend premium purchase endpoint
      const response = await fetch(`${API_URL}/api/user/premium/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          months: planName.includes('Child Plan') ? 1 : 12, // Basic plan = 1 month, Premium = 12 months
          paymentMethod: paymentMethod,
          amount: paymentAmount,
          planName: planName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Payment successful! Your premium subscription has been activated.`);
        onClose();
        // Navigate to login screen after successful purchase
        navigate('/login');
      } else {
        alert(`Payment failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Payment processing failed. Please try again.');
      console.error('Payment error:', error);
    }
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
          <div className="text-lg font-semibold text-center">
            {promoApplied ? (
              <div>
                <p className="text-sm text-gray-500 line-through">Original: K{amount?.toFixed(2)}</p>
                <p className="text-green-600">
                  Final Amount: K{finalAmount?.toFixed(2)}
                </p>
                <p className="text-sm text-green-600">
                  Saved: K{(amount - finalAmount)?.toFixed(2)} ({promoDiscount}% off)
                </p>
              </div>
            ) : (
              <p>Amount: K{amount?.toFixed(2)}</p>
            )}
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code (Optional)
          </label>
          
          {promoApplied ? (
            <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-700 font-medium">{promoCode}</span>
                <span className="text-sm text-green-600 ml-2">({promoDiscount}% off)</span>
              </div>
              <button
                onClick={removePromoCode}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 p-2 border rounded"
                disabled={promoLoading}
              />
              <button
                onClick={validatePromoCode}
                disabled={promoLoading || !promoCode.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                {promoLoading ? 'Checking...' : 'Apply'}
              </button>
            </div>
          )}
          
          {promoError && (
            <p className="text-red-500 text-sm mt-1">{promoError}</p>
          )}
        </div>

        {/* Payment Method Tabs */}
        <div className="flex mb-4 border-b">
          <button
            className={`py-2 px-4 ${paymentMethod === 'mobile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setPaymentMethod('mobile')}
          >
            Mobile Money
          </button>
          <button
            className={`py-2 px-4 ${paymentMethod === 'card' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
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
                <div className="flex items-center gap-2 mt-1">
                  <img
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
          Pay K{finalAmount?.toFixed(2)} Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPopup;