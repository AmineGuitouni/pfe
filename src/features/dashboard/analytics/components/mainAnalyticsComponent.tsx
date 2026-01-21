"use client";
import { DatePicker } from './dateSelector';
import useAnalytics from '../hooks/useAnalytics';
import SelectDateFilterType from './selectDateFilterType';
import MultiLineChart from './MultiLineChart';
import PieChart from './PieChart';
import UserSelector from './userSelector';
import { Skeleton } from "@heroui/react";
import React from 'react';

export default function MainAnalyticsComponent({ company_id }: { company_id: string }) {
  const { data, setDay, setMonth, setYear, year, month, day, dateType, setDateType,selectedUserId, setSelectedUserId, loading} = useAnalytics({
    company_id,
  })

  const handleDateChange = (newDate : Date) => {
    setDay(newDate.getDate());
    setMonth(newDate.getMonth() + 1);
    setYear(newDate.getFullYear());
  };

  const ChartSkeleton = () => (
    <Skeleton className="w-full h-[400px] rounded-lg animate-pulse bg-modal_bg opacity-50" />
  );
  const PieSkeleton = () => (
     <Skeleton className="w-full h-[440px] rounded-lg animate-pulse bg-modal_bg opacity-50 p-4 border border-light_blue-500/20" />
  )

  const piesData = data ? data.chartData.data[data.chartData.data.length - 1] : undefined;
  const mockPieData = piesData ? {
    "To Do": piesData["To Do"],
    "In Progress": piesData["In Progress"],
    Completed: piesData["Completed"],
    Blocked: piesData["Blocked"],
  } : undefined

  const taskStatusColors = {
    "To Do": "#7dd5de",
    "In Progress": "#D69E2E",
    Completed: "#38A169",
    Blocked: "#E53E3E",
    default: "#8884d8",
  };

  const mockDifficultyData = piesData ? {
    "Easy": piesData["Easy"],
    "Medium": piesData["Medium"],
    "Hard": piesData["Hard"],
    "Very Hard": piesData["Very Hard"],
    "Extreme": piesData["Extreme"],
  } : undefined

  const taskDifficultyColors = {
    "Easy": "#2dd4bf",
    "Medium": "#60a5fa",
    "Hard": "#facc15",
    "Very Hard": "#f87171",
    "Extreme": "#a855f7",
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end">
        <DatePicker selectedDate={new Date(`${year}-${month}-${day || 1}`)} onChange={handleDateChange} pickerType={dateType} />
        <SelectDateFilterType day={dateType === "day-month-year"} onChange={(val)=>{
          setDateType(val ? "day-month-year" : "month-year");
        }}/>
        <UserSelector
          company_id={company_id}
          selectedUserId={selectedUserId}
          onUserSelect={setSelectedUserId}
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-col gap-4">
             <ChartSkeleton />
             <div className="flex flex-col md:flex-row gap-4 w-full">
                <PieSkeleton />
                <PieSkeleton />
             </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full bg-modal_bg p-4 rounded-lg border border-light_blue-500/20">
              <h4 className="text-light_blue text-lg font-semibold mb-4">Task Trends</h4>
              {data && data.chartData && data.chartData.data && data.chartData.data.length > 0 ? (
                <MultiLineChart chartData={data.chartData.data} dateType={dateType} />
              ) : (
                <div className="text-center text-gray-500 py-10 h-[400px] flex items-center justify-center">
                  No data available for Line Chart.
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="w-full md:w-1/2 bg-modal_bg p-4 rounded-lg border border-light_blue-500/20">
                  <h4 className="text-light_blue text-lg font-semibold mb-4">Task Status Distribution</h4>
                  {mockPieData && Object.values(mockPieData).some(value => value > 0) ? (
                    <PieChart data={mockPieData} colorMap={taskStatusColors} />
                  ) : (
                    <div className="text-center text-gray-500 py-10 h-[440px] flex items-center justify-center">
                      No data available for Task Status.
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2 bg-modal_bg p-4 rounded-lg border border-light_blue-500/20">
                   <h4 className="text-light_blue text-lg font-semibold mb-4">Task Difficulty Distribution</h4>
                   {mockDifficultyData && Object.values(mockDifficultyData).some(value => value > 0) ? (
                     <PieChart data={mockDifficultyData} colorMap={taskDifficultyColors} />
                    ) : (
                      <div className="text-center text-gray-500 py-10 h-[440px] flex items-center justify-center">
                        No data available for Task Difficulty.
                      </div>
                    )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
