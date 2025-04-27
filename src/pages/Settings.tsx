
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import AdminSettings from "@/components/settings/AdminSettings";
import UserSettings from "@/components/settings/UserSettings";
import { toast } from "@/components/ui/sonner";

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to access settings");
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Manage your account and system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="user" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="user">User Settings</TabsTrigger>
                {isAdmin && <TabsTrigger value="admin">Admin Controls</TabsTrigger>}
              </TabsList>
              <TabsContent value="user" className="space-y-4">
                <UserSettings />
              </TabsContent>
              {isAdmin && (
                <TabsContent value="admin" className="space-y-4">
                  <AdminSettings />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
