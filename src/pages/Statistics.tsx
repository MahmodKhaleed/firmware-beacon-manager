
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStatisticsData } from "@/hooks/useStatisticsData";
import { VersionBurnsChart } from "@/components/statistics/VersionBurnsChart";
import { FirmwareTypeChart } from "@/components/statistics/FirmwareTypeChart";
import { TimeSeriesChart } from "@/components/statistics/TimeSeriesChart";
import { StatusChart } from "@/components/statistics/StatusChart";

const Statistics = () => {
  const { isLoading, error, chartData } = useStatisticsData();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading firmware statistics...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !chartData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64 flex-col gap-4">
          <p className="text-destructive">Error loading firmware data</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }
  
  const { sortedByBurns, firmwareTypeData, statusData, timeSeriesData, totalBurns } = chartData;

  return (
    <MainLayout>
      <div className="grid gap-6">
        <Tabs defaultValue="by-version">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Burn Statistics</h2>
            <TabsList>
              <TabsTrigger value="by-version">By Version</TabsTrigger>
              <TabsTrigger value="by-type">By Firmware Type</TabsTrigger>
              <TabsTrigger value="by-time">Over Time</TabsTrigger>
              <TabsTrigger value="by-status">By Status</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="by-version">
            <VersionBurnsChart data={sortedByBurns} />
          </TabsContent>
          
          <TabsContent value="by-type">
            <FirmwareTypeChart data={firmwareTypeData} />
          </TabsContent>
          
          <TabsContent value="by-time">
            <TimeSeriesChart data={timeSeriesData} />
          </TabsContent>
          
          <TabsContent value="by-status">
            <StatusChart data={statusData} totalBurns={totalBurns} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Statistics;
