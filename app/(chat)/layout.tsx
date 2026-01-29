import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { MetricsSidebar } from "@/components/metrics-sidebar";
import { OnboardingWrapper } from "@/components/onboarding-wrapper";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <OnboardingWrapper>
          <Suspense fallback={<div className="flex h-dvh" />}>
            <SidebarWrapper>{children}</SidebarWrapper>
          </Suspense>
        </OnboardingWrapper>
      </DataStreamProvider>
    </>
  );
}

async function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar />
      <SidebarInset className="bg-muted/30">{children}</SidebarInset>
      <MetricsSidebar />
    </SidebarProvider>
  );
}
