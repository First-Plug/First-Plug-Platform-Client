import { observer } from "mobx-react-lite";

import { EmptyDashboardCard, ShopIcon, Card } from "@/shared";
import { TeamHomeCard } from "@/features/dashboard";
import { UserServices } from "@/services/user.services";
import type { TeamMember } from "@/types";
import { useStore } from "@/models";

interface Props {
  members: TeamMember[];
  user: any;
}

export const UpcomingBirthdaysWidget = observer(({ members, user }: Props) => {
  const {
    alerts: { setAlert },
  } = useStore();

  const handleBirthdayGift = async () => {
    try {
      await UserServices.notifyBirthdayGiftInterest(
        user.email,
        user.tenantName
      );
      setAlert("birthdayGiftAlert");
    } catch (error) {
      console.error("Failed to send Slack message:", error);
    }
  };

  if (members.length === 0) {
    return <EmptyDashboardCard type="members" handleSwapy />;
  }

  return (
    <Card
      className="bg-white h-full"
      Title="Upcoming Birthdays"
      titleButton="Birthday Gifts"
      handleSwapy
      icon={<ShopIcon />}
      onClick={handleBirthdayGift}
    >
      <TeamHomeCard members={members} />
    </Card>
  );
});
