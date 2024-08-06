"use client";
import React, { useEffect } from "react";

interface InputProps {
  title: string;
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  // required?: string;
  allowFutureDates?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  disabledValue?: string;
}

export function InputProductForm({
  title,
  placeholder,
  type = "text",
  className = "",
  value = "",
  onChange,
  name,
  allowFutureDates = true,
  disabled = false,
  readOnly = false,
  disabledValue = "",
}: InputProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(e);
  };
  const [inputValue, setInputValue] = React.useState<string>(value);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (disabled) {
      setInputValue(disabledValue);
    }
  }, [disabled, disabledValue]);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-dark-grey ml-2 font-sans">{title}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e);
          if (type === "date") {
            handleDateChange(e);
          } else {
            onChange && onChange(e);
          }
        }}
        placeholder={placeholder}
        className={`w-full h-14 py-2 rounded-xl border text-black p-4 font-sans focus:outline-none ${className}`}
        max={type === "date" && !allowFutureDates ? today : undefined}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
}
