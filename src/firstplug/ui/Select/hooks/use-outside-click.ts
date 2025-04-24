import { useEffect, type RefObject } from "react";

interface UseOutsideClickProps {
  ref: RefObject<HTMLElement>;
  isOpen: boolean;
  onOutsideClick: () => void;
}

export function useOutsideClick({
  ref,
  isOpen,
  onOutsideClick,
}: UseOutsideClickProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, ref, onOutsideClick]);
}
