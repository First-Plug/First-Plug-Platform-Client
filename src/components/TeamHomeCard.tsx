"use client";
import { AddIcon, Cake, InfoCircle, UploadIcon } from "@/common/Icons";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import { BirthdayTable } from "./Tables/BirthdayTable";
import { Button } from "@/common";
import { TeamMember } from "@/types";

const isBirthdayInNext30Days = (birthDateString: string) => {
  const today = new Date();

  const birthDate = new Date(
    birthDateString.includes("T")
      ? birthDateString.split("T")[0]
      : birthDateString
  );
  birthDate.setFullYear(today.getFullYear());

  const diffTime = birthDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 30;
};

const sortBirthdaysByUpcoming = (members: TeamMember[]) => {
  const today = new Date();

  return members.sort((a, b) => {
    const birthDateA = new Date(a.birthDate);
    const birthDateB = new Date(b.birthDate);

    birthDateA.setFullYear(today.getFullYear());
    birthDateB.setFullYear(today.getFullYear());

    const monthDayA = `${birthDateA.getMonth() + 1}-${birthDateA.getDate()}`;
    const monthDayB = `${birthDateB.getMonth() + 1}-${birthDateB.getDate()}`;

    const isTodayA =
      birthDateA.getDate() === today.getDate() &&
      birthDateA.getMonth() === today.getMonth();
    const isTodayB =
      birthDateB.getDate() === today.getDate() &&
      birthDateB.getMonth() === today.getMonth();

    if (isTodayA) return -1;
    if (isTodayB) return 1;

    return monthDayA.localeCompare(monthDayB);
  });
};

export const TeamHomeCard = observer(function () {
  const {
    members: { members },
    aside: { setAside },
  } = useStore();

  const membersWithBirthdate = members.filter((member) => member.birthDate);

  const upcomingBirthdays = sortBirthdaysByUpcoming(
    membersWithBirthdate.filter((member) =>
      isBirthdayInNext30Days(member.birthDate)
    )
  );

  const handleAddMemberClick = () => {
    window.location.href = "/home/my-team/addTeam";
  };
  const handleLoadMembersClick = () => {
    setAside("LoadMembers");
  };

  return (
    <div className="flex gap-2 p-2 w-full h-full ">
      <section className="flex w-full h-full relative">
        <div className="flex flex-col gap-2 h-full w-full absolute">
          <div className="flex flex-col overflow-y-auto  w-full gap-1">
            {membersWithBirthdate.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full mt-10">
                <Cake />
                <p className="text-dark-grey text-md text-center mt-6">
                  No birthdates have been completed for any team members
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    body="Add Team Member"
                    size="small"
                    icon={<AddIcon />}
                    className="p-3 rounded-md gap-2"
                    onClick={handleAddMemberClick}
                  />
                  <Button
                    variant="secondary"
                    body="Load Team Members"
                    size="small"
                    icon={<UploadIcon />}
                    className="p-3 rounded-md gap-2"
                    onClick={handleLoadMembersClick}
                  />
                </div>
              </div>
            ) : upcomingBirthdays.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full w-full mb-2 overflow-hidden mt-10">
                <Cake />
                <p className="text-dark-grey text-md text-center mt-14 ">
                  There are no upcoming birthdays for members with a completed
                  birthdate.
                </p>
              </div>
            ) : (
              <BirthdayTable members={upcomingBirthdays} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
});
