
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockFirmwareData } from "@/data/mockFirmware";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Statistics = () => {
  // Data prep for charts
  const firmwareVersions = mockFirmwareData.map(fw => ({
    name: `${fw.name} ${fw.version}`,
    burns: fw.burnCount,
    size: Math.round(fw.size / 1024),
    status: fw.status,
  }));
  
  // Sort by burn count
  const sortedByBurns = [...firmwareVersions].sort((a, b) => b.burns - a.burns);
  
  // Group by firmware name
  const burnsByFirmwareType = mockFirmwareData.reduce((acc: any, curr) => {
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
  const burnsByStatus = mockFirmwareData.reduce((acc: any, curr) => {
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
  mockFirmwareData.forEach(fw => {
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

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Device Burns by Firmware Version</CardTitle>
                <CardDescription>
                  Comparison of burn counts across different firmware versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedByBurns}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="burns" 
                        name="Device Burns" 
                        fill="#0ea5e9" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="by-type">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Device Burns by Firmware Type</CardTitle>
                <CardDescription>
                  Aggregated burn statistics grouped by firmware type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={firmwareTypeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="burns" 
                          name="Total Burns" 
                          fill="#0ea5e9" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Firmware Type Summary</h3>
                    <div className="space-y-4">
                      {firmwareTypeData.map((item: any) => (
                        <div key={item.name} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.versions} versions</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{item.burns}</p>
                            <p className="text-sm text-muted-foreground">total burns</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="by-time">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Device Burns Over Time</CardTitle>
                <CardDescription>
                  Monthly trend of firmware burn activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="burns" 
                        name="Monthly Burns" 
                        fill="#0ea5e9" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="by-status">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Device Burns by Firmware Status</CardTitle>
                <CardDescription>
                  Distribution of device burns across different firmware statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} burns`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Status Summary</h3>
                    <div className="space-y-4">
                      {statusData.map((item: any) => (
                        <div key={item.name} className="flex justify-between items-center border-b pb-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${
                              item.name === 'stable' ? 'bg-green-500' : 
                              item.name === 'beta' ? 'bg-yellow-500' : 
                              'bg-gray-500'
                            }`} />
                            <p className="font-medium capitalize">{item.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{item.value}</p>
                            <p className="text-sm text-muted-foreground">
                              {(item.value / mockFirmwareData.reduce((sum, fw) => sum + fw.burnCount, 0) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Total Burns</p>
                        <p className="font-bold text-lg">
                          {mockFirmwareData.reduce((sum, fw) => sum + fw.burnCount, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Statistics;
