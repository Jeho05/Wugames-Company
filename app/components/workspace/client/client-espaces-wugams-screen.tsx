"use client";

import { useEffect, useState } from "react";

import { ClientEspacesWugams } from "@/app/components/workspace/client/client-demandes";
import { demoClientPortalData, loadClientPortalData } from "@/app/lib/client-data";
import type { ClientPortalData } from "@/app/lib/client-data";
import { demoCleansOverview } from "@/app/lib/cleans-data";
import type { CleansOverview } from "@/app/lib/cleans-data";

export function ClientEspacesWugamsScreen() {
  const [data, setData] = useState<ClientPortalData>(demoClientPortalData);
  const [cleans, setCleans] = useState<CleansOverview>(demoCleansOverview);

  useEffect(() => {
    let cancelled = false;
    loadClientPortalData().then((result) => {
      if (cancelled) return;
      setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10 lg:space-y-12">
      <ClientEspacesWugams demandes={data.demandes} cleans={cleans} />
    </div>
  );
}
