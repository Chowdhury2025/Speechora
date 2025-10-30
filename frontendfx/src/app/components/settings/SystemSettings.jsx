import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import SettingSection from "./SettingSection";
import { API_URL } from "../../../config";
import { useSetRecoilState } from "recoil";
import { companyNameState } from "../../../atoms";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    emailEmail: "",
    adminEmail: "",
    businessName: "",
    supportEmail: "",
    notificationEmail: "",
    autoLogoutTime: 30,
    bossId: null,
    contact: "",
    tpn: "",
    address: "",
    Terms_and_conditions: "",
    premiumPricing: "50"
  });
  const [mobileDefaults, setMobileDefaults] = useState({
    languageOverride: 'en',
    homeButtons: '', // comma separated labels for simple storage
    appIconUrl: '',
    splashIconUrl: '',
    orientation: 'portrait',
    downloadOnInitialLogin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const setCompanyName = useSetRecoilState(companyNameState);

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/system/settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      // Map backend response to local settings state
      setSettings(data);
      setMobileDefaults(data.mobileDefaults || {
        languageOverride: 'en',
        homeButtons: '',
        appIconUrl: '',
        splashIconUrl: '',
        orientation: 'portrait',
        downloadOnInitialLogin: false
      });
      // Update company name in Recoil state
      setCompanyName(data.businessName || "Speechora ");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting settings:', settings);
      // include mobile defaults in payload
      const payload = { ...settings, mobileDefaults };
      const response = await fetch(`${API_URL}/api/system/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log('Response status:', response.status);
      
      if (!response.ok) throw new Error("Failed to update settings");
      
      const data = await response.json();
      console.log('Updated settings:', data);
      setSettings(data);
      setMobileDefaults(data.mobileDefaults || mobileDefaults);
      // Update company name in Recoil state after successful update
      setCompanyName(data.businessName || "Speechora ");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === "bossId" ? (value ? parseInt(value, 10) : null) : value
    }));
  };

  const handleMobileDefaultChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMobileDefaults(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <SettingSection icon={Settings} title="System Settings">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boss Selection */}
          <div>
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Boss (Admin)
            </label>
            <select
              name="bossId"
              value={settings.bossId || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium text-[#4b4b4b] bg-white"
            >
              <option value="">Select a boss</option>
              {users
                .filter(user => user.role === "ADMIN" || user.role === "SUPERUSER")
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username || user.email}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={settings.businessName || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Support Email
            </label>
            <input
              type="email"
              name="supportEmail"
              value={settings.supportEmail || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Notification Email
            </label>
            <input
              type="email"
              name="notificationEmail"
              value={settings.notificationEmail || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Monthly Premium Price (ZMK)
            </label>
            <input
              type="number"
              name="premiumPricing"
              value={settings.premiumPricing || "50"}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
              placeholder="Enter monthly premium price"
            />
            <p className="text-sm text-gray-600 mt-1">
              This is the monthly deduction amount for premium subscriptions
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-[#3C3C3C] mb-2">
              Terms and Conditions
            </label>
            <textarea
              name="Terms_and_conditions"  
              value={settings.Terms_and_conditions || ""}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#58cc02] focus:ring-1 focus:ring-[#58cc02] font-medium"
            />
          </div>

          {/* Mobile defaults section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-[#3c9202] mb-3">Mobile App Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language Override</label>
                <select name="languageOverride" value={mobileDefaults.languageOverride} onChange={handleMobileDefaultChange} className="w-full px-4 py-3 border-2 rounded-xl">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="pt">Portuguese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Buttons (comma-separated)</label>
                <input type="text" name="homeButtons" value={mobileDefaults.homeButtons} onChange={handleMobileDefaultChange} className="w-full px-4 py-3 border-2 rounded-xl" placeholder="e.g. Home,Profile,Settings" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Icon URL</label>
                <input type="text" name="appIconUrl" value={mobileDefaults.appIconUrl} onChange={handleMobileDefaultChange} className="w-full px-4 py-3 border-2 rounded-xl" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Splash Icon URL</label>
                <input type="text" name="splashIconUrl" value={mobileDefaults.splashIconUrl} onChange={handleMobileDefaultChange} className="w-full px-4 py-3 border-2 rounded-xl" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                <select name="orientation" value={mobileDefaults.orientation} onChange={handleMobileDefaultChange} className="w-full px-4 py-3 border-2 rounded-xl">
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="any">Any</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="downloadOnInitialLogin" name="downloadOnInitialLogin" checked={mobileDefaults.downloadOnInitialLogin} onChange={handleMobileDefaultChange} />
                <label htmlFor="downloadOnInitialLogin" className="text-sm">Download app assets on initial login</label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#58cc02] hover:bg-[#47b102] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 border-b-2 border-[#3c9202] hover:border-[#2e7502] focus:outline-none focus:ring-2 focus:ring-[#58cc02] focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </SettingSection>
  );
};

export default SystemSettings;