
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { migrateAllFirmware } from "@/utils/firmwareMigrationUtils";
import { useFirmware } from "@/hooks/useFirmware";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Migration = () => {
  const { toast } = useToast();
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const { data: firmwares, isLoading, refetch } = useFirmware();

  const handleMigration = async () => {
    setMigrating(true);
    try {
      const migrationResults = await migrateAllFirmware();
      setResults(migrationResults);
      
      // Refresh firmware data
      refetch();
      
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${migrationResults.success} firmware files. ${migrationResults.failed} migrations failed.`,
      });
    } catch (error) {
      console.error("Migration failed:", error);
      toast({
        title: "Migration Failed",
        description: "An error occurred during the migration process",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  // Count firmware that need migration (have no file_url)
  const needsMigration = firmwares?.filter(fw => !fw.file_url).length || 0;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Firmware Migration Tool</CardTitle>
            <CardDescription>
              Process firmware entries missing file URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTitle>Migration Information</AlertTitle>
              <AlertDescription>
                This tool will process firmware records that don't have associated file URLs.
                This is a maintenance operation to ensure all firmware records have valid file references.
              </AlertDescription>
            </Alert>

            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <p><strong>Total firmware records:</strong> {firmwares?.length || 0}</p>
                  <p><strong>Records to process:</strong> {needsMigration}</p>
                  
                  {results && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium mb-2">Migration Results</h3>
                      <p>Successfully migrated: {results.success}</p>
                      <p>Failed migrations: {results.failed}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleMigration}
                  disabled={migrating || needsMigration === 0}
                  className="w-full"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Firmware Files"
                  )}
                </Button>

                {needsMigration === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    All firmware files have already been processed.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Migration;
