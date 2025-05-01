
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusData {
  name: string;
  value: number;
}

interface StatusChartProps {
  data: StatusData[];
  totalBurns: number;
}

export const StatusChart = ({ data, totalBurns }: StatusChartProps) => {
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
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
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
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
              {data.map((item) => (
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
                      {(item.value / totalBurns * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="font-medium">Total Burns</p>
                <p className="font-bold text-lg">{totalBurns}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
