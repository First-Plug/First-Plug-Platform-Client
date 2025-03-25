import { ShopIcon } from "@/common";
import { Card, TeamHomeCard } from "@/components";
import { UserServices } from "@/services/user.services";

export const UpcomingBirthdays = ({ membersData, user, setAlert }) => {
  const handleBirthdayGiftClick = async () => {
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

  return (
    <Card
      className="h-full bg-white"
      Title="Upcoming Birthdays"
      titleButton="Birthday Gifts"
      icon={<ShopIcon />}
      onClick={handleBirthdayGiftClick}
    >
      <TeamHomeCard members={membersData} />
    </Card>
  );
};
