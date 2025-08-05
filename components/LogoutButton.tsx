import { useRouter } from "next/router";
import { signOutUser } from "../lib/firebaseAuth";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
