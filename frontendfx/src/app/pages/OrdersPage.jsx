import { useState, useEffect } from "react";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useRecoilValue } from "recoil";
import { userStates } from "../../atoms";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import DailyOrders from "../components/orders/DailyOrders";
import OrderDistribution from "../components/orders/OrderDistribution";
import OrdersTable from "../components/orders/OrdersTable";
import { API_URL } from "../../config";

const OrdersPage = () => {
  const userState = useRecoilValue(userStates);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    transitOrders: 0,
    receivedOrders: 0,
    totalQuantity: 0,
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/a/listorders`);
      const data = await res.json();
      if (data.orders) {
        let filteredOrders = data.orders;
        
        // Filter orders for store manager
        if (userState.role === "STOREMANAGER" && userState.storeIds) {
          filteredOrders = data.orders.filter(order => 
            userState.storeIds.includes(order.storeId)
          );
        }

        const totalOrders = filteredOrders.length;
        const pendingOrders = filteredOrders.filter(order => order.status === "PENDING").length;
        const transitOrders = filteredOrders.filter(order => order.status === "TRANSIT").length;
        const receivedOrders = filteredOrders.filter(order => order.status === "RECEIVED").length;
        const totalQuantity = filteredOrders.reduce((acc, order) => acc + order.quantity, 0);

        setOrderStats({
          totalOrders,
          pendingOrders,
          transitOrders,
          receivedOrders,
          totalQuantity,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userState.storeIds]);

  return (
    <div className="flex-1 relative z-10 overflow-auto">
      <Header title={"Orders"} />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name="Total Orders" 
            icon={ShoppingBag} 
            value={orderStats.totalOrders} 
            color="#6366F1" 
          />
          {userState.role === "STOREMANAGER" ? (
            <>
              <StatCard 
                name="In Transit" 
                icon={Clock} 
                value={orderStats.transitOrders} 
                color="#3B82F6" 
              />
              <StatCard
                name="Received Orders"
                icon={CheckCircle}
                value={orderStats.receivedOrders}
                color="#10B981"
              />
              <StatCard 
                name="Total Quantity" 
                icon={ShoppingBag} 
                value={orderStats.totalQuantity} 
                color="#8B5CF6" 
              />
            </>
          ) : (
            <>
              <StatCard 
                name="Pending Orders" 
                icon={Clock} 
                value={orderStats.pendingOrders} 
                color="#F59E0B" 
              />
              <StatCard
                name="Completed Orders"
                icon={CheckCircle}
                value={orderStats.receivedOrders}
                color="#10B981"
              />
              <StatCard 
                name="In Transit" 
                icon={ShoppingBag} 
                value={orderStats.transitOrders} 
                color="#3B82F6" 
              />
            </>
          )}
        </motion.div>

        <div className="mb-8">
          <OrdersTable />
        </div>
        
        {!userState.role === "STOREMANAGER" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DailyOrders />
            <OrderDistribution />
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
