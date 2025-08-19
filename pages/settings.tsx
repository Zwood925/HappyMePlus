import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { signOutUser } from "../lib/firebaseAuth";
import { motion } from "framer-motion";
import GroupSelector from "../components/GroupSelector";
import { getUserSupportGroups, getUserDefaultHappyMomentGroups, updateGroupNotificationPreferences } from "../lib/userProfiles";

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
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <motion.div
        className="max-w-xl w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h1 className="text-2xl font-bold mb-6">Settings ⚙️</h1>

        {errorMsg && <p className="text-red-500 mb-4">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newPassword !== confirmPassword) {
              setErrorMsg("Passwords do not match.");
              setSuccessMsg("");
              return;
            }

            setErrorMsg("");
            setSuccessMsg("Password updated!");
          }}
          className="card bg-base-100 shadow p-6 mb-6"
        >
          <h2 className="font-semibold text-lg mb-4">Change Password</h2>
          <input
            type="password"
            className="input input-bordered w-full mb-3"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="input input-bordered w-full mb-3"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="btn btn-primary w-full" type="submit">
            Update Password
          </button>
        </form>

        <div className="card bg-base-100 shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Preferences</h2>

          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-between">
              <span className="label-text">Enable Notifications</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notificationEnabled}
                onChange={() => setNotificationEnabled(!notificationEnabled)}
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Privacy</span>
            </label>
            <select
              className="select select-bordered"
              value={privacySetting}
              onChange={(e) => setPrivacySetting(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends-only">Friends Only</option>
            </select>
          </div>
        </div>

        {/* Group Settings */}
        <div className="card bg-base-100 shadow p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Group Settings</h2>
          
          {loadingGroups ? (
            <div className="flex justify-center py-4">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Support Groups */}
              <div>
                <h3 className="font-medium text-base mb-3">Support Groups</h3>
                <p className="text-sm text-gray-600 mb-3">
                  These groups will be notified when you're feeling down or having a rough day.
                </p>
                <GroupSelector
                  selectedGroups={supportGroups}
                  onGroupsChange={setSupportGroups}
                  title="Support Groups"
                  description="Groups to notify when you need support:"
                  maxSelection={5}
                />
              </div>

              {/* Default Happy Moment Groups */}
              <div>
                <h3 className="font-medium text-base mb-3">Default Happy Moment Groups</h3>
                <p className="text-sm text-gray-600 mb-3">
                  These groups will be pre-selected when you share happy moments.
                </p>
                <GroupSelector
                  selectedGroups={defaultHappyMomentGroups}
                  onGroupsChange={setDefaultHappyMomentGroups}
                  title="Default Groups"
                  description="Groups to share happy moments with by default:"
                  maxSelection={3}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveGroupPreferences}
                  disabled={savingGroups}
                  className="btn btn-primary"
                >
                  {savingGroups ? (
                    <>
                      <div className="loading loading-spinner loading-sm"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Group Preferences'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Logout Button */}
        <div className="text-center mt-6">
          <button onClick={handleLogout} className="btn btn-warning btn-wide">
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
