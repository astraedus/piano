import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { HomeGate } from "@/components/HomeGate";
import { AppStateProvider } from "@/hooks/useAppState";

export default function Page() {
  return (
    <AppStateProvider>
      <AppShell>
        <Suspense fallback={null}>
          <HomeGate />
        </Suspense>
      </AppShell>
    </AppStateProvider>
  );
}
