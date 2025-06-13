
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { userStates } from '../atoms';
import { useNavigate } from 'react-router-dom';
import { colorGuide, componentStyles } from '../theme/colors';
import AuthLayout from './AuthLayout';

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
    <AuthLayout>
      <div className={`flex flex-col items-center justify-center min-h-screen ${colorGuide.neutral.bgPage} px-4`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md w-full ${colorGuide.neutral.bgCard} rounded-lg shadow-xl p-8 text-center ${componentStyles.card.base}`}
        >
          <h1 className={`text-2xl font-bold ${colorGuide.neutral.textPrimary} mb-4`}>
            Access Restricted
          </h1>
          <p className={`${colorGuide.neutral.textSecondary} mb-4`}>
            Your account is not authorized to access this system. Please contact the administrator for assistance.
          </p>
          
          <div className="w-64 h-64 mx-auto mb-6">
            <DotLottieReact
              src="https://lottie.host/c99623c9-8940-4c1d-a319-56a3460f8d79/E4DpXs9r5j.lottie"
              autoplay
              loop
            />
          </div>

          <p className={`${colorGuide.neutral.textSecondary} mb-6`}>
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

          <button
            onClick={handleLogout}
            className={`w-full ${componentStyles.button.primary}`}
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

export default NoRoleAssigned;