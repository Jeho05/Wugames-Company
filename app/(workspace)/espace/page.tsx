"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { ClientDashboardScreen } from "@/app/components/workspace/client-dashboard-screen";
import { DashboardScreen } from "@/app/components/workspace/dashboard-screen";
import { SupplierDashboardScreen } from "@/app/components/workspace/supplier-dashboard-screen";

const clientRoles = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

export default function WorkspaceDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/connexion");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (user.role === "ROLE_FOURNISSEUR") {
    return <SupplierDashboardScreen />;
  }

  if (clientRoles.has(user.role)) {
    const clientUser = {
      audience: "client" as const,
      email: user.email,
      initials: user.initials,
      name: user.name,
      role: user.role,
    };
    return <ClientDashboardScreen user={clientUser} />;
  }

  return <DashboardScreen />;
}
