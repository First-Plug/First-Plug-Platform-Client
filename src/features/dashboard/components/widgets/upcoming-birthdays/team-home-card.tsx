"use client";

import { AddIcon, Cake, UploadIcon, Button } from "@/shared";

import { BirthdayTable } from "@/features/dashboard";
import { Member } from "@/features/members";
import { useAsideStore } from "@/shared";

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

const sortBirthdaysByUpcoming = (members: Member[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return members.sort((a, b) => {
    const birthDateA = new Date(a.birthDate);
    const birthDateB = new Date(b.birthDate);

    birthDateA.setFullYear(today.getFullYear());
    birthDateB.setFullYear(today.getFullYear());

    const diffDaysA = Math.ceil(
      (birthDateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diffDaysB = Math.ceil(
      (birthDateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDaysA === 0) return -1;
    if (diffDaysB === 0) return 1;

    return diffDaysA - diffDaysB;
  });
};

export const TeamHomeCard = function ({ members }: { members: Member[] }) {
  const { setAside } = useAsideStore();

  const membersWithBirthdate = members.filter((member) => member.birthDate);

  const upcomingBirthdays = sortBirthdaysByUpcoming(
    membersWithBirthdate.filter((member) =>
      isBirthdayInNext30Days(member.birthDate)
    )
  );

  const handleAddMemberClick = () => {
    window.location.href = "/home/my-team/add";
  };
  const handleLoadMembersClick = () => {
    setAside("LoadMembers");
  };

  return (
    <div className="flex gap-2 p-2 w-full h-full">
      <section className="relative flex w-full h-full">
        <div className="absolute flex flex-col gap-2 w-full h-full">
          <div className="flex flex-col flex-1 gap-1 w-full min-h-0 overflow-hidden">
            {membersWithBirthdate.length === 0 ? (
              <div className="flex flex-col justify-center items-center mt-10 h-full overflow-hidden">
                <Cake />
                <p className="mt-6 text-dark-grey text-md text-center">
                  No birthdates have been completed for any team members
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="secondary"
                    body="Add Team Member"
                    size="small"
                    icon={<AddIcon />}
                    className="gap-2 p-3 rounded-md"
                    onClick={handleAddMemberClick}
                  />
                  <Button
                    variant="secondary"
                    body="Load Team Members"
                    size="small"
                    icon={<UploadIcon />}
                    className="gap-2 p-3 rounded-md"
                    onClick={handleLoadMembersClick}
                  />
                </div>
              </div>
            ) : upcomingBirthdays.length === 0 ? (
              <div className="flex flex-col justify-center items-center mt-10 mb-2 w-full h-full overflow-hidden">
                <Cake />
                <p className="mt-14 text-dark-grey text-md text-center">
                  There are no upcoming birthdays for members with a completed
                  birthdate.
                </p>
              </div>
            ) : (
              <div className="flex-1 min-h-0">
                <BirthdayTable members={upcomingBirthdays} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
