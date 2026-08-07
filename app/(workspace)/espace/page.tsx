"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";

const AccountantCommandCenter = dynamic(
  () => import("@/app/components/workspace/accountant/accountant-command-center").then((m) => ({ default: m.AccountantCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const ClientPortalScreen = dynamic(
  () => import("@/app/components/workspace/client/client-portal-screen").then((m) => ({ default: m.ClientPortalScreen })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const ClientStdScreen = dynamic(
  () => import("@/app/components/workspace/client-std/client-std-screen").then((m) => ({ default: m.ClientStdScreen })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const DashboardScreen = dynamic(
  () => import("@/app/components/workspace/dashboard-screen").then((m) => ({ default: m.DashboardScreen })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const ExecutiveCommandCenter = dynamic(
  () => import("@/app/components/workspace/executive/executive-command-center").then((m) => ({ default: m.ExecutiveCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const OpsCommandCenter = dynamic(
  () => import("@/app/components/workspace/ops/ops-command-center").then((m) => ({ default: m.OpsCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const BranchCommandCenter = dynamic(
  () => import("@/app/components/workspace/branch/branch-command-center").then((m) => ({ default: m.BranchCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const PartnerCommandCenter = dynamic(
  () => import("@/app/components/workspace/partner/partner-command-center").then((m) => ({ default: m.PartnerCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const RespOuvriersCommandCenter = dynamic(
  () => import("@/app/components/workspace/resp-ouvriers/resp-ouvriers-command-center").then((m) => ({ default: m.RespOuvriersCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const DevDigitalCommandCenter = dynamic(
  () => import("@/app/components/workspace/dev-digital/dev-digital-command-center").then((m) => ({ default: m.DevDigitalCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const WorkerCommandCenter = dynamic(
  () => import("@/app/components/workspace/worker/worker-command-center").then((m) => ({ default: m.WorkerCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const SecretaryCommandCenter = dynamic(
  () => import("@/app/components/workspace/secretary/secretary-command-center").then((m) => ({ default: m.SecretaryCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);
const SupplierCommandCenter = dynamic(
  () => import("@/app/components/workspace/supplier/supplier-command-center").then((m) => ({ default: m.SupplierCommandCenter })),
  { ssr: false, loading: () => <RoleSkeleton /> },
);

const clientRoles = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

function RoleSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-28 rounded-2xl bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="h-20 rounded-xl bg-slate-200/60" />
        <div className="h-20 rounded-xl bg-slate-200/60" />
        <div className="h-20 rounded-xl bg-slate-200/60" />
        <div className="h-20 rounded-xl bg-slate-200/60" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-200/50" />
    </div>
  );
}

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
