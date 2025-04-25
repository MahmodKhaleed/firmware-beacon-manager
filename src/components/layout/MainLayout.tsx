
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h1 className="text-2xl font-bold text-firmware-gray-900">
              Firmware Beacon Manager
            </h1>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              {user ? (
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
