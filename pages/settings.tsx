import { useState } from "react";
import { useRouter } from "next/router";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { signOutUser } from "../lib/firebaseAuth";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user } = useFirebaseAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [privacySetting, setPrivacySetting] = useState("public");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
