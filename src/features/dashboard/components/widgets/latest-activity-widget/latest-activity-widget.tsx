import { EmptyDashboardCard, Card } from "@/shared";
import { LatestActivityTable } from "@/features/dashboard";

interface Props {
  history: any[];
}

export const LatestActivityWidget = ({ history }: Props) => {
  if (history.length === 0) {
    return <EmptyDashboardCard type="latestActivity" handleSwapy />;
  }

  return (
    <Card className="bg-white h-full" Title="Latest Activity" handleSwapy>
      <div className="flex flex-col flex-1 w-full h-full">
        <LatestActivityTable history={history} />
      </div>
    </Card>
  );
};
