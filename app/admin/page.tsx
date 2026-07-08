"use client";
import { PortalShell, EmptyState } from "@/components/ui";
export default function Page() {
  return (
    <PortalShell portal="admin" titulo="Em construção" sub="Portal admin">
      <EmptyState emoji="🚧" titulo="Chegando já" />
    </PortalShell>
  );
}
