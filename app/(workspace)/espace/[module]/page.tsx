import { notFound } from "next/navigation";

import { ModuleScreen } from "@/app/components/workspace/module-screen";
import { FilialeCreateForm } from "@/app/components/workspace/filiale-create-form";
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

  if (module === "filiales") {
    return (
      <ModuleScreen
        definition={definition}
        renderCreateForm={(props) => <FilialeCreateForm {...props} />}
      />
    );
  }

  return <ModuleScreen definition={definition} />;
}
