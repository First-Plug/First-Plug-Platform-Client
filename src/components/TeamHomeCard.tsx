"use client";
import { AddIcon, InfoCircle, UploadIcon } from "@/common/Icons";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { BirthdayTable } from "./Tables/BirthdayTable";
import { Button } from "@/common";

const isBirthdayInNext30Days = (birthDateString: string) => {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  birthDate.setFullYear(today.getFullYear());

  const diffTime = birthDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 30;
};

export const TeamHomeCard = observer(function () {
  const {
    members: { members },
    aside: { setAside },
  } = useStore();

  const membersWithBirthdate = members.filter((member) => member.birthDate);

  const upcomingBirthdays = membersWithBirthdate.filter((member) =>
    isBirthdayInNext30Days(member.birthDate)
  );

  const handleAddMemberClick = () => {
    window.location.href = "/home/my-team/addTeam";
  };
  const handleLoadMembersClick = () => {
    setAside("LoadMembers");
  };

  return (
    <div className="flex gap-2 p-2 w-full h-full">
      <section className="flex w-full h-full relative">
        <div className="flex flex-col gap-2 h-full w-full absolute">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-black font-semibold  flex items-center gap-2">
              Upcoming Birthdays
            </h2>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-2 p-1 text-blue/80">
                    <InfoCircle />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  className="bg-blue/80 text-white p-2 rounded-md text-sm"
                >
                  The upcoming birthdays of team members, with complete
                  birthdate information, are displayed.
                  <TooltipArrow className="fill-blue/80" />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-col overflow-y-auto max-h-[85%] w-full gap-1">
            {membersWithBirthdate.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-dark-grey text-center mt-6">
                  The members of your team don't have their full birthdate
                  information
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
              <div className="flex items-center justify-center h-full">
                <p className="text-dark-grey text-center mt-6">
                  There are no upcoming birthdays for your members.
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

// "use client";
// import { AddIcon } from "@/common/Icons";
// import { JoinerRow, CustomLink } from "@/common";
// import { observer } from "mobx-react-lite";
// import { useStore } from "@/models";
// import { MyTeamHeader } from "./MyTeamHeader";

// export const TeamHomeCard = observer(function () {
//   const {
//     members: { members },
//   } = useStore();
//   return (
//     <div className={`flex gap-2 p-2 w-full h-full border rounded-lg   `}>
//       <section className="  flex flex-col justify-between  w-1/3  p-4 rounded-lg bg-light-grey ">
//         <MyTeamHeader />
//         <div className="flex gap-4 items-center w-1/3 ">
//           <h1 className="text-[4rem] font-bold text-black font-montserrat">
//             {members.length}
//           </h1>
//           <span className="text-dark-grey  text-2xl">Team members</span>
//         </div>
//         <CustomLink
//           href={"/home/addTeam"}
//           size={"small"}
//           className={
//             " flex justify-center items-center rounded-md w-full   text-xl py-4  border border-blue text-blue "
//           }
//         >
//           <AddIcon /> Add Team Member
//         </CustomLink>
//       </section>
//       <section className="  flex   w-2/3 h-full  relative ">
//         <div className=" flex flex-col gap-2 h-full w-full absolute">
//           <h2 className="text-xl text-black font-semibold h-[10%]  p-0 m-0">
//             New Joiners
//           </h2>

//           <div className="flex flex-col overflow-y-auto max-h-[85%] h-[85%] w-full   gap-1  bottom-0">
//             {members.map((member) => (
//               <JoinerRow key={member._id} joiner={member} />
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// });
