import { ReactNode } from "react";
interface PageLayoutProps {
  children: ReactNode;
}
export function PageLayout({ children }: PageLayoutProps) {
  return <div className="w-full h-full">{children}</div>;
}
