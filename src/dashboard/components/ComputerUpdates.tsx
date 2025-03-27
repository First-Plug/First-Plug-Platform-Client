import { Card } from "@/components";
import ComputerAgeChart from "@/components/Dashboard/ComputerAgeChart";
import { ComputerUpdateCard } from "@/components/Dashboard/ComputerUpdateCard";
import { getBarColor } from "@/components/Dashboard/GetBarColor";
import { useCallback, useState } from "react";

export const ComputerUpdates = ({ assets, user }) => {
  const [avgAge, setAvgAge] = useState<number>(0);

  const handleAvgAgeCalculated = useCallback((calculatedAvgAge: number) => {
    setAvgAge((prev) => (prev !== calculatedAvgAge ? calculatedAvgAge : prev));
  }, []);

  return (
    <Card
      className="h-full bg-white"
      Title="Computer Updates"
      handleSwapy
      RightContent={
        <ComputerAgeChart
          products={assets}
          onAvgAgeCalculated={handleAvgAgeCalculated}
          computerExpiration={user?.computerExpiration}
        />
      }
      FooterContent={
        <p className="text-dark-grey font-medium text-sm">
          Avg computer age:{" "}
          <span
            style={{
              backgroundColor: getBarColor(
                avgAge,
                user?.computerExpiration,
                avgAge
              ),
              color: "black",
              padding: "0 4px",
              borderRadius: "4px",
            }}
          >
            {avgAge.toFixed(2)} years
          </span>
        </p>
      }
    >
      <ComputerUpdateCard
        products={assets}
        computerExpiration={user?.computerExpiration}
      />
    </Card>
  );
};
