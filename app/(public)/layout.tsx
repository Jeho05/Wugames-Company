import type { ReactNode } from "react";

import { SmoothScroll } from "@/app/components/ui/smooth-scroll";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
