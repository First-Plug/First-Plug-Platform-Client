import { useEffect, useRef } from "react";
import { createSwapy, Swapy } from "swapy";

interface SwapyOptions {
  animation?: "dynamic";
  swapMode?: "hover" | "drop";
  enabled?: boolean;
  autoScrollOnDrag?: boolean;
}

export const useSwapy = (
  containerRef: React.RefObject<HTMLDivElement>,
  onSwap?: () => void,
  options: SwapyOptions = {}
) => {
  const swapyRef = useRef<Swapy | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: "dynamic",
        swapMode: "hover",
        enabled: true,
        autoScrollOnDrag: true,
        ...options,
      });

      if (onSwap) {
        swapyRef.current.onSwap(onSwap);
      }
    }

    return () => {
      swapyRef.current?.destroy();
    };
  }, [containerRef, onSwap, options]);

  return swapyRef;
};
