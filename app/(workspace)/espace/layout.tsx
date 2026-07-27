import type { ReactNode } from "react";

import { BackOfficeShell } from "@/app/components/workspace/back-office-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <BackOfficeShell>{children}</BackOfficeShell>;
}
