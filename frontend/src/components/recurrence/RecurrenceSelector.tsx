import React, { useState } from 'react';

interface RecurrenceSelectorProps {
  type: string;
  days?: number[];
  onChange: (type: string, days?: number[]) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  type,
  days,
  onChange
}) => {
  return (
    <div className="recurrence-selector">
      <label>Recurrence Pattern</label>
      <select value={type} onChange={(e) => onChange(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="custom">Custom</option>
      </select>
    </div>
  );
};
