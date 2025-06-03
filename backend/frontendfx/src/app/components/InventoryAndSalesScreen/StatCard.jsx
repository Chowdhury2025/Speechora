import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, isLoading }) => (
  <motion.div
    className="bg-gray-800 rounded-lg shadow-md p-6 flex items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="rounded-full p-3 mr-4" style={{ backgroundColor: `${color}20` }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <p className="text-sm text-gray-100 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-100">
        {isLoading ? 'Loading...' : value}
      </p>
    </div>
  </motion.div>
);

export default StatCard;
