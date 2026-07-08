"use client";
import { PortalShell, EmptyState } from "@/components/ui";
export default function Page() {
  return (
    <PortalShell portal="hunter" titulo="Em construção" sub="Portal hunter">
      <EmptyState emoji="🚧" titulo="Chegando já" />
    </PortalShell>
  );
}
