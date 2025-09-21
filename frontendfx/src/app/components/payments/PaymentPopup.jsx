import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';
import api from '../../../utils/api';
import { API_URL } from '../../../config';

const PaymentPopup = ({ isOpen, onClose, amount, planName }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      const response = await api.post('/api/promo-codes/validate', {
        code: promoCode.trim()
      });

      if (response.data.valid) {
        setPromoApplied(true);
        setPromoDiscount(response.data.discount);
        const discountAmount = (amount * response.data.discount) / 100;
        setFinalAmount(amount - discountAmount);
        setPromoError('');
      } else {
        setPromoError(response.data.error || 'Invalid promo code');
        setPromoApplied(false);
        setPromoDiscount(0);
        setFinalAmount(amount);
      }
    } catch (error) {
      setPromoError(error.response?.data?.error || 'Failed to validate promo code');
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
    if (!user?.userId) {
      alert('Please log in to make a purchase');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      let paymentAmount = finalAmount;
      
      // If promo code is applied, use the apply endpoint to increment usage
      if (promoApplied) {
        try {
          const promoResponse = await api.post('/api/promo-codes/apply', {
            code: promoCode.trim()
          });

          if (promoResponse.data.success) {
            paymentAmount = promoResponse.data.finalPrice;
          } else {
            alert(`Promo code error: ${promoResponse.data.error}`);
            return;
          }
        } catch (error) {
          alert('Failed to apply promo code');
          return;
        }
      }

      // Use the same API endpoint as the add funds functionality
      const response = await api.post('/api/user/premium/add', {
        userId: user.userId,
        amount: paymentAmount,
        paymentMethod: paymentMethod === 'card' ? 'visa' : 'mobile_money'
      });

      if (response.data) {
        alert(`Payment successful! ₦${paymentAmount} has been added to your account.`);
        onClose();
        // Optionally refresh the parent component or navigate
        window.location.reload(); // Simple refresh to update premium status
      }
    } catch (error) {
      let errorMessage = 'Payment processing failed. Please try again.';
      if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      JSON.stringify(error.response.data) || 
                      errorMessage;
      }
      alert(errorMessage);
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                <p className="text-sm text-gray-500 line-through">Original: ₦{amount?.toFixed(2)}</p>
                <p className="text-green-600">
                  Final Amount: ₦{finalAmount?.toFixed(2)}
                </p>
                <p className="text-sm text-green-600">
                  Saved: ₦{(amount - finalAmount)?.toFixed(2)} ({promoDiscount}% off)
                </p>
              </div>
            ) : (
              <p>Amount: ₦{amount?.toFixed(2)}</p>
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
                disabled={isProcessing}
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
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={promoLoading || isProcessing}
              />
              <button
                onClick={validatePromoCode}
                disabled={promoLoading || !promoCode.trim() || isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
            className={`py-2 px-4 ${paymentMethod === 'mobile_money' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setPaymentMethod('mobile_money')}
            disabled={isProcessing}
          >
            Mobile Money
          </button>
          <button
            className={`py-2 px-4 ${paymentMethod === 'visa' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setPaymentMethod('visa')}
            disabled={isProcessing}
          >
            Card
          </button>
        </div>

        {paymentMethod === 'mobile_money' ? (
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
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
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
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
          disabled={isProcessing}
          className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            `Pay ₦${finalAmount?.toFixed(2)} Now`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPopup;