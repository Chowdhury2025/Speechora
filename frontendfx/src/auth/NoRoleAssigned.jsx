import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { userStates } from '../atoms';
import { useNavigate } from 'react-router-dom';

function NoRoleAssigned() {
  const user = useRecoilValue(userStates);
  const resetUser = useResetRecoilState(userStates);
  const navigate = useNavigate();
  const isStaff = user?.role === 'STAFF';
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    resetUser();
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-100 mb-4">
          Welcome FREIND YOU ARE NOT AUTHORIZED 
        </h1>
        <p className="text-gray-400 mb-4">
          Your account is not authorized to access this system. Please contact the administrator for assistance.
          MOST LIKLY YOU ARE A THIEF... YEAH YOU ARE A THIEF
        </p>
        
        <div className="w-64 h-64 mx-auto mb-6">
          <DotLottieReact
            src="https://lottie.host/c99623c9-8940-4c1d-a319-56a3460f8d79/E4DpXs9r5j.lottie"
            autoplay
            loop
          />
        </div>

        <p className="text-gray-300 mb-6">
          {isStaff ? (
            <>
              Your account is currently set as STAFF role. To access the system, you need to be assigned
              a different role like Store Manager or Admin. Please contact the administrator for role assignment.
            </>
          ) : (
            <>
              Your account has been created successfully, but you don't have a role assigned yet.
              Please contact the administrator to assign you appropriate permissions.
            </>
          )}
        </p>
          <p className="text-gray-400 text-sm mb-6">
          For assistance, contact: <br />
          <a href="mailto:admin@sstore.com" className="text-blue-400 hover:text-blue-300">
            admin
          </a>
        </p>
        
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
        >
          Logout
        </button>
      </motion.div>
    </div>
  );
}

export default NoRoleAssigned;