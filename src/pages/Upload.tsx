
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from "@/components/firmware/upload/UploadForm";

const Upload = () => {
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
