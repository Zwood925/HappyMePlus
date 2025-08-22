import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { signOutUser } from "../lib/firebaseAuth";
import { motion } from "framer-motion";
import GroupSelector from "../components/GroupSelector";
import { getUserSupportGroups, getUserDefaultHappyMomentGroups, updateGroupNotificationPreferences } from "../lib/userProfiles";
import BottomNavigation from "../components/BottomNavigation";

export default function SettingsPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [privacySetting, setPrivacySetting] = useState("public");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Group settings
  const [supportGroups, setSupportGroups] = useState<string[]>([]);
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

  // Load user's group preferences
  useEffect(() => {
    const loadGroupPreferences = async () => {
      if (!user?.uid) return;
      
      try {
        const [support, defaultGroups] = await Promise.all([
          getUserSupportGroups(user.uid),
          getUserDefaultHappyMomentGroups(user.uid)
        ]);
        
        setSupportGroups(support);
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
        supportGroups,
        defaultHappyMomentGroups
      );
      setSuccessMsg('Group preferences saved successfully!');
    } catch (error) {
      console.error('Error saving group preferences:', error);
      setErrorMsg('Failed to save group preferences');
    } finally {
      setSavingGroups(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
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
      <div className="pt-16 pb-20 min-h-screen bg-gray-50">
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

            {/* Privacy */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Privacy</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Privacy</label>
                  <select
                    value={privacySetting}
                    onChange={(e) => setPrivacySetting(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="public">Public - Share with everyone</option>
                    <option value="friends">Friends - Share with friends only</option>
                    <option value="private">Private - Share with no one</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Group Preferences */}
            {!loadingGroups && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Group Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Support Groups</label>
                    <p className="text-sm text-gray-500 mb-3">Groups to notify when you're feeling down</p>
                    <GroupSelector
                      selectedGroups={supportGroups}
                      onGroupsChange={setSupportGroups}
                      title="Select Support Groups"
                      description="Choose groups to notify when you need support:"
                      maxSelection={5}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Share Groups</label>
                    <p className="text-sm text-gray-500 mb-3">Groups to automatically share happy moments with</p>
                    <GroupSelector
                      selectedGroups={defaultHappyMomentGroups}
                      onGroupsChange={setDefaultHappyMomentGroups}
                      title="Select Default Groups"
                      description="Choose groups to automatically share with:"
                      maxSelection={3}
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveGroupPreferences}
                    disabled={savingGroups}
                    className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                  >
                    {savingGroups ? 'Saving...' : 'Save Group Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Sign Out
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
