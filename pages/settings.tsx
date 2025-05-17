import { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "../components/Layout"; // If you're using a layout component

export default function SettingsPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <h2>Settings</h2>

      {/* Account Management */}
      <h3>Account</h3>
      <p>Email: {user?.email || "Loading..."}</p>

      {/* Password Change */}
      <h4>Change Password</h4>
      <form onSubmit={handlePasswordChange}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ display: "block", marginBottom: "0.5rem" }}
        />
        <button type="submit">Change Password</button>
      </form>

      {/* Sign Out */}
      <h4>Sign Out</h4>
      <button onClick={handleSignOut}>Sign Out</button>

      {/* Notification Preferences */}
      <h3>Notifications</h3>
      <label>
        <input
          type="checkbox"
          checked={notificationEnabled}
          onChange={(e) => setNotificationEnabled(e.target.checked)}
        />
        Enable Encouragement Notifications
      </label>

      {/* About & Help */}
      <h3>About</h3>
      <p>
        HappyMe is a platform designed solely to help you feel happy
      </p>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}
    </>
  );
}
