import Header from "../components/common/Header";
import Profile from "../components/settings/Profile";


import SystemSettings from "../components/settings/SystemSettings";

const SettingsPage = () => {
  return (
    <div className='flex-1 overflow-auto relative z-10 bg-white'>
      <Header title='Settings' />
      <div className="bg-[#f7ffec] border-b border-[#e5e5e5]">
        <div className="max-w-4xl mx-auto py-8 px-4 lg:px-8">
          <h1 className="text-2xl font-bold text-[#58cc02] mb-3">Settings</h1>
          <p className="text-[#4b4b4b]">
            Manage your profile, system preferences, and account settings. Changes will be automatically saved and synced across your account.
          </p>
        </div>
      </div>
      <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8 space-y-6'>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
          <Profile />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] hover:border-[#58cc02] transition-colors duration-200">
          <SystemSettings />
        </div>
      </main>
    </div>
  );
};
export default SettingsPage;
