import { useRecoilValue } from "recoil";
import Header from "../components/common/Header";
import InventoryAndSalesScreen from "./InventoryAndSalesScreen";
import SalesOverviewChart from "../components/sales/SalesOverviewChart";
import { userStates } from "../../atoms";
import CalendarWithPopupTable from "../components/InventoryAndSalesScreen/CalendarSales";
import { API_URL } from "../../config";

const SalesPage = () => {
  // Get the logged-in user's info
  const user = useRecoilValue(userStates);
  // Define roles that get the sales overview chart
  const adminRoles = ["ADMIN", "SUPERUSER", "INSPECTOR"];
  
  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Sales Dashboard' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {adminRoles.includes(user.role) ? (
          <>
            <SalesOverviewChart />
            <div className="mt-8">
              <CalendarWithPopupTable 
                API_URL={API_URL}
                userState={user}
              />
            </div>
          </>
        ) : (
          <InventoryAndSalesScreen />
        )}
      </main>
    </div>
  );
};

export default SalesPage;
