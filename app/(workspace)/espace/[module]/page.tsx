import { notFound } from "next/navigation";

import { ModuleScreen } from "@/app/components/workspace/module-screen";
import { getModuleDefinition } from "@/app/lib/demo-data";

export default async function WorkspaceModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const definition = getModuleDefinition(module);

  if (!definition) {
    notFound();
  }

  return <ModuleScreen definition={definition} />;
}
