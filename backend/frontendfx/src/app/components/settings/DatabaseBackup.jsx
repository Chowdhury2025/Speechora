import { useState, useEffect, useRef } from "react";
import { Database, Download, Upload } from "lucide-react";
import SettingSection from "./SettingSection";
import { API_URL } from "../../../config";
import { motion } from "framer-motion";

const GOOGLE_CLIENT_ID = "105629799353489943653.apps.googleusercontent.com";
const BACKUP_FOLDER_ID = "1D3ALn06h-ZUNqYqv1R4ee_htgh7SZBZ5PvK1yVu2X-8";
const TOKEN_KEY = "gdrive_token";

const DatabaseBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check for token in URL (after OAuth redirect)
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get("access_token");
    
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      window.location.hash = ""; // Clear token from URL
      setIsConnected(true);
    } else {
      // Check if we have a saved token
      const savedToken = localStorage.getItem(TOKEN_KEY);
      setIsConnected(!!savedToken);
    }
  }, []);

  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/settings`;
    const scope = "https://www.googleapis.com/auth/drive.file";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsConnected(false);
    setStatus("");
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setStatus("Creating backup...");
    setProgress(0);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        handleGoogleLogin();
        return;
      }

      setProgress(10);
      
      // Fetch all data with progress updates
      const data = {};
      
      setProgress(20);
      data.users = await (await fetch(`${API_URL}/api/users`)).json();
      
      setProgress(40);
      data.stores = await (await fetch(`${API_URL}/api/stores`)).json();
      
      setProgress(60);
      data.warehouses = await (await fetch(`${API_URL}/api/warehouses`)).json();
      
      setProgress(75);
      data.products = await (await fetch(`${API_URL}/api/products`)).json();
      
      setProgress(85);
      data.sales = await (await fetch(`${API_URL}/api/sales`)).json();

      setProgress(90);

      // Upload to Google Drive
      const metadata = {
        name: `backup-${new Date().toISOString()}.json`,
        parents: [BACKUP_FOLDER_ID],
        mimeType: "application/json"
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", new Blob([JSON.stringify(data)], { type: "application/json" }));

      const upload = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form
        }
      );

      if (!upload.ok) {
        if (upload.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          setIsConnected(false);
          throw new Error("Session expired. Please reconnect to Google Drive.");
        }
        throw new Error("Upload failed");
      }

      setProgress(100);
      setStatus("Backup completed!");
    } catch (error) {
      console.error("Backup failed:", error);
      setStatus(error.message || "Backup failed! Please try again.");
    } finally {
      setTimeout(() => {
        setProgress(0);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleDownloadBackup = async () => {
    setIsLoading(true);
    setStatus("Creating backup...");

    try {
      const responses = await Promise.all([
        fetch(`${API_URL}/api/users`),
        fetch(`${API_URL}/api/stores`),
        fetch(`${API_URL}/api/warehouses`),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/sales`)
      ]);

      const [users, stores, warehouses, products, sales] = await Promise.all(
        responses.map(r => r.json())
      );

      // Sanitize sensitive data
      const sanitizedUsers = users.map(user => {
        const { password, token, emailVerificationToken, ...cleanUser } = user;
        return cleanUser;
      });

      const backupData = {
        users: sanitizedUsers,
        stores,
        warehouses,
        products,
        sales,
        _meta: {
          type: 'inventory_backup',
          version: '1.0',
          timestamp: new Date().toISOString()
        }
      };

      // Create and download the backup file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("Backup downloaded successfully!");
    } catch (error) {
      console.error("Backup failed:", error);
      setStatus(error.message || "Backup failed! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setStatus("Restoring backup...");
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setProgress(20);
          const backupData = JSON.parse(e.target.result);

          setProgress(40);
          // Validate backup format
          if (!backupData._meta?.type === 'inventory_backup') {
            throw new Error('Invalid backup file format');
          }

          setProgress(60);
          // Send the backup data to the server for restoration
          const response = await fetch(`${API_URL}/api/restore`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Transfer-Encoding': 'chunked'
            },
            body: e.target.result
          });

          setProgress(80);

          if (!response.ok) {
            throw new Error('Failed to restore backup');
          }

          const result = await response.json();
          setProgress(100);
          setStatus(result.message || "Backup restored successfully!");
        } catch (error) {
          console.error("Restore failed:", error);
          setStatus(error.message || "Restore failed! Please try again.");
        } finally {
          setTimeout(() => {
            setProgress(0);
            setIsLoading(false);
          }, 1000);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Restore failed:", error);
      setStatus(error.message || "Restore failed! Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <SettingSection icon={Database} title="Database Backup">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {isConnected ? "Connected to Google Drive" : "Connect to backup your data to Google Drive"}
          </p>
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
            >
              Connect
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <button
              onClick={handleDownloadBackup}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {isLoading ? "Processing..." : "Download Backup"}
            </button>
          </div>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestore}
              accept=".json"
              className="hidden"
              id="restore-file"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              {isLoading ? "Processing..." : "Restore from Backup"}
            </button>
          </div>
        </div>

        <button
          onClick={handleBackup}
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Create Backup"}
        </button>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {status && (
          <p className={`text-sm ${
            status.includes("failed") || status.includes("expired") 
              ? "text-red-400" 
              : "text-green-400"
          }`}>
            {status}
          </p>
        )}

        <p className="text-sm text-gray-400 mt-4">
          Backup your database to protect against data loss. The backup file includes all your inventory data, sales records, and user information (excluding sensitive data).
        </p>
      </div>
    </SettingSection>
  );
};

export default DatabaseBackup;