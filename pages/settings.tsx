import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { signOutUser } from "../lib/firebaseAuth";
import { motion } from "framer-motion";
import GroupSelector from "../components/GroupSelector";
import { getUserDefaultHappyMomentGroups, updateGroupNotificationPreferences } from "../lib/userProfiles";
import BottomNavigation from "../components/BottomNavigation";

import { getAuth, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; 

export default function SettingsPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [privacySetting, setPrivacySetting] = useState("public");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Group settings
  const [defaultHappyMomentGroups, setDefaultHappyMomentGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [savingGroups, setSavingGroups] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 12 },
    },
  };

  const handleLogout = async () => {
    try {
      const result = await signOutUser();
      if (result.error) {
        console.error("Error signing out:", result.error);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to completely delete your account? This action cannot be undone and will erase all your data."
    );
    
    if (!confirmDelete) return;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid));
        
        await deleteUser(currentUser);
        
        router.push("/signup");
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        setErrorMsg("For security reasons, please sign out and sign back in before deleting your account.");
      } else {
        setErrorMsg("Failed to delete account. Please try again.");
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load user's group preferences
  useEffect(() => {
    const loadGroupPreferences = async () => {
      if (!user?.uid) return;
      
      try {
        const defaultGroups = await getUserDefaultHappyMomentGroups(user.uid);
        setDefaultHappyMomentGroups(defaultGroups);
      } catch (error) {
        console.error('Error loading group preferences:', error);
        setErrorMsg('Failed to load group preferences');
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroupPreferences();
  }, [user?.uid]);

  // Save group preferences
  const handleSaveGroupPreferences = async () => {
    if (!user?.uid) return;
    
    setSavingGroups(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      await updateGroupNotificationPreferences(
        user.uid,
        [], 
        defaultHappyMomentGroups
      );
      setSuccessMsg('Group preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error saving group preferences:', error);
      setErrorMsg('Failed to save group preferences');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setSavingGroups(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Settings</h1>
              <p className="text-xs text-gray-500">Customize your experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-28 min-h-screen bg-gray-50">
        <div className="p-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-4"
          >
            {/* Messages */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{successMsg}</p>
              </div>
            )}

            {/* Account Settings */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Account</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <input
                    type="text"
                    value={user?.displayName || ''}
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get notified about new messages and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationEnabled}
                    onChange={(e) => setNotificationEnabled(e.target.checked)}
                    className="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>

            {/* Group Preferences */}
            {!loadingGroups && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Sharing Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Share Pods</label>
                    <p className="text-sm text-gray-500 mb-3">Pods to automatically share happy moments with</p>
                    <GroupSelector
                      selectedGroups={defaultHappyMomentGroups}
                      onGroupsChange={setDefaultHappyMomentGroups}
                      title="Select Default Pods"
                      description="Choose pods to automatically share with:"
                      maxSelection={3}
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveGroupPreferences}
                    disabled={savingGroups}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {savingGroups ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300"
              >
                Sign Out
              </button>
            </div>

            {/* ADDED: Danger Zone for Account Deletion */}
            <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-100 mt-6">
              <h2 className="text-lg font-semibold mb-2 text-red-800">Danger Zone</h2>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. This will erase all your data.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-transparent border-2 border-red-500 text-red-600 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}