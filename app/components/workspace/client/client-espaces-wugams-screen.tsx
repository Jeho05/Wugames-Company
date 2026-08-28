"use client";

import { useEffect, useState } from "react";

import { ClientEspacesWugams } from "@/app/components/workspace/client/client-demandes";
import { loadClientPortalData } from "@/app/lib/client-data";
import type { ClientPortalData } from "@/app/lib/client-data";
import { demoCleansOverview } from "@/app/lib/cleans-data";
import type { CleansOverview } from "@/app/lib/cleans-data";

export function ClientEspacesWugamsScreen() {
  const [data, setData] = useState<ClientPortalData | null>(null);
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

  if (!data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-2xl bg-slate-200/70" />
        <div className="h-48 rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-12">
      <ClientEspacesWugams demandes={data.demandes} cleans={cleans} />
    </div>
  );
}
