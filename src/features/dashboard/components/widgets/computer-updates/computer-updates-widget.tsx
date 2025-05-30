import { Card, EmptyDashboardCard } from "@/shared";

import {
  useAverageAge,
  getBarColor,
  ComputerUpdateCard,
  ComputerAgeChart,
} from "@/features/dashboard";

import type { LoggedInUser, ProductTable } from "@/types";

interface Props {
  assets: ProductTable[];
  user: LoggedInUser;
}

export const ComputerUpdatesWidget = ({ assets, user }: Props) => {
  const { avgAge, handleAvgAgeCalculated } = useAverageAge();

  if (assets.length === 0) {
    return <EmptyDashboardCard type="computer" handleSwapy />;
  }

  return (
    <Card
      className="bg-white h-full"
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
        <p className="font-medium text-dark-grey text-sm">
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
