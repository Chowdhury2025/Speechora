// src/pages/OverviewPage.jsx
import  { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, ShoppingBag, BarChart2, DollarSign } from 'lucide-react';
import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import SalesOverviewChart from '../components/overview/SalesOverviewChart';
import CategoryDistributionChart from '../components/overview/CategoryDistributionChart';
import SalesChannelStore from '../components/overview/SalesChannelChart';
import { API_URL } from '../../config';

const OverviewPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_URL}/overview/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Overview" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {stats ? (
            <>
              <StatCard name="Total Sales" icon={Zap} value={`K ${stats.totalSales}`} color="#6366F1" />
              <StatCard name="Total Profits" icon={ShoppingBag} value={`K ${stats.totalProfits}`} color="#EC4899" />
              <StatCard name="Total Expenses" icon={DollarSign} value={`K ${stats.totalExpenses}`} color="#EF4444" />
              <StatCard name="Monthly Expenses" icon={DollarSign} value={`K ${stats.monthlyExpenses}`} color="#F59E0B" />
              <StatCard name="Users" icon={Users} value={stats.userCount} color="#8B5CF6" />
              <StatCard name="Stores" icon={Users} value={stats.storeCount} color="#8B5CF6" />
              <StatCard name="Warehouses" icon={Users} value={stats.warehouseCount} color="#8B5CF6" />
              <StatCard name="Products" icon={ShoppingBag} value={stats.productCount} color="#EC4899" />
              <StatCard name="Sold Products" icon={BarChart2} value={`${stats.soldProductsPercentage}%`} color="#10B981" />
            </>
          ) : (
            <p>Loading stats...</p>
          )}
        </motion.div>
        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SalesOverviewChart />
          <CategoryDistributionChart />
          <SalesChannelStore />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;