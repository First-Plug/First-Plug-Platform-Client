import { EmptyDashboardCard, ShopIcon, Card } from "@/shared";
import { TeamHomeCard } from "@/features/dashboard";
import { UserServices } from "@/features/settings";
import { Member } from "@/features/members";
import { useAlertStore } from "@/shared";

interface Props {
  members: Member[];
  user: any;
}

export const UpcomingBirthdaysWidget = function ({ members, user }: Props) {
  const { setAlert } = useAlertStore();

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
};
