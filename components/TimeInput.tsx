// components/TimeInput.tsx

import React from "react";
import { useController, UseControllerProps } from "react-hook-form";

interface TimeInputProps extends UseControllerProps<any> {}

export const TimeInput: React.FC<TimeInputProps> = ({ ...props }) => {
  const {
    field,
    fieldState: { error },
  } = useController(props);

  return (
    <div>
      <div className="relative w-24">
        <input
          type="time"
          id={props.name}
          {...field}
          className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};
