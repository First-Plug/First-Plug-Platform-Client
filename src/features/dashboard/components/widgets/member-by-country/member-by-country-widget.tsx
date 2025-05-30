import { EmptyDashboardCard } from "@/shared";
import { OpsByCountryChart } from "@/features/dashboard";
import { Card } from "@/components";
import { TeamMember } from "@/types";

interface Props {
  members: TeamMember[];
}

export const MembersByCountryWidget = ({ members }: Props) => {
  if (members.length === 0) {
    return <EmptyDashboardCard type="opsByCountry" handleSwapy />;
  }

  return (
    <Card className="bg-white h-full" handleSwapy Title="Members By Country">
      <OpsByCountryChart members={members} />
    </Card>
  );
};
