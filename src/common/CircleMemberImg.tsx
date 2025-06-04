import { Member } from "@/features/members";
import Image from "next/image";
import React from "react";
import memberPhoto from "public/member.png";

interface CircleImgProps {
  member: Member;
}
export function CircleMemberImg({ member }: CircleImgProps) {
  return (
    <div className="relative -ml-[1.75rem] rounded-full w-[3rem] h-[3rem]">
      <Image
        src={member.picture ? member.picture : memberPhoto}
        className="rounded-full"
        alt={member.firstName}
        fill
      />
    </div>
  );
}
