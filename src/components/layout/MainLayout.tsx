
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar />
        <main className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h1 className="text-2xl font-bold text-firmware-gray-900 dark:text-firmware-gray-50">
              Firmware Beacon Manager
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle asSwitch={true} />
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
