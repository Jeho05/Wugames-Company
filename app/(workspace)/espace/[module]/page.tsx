import { notFound } from "next/navigation";

import { ClientCleanScreen } from "@/app/components/workspace/client/client-clean-screen";
import { ClientMessagerieScreen } from "@/app/components/workspace/client/client-messagerie-screen";
import { ClientMode2Vie } from "@/app/components/workspace/client/client-mode2vie";
import { ModuleAccessGuard } from "@/app/components/workspace/module-access-guard";
import { ModuleDataBridge } from "@/app/components/workspace/module-data-bridge";
import { getModuleDefinition } from "@/app/lib/demo-data";

export default async function WorkspaceModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ creer?: string }>;
}) {
  const { module } = await params;
  const { creer } = await searchParams;

  if (module === "demandes") {
    return (
      <ModuleAccessGuard slug="demandes">
        <ClientCleanScreen />
      </ModuleAccessGuard>
    );
  }

  if (module === "messages") {
    return (
      <ModuleAccessGuard slug="messages">
        <ClientMessagerieScreen />
      </ModuleAccessGuard>
    );
  }

  if (module === "mode2vie") {
    return (
      <ModuleAccessGuard slug="mode2vie">
        <div className="mx-auto w-full max-w-[880px]">
          <ClientMode2Vie sectionId="espace-mode2vie" />
        </div>
      </ModuleAccessGuard>
    );
  }

  const definition = getModuleDefinition(module);

  if (!definition) {
    notFound();
  }

  return (
    <ModuleAccessGuard slug={module}>
      <ModuleDataBridge definition={definition} slug={module} initialCreateOpen={creer === "1"} />
    </ModuleAccessGuard>
  );
}
