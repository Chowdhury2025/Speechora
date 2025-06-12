import Header from "../components/common/Header";
import Profile from "../components/settings/Profile";

import DatabaseBackup from "../components/settings/DatabaseBackup";
// import Security from "../components/settings/Security";
import SystemSettings from "../components/settings/SystemSettings";

const SettingsPage = () => {
  return (    <div className='flex-1 overflow-auto relative z-10 bg-gray-50'>
      <Header title='Settings' />
      <div className="bg-gradient-to-r from-sky_blue-50 to-white border-b">
        <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8">          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your profile, system preferences, and account settings. Changes will be automatically saved and synced across your account.
          </p>
        </div>
      </div>
      <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8 space-y-6'>
        <div className="bg-white rounded-lg shadow-sm">
          <Profile />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <SystemSettings />
        </div>
        {/* <DatabaseBackup /> this is for the dektop offline version Rabbi */}
        {/* <ConnectedAccounts /> */}
      </main>
    </div>
  );
};
export default SettingsPage;
