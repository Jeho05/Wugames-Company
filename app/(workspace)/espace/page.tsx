"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { AccountantCommandCenter } from "@/app/components/workspace/accountant/accountant-command-center";
import { ClientPortalScreen } from "@/app/components/workspace/client/client-portal-screen";
import { ClientStdScreen } from "@/app/components/workspace/client-std/client-std-screen";
import { DashboardScreen } from "@/app/components/workspace/dashboard-screen";
import { ExecutiveCommandCenter } from "@/app/components/workspace/executive/executive-command-center";
import { OpsCommandCenter } from "@/app/components/workspace/ops/ops-command-center";
import { BranchCommandCenter } from "@/app/components/workspace/branch/branch-command-center";
import { PartnerCommandCenter } from "@/app/components/workspace/partner/partner-command-center";
import { RespOuvriersCommandCenter } from "@/app/components/workspace/resp-ouvriers/resp-ouvriers-command-center";
import { DevDigitalCommandCenter } from "@/app/components/workspace/dev-digital/dev-digital-command-center";
import { WorkerCommandCenter } from "@/app/components/workspace/worker/worker-command-center";
import { SecretaryCommandCenter } from "@/app/components/workspace/secretary/secretary-command-center";
import { SupplierCommandCenter } from "@/app/components/workspace/supplier/supplier-command-center";

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
    return <SupplierCommandCenter />;
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

  if (user.role === "ROLE_MGR_FILIALE") {
    return <BranchCommandCenter />;
  }

  if (user.role === "ROLE_RESP_OUVRIERS") {
    return <RespOuvriersCommandCenter />;
  }

  if (user.role === "ROLE_DEV_DIGITAL") {
    return <DevDigitalCommandCenter />;
  }

  if (user.role === "ROLE_OUVRIER") {
    return <WorkerCommandCenter />;
  }

  if (clientRoles.has(user.role)) {
    const clientUser = {
      audience: "client" as const,
      email: user.email,
      initials: user.initials,
      name: user.name,
      role: user.role,
    };
    return user.role === "ROLE_CLIENT_MEMBRE"
      ? <ClientPortalScreen user={clientUser} />
      : <ClientStdScreen user={clientUser} />;
  }

  return <DashboardScreen />;
}
