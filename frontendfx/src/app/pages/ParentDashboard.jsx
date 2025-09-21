import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import {API_URL} from'../../config'
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  Star,
  Receipt,
  CreditCard,
  Tag,
  Plus
} from 'lucide-react';
import { fetchPremiumPrice } from '../utils/premium';
import PaymentPopup from '../components/payments/PaymentPopup'; // Import the PaymentPopup component

const ParentDashboard = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    recentTests: [],
    completedLessons: 0,
    upcomingTests: [],
    childProgress: [],
    achievements: [],
    schoolFees: {
      currentTerm: {},
      paymentHistory: []
    }
  });

  // Premium simulation state
  const [premium, setPremium] = useState({
    isActive: false,
    balance: 0,
    deduction: 0,
    expiry: null,
  });
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(null);

  // Payment popup state
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentPlan, setPaymentPlan] = useState('');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [promoSuccess, setPromoSuccess] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchPremiumInfo();
    fetchAndSetPremiumPrice();
  }, []);

  const fetchAndSetPremiumPrice = async () => {
    const price = await fetchPremiumPrice();
    setPremiumPrice(price);
  };

  function calculateExpiry(balance, deduction) {
    if (!deduction || deduction <= 0) return null;
    const months = Math.floor(balance / deduction);
    const now = new Date();
    now.setMonth(now.getMonth() + months);
    return now.toISOString().split('T')[0];
  }

  // Check and update premium status on every fetch
  const checkAndUpdatePremiumStatus = async (premiumData) => {
    if (!premiumData) return;
    // If premium is active and expiry is in the past or today
    if (premiumData.isActive && premiumData.expiry) {
      const now = new Date();
      const expiryDate = new Date(premiumData.expiry);
      if (expiryDate <= now) {
        if (premiumData.balance >= premiumData.deduction && premiumData.deduction > 0) {
          // Deduct and update expiry
          const newBalance = premiumData.balance - premiumData.deduction;
          const newExpiry = new Date(expiryDate);
          newExpiry.setMonth(newExpiry.getMonth() + 1);
          await api.post('/api/user/premium/update', {
            userId,
            balance: newBalance,
            expiry: newExpiry.toISOString(),
            isActive: true
          });
          setPremium({ ...premiumData, balance: newBalance, expiry: newExpiry.toISOString() });
        } else {
          // Deactivate and notify
          await api.post('/api/user/premium/update', {
            userId,
            isActive: false
          });
          setPremium({ ...premiumData, isActive: false });
          // Optionally, trigger a notification to the user here
        }
      }
    }
  };

  const fetchPremiumInfo = async () => {
    if (!userId) return;
    setPremiumLoading(true);
    setPremiumError(null);
    try {
      const res = await api.get(`/api/user/premium?userId=${userId}`);
      const premiumData = {
        isActive: res.data.isActive,
        balance: res.data.balance,
        deduction: res.data.deduction,
        expiry: res.data.expiry,
      };
      setPremium(premiumData);
      await checkAndUpdatePremiumStatus(premiumData);
    } catch (err) {
      setPremiumError('Failed to load premium info.');
    } finally {
      setPremiumLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/parent/dashboard');
      const data = response.data;
      
      setDashboardData({
        recentTests: data.recentTests || [],
        completedLessons: data.completedLessons?.recentLessons?.length || 0,
        totalCompletedLessons: data.stats.totalCompletedLessons || 0,
        childProgress: data.childProgress || [],
        achievements: data.achievements || [],
        stats: data.stats || {},
        schoolFees: data.schoolFees || { currentTerm: {}, paymentHistory: [] }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Use user.userId for premium endpoints
  const userId = user?.userId;

  const handleCancelPremium = async () => {
    setPremiumLoading(true);
    setPremiumError(null);
    if (!userId) {
      setPremiumError('User ID is missing or invalid. Please log in again.');
      return;
    }
    try {
      await api.post('/api/user/premium/cancel', { userId });
      await fetchPremiumInfo();
      toast.success('Premium subscription cancelled successfully!');
    } catch (err) {
      setPremiumError('Failed to cancel premium.');
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleUpgradePremium = async (deduction) => {
    setPremiumLoading(true);
    setPremiumError(null);
    if (!userId) {
      setPremiumError('User ID is missing or invalid. Please log in again.');
      return;
    }
    try {
      await api.post(`/api/user/premium/upgrade`, { userId, deduction });
      await fetchPremiumInfo();
      toast.success('Premium plan upgraded successfully!');
    } catch (err) {
      setPremiumError('Failed to upgrade premium.');
    } finally {
      setPremiumLoading(false);
    }
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const response = await api.post('/api/promo-codes/validate', {
        code: promoCode
      });
      
      if (response.data.valid) {
        setPromoSuccess(`Valid promo code! ${response.data.discount}% discount available`);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (error) {
      setPromoError(error.response?.data?.error || 'Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const response = await api.post('/api/promo-codes/apply', {
        code: promoCode
      });
      
      if (response.data.success) {
        setPromoSuccess(`Promo code applied! ${response.data.discount}% discount (ZMK${response.data.discountAmount} saved)`);
        // Update premium price to reflect the discount
        setPremiumPrice(response.data.finalPrice);
        // Clear the promo code input
        setPromoCode('');
        // Refresh premium info to show updated balance
        await fetchPremiumInfo();
        toast.success('Promo code applied successfully!');
      } else {
        setPromoError('Failed to apply promo code');
      }
    } catch (error) {
      setPromoError(error.response?.data?.error || 'Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  // Handle opening payment popup
  const handleAddFunds = (amount = null, planName = 'Add Funds') => {
    if (amount) {
      setPaymentAmount(amount);
    } else {
      setPaymentAmount(premiumPrice || 1000);
    }
    setPaymentPlan(planName);
    setShowPaymentPopup(true);
  };

  // Handle closing payment popup and refreshing data
  const handlePaymentPopupClose = () => {
    setShowPaymentPopup(false);
    setPaymentAmount(0);
    setPaymentPlan('');
    // Refresh premium info after payment
    fetchPremiumInfo();
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-2xl p-6 border border-[#e5f5d5] hover:border-[#58cc02] transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#3c9202]">{title}</p>
          <p className="text-2xl font-bold mt-2 text-[#58cc02]">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58cc02]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-2 px-4 rounded-xl
            transition-colors duration-200 border-b-2 border-[#3c9202]
            focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Welcome Section */}
      <div className="bg-[#e5f5d5] rounded-2xl p-6 mb-8">
        <h1 className="text-2xl font-bold text-[#3c9202] mb-2">
          Welcome back, {user?.firstName || user?.username}!
        </h1>
        <p className="text-[#3c9202]">
          Track your child's learning progress and achievements here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
      </div>

      {/* School subscription section */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5f5d5]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#3c9202]">Learning Fees</h2>
          <button 
            onClick={() => navigate('/app/premium')}
            className="flex items-center gap-2 bg-[#58cc02] hover:bg-[#47b102] text-white px-4 py-2 rounded-xl
              transition-colors duration-200 border-b-2 border-[#3c9202]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Make Payment</span>
          </button>
        </div>

        {/* Payment History */}
        <div>
          <h3 className="font-bold text-[#3c9202] mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <span>Payment History</span>
          </h3>
          <div className="space-y-3">
            {dashboardData.schoolFees.paymentHistory.map((payment) => (
              <div key={payment.id} 
                className="flex justify-between items-center p-4 bg-[#f7ffec] rounded-xl"
              >
                <div>
                  <h4 className="font-bold text-[#3c9202]">
                    {payment.term} - {payment.year}
                  </h4>
                  <p className="text-sm text-[#58cc02]">
                    Receipt: {payment.receiptNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#3c9202]">
                    ZMK{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#58cc02]">
                    {new Date(payment.datePaid).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5f5d5]">
        <h2 className="text-xl font-bold text-[#3c9202] mb-4">Recent Achievements</h2>
        {dashboardData.achievements.map((achievement) => (
          <div key={achievement.id} className="flex items-center p-4 bg-[#f7ffec] rounded-xl">
            <Star className="w-8 h-8 text-[#ffc800] mr-3" />
            <div>
              <h3 className="font-bold text-[#3c9202]">{achievement.title}</h3>
              <p className="text-sm text-[#58cc02]">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 border border-[hsl(90,62%,90%)]">
        <h2 className="text-xl font-bold text-[#3c9202] mb-2 flex items-center gap-4">
          Premium Account
          <button
            onClick={fetchPremiumInfo}
            className="ml-2 px-3 py-1 text-xs bg-[#e5f5d5] text-[#3c9202] rounded hover:bg-[#c8f2a0] border border-[#58cc02]"
            disabled={premiumLoading}
            title="Refresh premium info"
          >
            Refresh
          </button>
        </h2>
        {premiumLoading ? (
          <div className="text-[#58cc02]">Loading premium info...</div>
        ) : premiumError ? (
          <div className="text-red-600 mb-2">
            {premiumError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-bold ${premium.isActive ? "text-green-600" : "text-red-600"}`}>
                    {premium.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-bold text-[#3c9202]">ZMK{premium.balance?.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Deduction:</span>
                  <span className="font-bold text-[#3c9202]">
                    ZMK{(premiumPrice !== null ? premiumPrice : premium.deduction)?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-bold text-[#3c9202]">
                    {premium.expiry ? new Date(premium.expiry).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button 
                onClick={() => handleAddFunds(premiumPrice || 1000, 'Premium Monthly Plan')}
                className="flex items-center gap-2 bg-[#58cc02] hover:bg-[#47b102] text-white px-4 py-2 rounded-lg
                  transition-colors duration-200 border-b-2 border-[#3c9202]"
                disabled={premiumLoading}
              >
                <Plus className="w-4 h-4" />
                Add Funds
              </button>
              
              <button 
                onClick={() => handleAddFunds(5000, 'Premium 5-Month Plan')}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg
                  transition-colors duration-200"
                disabled={premiumLoading}
              >
                <CreditCard className="w-4 h-4" />
                5-Month Plan (ZMK5,000)
              </button>

              <button 
                onClick={() => handleUpgradePremium(1000)} 
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200" 
                disabled={premiumLoading}
              >
                Upgrade Plan (ZMK1000/mo)
              </button>
              
              <button 
                onClick={handleCancelPremium} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200" 
                disabled={premiumLoading}
              >
                Cancel Premium
              </button>
            </div>

            {premium.deduction > 0 && premium.balance > 0 && (
              <div className="bg-[#f7ffec] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#3c9202]">
                  <span className="font-semibold">Duration:</span> Your current balance will last for{' '}
                  <span className="font-bold text-[#58cc02]">
                    {Math.floor(premium.balance / premium.deduction)}
                  </span>{' '}
                  month(s) at the current deduction rate.
                </p>
              </div>
            )}

            {/* Promo Code Section */}
            <div className="mt-6 border-t pt-4 border-[#e5f5d5]">
              <h3 className="text-lg font-semibold text-[#3c9202] mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Promo Code
              </h3>
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full border-2 border-[#e5f5d5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#58cc02]"
                  />
                  {promoError && (
                    <p className="text-red-500 text-sm">{promoError}</p>
                  )}
                  {promoSuccess && (
                    <p className="text-green-600 text-sm">{promoSuccess}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleValidatePromoCode}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2 bg-[#e5f5d5] text-[#3c9202] rounded-lg hover:bg-[#c8f2a0] transition-colors
                      focus:outline-none focus:ring-2 focus:ring-[#58cc02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Validate
                  </button>
                  <button
                    onClick={handleApplyPromoCode}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2 bg-[#58cc02] text-white rounded-lg hover:bg-[#47b102] transition-colors
                      focus:outline-none focus:ring-2 focus:ring-[#58cc02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Enter a promo code to get a discount on your premium subscription
              </p>
            </div>
          </>
        )}
      </div>

      {/* Payment Popup */}
      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={handlePaymentPopupClose}
        amount={paymentAmount}
        planName={paymentPlan}
      />
    </div>
  );
};

export default ParentDashboard;