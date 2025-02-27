import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface SizeBarChartProps {
  data: { name: string; size: number }[];
  fillColor?: string;
}

export default function SizeBarChart({ data, fillColor = '#8884d8' }: SizeBarChartProps) {
  return (
    <BarChart width={500} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="size" fill={fillColor} />
    </BarChart>
  );
}