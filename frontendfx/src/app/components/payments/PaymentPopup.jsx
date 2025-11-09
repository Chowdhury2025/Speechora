import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../../atoms';
import api from '../../../utils/api';
import { API_URL } from '../../../config';
import googlePayService from '../../../services/googlePayService';

const PaymentPopup = ({ isOpen, onClose, amount, planName }) => {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      const available = await googlePayService.isGooglePayAvailable();
      setIsGooglePayAvailable(available);
    };
    checkGooglePayAvailability();
  }, []);
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

  const detectProvider = async (number) => {
    return await lencoService.detectMobileProvider(number);
  };

  const handlePhoneNumberChange = async (e) => {
    // Only allow numbers and format
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit length and format
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (value.length >= 3) {
        setSelectedProvider(await detectProvider(value));
      }
    }
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

    if (!isGooglePayAvailable) {
      alert('Google Pay is not available in your browser');
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

      // Prepare payment data
      const paymentData = {
        amount: paymentAmount,
        currencyCode: 'USD',
        email: user.email,
        customerName: `${user.username || ''} ${user.lastName || ''}`.trim() || 'Speechora User',
        metadata: {
          userId: user.userId,
          planName: planName
        }
      };

      const paymentResponse = await googlePayService.initializePayment(paymentData);

      if (paymentResponse.success) {
        // Handle successful payment
        await updateUserPremium(paymentAmount);
        onClose();
      } else {
        throw new Error(paymentResponse.message || 'Payment failed');
      }

    } catch (error) {
      let errorMessage = 'Payment processing failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        errorMessage = error.response.data.message || 
                      JSON.stringify(error.response.data) || 
                      errorMessage;
      }
      alert(errorMessage);
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  // Check payment status periodically
  const checkPaymentStatus = async (reference, amount, attempts = 0) => {
    const maxAttempts = 12; // Check for 2 minutes (12 * 10 seconds)
    
    try {
      const statusResponse = await lencoService.verifyPayment(reference);
      
      if (statusResponse.data?.status === 'success') {
        await updateUserPremium(amount);
      } else if (statusResponse.data?.status === 'failed') {
        alert('Payment failed. Please try again.');
        setIsProcessing(false);
      } else if (attempts < maxAttempts) {
        // Payment still pending, check again in 10 seconds
        setTimeout(() => {
          checkPaymentStatus(reference, amount, attempts + 1);
        }, 10000);
      } else {
        // Max attempts reached
        alert('Payment verification timeout. Please contact support if money was deducted.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      if (attempts < maxAttempts) {
        setTimeout(() => {
          checkPaymentStatus(reference, amount, attempts + 1);
        }, 10000);
      } else {
        alert('Unable to verify payment status. Please contact support.');
        setIsProcessing(false);
      }
    }
  };

  // Update user premium after successful payment
  const updateUserPremium = async (amount) => {
    try {
      const response = await api.post('/api/user/premium/add', {
        userId: user.userId,
        amount: amount,
        paymentMethod: paymentMethod === 'card' ? 'visa' : 'mobile_money'
      });

      if (response.data) {
        alert(`Payment successful! K${amount} has been added to your account.`);
        onClose();
        window.location.reload(); // Refresh to update premium status
      }
    } catch (error) {
      console.error('Premium update error:', error);
      alert('Payment was successful but failed to update account. Please contact support.');
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
        <div className="flex justify-center items-center mb-6">
          {isGooglePayAvailable ? (
            <div className="google-pay-button">
              <img 
                src="/images/google-pay-mark.png" 
                alt="Google Pay" 
                className="h-12" 
              />
            </div>
          ) : (
            <div className="text-center text-gray-600">
              Google Pay is not available in your browser.
              Please ensure you're using a supported browser and have Google Pay set up.
            </div>
          )}
        </div>

        {paymentMethod === 'mobile_money' ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="0XX XXX XXXX"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
                maxLength="10"
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
                onChange={(e) => {
                  // Format card number with spaces
                  const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                  if (value.replace(/\s/g, '').length <= 16) {
                    setCardNumber(value);
                  }
                }}
                placeholder="1234 5678 9012 3456"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
                maxLength="19"
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
                  onChange={(e) => {
                    // Format expiry date as MM/YY
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setExpiryDate(value);
                  }}
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    // Only allow numbers and limit to 3-4 digits
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCvv(value);
                    }
                  }}
                  placeholder="123"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                  maxLength="4"
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
            `Pay K${finalAmount?.toFixed(2)} Now`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentPopup;