import { notFound } from "next/navigation";

import { ClientCleanScreen } from "@/app/components/workspace/client/client-clean-screen";
import { ClientMessagerieScreen } from "@/app/components/workspace/client/client-messagerie-screen";
import { ClientMode2Vie } from "@/app/components/workspace/client/client-mode2vie";
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
    return <ClientCleanScreen />;
  }

  if (module === "messages") {
    return <ClientMessagerieScreen />;
  }

  if (module === "mode2vie") {
    return (
      <div className="mx-auto w-full max-w-[880px]">
        <ClientMode2Vie sectionId="espace-mode2vie" />
      </div>
    );
  }

  const definition = getModuleDefinition(module);

  if (!definition) {
    notFound();
  }

  return <ModuleDataBridge definition={definition} slug={module} initialCreateOpen={creer === "1"} />;
}
