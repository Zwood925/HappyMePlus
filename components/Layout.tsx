import Link from "next/link";
import { ReactNode } from "react";
import LogoutButton from "./LogoutButton";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>HappyMe Plus</h1>
        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/">Home</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/encouragements">Encouragements</Link>
          <Link href="/settings">Settings</Link>
          <LogoutButton />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
