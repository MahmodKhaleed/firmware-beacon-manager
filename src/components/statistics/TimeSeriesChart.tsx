
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

interface TimeSeriesData {
  date: string;
  burns: number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
}

export const TimeSeriesChart = ({ data }: TimeSeriesChartProps) => {
  return (
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
              data={data}
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
  );
};
