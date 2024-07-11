import Link from "next/link";
import { ReactNode } from "react";

type Variant = keyof (typeof customLinkStyle)["variant"];
type Size = keyof (typeof customLinkStyle)["size"];
type Disabled = keyof (typeof customLinkStyle)["disabled"];

interface CustomLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
  disabled?: Disabled;
  variant?: Variant;
  size?: Size;
}

const customLinkStyle = {
  variant: {
    primary: "bg-blue text-white   hover:bg-gradient-to-r from-blue to-green ",
    secondary: "bg-white border border-blue hover:bg-hoverBlue  text-blue ",
    text: "bg-white   text-blue  hover:bg-hoverBlue",
    alert: "text-error    hover:bg-hoverRed",
  },
  size: {
    big: "text-lg py-3 px-6",
    small: "text-sm  py-2 px-6",
    default: "p-2",
  },
  disabled: {
    primary: "bg-light-grey    text-grey ",
    secondary: "bg-white   text-grey ",
    text: "bg-white    text-grey   ",
    alert: "bg-white   text-grey ",
  },
} as const;

export function CustomLink({
  href,
  children,
  className = "",
  disabled,
  variant,
  size,
}: CustomLinkProps) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      className={`text-blue font-lg font-bold font-sans ${className} ${
        disabled
          ? `${customLinkStyle.disabled[variant]} ${customLinkStyle.size[size]}`
          : `${customLinkStyle.variant[variant]} ${customLinkStyle.size[size]}`
      } `}
    >
      {children}
    </Link>
  );
}
