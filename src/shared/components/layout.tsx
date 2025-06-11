import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <section className={`w-[98%]  flex-grow mx-auto max-h-[88vh]  p-2 `}>
      {children}
    </section>
  );
};
