"use client";
import { MouseEvent, ReactNode } from "react";

type Size = keyof (typeof btnStyle)["size"];
type Variant = keyof (typeof btnStyle)["variant"];

interface ButtonProps {
  body?: ReactNode;
  variant?: Variant;
  icon?: JSX.Element;
  className?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
  size?: Size;
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
  onMouseEnter?: () => void;
}

const btnStyle = {
  variant: {
    primary: "bg-blue rounded-md text-white from-blue to-green hover:bg ",
    secondary:
      "bg-white border border-blue hover:bg-hoverBlue  text-blue  rounded-md",
    delete:
      "bg-error text-white border border-red-500 hover:bg-error/80 rounded-md ",
    text: "bg-white text-blue hover:bg-hoverBlue rounded-full",
    outline: "bg-white text-blue  rounded-full",
    alert: "text-error  hover:bg-hoverRed",
  },
  size: {
    default: "p-2",
    big: "text-lg py-3 px-6",
    small: "text-sm py-1 px-3",
  },
  disabled: {
    primary: "bg-light-grey border border-disabled   text-grey ",
    delete: "bg-light-grey    text-grey ",
    secondary: "bg-white  border border-disabled rounded-md  text-grey ",
    text: "bg-white    text-grey   ",
    alert: "bg-white border border-disabled  text-grey ",
  },
} as const;

export function Button({
  body,
  variant = "primary",
  icon,
  className,
  disabled = false,
  onClick,
  size = "default",
  children,
  type = "button",
  onMouseEnter,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-center flex items-center justify-center gap-2  font-bold leading-5 capitalize transition-all duration-150 ease-in    ${
        disabled
          ? `${btnStyle.disabled[variant]} ${btnStyle.size[size]}`
          : `${btnStyle.variant[variant]} ${btnStyle.size[size]}`
      } ${className} `}
      {...buttonProps}
      disabled={disabled}
    >
      {children ? (
        children
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {body}
        </>
      )}
    </button>
  );
}
