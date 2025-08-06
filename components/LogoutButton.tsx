import { useRouter } from "next/router";
import { signOutUser } from "../lib/firebaseAuth";

export default function LogoutButton() {
  const router = useRouter();

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

  return <button onClick={handleLogout}>Logout</button>;
}
