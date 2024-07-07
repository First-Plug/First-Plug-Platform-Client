import { ReactNode } from "react";
interface PageLayoutProps {
  children: ReactNode;
}
export function PageLayout({ children }: PageLayoutProps) {
  return <div className="h-full w-full max-h-full   ">{children}</div>;
}
