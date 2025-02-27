import { PieChart, Pie, Cell } from 'recharts';

interface SizePieChartProps {
  data: { name: string; size: number }[];
}

export default function SizePieChart({ data }: SizePieChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        dataKey="size"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  );
}