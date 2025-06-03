import Header from "../components/common/Header";
import Profile from "../components/settings/Profile";

import DatabaseBackup from "../components/settings/DatabaseBackup";
// import Security from "../components/settings/Security";
import SystemSettings from "../components/settings/SystemSettings";

const SettingsPage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
      <Header title='Settings' />
      <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
       
        <Profile />
       <SystemSettings />
      
        {/* <DatabaseBackup /> this is for the dektop offline version Rabbi */}
        {/* <ConnectedAccounts /> */}
      </main>
    </div>
  );
};
export default SettingsPage;
