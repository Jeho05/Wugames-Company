"use client";

import { useEffect, useState } from "react";

import * as authApi from "@/app/lib/api/auth";
import { ApiError } from "@/app/lib/api-client";
import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, Panel, SectionHeader } from "@/app/components/workspace/dev-digital/ui/primitives";
import { C } from "@/app/components/workspace/dev-digital/theme";
import type { JwtPayload } from "@/app/lib/contracts";

type SecurityState =
  | { phase: "loading" }
  | { phase: "ready"; payload: JwtPayload }
  | { phase: "error"; message: string };

function shortFiliale(id: string | null): string {
  if (!id) return "N/A";
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function SecurityPanel({ firstName }: { firstName: string | null }) {
  const [state, setState] = useState<SecurityState>({ phase: "loading" });

  useEffect(() => {
    let mounted = true;
    authApi
      .me()
      .then((payload) => {
        if (mounted) setState({ phase: "ready", payload });
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof ApiError && error.statusCode === 401 ? "SESSION EXPIRED" : "STATUS UNKNOWN";
        setState({ phase: "error", message });
      });
    return () => {
      mounted = false;
    };
  }, []);

  const twoFa = state.phase === "ready" ? state.payload.two_factor_enabled : null;
  const verified = state.phase === "ready" ? state.payload.two_factor_verified : null;

  const label = twoFa && verified ? "2FA VERIFIED" : twoFa ? "2FA NOT VERIFIED" : "2FA DISABLED";
  const color = twoFa && verified ? C.green : twoFa ? C.amber : C.rose;

  return (
    <Panel>
      <SectionHeader eyebrow="MY SECURITY" title="Posture du compte" />
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <span className="flex items-center gap-2 text-[11px] font-bold text-[#8b96b3]">
            <BreathingDot
              color={state.phase === "loading" ? C.slate : state.phase === "error" ? C.rose : color}
              size={6}
            />
            Double authentification
          </span>
          <span className={"font-mono text-[10px] font-black tracking-wider " + (state.phase === "ready" ? "" : "text-[#5c6889]")} style={state.phase === "ready" ? { color } : undefined}>
            {state.phase === "loading" ? "CHECKING…" : state.phase === "error" ? state.message : label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">Rôle</p>
            <p className="mt-1 truncate font-mono text-[10px] font-bold text-[#c3cbdf]">
              {state.phase === "ready" ? state.payload.role : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">Filiale</p>
            <p className="mt-1 truncate font-mono text-[10px] font-bold text-[#c3cbdf]">
              {state.phase === "ready" ? shortFiliale(state.payload.filiale_id) : "—"}
            </p>
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#4a5675]">
          <Icon name="shield" size={10} style={{ color: C.cyan }} />
          {firstName ? `${firstName} — posture vérifiée sur le jeton courant` : "Posture évaluée sur le jeton courant"}
        </p>
      </div>
    </Panel>
  );
}