import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTests: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    recentActivities: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/dashboard/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-[#58cc02]"
        />
        <StatCard
          title="Premium Users"
          value={stats.premiumUsers}
          icon="⭐"
          color="bg-[#58cc02]"
        />
        <StatCard
          title="Total Tests"
          value={stats.totalTests}
          icon="📝"
          color="bg-[#58cc02]"
        />
        <StatCard
          title="Active Users Today"
          value={stats.activeUsers}
          icon="📱"
          color="bg-[#58cc02]"
        />
        <StatCard
          title="Total Revenue"
          value={`K${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="bg-[#58cc02]"
        />
      </div>

      {/* Recent Activities */}      <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6">
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

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border-2 border-[#e5f5d5] p-6 hover:border-[#58cc02] transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-[#3c9202]">{title}</p>
        <p className="text-2xl font-bold mt-2 text-[#58cc02]">{value}</p>
      </div>
      <div className="p-3 rounded-xl bg-[#e5f5d5]">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

export default DashboardPage;
