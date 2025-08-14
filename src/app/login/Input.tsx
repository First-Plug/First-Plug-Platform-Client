"use client";
import { ChangeEvent, FocusEvent, useState, forwardRef } from "react";
import { EyeIcon, EyeSlashIcon } from "@/shared";

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
  name?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      title,
      placeholder,
      type,
      defaultValue,
      className,
      readonly,
      value,
      onChange,
      onBlur,
      onFocus,
      error,
      touched,
      required,
      isLogin = false,
      name,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = showPassword ? "text" : type;

    return (
      <div className={`relative h-20 font-inter ${className}`}>
        <label className="block ml-2 text-dark-grey">{title}</label>
        <input
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          type={inputType}
          placeholder={placeholder}
          defaultValue={value}
          className={`w-full  h-14 py-2 rounded-xl border ${
            value?.length && touched && error && !isLogin ? "border-error" : ""
          } text-black p-4   focus:outline-none`}
        />

        {type === "password" && (
          <button
            type="button"
            className="top-2 right-5 absolute inset-y-0 flex items-center mr-2 h-full"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
            disabled={readonly}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5 text-grey" />
            ) : (
              <EyeIcon className="w-5 h-5 text-grey" />
            )}
          </button>
        )}

        {value?.length && touched && error && !isLogin ? (
          <p className="absolute ml-2 w-[110%] text-error text-sm">{error}</p>
        ) : null}

        {/* Show error for react-hook-form */}
        {error && !touched && (
          <p className="absolute ml-2 w-[110%] text-error text-sm">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
