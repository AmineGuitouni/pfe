"use client";

import React, { useState } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";

interface PieChartProps {
  data: Record<string, number>;
  colorMap?: Record<string, string>;
}

const DEFAULT_COLORS = {
  "To Do": "#7dd5de",
  "In Progress": "#D69E2E",
  Completed: "#38A169",
  Blocked: "#E53E3E",
  default: "#8884d8",
};


const PieChart: React.FC<PieChartProps> = ({ data, colorMap = DEFAULT_COLORS }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getColor = (status: string): string => {
      if (colorMap && colorMap !== DEFAULT_COLORS) {
          if (Object.prototype.hasOwnProperty.call(colorMap, status)) {
              return (colorMap as Record<string, string>)[status];
          }
          if (Object.prototype.hasOwnProperty.call(colorMap, 'default')) {
              return (colorMap as Record<string, string>)['default'];
          }
      }
      if (Object.prototype.hasOwnProperty.call(DEFAULT_COLORS, status)) {
          return DEFAULT_COLORS[status as keyof typeof DEFAULT_COLORS];
      }
      return DEFAULT_COLORS.default;
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, payload, percent } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 5) * cos;
    const sy = cy + (outerRadius + 5) * sin;
    const mx = cx + (outerRadius + 15) * cos;
    const my = cy + (outerRadius + 15) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 18;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const shapeFill = getColor(payload.name);

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={shapeFill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 4}
          outerRadius={outerRadius + 8}
          fill={shapeFill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={shapeFill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={shapeFill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="#FFFFFF" fontSize="14px">{`${payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} dy={18} textAnchor={textAnchor} fill="#cbd5e1" fontSize="12px">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };


  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsPieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={110}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          onMouseEnter={onPieEnter}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(entry.name)}
              stroke={activeIndex === index ? '#fff' : 'none'}
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Legend wrapperStyle={{ color: "#ffffff", paddingTop: '20px' }} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;