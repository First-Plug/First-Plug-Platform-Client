import React, { createContext, useContext, useState, useCallback } from "react";

interface FilterResetContextProps {
  resetFilters: () => void;
  subscribeToReset: (callback: () => void) => () => void;
}

const FilterResetContext = createContext<FilterResetContextProps | undefined>(
  undefined
);

export const FilterResetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscribers, setSubscribers] = useState<(() => void)[]>([]);

  const resetFilters = useCallback(() => {
    subscribers.forEach((callback) => callback());
  }, [subscribers]);

  const subscribeToReset = useCallback((callback: () => void) => {
    setSubscribers((prev) => [...prev, callback]);
    return () =>
      setSubscribers((prev) => prev.filter((sub) => sub !== callback));
  }, []);

  return (
    <FilterResetContext.Provider value={{ resetFilters, subscribeToReset }}>
      {children}
    </FilterResetContext.Provider>
  );
};

export const useFilterReset = () => {
  const context = useContext(FilterResetContext);
  if (!context) {
    throw new Error("useFilterReset must be used within a FilterResetProvider");
  }
  return context;
};
