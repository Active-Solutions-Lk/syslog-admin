"use client";

import { Button } from "@/components/ui/button";
import { Logout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await Logout();
      if (result.success) {
        // Redirect to login page after successful logout
        router.push('/auth/login');
        router.refresh();
      } else {
        console.error("Logout failed:", result.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}