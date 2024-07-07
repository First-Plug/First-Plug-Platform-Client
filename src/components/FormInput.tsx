"use client";
import { DropdownInput, Input } from "@/common";
import { PhoneInput } from "@/common/Inputs";
import useInput from "@/hooks/useInput";
import React, { useEffect } from "react";

interface FormInputProps {
  title: string;
  placeholder: string;
  type: "text" | "number" | "password" | "options" | "date" | "email" | "phone";
  className?: string;
  prop: string;
  handleInput: (prop: string, value: unknown) => void;
  options?: any[];
  required?: string;
  clear?: boolean;
  value?: string;
}

export const FormInput = function ({
  title,
  placeholder,
  type,
  className = "",
  prop,
  handleInput,
  options = [],
  required,
  clear,
  value,
}: FormInputProps) {
  const input = useInput(
    value || "",
    (required = "required"),
    type === "options"
  );
  const { value: InputValue, selectedOption, clearInput } = input;

  useEffect(() => {
    if (clear) {
      clearInput();
    } else {
      const newValue = type === "options" ? selectedOption : value;
      handleInput(prop, newValue);
    }
  }, [value, selectedOption, clearInput, clear, handleInput, prop, type]);

  return (
    <>
      {type === "options" ? (
        <DropdownInput
          options={options}
          placeholder={placeholder}
          title={title}
          defaultValue={value}
          className="w-full"
          {...input}
        />
      ) : (
        <Input
          type={type}
          // defaultValue={value}
          value={InputValue}
          className={` w-full ${className}`}
          placeholder={placeholder}
          title={title}
          {...input}
        />
      )}
    </>
  );
};
