import { AppStateProvider } from "@/hooks/useAppState";
import { OnboardingGate } from "@/components/OnboardingGate";

export default function OnboardingPage() {
  return (
    <AppStateProvider>
      <div className="min-h-screen flex flex-col bg-[color:var(--background)]">
        <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12">
          <OnboardingGate />
        </main>
      </div>
    </AppStateProvider>
  );
}
