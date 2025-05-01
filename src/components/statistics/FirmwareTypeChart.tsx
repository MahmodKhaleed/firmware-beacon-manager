
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FirmwareTypeData {
  name: string;
  burns: number;
  versions: number;
}

interface FirmwareTypeChartProps {
  data: FirmwareTypeData[];
}

export const FirmwareTypeChart = ({ data }: FirmwareTypeChartProps) => {
  return (
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
                data={data}
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
              {data.map((item) => (
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
  );
};
