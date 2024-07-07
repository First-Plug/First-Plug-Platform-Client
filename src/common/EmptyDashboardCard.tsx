import React from "react";
import { AddIcon, ShopIcon, UploadIcon } from "./Icons";
import { Button } from "./Button";
import { CustomLink } from "./CustomLink";
import Image from "next/image";
type EmptyCardType = "stock" | "members";
type TConfig = {
  title: string;
  image: string;
  paragraph: string;
  ButtonIcon?: () => JSX.Element;
  buttonText?: string;
  LinkIcon?: () => JSX.Element;
  linkText?: string;
  link?: string;
};
const Config: Record<EmptyCardType, TConfig> = {
  stock: {
    title: "My Stock",
    image: "/office.svg",
    paragraph: "You don't have any items.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Stock",
    LinkIcon: ShopIcon,
    link: "/shop",
    linkText: "Shop Now",
  },
  members: {
    title: "My Team",
    image: "/girl.svg",
    paragraph: "You haven't loaded any employees yet.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Team Members",
    LinkIcon: AddIcon,
    link: "/home/my-team/addTeam",
    linkText: "Add Team Member",
  },
};

interface EmptyCardProps {
  type: EmptyCardType;
}

export function EmptyDashboardCard({ type }: EmptyCardProps) {
  const { title, LinkIcon, buttonText, image, link, linkText, paragraph } =
    Config[type];
  return (
    <div className="flex flex-col items-center gap-3  h-full w-full rounded-xl p-4  border border-border ">
      <div className="flex gap-2 w-full">
        <h2 className="text-[20px]  text-black font-montserrat font-bold flex-1 md:text-sm lg:text-xl">
          {title}
        </h2>
        {LinkIcon && (
          <CustomLink
            variant="secondary"
            size="small"
            className="rounded-md flex   gap-2"
            href={link}
          >
            <LinkIcon /> {linkText}
          </CustomLink>
        )}
      </div>
      <div className="flex flex-col items-center justify-center  w-full h-full">
        <div className="w-52 h-52 relative">
          <Image src={image} alt={paragraph} fill />
        </div>
        <p className="text-dark-grey">{paragraph}</p>
      </div>
    </div>
  );
}
