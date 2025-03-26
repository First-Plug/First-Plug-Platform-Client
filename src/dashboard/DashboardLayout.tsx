import { useEffect, useRef } from "react";
import { createSwapy, Swapy } from "swapy";

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

        swapyRef.current.onSwap((event) => {
          console.log("swap", event);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      swapyRef.current?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full h-full" ref={containerRef}>
      {children}
    </div>
  );
}
