"use client";
import { InfoCircle } from "@/common/Icons";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";

const isBirthdayInNext30Days = (birthDateString: string) => {
  const today = new Date();
  const birthDate = new Date(birthDateString);
  birthDate.setFullYear(today.getFullYear());

  const diffTime = birthDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= 30;
};

const formatBirthDate = (birthDateString: string) => {
  const birthDate = new Date(birthDateString);
  return `${birthDate.getDate()}/${birthDate.getMonth() + 1}`;
};

export const TeamHomeCard = observer(function () {
  const {
    members: { members },
  } = useStore();

  const membersWithBirthdate = members.filter((member) => member.birthDate);

  const upcomingBirthdays = membersWithBirthdate.filter((member) =>
    isBirthdayInNext30Days(member.birthDate)
  );

  const handleBirthdayGiftsClick = () => {
    alert("We will contact you shortly to share our gifts for your team.");
  };

  return (
    <div className="flex gap-2 p-2 w-full h-full ">
      <section className="flex w-2/3 h-full relative">
        <div className="flex flex-col gap-2 h-full w-full absolute">
          <div className="flex justify-between items-center">
            <h2 className="text-xl text-black font-semibold">
              Upcoming Birthdays
            </h2>
            <div className="flex gap-2 items-center">
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
                    The upcoming birthdays of team members with complete
                    birthdate information are displayed.
                    <TooltipArrow className="fill-blue/80" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex flex-col overflow-y-auto max-h-[85%] gap-1">
            {membersWithBirthdate.length === 0 ? (
              <p className="text-dark-grey">
                The members of your team don't have their full birthdate
                information
              </p>
            ) : upcomingBirthdays.length === 0 ? (
              <p className="text-dark-grey">
                There are no upcoming birthdays for your members.
              </p>
            ) : (
              upcomingBirthdays.map((member) => (
                <div key={member._id} className="flex justify-between">
                  <span>{member.fullName}</span>
                  <span>{formatBirthDate(member.birthDate)}</span>
                </div>
              ))
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
