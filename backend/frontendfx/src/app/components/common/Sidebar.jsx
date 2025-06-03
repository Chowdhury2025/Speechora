import { BarChart2, DollarSign, Menu, Settings, ShoppingBag, ShoppingCart, TrendingUp, Users, Warehouse, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState, userStates } from '../../../atoms';

// Define which menu items are accessible to each role
const ROLE_PERMISSIONS = {
  SUPERUSER: ["Overview", "Products", "Sales", "Orders", "Analytics", "Settings", "Users", "Add Warehouse", "Expenses", "Quotations"],
  ADMIN: ["Overview", "Products", "Sales", "Orders", "Analytics", "Settings", "Users", "Add Warehouse", "Expenses", "Quotations"],
  INSPECTOR: ["Overview", "Products", "Sales", "Orders", "Analytics", "Settings", "Users", "Add Warehouse", "Expenses", "Quotations"],
  STOREMANAGER: ["Sales", "Orders", "Expenses", "Quotations"],
  STAFF: ["Quotations"],
};

const SIDEBAR_ITEMS = [
  { name: "Overview", icon: BarChart2, color: "#6366f1", href: "/" },
  { name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
  { name: "Sales", icon: DollarSign, color: "#10B981", href: "/sales" },
  { name: "Quotations", icon: ShoppingCart, color: "#38BDF8", href: "/quotations" },
  { name: "Expenses", icon: DollarSign, color: "#F97316", href: "/expenses" },
  { name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
  // { name: "Analytics", icon: TrendingUp, color: "#3B82F6", href: "/analytics" },
  { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
  { name: "Users", icon: Users, color: "#EC4899", href: "/users" },
  { name: "Add Warehouse", icon: Warehouse, color: "#F97316", href: "/add-warehouse" }
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = useRecoilValue(userStates);
  const setAuth = useSetRecoilState(authState);
  const setUser = useSetRecoilState(userStates);
  const isAuthenticated = useRecoilValue(authState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setAuth(false);
    navigate("/login");
  };

  // Get accessible menu items based on user role
  const getUserMenuItems = () => {
    if (!user || !user.role) return [];
    const userRole = user.role.toUpperCase();
    const allowedItems = ROLE_PERMISSIONS[userRole] || ["Overview"];
    return SIDEBAR_ITEMS.filter(item => allowedItems.includes(item.name));
  };

  const accessibleMenuItems = getUserMenuItems();

  return (
    <motion.div
      className="relative z-10 transition-all duration-300 ease-in-out flex-shrink-0"
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="min-h-screen bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        <nav className="mt-4 flex-grow">
          {accessibleMenuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div className="flex items-center p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-4 whitespace-nowrap"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>

        {user && (
          <div className="mt-auto p-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                <User size={20} />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-gray-400 text-sm">{user.role}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded-md text-sm"
            >
              {isSidebarOpen ? "Logout" : ""}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
