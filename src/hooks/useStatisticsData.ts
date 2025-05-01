
import { useFirmware } from "./useFirmware";
import { Firmware } from "@/types/firmware";

export const useStatisticsData = () => {
  const { data: firmwareData, isLoading, error } = useFirmware();

  // Prepare data for charts if firmware data is available
  const prepareChartData = () => {
    if (!firmwareData) return null;

    // Data prep for charts
    const firmwareVersions = firmwareData.map(fw => ({
      name: `${fw.name} ${fw.version}`,
      burns: fw.burnCount,
      size: Math.round(fw.size / 1024),
      status: fw.status,
    }));
    
    // Sort by burn count
    const sortedByBurns = [...firmwareVersions].sort((a, b) => b.burns - a.burns);
    
    // Group by firmware name
    const burnsByFirmwareType = firmwareData.reduce((acc: Record<string, { name: string, burns: number, versions: number }>, curr) => {
      const baseName = curr.name;
      if (!acc[baseName]) {
        acc[baseName] = { name: baseName, burns: 0, versions: 0 };
      }
      acc[baseName].burns += curr.burnCount;
      acc[baseName].versions += 1;
      return acc;
    }, {});
    
    const firmwareTypeData = Object.values(burnsByFirmwareType);
    
    // Group by status
    const burnsByStatus = firmwareData.reduce((acc: Record<string, { name: string, value: number }>, curr) => {
      const status = curr.status;
      if (!acc[status]) {
        acc[status] = { name: status, value: 0 };
      }
      acc[status].value += curr.burnCount;
      return acc;
    }, {});
    
    const statusData = Object.values(burnsByStatus);
  
    // For time series chart
    const burnsByMonth: Record<string, number> = {};
    firmwareData.forEach(fw => {
      const monthYear = `${fw.dateUploaded.getMonth() + 1}/${fw.dateUploaded.getFullYear()}`;
      if (!burnsByMonth[monthYear]) {
        burnsByMonth[monthYear] = 0;
      }
      burnsByMonth[monthYear] += fw.burnCount;
    });
    
    const timeSeriesData = Object.entries(burnsByMonth).map(([date, burns]) => ({
      date,
      burns
    })).sort((a, b) => {
      const [aMonth, aYear] = a.date.split('/').map(Number);
      const [bMonth, bYear] = b.date.split('/').map(Number);
      
      return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
    });

    return {
      sortedByBurns,
      firmwareTypeData,
      statusData,
      timeSeriesData,
      totalBurns: firmwareData.reduce((sum, fw) => sum + fw.burnCount, 0)
    };
  };

  return {
    isLoading,
    error,
    firmwareData,
    chartData: prepareChartData()
  };
};
