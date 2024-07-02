"use client";
import { ChangeEvent, FocusEvent, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@/common/Icons";

type InputProps = {
  title?: string;
  placeholder?: string;
  type?: string;
  readonly?: boolean;
  defaultValue?: string;
  className?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  isLogin?: boolean;
};

export function Input({
  title,
  placeholder,
  type,
  defaultValue,
  className,
  readonly,
  value = "",
  onChange,
  onBlur,
  onFocus,
  error,
  touched,
  required,
  isLogin = false,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPassword ? "text" : type;

  return (
    <div className={`relative   h-24  font-inter  ${className}`}>
      <label className="block text-dark-grey ml-2 ">{title}</label>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        type={inputType}
        placeholder={placeholder}
        defaultValue={value}
        className={`w-full  h-14 py-2 rounded-xl border ${
          value.length && touched && error && !isLogin ? "border-error" : ""
        } text-black p-4   focus:outline-none`}
      />

      {type === "password" && (
        <button
          type="button"
          className="absolute inset-y-0 right-5 top-2  h-full flex items-center mr-2"
          onClick={() => {
            setShowPassword(!showPassword);
          }}
          disabled={readonly}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-grey " />
          ) : (
            <EyeIcon className="h-5 w-5 text-grey " />
          )}
        </button>
      )}

      {value.length && touched && error && !isLogin ? (
        <p className=" ml-2  w-[110%]  absolute  text-error text-sm  ">
          {error}
        </p>
      ) : null}
    </div>
  );
}
