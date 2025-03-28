import OpsByCountryChart from "@/common/OpsByCountryChart";
import { Card } from "@/components";

export const MembersByCountry = ({ membersData }) => (
  <Card className="h-full bg-white" handleSwapy Title="Members By Country">
    <OpsByCountryChart members={membersData} />
  </Card>
);
