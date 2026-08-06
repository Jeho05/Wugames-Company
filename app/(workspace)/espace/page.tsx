"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { AccountantCommandCenter } from "@/app/components/workspace/accountant/accountant-command-center";
import { ClientDashboardScreen } from "@/app/components/workspace/client-dashboard-screen";
import { DashboardScreen } from "@/app/components/workspace/dashboard-screen";
import { ExecutiveCommandCenter } from "@/app/components/workspace/executive/executive-command-center";
import { OpsCommandCenter } from "@/app/components/workspace/ops/ops-command-center";
import { PartnerCommandCenter } from "@/app/components/workspace/partner/partner-command-center";
import { SecretaryCommandCenter } from "@/app/components/workspace/secretary/secretary-command-center";
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

  if (user.role === "ROLE_GERANT") {
    return <ExecutiveCommandCenter />;
  }

  if (user.role === "ROLE_SECRETAIRE") {
    return <SecretaryCommandCenter />;
  }

  if (user.role === "ROLE_COMPTABLE") {
    return <AccountantCommandCenter />;
  }

  if (user.role === "ROLE_MGR_OPS") {
    return <OpsCommandCenter />;
  }

  if (user.role === "ROLE_MGR_PARTENAIRE") {
    return <PartnerCommandCenter />;
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
