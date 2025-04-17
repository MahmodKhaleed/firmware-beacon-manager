
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFirmwareData } from "@/data/mockFirmware";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Upload, MonitorSmartphone } from "lucide-react";
import { Link } from "react-router-dom";

// Prepare data for the chart
const burnDataByDate = mockFirmwareData.reduce((acc: any, curr) => {
  const date = curr.dateUploaded.toISOString().split('T')[0];
  if (!acc[date]) {
    acc[date] = { date, totalBurns: 0 };
  }
  acc[date].totalBurns += curr.burnCount;
  return acc;
}, {});

const chartData = Object.values(burnDataByDate);

const latestVersions = [...mockFirmwareData]
  .sort((a, b) => b.dateUploaded.getTime() - a.dateUploaded.getTime())
  .slice(0, 3);

const Index = () => {
  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firmware Versions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockFirmwareData.length}</div>
            <p className="text-xs text-muted-foreground">
              Manage all versions in the Version History
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Device Burns</CardTitle>
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockFirmwareData.reduce((sum, fw) => sum + fw.burnCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all firmware versions
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Version</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...mockFirmwareData].sort((a, b) => 
                b.dateUploaded.getTime() - a.dateUploaded.getTime())[0].version}
            </div>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date([...mockFirmwareData].sort((a, b) => 
                b.dateUploaded.getTime() - a.dateUploaded.getTime())[0].dateUploaded).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="col-span-1 bg-white lg:col-span-4">
          <CardHeader>
            <CardTitle>Burn Statistics</CardTitle>
            <CardDescription>
              Number of device burns over time across all firmware versions
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalBurns" stroke="#0ea5e9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-white lg:col-span-3">
          <CardHeader>
            <CardTitle>Latest Firmware Versions</CardTitle>
            <CardDescription>
              Recently uploaded firmware files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestVersions.map((fw) => (
                <div key={fw.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{fw.name} {fw.version}</p>
                    <p className="text-sm text-muted-foreground">{fw.description.slice(0, 40)}{fw.description.length > 40 ? '...' : ''}</p>
                    <div className="mt-1 flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        fw.status === 'stable' ? 'bg-green-500' : 
                        fw.status === 'beta' ? 'bg-amber-500' : 
                        'bg-slate-400'
                      }`} />
                      <span className="text-xs capitalize">{fw.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{fw.burnCount} burns</p>
                    <p className="text-xs text-muted-foreground">
                      {fw.dateUploaded.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Link to="/versions" className="text-sm text-firmware-blue-600 hover:underline">
                  View all versions →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Firmware Versions</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="stable">Stable</TabsTrigger>
                  <TabsTrigger value="beta">Beta</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Overview of all firmware versions and their burn statistics
              </CardDescription>
            </CardHeader>
          <Tabs defaultValue="all">
            <CardContent>
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 bg-muted/50 p-3 text-sm font-medium">
                    <div className="col-span-2">Name & Version</div>
                    <div>Status</div>
                    <div>Size</div>
                    <div>Date</div>
                    <div>Burns</div>
                  </div>
                  {mockFirmwareData.map((firmware) => (
                    <div
                      key={firmware.id}
                      className="grid grid-cols-6 gap-4 p-3 text-sm items-center border-t"
                    >
                      <div className="col-span-2">
                        <div className="font-medium">{firmware.name}</div>
                        <div className="text-muted-foreground">{firmware.version}</div>
                      </div>
                      <div>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          firmware.status === 'stable' 
                            ? 'bg-green-100 text-green-800' 
                            : firmware.status === 'beta'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {firmware.status}
                        </div>
                      </div>
                      <div>{(firmware.size / 1024).toFixed(1)} KB</div>
                      <div>{firmware.dateUploaded.toLocaleDateString()}</div>
                      <div>{firmware.burnCount}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="stable">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 bg-muted/50 p-3 text-sm font-medium">
                    <div className="col-span-2">Name & Version</div>
                    <div>Status</div>
                    <div>Size</div>
                    <div>Date</div>
                    <div>Burns</div>
                  </div>
                  {mockFirmwareData
                    .filter(fw => fw.status === 'stable')
                    .map((firmware) => (
                      <div
                        key={firmware.id}
                        className="grid grid-cols-6 gap-4 p-3 text-sm items-center border-t"
                      >
                        <div className="col-span-2">
                          <div className="font-medium">{firmware.name}</div>
                          <div className="text-muted-foreground">{firmware.version}</div>
                        </div>
                        <div>
                          <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {firmware.status}
                          </div>
                        </div>
                        <div>{(firmware.size / 1024).toFixed(1)} KB</div>
                        <div>{firmware.dateUploaded.toLocaleDateString()}</div>
                        <div>{firmware.burnCount}</div>
                      </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="beta">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 bg-muted/50 p-3 text-sm font-medium">
                    <div className="col-span-2">Name & Version</div>
                    <div>Status</div>
                    <div>Size</div>
                    <div>Date</div>
                    <div>Burns</div>
                  </div>
                  {mockFirmwareData
                    .filter(fw => fw.status === 'beta')
                    .map((firmware) => (
                      <div
                        key={firmware.id}
                        className="grid grid-cols-6 gap-4 p-3 text-sm items-center border-t"
                      >
                        <div className="col-span-2">
                          <div className="font-medium">{firmware.name}</div>
                          <div className="text-muted-foreground">{firmware.version}</div>
                        </div>
                        <div>
                          <div className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            {firmware.status}
                          </div>
                        </div>
                        <div>{(firmware.size / 1024).toFixed(1)} KB</div>
                        <div>{firmware.dateUploaded.toLocaleDateString()}</div>
                        <div>{firmware.burnCount}</div>
                      </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
          </Card>
        </div>
    </MainLayout>
  );
};

export default Index;
