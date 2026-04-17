import { AppStateProvider } from "@/hooks/useAppState";
import { Onboarding } from "@/components/Onboarding";

export default function OnboardingPage() {
  return (
    <AppStateProvider>
      <div className="min-h-screen flex flex-col bg-[color:var(--background)]">
        <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12">
          <Onboarding />
        </main>
      </div>
    </AppStateProvider>
  );
}
