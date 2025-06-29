import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userStates } from '../../atoms';
import api from '../../utils/api';
import { 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Clock, 
  Calendar,
  TrendingUp,
  Star,
  DollarSign,
  Receipt,
  CreditCard
} from 'lucide-react';
import { fetchPremiumPrice } from '../utils/premium';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userStates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [dashboardData, setDashboardData] = useState({
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
  const [addAmount, setAddAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('visa'); // 'visa' or 'mobile_money'
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumError, setPremiumError] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(null);

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
        childProgress: data.childProgress || [],        achievements: data.achievements || [],
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
  const userId = user?.userId

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (!userId) {
      setPremiumError('User ID is missing or invalid. Please log in again.');
      return;
    }
    setPremiumLoading(true);
    setPremiumError(null);
    const payload = {
      userId, // only send numeric userId
      amount,
      paymentMethod
    };
    console.log('Add Funds Payload:', payload);
    try {
      await api.post('/api/user/premium/add', payload);
      await fetchPremiumInfo();
      setAddAmount('');
    } catch (err) {
      // Show backend error message if available
      let errorMsg = 'Failed to add funds.';
      if (err?.response) {
        errorMsg =
          (err.response.data && (err.response.data.message || JSON.stringify(err.response.data))) ||
          'Failed to add funds.';
        console.error('API Error Response:', err.response);
      }
      setPremiumError(errorMsg);
      console.error('API Error:', err);
    } finally {
      setPremiumLoading(false);
    }
  };

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
      await api.post('/api/user/premium/upgrade', { userId, deduction });
      await fetchPremiumInfo();
    } catch (err) {
      setPremiumError('Failed to upgrade premium.');
    } finally {
      setPremiumLoading(false);
    }
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">        <StatCard
          icon={BookOpen}
          title="Completed Lessons"
          value={dashboardData.totalCompletedLessons}
          color="bg-[#58cc02]"
        />
        <StatCard
          icon={GraduationCap}
          title="Test Score Average"
          value="85%"
          color="bg-[#1cb0f6]"
        />
        <StatCard
          icon={Trophy}
          title="Achievements"
          value={dashboardData.achievements.length}
          color="bg-[#ffc800]"
        />
        <StatCard
          icon={Clock}
          title="Learning Hours"
          value="12.5"
          color="bg-[#ff4b4b]"
        />
      </div>

      {/* Recent Activity & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tests */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5f5d5]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#3c9202]">Recent Tests</h2>
            <button 
              onClick={() => navigate('/app/tests')}
              className="text-[#58cc02] hover:text-[#47b102] font-bold"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-[#f7ffec] rounded-xl">
                <div>
                  <h3 className="font-bold text-[#3c9202]">{test.title}</h3>
                  <p className="text-sm text-[#58cc02]">{test.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#3c9202]">{test.score}%</p>
                  <p className="text-sm text-[#58cc02]">{new Date(test.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5f5d5]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#3c9202]">Learning Progress</h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#58cc02]" />
              <span className="text-[#58cc02] font-bold">+15% this month</span>
            </div>
          </div>
          {/* Add your chart component here */}
          <div className="h-64 flex items-center justify-center bg-[#f7ffec] rounded-xl">
            <p className="text-[#3c9202]">Progress Chart Coming Soon</p>
          </div>
        </div>
      </div>

      {/* Child Progress Section */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5f5d5]">
        <h2 className="text-xl font-bold text-[#3c9202] mb-4">Subject Progress</h2>
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: premium.isActive ? '#e5f5d5' : '#ffe5e5', color: premium.isActive ? '#3c9202' : '#d32f2f' }}>
            {premium.isActive ? 'Premium Account Active' : 'Not a Premium Account'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardData.childProgress.map((subject, index) => (
            <div key={index} className="bg-[#f7ffec] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-[#3c9202]">{subject.subject}</h3>
                <span className="text-[#58cc02] font-bold">{subject.progress}%</span>
              </div>
              <div className="w-full bg-[#e5f5d5] rounded-full h-2.5">
                <div 
                  className="bg-[#58cc02] h-2.5 rounded-full" 
                  style={{ width: `${subject.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-[#58cc02] mt-2">
                {subject.completedLessons} of {subject.totalLessons} lessons completed
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* School Fees Section */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5f5d5]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#3c9202]">School Fees</h2>          <button 
            onClick={() => navigate('/app/premium')}
            className="flex items-center gap-2 bg-[#58cc02] hover:bg-[#47b102] text-white px-4 py-2 rounded-xl
              transition-colors duration-200 border-b-2 border-[#3c9202]"
          >
            <CreditCard className="w-4 h-4" />
            <span>Make Payment</span>
          </button>
        </div>

        {/* Current Term Fees */}
        <div className="bg-[#f7ffec] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-[#3c9202]">
                {dashboardData.schoolFees.currentTerm.term} - {dashboardData.schoolFees.currentTerm.year}
              </h3>
              <p className="text-sm text-[#58cc02]">
                Due by {new Date(dashboardData.schoolFees.currentTerm.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#3c9202]">
                ₦{dashboardData.schoolFees.currentTerm.amount?.toLocaleString()}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                dashboardData.schoolFees.currentTerm.status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>                {dashboardData.schoolFees.currentTerm.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
              {dashboardData.schoolFees.currentTerm.status !== 'paid' && (
                <button 
                  onClick={() => navigate('/app/premium')}
                  className="mt-2 flex items-center gap-2 bg-[#58cc02] hover:bg-[#47b102] text-white px-3 py-1.5 rounded-xl
                    transition-colors duration-200 border-b-2 border-[#3c9202] text-sm"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Pay Now</span>
                </button>
              )}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-2">
            {dashboardData.schoolFees.currentTerm.breakdown?.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-[#3c9202]">{item.item}</span>
                <span className="text-sm font-bold text-[#58cc02]">
                  ₦{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
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
                    ₦{payment.amount.toLocaleString()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <br />
            <span className="text-xs break-all">Payload: {JSON.stringify({ userId, amount: parseFloat(addAmount), paymentMethod })}</span>
          </div>
        ) : (
          <>
            <p>Status: <span className={premium.isActive ? "text-green-600" : "text-red-600"}>{premium.isActive ? "Active" : "Inactive"}</span></p>
            <p>Balance: <span className="font-bold">₦{premium.balance}</span></p>
            <p>Monthly Deduction: <span className="font-bold">₦{premiumPrice !== null ? premiumPrice : premium.deduction}</span></p>
            <p>Expiry Date: <span className="font-bold">{premium.expiry || "N/A"}</span></p>
            <div className="flex gap-2 mt-4 items-center">
              <input
                type="number"
                placeholder="Add funds"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="visa">Visa</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
              <button onClick={handleAddFunds} className="bg-[#58cc02] text-white px-4 py-1 rounded" disabled={premiumLoading}>Add</button>
              <button onClick={handleCancelPremium} className="bg-red-500 text-white px-4 py-1 rounded" disabled={premiumLoading}>Cancel</button>
              <button onClick={() => handleUpgradePremium(1000)} className="bg-blue-500 text-white px-4 py-1 rounded" disabled={premiumLoading}>Upgrade (₦1000/mo)</button>
            </div>
            <p className="mt-2 text-sm text-gray-600">Payment Method: <b>{paymentMethod === 'visa' ? 'Visa' : 'Mobile Money'}</b></p>
            {premium.deduction > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Your balance will last for <b>{Math.floor(premium.balance / premium.deduction)}</b> month(s).
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
