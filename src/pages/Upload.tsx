
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from "@/components/firmware/upload/UploadForm";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Upload = () => {
  // Ensure we have a valid session (anonymous or authenticated) for RLS policies
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // For simplicity, create an anonymous session to allow uploads
        // In a production app, you might want to use real authentication
        await supabase.auth.signInAnonymously();
        console.log('Created anonymous session for file uploads');
      }
    };
    
    checkSession();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Upload Firmware</CardTitle>
            <CardDescription>Upload a new firmware file for OTA updates</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Upload;
