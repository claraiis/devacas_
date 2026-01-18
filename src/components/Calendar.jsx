import React from 'react';
import CalendarMonth from './CalendarMonth';

const Calendar = ({ months, ...props }) => {
  const monthList = months ?? Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-y-2 gap-x-6 mt-6">
      {monthList.map((month) => (
        <CalendarMonth key={month} month={month} {...props} />
      ))}
    </div>
  );
};

export default Calendar;
