import "./icon-display.css";
import Icon from "./CalendarIcon";

import { useState } from "react";
import DatePicker from "react-datepicker";

export default function Calendar() {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <>
      <div>
        <DatePicker
          className="calendar text-center"
          showIcon
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          icon={Icon}
        />
      </div>
    </>
  );
}
