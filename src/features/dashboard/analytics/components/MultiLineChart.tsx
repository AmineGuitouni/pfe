"use client";

import React from "react";
import {
  AreaChart, // Change from LineChart to AreaChart
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area, // Import Area
} from "recharts";

// Define the structure for status counts
type StatusCounts = Record<"To Do" | "In Progress" | "Completed" | "Blocked", number>;

// Define the structure for data points with hour or day label
type HourlyDataPoint = StatusCounts & { hour: string };
type DailyDataPoint = StatusCounts & { day: number };

// Union type for the chart data points received as props
type ChartDataPoint = HourlyDataPoint | DailyDataPoint;


// Define the props for the component
interface MultiLineChartProps {
  chartData: ChartDataPoint[];
  dateType: 'month-year' | 'day-month-year'; // Add dateType prop
}


const MultiLineChart: React.FC<MultiLineChartProps> = ({ chartData, dateType }) => { // Add dateType to props

  // Data is now received pre-formatted with 'hour' or 'day' key.
  // No need for the previous transformation to add xAxisTick.

  // Define colors for the lines (using design sheet where applicable)
  const colors = {
    "To Do": "#7dd5de",       // text-light_blue-500 -> hex from designSheet.md
    "In Progress": "#D69E2E", // text-yellow-600 -> hex
    Completed: "#38A169",     // text-green-600 -> hex
    Blocked: "#E53E3E",       // text-red-600 -> hex
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart // Use AreaChart container
        data={chartData} // Use chartData directly
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* Define SVG gradients for area fills */}
        <defs>
          <linearGradient id="gradientToDo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors["To Do"]} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={colors["To Do"]} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradientInProgress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors["In Progress"]} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={colors["In Progress"]} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.Completed} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={colors.Completed} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradientBlocked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.Blocked} stopOpacity={0.4}/>
            <stop offset="95%" stopColor={colors.Blocked} stopOpacity={0}/>
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#374151" /> {/* Darker grid for contrast */}
        <XAxis
          dataKey={dateType === 'day-month-year' ? 'hour' : 'day'} // Dynamic dataKey
          stroke="#8ab0e0" // light_blue
          tick={{ fill: "#8ab0e0" }}
          axisLine={{ stroke: "#8ab0e0" }}
          tickLine={{ stroke: "#8ab0e0" }}
        />
        <YAxis
          stroke="#8ab0e0" // light_blue
          tick={{ fill: "#8ab0e0" }}
          axisLine={{ stroke: "#8ab0e0" }}
          tickLine={{ stroke: "#8ab0e0" }}
          allowDecimals={false} // Ensure Y-axis shows whole numbers for counts
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#212c30", // modal_bg
            borderColor: "#7dd5de", // light_blue-500
            color: "#ffffff", // white text
          }}
          itemStyle={{ color: "#ffffff" }}
          cursor={{ stroke: "#7dd5de", strokeWidth: 1 }} // light_blue-500 cursor
        />
        <Legend wrapperStyle={{ color: "#ffffff" }} />
        {/* Area components with stroke and fill */}
        <Area
          type="monotone"
          dataKey="To Do"
          stroke={colors["To Do"]}
          strokeWidth={2}
          fillOpacity={1} // Use gradient opacity
          fill="url(#gradientToDo)"
          activeDot={{ r: 6, fill: colors["To Do"], stroke: "#fff", strokeWidth: 2 }} // Enhanced active dot
          dot={{ r: 3, fill: colors["To Do"] }}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="In Progress"
          stroke={colors["In Progress"]}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#gradientInProgress)"
          activeDot={{ r: 6, fill: colors["In Progress"], stroke: "#fff", strokeWidth: 2 }}
          dot={{ r: 3, fill: colors["In Progress"] }}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="Completed"
          stroke={colors.Completed}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#gradientCompleted)"
          activeDot={{ r: 6, fill: colors.Completed, stroke: "#fff", strokeWidth: 2 }}
          dot={{ r: 3, fill: colors.Completed }}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="Blocked"
          stroke={colors.Blocked}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#gradientBlocked)"
          activeDot={{ r: 6, fill: colors.Blocked, stroke: "#fff", strokeWidth: 2 }}
          dot={{ r: 3, fill: colors.Blocked }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MultiLineChart;
