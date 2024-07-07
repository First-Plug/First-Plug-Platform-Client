"use client";
import Photo from "../../public/employees/member.jpg";
import Image from "next/image";
import { Button, TeamCard } from "@/common";
import { PenIcon, TrashIcon } from "@/common/Icons";
import { Memberservices } from "@/services";
import { useStore } from "@/models/root.store";
import { observer } from "mobx-react-lite";
import { AsideType, TeamMember, ShipmentStatus } from "@/types";
import { StatusColor } from "@/common/StatusColors";

interface TeamMemberCardProps {
  member: TeamMember;
  _id: string;
  shipmentDetails?: ShipmentStatus;
  className?: string;
}

export const TeamMemberCard = observer(function ({
  member,
  className,
}: TeamMemberCardProps) {
  const {
    aside: { setAside },
    members: { setMembers, setSelectedMember },
  } = useStore();

  const handleModal = (asideType: AsideType) => {
    setSelectedMember(member._id);
    setAside(asideType);
  };

  const handleDeleteMember = () => {
    Memberservices.deleteMember(member._id).then((res) => {
      Memberservices.getAllMembers().then((res) => {
        setMembers(res);
      });
    });
  };

  return (
    <>
      <div
        className={`flex flex-col gap-2  mx-auto rounded-lg border border-border p-4 font-inter w-full ${className}`}
      >
        <header className="flex  items-start ">
          <div className="flex gap-1 flex-grow">
            <div className="w-[150px] relative aspect-square">
              <Image
                src={member.picture || Photo}
                alt="colabPhoto"
                className="rounded-md"
                objectFit="cover"
                fill
              />
            </div>
            <div className="ml-1 flex flex-col  w-full ">
              <div className="flex items-center gap-1">
                {!member.team ? (
                  <TeamCard team={undefined} key={"no team"} />
                ) : (
                  Array.isArray(member.team) &&
                  member.team.map((team) => <TeamCard team={team} key={team} />)
                )}
              </div>
              <h2
                className="text-black font-bold cursor-pointer  "
                onClick={() => handleModal("MemberDetails")}
              >
                {member.firstName} {member.lastName}
              </h2>
            </div>
          </div>
          <div className="flex ">
            <Button
              variant="text"
              icon={
                <PenIcon
                  strokeWidth={2}
                  className="text-dark-grey w-[1.2rem] h-[1.2rem]"
                />
              }
              onClick={() => handleModal("EditMember")}
            />
            <Button
              variant="text"
              onClick={handleDeleteMember}
              body={
                <TrashIcon
                  strokeWidth={2}
                  className=" text-dark-grey w-[1.2rem] h-[1.2rem] hover:text-error"
                />
              }
            />
          </div>
        </header>
        <section className="flex flex-col gap-2 justify-start">
          <div className="flex   items-center gap-3">
            <h2 className="font-semibold text-lg">Job Position:</h2>
            <p>{member.position}</p>
          </div>
          <div className="flex items-center  gap-3">
            <h2 className="font-semibold text-lg">Products</h2>
            <p className="bg-border  rounded-full h-6 w-6 text-center  grid place-items-center items text-sm">
              {member.products.length}
            </p>
          </div>
        </section>
      </div>
    </>
  );
});
