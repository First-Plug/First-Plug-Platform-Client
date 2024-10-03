"use client";
import React from "react";

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
}: InputProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : e.target.value;
    onChange && onChange({ ...e, target: { ...e.target, value: newValue } });
  };

  const today = new Date().toISOString().split("T")[0];
  const formattedValue = type === "date" && value ? value.split("T")[0] : value;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-dark-grey ml-2 font-sans">{title}</label>
      <input
        name={name}
        type={type}
        value={formattedValue || ""}
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
