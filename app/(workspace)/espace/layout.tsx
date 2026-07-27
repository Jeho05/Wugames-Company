"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { BackOfficeShell } from "@/app/components/workspace/back-office-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
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

  return <BackOfficeShell>{children}</BackOfficeShell>;
}
