
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ReactNode } from "react";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 relative">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden inline-flex items-center justify-center rounded-md h-10 w-10 text-foreground hover:bg-muted">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-2xl font-bold tracking-tight">
                Automotive FOTA Manager
              </h1>
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
