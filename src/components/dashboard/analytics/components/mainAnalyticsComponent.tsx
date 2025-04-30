"use client";

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DatePicker } from './dateSelector';

export const dummyDataList = [
  {
    task_id: 'c8b9f6d0-5c5d-4a7e-8a9a-f3d7d8e2c1c9',
    updated_at: new Date('2024-03-15T09:30:00'),
    status: 'In Progress',
    difficulty_level: 3,
    worker_id: 'a3b4c5d6-e7f8-4923-a456-7890b1c2d3e4'
  },
  {
    task_id: 'd7e8f9a0-b1c2-4d5e-6f7a-8b9c0d1e2f3',
    updated_at: new Date('2024-03-14T14:45:00'),
    status: 'Completed',
    difficulty_level: 5,
    worker_id: 'f1e2d3c4-b5a6-4879-8e0f-1a2b3c4d5e6f'
  },
  {
    task_id: 'b2a3c4d5-e6f7-4891-a2b3-4c5d6e7f8a9',
    updated_at: new Date('2024-03-13T16:20:00'),
    status: 'To Do',
    difficulty_level: 2,
    worker_id: 'a3b4c5d6-e7f8-4923-a456-7890b1c2d3e4'
  },
  {
    task_id: 'e9f8a7b6-c5d4-3e2f-1a0b-9c8d7e6f5a4b',
    updated_at: new Date('2024-03-11T11:10:00'),
    status: 'Done',
    difficulty_level: 4,
    worker_id: '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'
  },
  {
    task_id: '1a2b3c4d-5e6f-7890-a1b2-c3d4e5f6a7b8',
    updated_at: new Date('2024-03-11T08:00:00'),
    status: 'In Progress',
    difficulty_level: 1,
    worker_id: 'f1e2d3c4-b5a6-4879-8e0f-1a2b3c4d5e6f'
  }
];
export default function MainAnalyticsComponent({ company_id }: { company_id: string }) {

  const {data : session} = useSession();
  const [birthDate, setBirthDate] = useState<Date | null>(null); // Start with null or new Date()

  // Callback function to update the date
  const handleDateChange = (newDate : Date) => {
    setBirthDate(newDate);
    console.log("Selected Date:", newDate); // Log the selected date object
  };


  const fetchData =useCallback( async () => {
    
    const response = await  fetch(`/api/v1/${session?.user.id}/companies/${company_id}/analytics/list/employee-details?day=1&month=1&year=2025`);

    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    console.log(data);

  },[company_id, session?.user.id])

  useEffect(() => {
    fetchData();

  },[fetchData])

  return (
    <div>
      <DatePicker selectedDate={birthDate} onChange={handleDateChange} pickerType='month-year' />
    </div>
  );
}
