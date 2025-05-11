
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BurnRequests } from "@/components/firmware/BurnRequests";
import { BurnSimulator } from "@/components/firmware/BurnSimulator";

const BurnMonitor = () => {
  return (
    <MainLayout>
      <div className="grid gap-6">
        <Tabs defaultValue="requests">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Burn Operations Monitor</h2>
            <TabsList>
              <TabsTrigger value="requests">Burn Requests</TabsTrigger>
              <TabsTrigger value="simulator">Burn Simulator</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="requests">
            <BurnRequests />
          </TabsContent>
          
          <TabsContent value="simulator">
            <BurnSimulator />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BurnMonitor;
