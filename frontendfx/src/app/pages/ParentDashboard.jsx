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
  Plus,
  TrendingUp,
  Award,
  Download,
  Calendar,
  BookOpen,
  Target,
  Clock,
  BarChart3
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

  // Set up polling for premium info updates
  useEffect(() => {
    fetchDashboardData();
    fetchPremiumInfo();
    fetchAndSetPremiumPrice();

    // Poll for premium price updates every minute
    const pollInterval = setInterval(() => {
      fetchPremiumInfo();
      fetchAndSetPremiumPrice();
    }, 60000); // Check every minute

    return () => clearInterval(pollInterval);
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
          // Let the backend refresh and return the latest premium status
          const resp = await api.post(`/api/user/premium/refresh/${userId}`);
          if (resp.data?.success) {
            const u = resp.data.user || {};
            setPremium({
              isActive: u.premiumActive ?? true,
              balance: u.premiumBalance ?? premiumData.balance,
              deduction: u.premiumDeduction ?? premiumData.deduction,
              expiry: u.premiumExpiry ?? premiumData.expiry,
              monthsRemaining: Math.floor((u.premiumBalance || 0) / (u.premiumDeduction || premiumData.deduction || 1))
            });
          } else {
            // Fallback: update UI locally
            const newBalance = premiumData.balance - premiumData.deduction;
            const newExpiry = new Date(expiryDate);
            newExpiry.setMonth(newExpiry.getMonth() + 1);
            setPremium({ ...premiumData, balance: newBalance, expiry: newExpiry.toISOString() });
          }
        } else {
          // Ask backend to refresh status (may deactivate based on balance)
          const resp = await api.post(`/api/user/premium/refresh/${userId}`);
          if (resp.data?.success) {
            const u = resp.data.user || {};
            setPremium({
              isActive: u.premiumActive ?? false,
              balance: u.premiumBalance ?? premiumData.balance,
              deduction: u.premiumDeduction ?? premiumData.deduction,
              expiry: u.premiumExpiry ?? premiumData.expiry,
              monthsRemaining: Math.floor((u.premiumBalance || 0) / (u.premiumDeduction || premiumData.deduction || 1))
            });
          } else {
            setPremium({ ...premiumData, isActive: false });
          }
          // Optionally, trigger a notification to the user here
        }
      }
    }
  };

  const fetchPremiumInfo = async () => {
    if (!userId) {
      console.log('No userId available for fetchPremiumInfo');
      return;
    }
    
    console.log('Fetching premium info for user:', userId);
    setPremiumLoading(true);
    setPremiumError(null);
    
    try {
      // Fetch both premium info and current system price in parallel
      const [premiumRes, priceRes] = await Promise.all([
        api.get(`/api/user/premium?userId=${userId}`),
        api.get('/api/system/premium-pricing')
      ]);
      
      console.log('Premium API Response:', premiumRes.data);
      console.log('Price API Response:', priceRes.data);
      
      const systemPrice = priceRes.data.premiumPricing;
      const premiumData = {
        isActive: premiumRes.data.isActive || false,
        balance: premiumRes.data.balance || 0,
        deduction: premiumRes.data.deduction || systemPrice, // Use system price if no deduction set
        expiry: premiumRes.data.expiry,
        monthsRemaining: premiumRes.data.monthsRemaining || 0
      };
      
      console.log('Processed premium data:', premiumData);
      setPremium(premiumData);
      setPremiumPrice(systemPrice); // Update the premium price state
      await checkAndUpdatePremiumStatus(premiumData);
    } catch (err) {
      console.error('Error fetching premium info:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Request config:', err.config);
      
      let errorMessage = 'Failed to load premium info.';
      if (err.response?.status === 404) {
        errorMessage = 'User not found. Please check your login status.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid request. Please refresh and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      } else {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      
      setPremiumError(errorMessage);
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
        childProgress: data.childProgress || {
          myChildProgress: {
            overallScore: 85,
            completedLessons: 24,
            timeSpent: 12.5,
            lastActivity: new Date().toISOString(),
            subjectProgress: []
          },
          weeklyLearningTrends: [],
          milestonesAchievements: []
        },
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

  // Handle progress report download
  const handleDownloadProgressReport = async () => {
    try {
      const userId = user?.userId;
      if (!userId) {
        toast.error('User information not available');
        return;
      }

      const response = await api.get(`/api/parent/progress-report/${userId}?format=json`);
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `child-progress-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Progress report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading progress report:', error);
      toast.error('Failed to download progress report');
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

      {/* New Child Progress Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Child's Progress */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5f5d5]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#3c9202] flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              My Child's Progress
            </h2>
            <div className="text-2xl font-bold text-[#58cc02]">
              {dashboardData.childProgress?.myChildProgress?.overallScore || 85}%
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Lessons:</span>
              <span className="font-bold text-[#3c9202]">
                {dashboardData.childProgress?.myChildProgress?.completedLessons || 24}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time Spent Learning:</span>
              <span className="font-bold text-[#3c9202]">
                {dashboardData.childProgress?.myChildProgress?.timeSpent || 12.5} hours
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Activity:</span>
              <span className="font-bold text-[#3c9202]">
                {new Date(dashboardData.childProgress?.myChildProgress?.lastActivity || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="mt-6">
            <h3 className="font-bold text-[#3c9202] mb-4">Subject Progress</h3>
            <div className="space-y-3">
              {(dashboardData.childProgress?.myChildProgress?.subjectProgress || [
                { subject: "Mathematics", progress: 75, lessonsCompleted: 8, totalLessons: 12 },
                { subject: "Science", progress: 90, lessonsCompleted: 9, totalLessons: 10 },
                { subject: "English", progress: 68, lessonsCompleted: 7, totalLessons: 15 }
              ]).map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#4b4b4b]">{subject.subject}</span>
                    <span className="text-sm text-[#58cc02]">
                      {subject.lessonsCompleted}/{subject.totalLessons} lessons
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#58cc02] to-[#47b102] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-[#3c9202] font-medium">
                    {subject.progress}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Learning Trends */}
        <div className="bg-white rounded-2xl p-6 border border-[#e5f5d5]">
          <h2 className="text-xl font-bold text-[#3c9202] mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Weekly Learning Trends
          </h2>
          
          <div className="space-y-4">
            {(dashboardData.childProgress?.weeklyLearningTrends || [
              { week: "Week 1", hoursStudied: 8.5, lessonsCompleted: 6, averageScore: 78 },
              { week: "Week 2", hoursStudied: 10.2, lessonsCompleted: 8, averageScore: 82 },
              { week: "Week 3", hoursStudied: 12.1, lessonsCompleted: 10, averageScore: 85 },
              { week: "Week 4", hoursStudied: 9.8, lessonsCompleted: 7, averageScore: 88 }
            ]).map((weekData, index) => (
              <div key={index} className="p-4 bg-[#f7ffec] rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-[#3c9202]">{weekData.week}</h4>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#58cc02]" />
                    <span className="text-[#58cc02] font-bold">{weekData.averageScore}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#58cc02]" />
                    <span className="text-[#4b4b4b]">{weekData.hoursStudied}h studied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#58cc02]" />
                    <span className="text-[#4b4b4b]">{weekData.lessonsCompleted} lessons</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones & Achievements */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5f5d5]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#3c9202] flex items-center gap-2">
            <Award className="w-6 h-6" />
            Milestones & Achievements
          </h2>
          <button 
            onClick={handleDownloadProgressReport}
            className="flex items-center gap-2 bg-[#1cb0f6] hover:bg-[#0095d9] text-white px-4 py-2 rounded-xl
              transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Download Progress Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(dashboardData.childProgress?.milestonesAchievements || [
            {
              id: 1,
              title: "Math Master",
              description: "Completed 10 consecutive math lessons",
              dateAchieved: "2025-10-10T00:00:00.000Z",
              category: "Academic",
              points: 100
            },
            {
              id: 2,
              title: "Science Explorer",
              description: "Scored 90% or higher in 5 science tests",
              dateAchieved: "2025-10-08T00:00:00.000Z",
              category: "Academic",
              points: 150
            },
            {
              id: 3,
              title: "Consistent Learner",
              description: "Logged in for 7 consecutive days",
              dateAchieved: "2025-10-01T00:00:00.000Z",
              category: "Engagement",
              points: 75
            }
          ]).map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gradient-to-br from-[#f7ffec] to-[#e5f5d5] rounded-xl border border-[#58cc02]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#58cc02] rounded-full">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3c9202] text-sm">{achievement.title}</h3>
                    <span className="text-xs text-[#58cc02] bg-white px-2 py-1 rounded-full">
                      {achievement.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#58cc02]">+{achievement.points}</div>
                  <div className="text-xs text-[#4b4b4b]">points</div>
                </div>
              </div>
              <p className="text-sm text-[#4b4b4b] mb-2">{achievement.description}</p>
              <div className="flex items-center gap-2 text-xs text-[#58cc02]">
                <Calendar className="w-3 h-3" />
                <span>{new Date(achievement.dateAchieved).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
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
                    ZMK{(premium.deduction || premiumPrice || 1000)?.toLocaleString()}
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