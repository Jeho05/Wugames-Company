import { notFound } from "next/navigation";

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
  const definition = getModuleDefinition(module);

  if (!definition) {
    notFound();
  }

  return <ModuleDataBridge definition={definition} slug={module} initialCreateOpen={creer === "1"} />;
}
