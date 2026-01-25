import React from 'react';
import CalendarMonth from './CalendarMonth';

const Calendar = ({ months, ...props }) => {
  const monthList = months ?? Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="calendar-grid grid w-full min-w-0 grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
      {monthList.map((month) => (
        <CalendarMonth key={month} month={month} {...props} />
      ))}
    </div>
  );
};

export default Calendar;
