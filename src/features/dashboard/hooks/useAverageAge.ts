import { useCallback, useState } from "react";

export const useAverageAge = () => {
  const [avgAge, setAvgAge] = useState<number>(0);

  const handleAvgAgeCalculated = useCallback((calculatedAvgAge: number) => {
    setAvgAge((prev) => (prev !== calculatedAvgAge ? calculatedAvgAge : prev));
  }, []);

  return { avgAge, handleAvgAgeCalculated };
};
