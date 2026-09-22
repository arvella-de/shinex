"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="focus-ring mt-8 rounded-lg border border-cream/20 px-3 py-2 text-left font-body text-sm text-cream/70 hover:bg-cream/10 hover:text-cream md:mt-0"
    >
      Log out
    </button>
  );
}
