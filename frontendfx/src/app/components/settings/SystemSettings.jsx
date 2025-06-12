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
    Terms_and_conditions: ""
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
      setSettings(data);
      // Update company name in Recoil state
      setCompanyName(data.businessName || "book8 ");
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
      const response = await fetch(`${API_URL}/api/system/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      console.log('Response status:', response.status);
      
      if (!response.ok) throw new Error("Failed to update settings");
      
      const data = await response.json();
      console.log('Updated settings:', data);
      setSettings(data);
      // Update company name in Recoil state after successful update
      setCompanyName(data.businessName || "book8 ");
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

  return (
    <SettingSection icon={Settings} title="System Settings">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Boss Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Boss (Admin)
            </label>
            <select
              name="bossId"
              value={settings.bossId || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={settings.businessName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              name="emailEmail"
              value={settings.emailEmail || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Support Email
            </label>
            <input
              type="email"
              name="supportEmail"
              value={settings.supportEmail || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Email
            </label>
            <input
              type="email"
              name="notificationEmail"
              value={settings.notificationEmail || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto Logout Time (minutes)
            </label>
            <input
              type="number"
              name="autoLogoutTime"
              value={settings.autoLogoutTime || 30}
              onChange={handleChange}
              min="1"
              max="99999"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>  
            <input
              type="text"
              name="contact"
              value={settings.contact || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Payer Number (TPN)
            </label>
            <input
              type="text"
              name="tpn"
              value={settings.tpn || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={settings.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              name="Terms_and_conditions"  
              value={settings.Terms_and_conditions || ""}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky_blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-sky_blue-500 text-white rounded-md hover:bg-sky_blue-600 focus:outline-none focus:ring-2 focus:ring-sky_blue-500 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </SettingSection>
  );
};

export default SystemSettings;