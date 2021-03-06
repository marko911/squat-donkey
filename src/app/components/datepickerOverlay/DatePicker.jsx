import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import './datepicker.css';

function CustomOverlay({ classNames, selectedDay, children }) {
  return (
    <div className={classNames.overlayWrapper} style={{ marginLeft: -100 }}>
      <div className={classNames.overlay}>
        <p>
          {selectedDay
            ? `You picked: ${selectedDay.toLocaleDateString()}`
            : 'Please pick a day'}
        </p>
        {children}
      </div>
    </div>
  );
}

export default function DatePicker() {
  return (
    <DayPickerInput
      overlayComponent={CustomOverlay}
      dayPickerProps={{
        todayButton: 'Today',
      }}
    />
  );
}
