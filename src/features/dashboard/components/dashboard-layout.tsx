import { useRef } from "react";

import { useSwapy, useSaveOrder } from "@/features/dashboard";

interface Props {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const saveOrder = useSaveOrder(containerRef);

  useSwapy(containerRef, saveOrder);

  return (
    <div className="flex flex-col gap-4 w-full">
      <section className="gap-4 grid grid-cols-2 mb-6" ref={containerRef}>
        {children}
      </section>
    </div>
  );
};
