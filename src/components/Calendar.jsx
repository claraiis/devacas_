import React from 'react';
import CalendarMonth from './CalendarMonth';

const Calendar = ({ months, ...props }) => {
  const monthList = months ?? Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {monthList.map((month) => (
        <CalendarMonth key={month} month={month} {...props} />
      ))}
    </div>
  );
};

export default Calendar;
