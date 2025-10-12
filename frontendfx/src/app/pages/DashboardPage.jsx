import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

// Helper to slice or expand series to requested ranges
function sliceRange(data = [], range = 'week') {
  const arr = Array.isArray(data) ? data : [];
  if (range === 'week') return arr.slice(-7);
  if (range === 'month') {
    if (arr.length >= 30) return arr.slice(-30);
    // pad by repeating first value at start until length 30
    const pad = [];
    while (pad.length + arr.length < 30) pad.push(arr[0] || { date: '', value: 0 });
    return [...pad, ...arr].slice(-30);
  }
  // year
  if (arr.length >= 12) return arr.slice(-12);
  const pad = [];
  while (pad.length + arr.length < 12) pad.push(arr[0] || { date: '', value: 0 });
  return [...pad, ...arr].slice(-12);
}

// basic statistical helpers
function mean(arr = []) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr = [], sample = false) {
  if (!arr.length) return 0;
  const m = mean(arr);
  const denom = sample ? (arr.length - 1 || 1) : arr.length;
  return arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / denom;
}

function stddev(arr = [], sample = false) {
  return Math.sqrt(variance(arr, sample));
}

const DashboardPage = () => {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeUsers: 485,
    totalTests: 3200,
    premiumUsers: 320,
    totalRevenue: 15000.50,
    cashInSystem: 25000.75,
    todaySales: 1250.25,
    recentActivities: [
      {
        icon: "⭐",
        title: "New Premium Subscription",
        description: "John Doe upgraded to premium",
        timestamp: "2 minutes ago"
      },
      {
        icon: "📝",
        title: "Test Completed",
        description: "Sarah Smith completed Advanced Level",
        timestamp: "15 minutes ago"
      },
      {
        icon: "👤",
        title: "New User Registration",
        description: "Mike Johnson joined the platform",
        timestamp: "1 hour ago"
      }
    ],
    analytics: {
      userGrowth: [
        { date: '2025-10-05', value: 125, total: 1050 },
        { date: '2025-10-06', value: 145, total: 1195 },
        { date: '2025-10-07', value: 155, total: 1350 },
        { date: '2025-10-08', value: 165, total: 1515 },
        { date: '2025-10-09', value: 175, total: 1690 },
        { date: '2025-10-10', value: 185, total: 1875 },
        { date: '2025-10-11', value: 195, total: 2070 }
      ],
      revenueGrowth: [
        { date: '2025-10-05', value: 1200.50, total: 12000.50 },
        { date: '2025-10-06', value: 1350.75, total: 13351.25 },
        { date: '2025-10-07', value: 1450.25, total: 14801.50 },
        { date: '2025-10-08', value: 1600.00, total: 16401.50 },
        { date: '2025-10-09', value: 1700.50, total: 18102.00 },
        { date: '2025-10-10', value: 1800.75, total: 19902.75 },
        { date: '2025-10-11', value: 1900.25, total: 21803.00 }
      ],
      testCompletion: [
        { date: '2025-10-05', value: 400, completed: 320, total: 400 },
        { date: '2025-10-06', value: 450, completed: 380, total: 450 },
        { date: '2025-10-07', value: 500, completed: 440, total: 500 },
        { date: '2025-10-08', value: 550, completed: 495, total: 550 },
        { date: '2025-10-09', value: 600, completed: 570, total: 600 },
        { date: '2025-10-10', value: 650, completed: 630, total: 650 },
        { date: '2025-10-11', value: 700, completed: 690, total: 700 }
      ],
      expenses: [
        { category: 'Server Costs', amount: 2500.00 },
        { category: 'Marketing', amount: 3500.00 },
        { category: 'Support', amount: 1800.00 },
        { category: 'Development', amount: 4200.00 },
        { category: 'Admin', amount: 1500.00 }
      ],
      userTypes: [
        { type: 'Premium', count: 320 },
        { type: 'Free Trial', count: 450 },
        { type: 'Basic', count: 480 }
      ],
      deviceStats: [
        { device: 'Mobile', count: 750 },
        { device: 'Desktop', count: 350 },
        { device: 'Tablet', count: 150 }
      ]
    }
  });

  const [users, setUsers] = useState([
    {
      name: "John Doe",
      email: "john.doe@example.com",
      isPremium: true,
      createdAt: "2025-09-15T10:30:00Z"
    },
    {
      name: "Sarah Smith",
      email: "sarah.smith@example.com",
      isPremium: true,
      createdAt: "2025-09-20T14:15:00Z"
    },
    {
      name: "Mike Johnson",
      email: "mike.j@example.com",
      isPremium: false,
      createdAt: "2025-10-01T09:45:00Z"
    },
    {
      name: "Emily Brown",
      email: "emily.b@example.com",
      isPremium: true,
      createdAt: "2025-10-05T16:20:00Z"
    },
    {
      name: "Alex Wilson",
      email: "alex.w@example.com",
      isPremium: false,
      createdAt: "2025-10-10T11:10:00Z"
    }
  ]);

  useEffect(() => {
    const fetchPremiumPrice = async () => {
      try {
        const priceResponse = await axios.get(`${API_URL}/api/system/premium-pricing`);
        setPremiumPrice(priceResponse.data.premiumPricing || '');
      } catch (error) {
        console.error('Error fetching premium price:', error);
      }
    };

    // For UI testing we use local dummy analytics and users data only. Fetch only premium price.
    fetchPremiumPrice();
  }, []);

  const [premiumPrice, setPremiumPrice] = useState('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month' | 'year'

  const handleUpdatePremiumPrice = async () => {
    try {
      setIsUpdatingPrice(true);
      await axios.post(`${API_URL}/api/system/premium-pricing`, {
        premiumPricing: premiumPrice
      });
      
      // Notify all clients that premium price has been updated
      await axios.post(`${API_URL}/api/system/broadcast-update`, {
        type: 'PREMIUM_PRICE_UPDATE',
        data: { newPrice: premiumPrice }
      }).catch(console.error); // Don't block on broadcast
      
      alert('Premium price updated successfully! All users will see the new price on their next refresh.');
    } catch (error) {
      alert('Failed to update premium price: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (    
    <div className="space-y-6">
      {/* Premium Price Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsPriceModalOpen(true)}
          className="bg-[#58cc02] hover:bg-[#47b102] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <span className="text-xl">⚙️</span>
          <span>Update Premium Price</span>
        </button>
      </div>

      {/* Premium Price Modal */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md m-4 relative">
            <button
              onClick={() => setIsPriceModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#3c9202] mb-4">Update Premium Price</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Premium Price
                </label>
                <input
                  type="number"
                  value={premiumPrice}
                  onChange={(e) => setPremiumPrice(e.target.value)}
                  placeholder="Enter new price"
                  className="w-full border-2 border-[#e5f5d5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#58cc02]"
                />
              </div>
              <p className="text-sm text-gray-600">
                This will be the new monthly deduction amount for premium subscriptions.
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdatePremiumPrice();
                    setIsPriceModalOpen(false);
                  }}
                  disabled={isUpdatingPrice || !premiumPrice}
                  className="bg-[#58cc02] hover:bg-[#47b102] text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPrice ? 'Updating...' : 'Update Price'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="👥"
              color="bg-[#58cc02]"
              sparkData={sliceRange(stats.analytics?.userGrowth || [], timeRange).map(p => p.value)}
            />
            <StatCard
              title="Current Total Buys"
              value={`K${sliceRange(stats.analytics?.revenueGrowth || [], timeRange).reduce((acc, r) => acc + (r.value || 0), 0).toFixed(2)}`}
              icon="🛒"
              color="bg-[#58cc02]"
              sparkData={sliceRange(stats.analytics?.revenueGrowth || [], timeRange).map(p => p.value)}
            />
            <StatCard
              title="Premium Users"
              value={stats.premiumUsers}
              icon="⭐"
              color="bg-[#58cc02]"
              sparkData={sliceRange((stats.analytics?.userGrowth || []).map((u, i) => ({ ...u, value: Math.max(0, stats.premiumUsers - i * 2) })), timeRange).map(p => p.value)}
            />
            <StatCard
              title="Total Tests"
              value={stats.totalTests}
              icon="📝"
              color="bg-[#58cc02]"
            />
            <StatCard
              title="Active Users Today"
              value={(() => {
                const ug = sliceRange(stats.analytics?.userGrowth || [], timeRange);
                return (ug.length ? ug[ug.length - 1].value : stats.activeUsers);
              })()}
              icon="📱"
              color="bg-[#58cc02]"
            />
            <StatCard
              title="Total Revenue"
              value={`K${stats.totalRevenue.toFixed(2)}`}
              icon="💰"
              color="bg-[#58cc02]"
              sparkData={sliceRange(stats.analytics?.revenueGrowth || [], timeRange).map(p => p.value)}
            />
          </div>

      {/* Analytics Section */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6">
        <h2 className="text-xl font-bold text-[#3c9202] mb-4">Analytics Overview</h2>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#3c9202]">Statistical Analysis</h2>
            <p className="text-sm text-gray-600">Summary (range: {timeRange})</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-[#e5f5d5]">
            {(() => {
              const rev = sliceRange(stats.analytics?.revenueGrowth || [], timeRange).map(r => r.value || 0);
              const ug = sliceRange(stats.analytics?.userGrowth || [], timeRange).map(r => r.value || 0);
              return (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-600">Revenue Mean</div>
                    <div className="font-bold text-[#3c9202]">K{mean(rev).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">σ: {stddev(rev).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Users Mean</div>
                    <div className="font-bold text-[#3c9202]">{mean(ug).toFixed(1)}</div>
                    <div className="text-xs text-gray-500">σ: {stddev(ug).toFixed(1)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bar Charts */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#3c9202]">User Growth (Bar Chart)</h3>
            <div className="h-48 bg-[#f7faf3] rounded-lg p-4">
              <div className="flex h-full items-end space-x-2">
                {(sliceRange(stats.analytics?.userGrowth || [], timeRange) || []).map((point, index) => {
                  const arr = sliceRange(stats.analytics?.userGrowth || [], timeRange) || [];
                  const maxValue = Math.max(...arr.map(p => p.total), 1);
                  // Use total relative to max to compute bar height
                  const heightPercentage = (point.total / maxValue) * 100;
                  // ensure a visible min-height for very small values
                  const visibleHeight = Math.max(heightPercentage, 6);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="mb-1 text-xs text-[#3c9202]">+{point.value}</div>
                      <div className="w-full bg-[#e5f5d5] rounded-t overflow-hidden flex items-end h-36">
                        <div
                          className="w-full bg-[#58cc02] hover:bg-[#47b102] transition-all duration-200 rounded-t cursor-pointer flex items-end justify-center"
                          style={{ height: `${visibleHeight}%` }}
                          title={`${new Date(point.date).toLocaleDateString()} - New: ${point.value} - Total: ${point.total}`}
                        >
                          <div className="text-[10px] text-white opacity-90 pb-1">{point.total}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-500">{new Date(point.date).toLocaleDateString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue Line Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#3c9202]">Revenue Growth</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-[#58cc02] text-white' : 'bg-white text-[#3c9202] border border-[#e5f5d5]'}`}>
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-[#58cc02] text-white' : 'bg-white text-[#3c9202] border border-[#e5f5d5]'}`}>
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-1 rounded ${timeRange === 'year' ? 'bg-[#58cc02] text-white' : 'bg-white text-[#3c9202] border border-[#e5f5d5]'}`}>
                  Year
                </button>
              </div>
            </div>
            <h4 className="text-sm text-gray-600">{timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'}</h4>
            <div className="h-48 bg-[#f7faf3] rounded-lg p-4">
              <div className="h-full w-full flex items-center justify-center">
                <RevenueLineChart
                  data={sliceRange(stats.analytics?.revenueGrowth || [], timeRange)}
                  range={timeRange}
                />
              </div>
            </div>
          </div>
        {/* Expenses Pie Chart */}
              <div className="space-y-2">
                <h3 className="font-semibold text-[#3c9202]">Expenses Distribution (Pie Chart)</h3>
                <div className="h-48 bg-[#f7faf3] rounded-lg p-4 relative">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-sm">
                      {(() => {
                        const expensesArr = stats.analytics?.expenses || [];
                        const total = expensesArr.reduce((acc, curr) => acc + curr.amount, 0) || 1;
                        const gradientParts = expensesArr.map((exp, idx) => {
                          const percentage = (exp.amount / total) * 100;
                          const start = expensesArr.slice(0, idx).reduce((acc, c) => acc + (c.amount / total) * 100, 0);
                          const end = start + percentage;
                          const hue = 96; // green hue
                          const lightness = 45 + idx * 6; // vary lightness
                          return `hsl(${hue} 85% ${lightness}%) ${start}% ${end}%`;
                        });
                        const gradient = `conic-gradient(${gradientParts.join(', ')})`;

                        return (
                          <div className="w-full h-full rounded-full" style={{ background: gradient }}>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-20 h-20 rounded-full bg-white" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {(stats.analytics?.expenses || []).map((expense, index) => {
                    const lightness = 45 + index * 6;
                    const color = `hsl(96 85% ${lightness}%)`;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                        <span>{expense.category}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

          {/* Test Completion Chart */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#3c9202]">Test Completion</h3>
            <div className="h-48 bg-[#f7faf3] rounded-lg p-4 flex items-center justify-center">
              <div className="w-full h-full p-2">
                <div className="flex h-full items-end gap-2">
                  {sliceRange(stats.analytics?.testCompletion || [], timeRange).map((t, i) => {
                    const arr = sliceRange(stats.analytics?.testCompletion || [], timeRange) || [];
                    const maxValue = Math.max(...arr.map(x => x.total), 1);
                    const heightPct = (t.completed / maxValue) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="mb-1 text-xs text-[#3c9202]">{t.completed}</div>
                        <div className="w-full bg-[#e5f5d5] rounded-t overflow-hidden flex items-end h-28">
                          <div className="w-full bg-[#3c9202]" style={{ height: `${Math.max(heightPct, 6)}%` }} />
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Device Stats */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#3c9202]">Device Distribution</h3>
            <div className="h-48 bg-[#f7faf3] rounded-lg p-4 flex flex-col justify-center">
              {(stats.analytics?.deviceStats || []).map((d, i) => {
                const total = (stats.analytics?.deviceStats || []).reduce((a, b) => a + b.count, 0) || 1;
                const pct = (d.count / total) * 100;
                return (
                  <div key={i} className="flex items-center justify-between mb-2">
                    <div className="text-sm">{d.device}</div>
                    <div className="flex-1 mx-3 h-3 bg-[#e5f5d5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#58cc02]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-12 text-right text-sm text-gray-600">{pct.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Types Distribution */}
          <div className="space-y-2">
            <h3 className="font-semibold text-[#3c9202]">User Types Distribution</h3>
            <div className="h-48 bg-[#f7faf3] rounded-lg p-4">
              <div className="flex flex-col h-full justify-center">
                {(stats.analytics?.userTypes || []).map((type, index) => {
                  const typesArr = stats.analytics?.userTypes || [];
                  const total = typesArr.reduce((acc, curr) => acc + curr.count, 0) || 1;
                  const percentage = (type.count / total) * 100;
                  return (
                    <div key={index} className="relative mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{type.type}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-4 bg-[#e5f5d5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User List Section */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6">
        <h2 className="text-xl font-bold text-[#3c9202] mb-4">User List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-[#e5f5d5]">
                <th className="py-3 text-left text-[#3c9202]">Name</th>
                <th className="py-3 text-left text-[#3c9202]">Email</th>
                <th className="py-3 text-left text-[#3c9202]">Status</th>
                <th className="py-3 text-left text-[#3c9202]">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="border-b border-[#e5f5d5]">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.isPremium ? 'bg-[#e5f5d5] text-[#3c9202]' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </td>
                  <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6">
        <h2 className="text-xl font-bold text-[#3c9202] mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {stats.recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b-2 border-[#e5f5d5] pb-4"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl bg-[#e5f5d5] p-2 rounded-xl">{activity.icon}</span>
                <div>
                  <p className="font-bold text-[#3c9202]">{activity.title}</p>
                  <p className="text-sm text-[#58cc02]">{activity.description}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-[#58cc02]">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, sparkData }) => (
  <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 hover:border-[#58cc02] transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-[#3c9202]">{title}</p>
        <p className="text-2xl font-bold mt-2 text-[#58cc02]">{value}</p>
        {sparkData && <div className="mt-2"><Sparkline data={sparkData} width={120} height={28} /></div>}
      </div>
      <div className="p-3 rounded-xl bg-[#e5f5d5]">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

export default DashboardPage;

// Sparkline small inline component for stat cards
function Sparkline({ data = [], width = 100, height = 28, stroke = '#58cc02' }) {
  const vals = data.length ? data : [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...vals, 1);
  const stepX = width / Math.max(vals.length - 1, 1);
  const points = vals.map((v, i) => `${i * stepX},${height - (v / max) * height}`).join(' ');
  return (
    <svg width={width} height={height} className="block">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </svg>
  );
}

// Improved RevenueLineChart with grid, smoothing and tooltip
function RevenueLineChart({ data = [], range = 'week' }) {
  // normalize data based on range
  let points = [];
  if (range === 'week') points = data.slice(-7);
  else if (range === 'month') points = Array.from({ length: 30 }).map((_, i) => data[i % data.length] || { date: '', value: 0 });
  else points = data.slice(-12);

  const values = points.map(p => p.value || 0);
  const max = Math.max(...values, 1);
  const width = 320;
  const height = 140;
  const padding = 10;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const stepX = innerW / Math.max(values.length - 1, 1);

  // build smoothed path using simple quadratic smoothing
  const coords = values.map((v, i) => ({ x: padding + i * stepX, y: padding + innerH - (v / max) * innerH }));
  const pathD = coords.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = coords[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} Q ${prev.x} ${prev.y} ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
  }, '');

  const total = values.reduce((a, b) => a + b, 0).toFixed(2);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="bg-transparent rounded">
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line key={i} x1={padding} x2={width - padding} y1={padding + innerH * g} y2={padding + innerH * g} stroke="#e6f3e6" strokeWidth="1" />
        ))}
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#58cc02" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#58cc02" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* area under curve (approx) */}
        <path d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#areaGrad)" stroke="none" />
        {/* curve */}
        <path d={pathD} fill="none" stroke="#2fae00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* points */}
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3.5} fill="#58cc02" stroke="#fff" strokeWidth={1} />
        ))}
      </svg>
      <div className="flex items-center justify-between w-full px-2">
        <div className="text-sm text-gray-600">Range: <span className="font-semibold text-[#3c9202]">{range}</span></div>
        <div className="text-sm">Current Total Buys: <span className="font-bold text-[#3c9202]">K{total}</span></div>
      </div>
    </div>
  );
}
