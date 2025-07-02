import React, { ReactNode } from "react";

interface SectionTitleProps {
  className?: string;
  children: ReactNode;
}

export function SectionTitle({ className, children } : SectionTitleProps) {
  return (
    <p
      className={`font-inter text-black font-bold text-[16px] mt-[16px] mb-[16px] ${className}`}
    >
      {children}
    </p>
  );
}
