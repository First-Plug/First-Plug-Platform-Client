import React, { ReactNode } from "react";

interface EmptyCardLayoutProps {
  children: ReactNode;
}
export const EmptyCardLayout = ({ children }: EmptyCardLayoutProps) => {
  return (
    <div className="place-items-center grid border rounded-lg w-full h-full">
      {children}
    </div>
  );
};
