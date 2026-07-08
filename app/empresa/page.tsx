"use client";
import { PortalShell, EmptyState } from "@/components/ui";
export default function Page() {
  return (
    <PortalShell portal="empresa" titulo="Em construção" sub="Portal empresa">
      <EmptyState emoji="🚧" titulo="Chegando já" />
    </PortalShell>
  );
}
