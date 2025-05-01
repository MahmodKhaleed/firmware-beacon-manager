
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

interface ChartData {
  name: string;
  burns: number;
  size: number;
  status: string;
}

interface VersionBurnsChartProps {
  data: ChartData[];
}

export const VersionBurnsChart = ({ data }: VersionBurnsChartProps) => {
  return (
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
              data={data}
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
  );
};
