import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    testCompletion: [],
    popularTests: [],
    userEngagement: {
      dailyActiveUsers: 0,
      averageTestsPerUser: 0,
      averageTimeSpent: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/analytics`);
        setAnalytics(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kids Learning Platform Analytics</h1>

      {/* User Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Daily Active Users</h3>
          <p className="text-3xl font-semibold mt-2">
            {analytics.userEngagement.dailyActiveUsers}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Average Tests per User
          </h3>
          <p className="text-3xl font-semibold mt-2">
            {analytics.userEngagement.averageTestsPerUser}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">
            Average Learning Time
          </h3>
          <p className="text-3xl font-semibold mt-2">
            {analytics.userEngagement.averageTimeSpent} mins
          </p>
        </div>
      </div>

      {/* Popular Tests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Most Popular Learning Tests
          </h2>
          <div className="space-y-4">
            {analytics.popularTests.map((test, index) => (
              <div
                key={test.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center">
                  <span className="text-lg font-medium text-gray-900 w-8">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{test.name}</p>
                    <p className="text-sm text-gray-500">{test.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {test.completions} completions
                  </p>
                  <p className="text-sm text-gray-500">
                    {test.averageScore?.toFixed(1)}% avg score
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {analytics.popularTests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No analytics data available yet.</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
