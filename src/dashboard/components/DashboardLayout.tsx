import { useEffect, useRef } from "react";
import { createSwapy, Swapy } from "swapy";
import { updateDashboard } from "../action/updateDashboard";

export default function DashboardLayout({ children }) {
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        observer.disconnect();

        swapyRef.current = createSwapy(containerRef.current, {
          animation: "dynamic",
          swapMode: "hover",
          enabled: true,
        });

        const saveOrderToDatabase = async () => {
          if (containerRef.current) {
            const newOrder = Array.from(
              containerRef.current.querySelectorAll("[data-swapy-item]")
            ).map((el, index) => ({
              id: el.getAttribute("data-swapy-item") || "",
              order: index,
            }));

            await updateDashboard(newOrder);
          }
        };

        swapyRef.current.onSwap(saveOrderToDatabase);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      swapyRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full" ref={containerRef}>
      {children}
    </div>
  );
}
