import React from "react";
import { AddIcon, ShopIcon, UploadIcon } from "./Icons";
import { Button } from "./Button";
import { CustomLink } from "./CustomLink";
import Image from "next/image";
import { useStore } from "@/models";
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
  additionalButtonText?: string;
  additionalButtonIcon?: () => JSX.Element;
  additionalOnClick?: () => void;
};
const Config: Record<EmptyCardType, TConfig> = {
  stock: {
    title: "My Assets",
    image: "/office.svg",
    paragraph: "You don't have any products.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Assets",
    LinkIcon: ShopIcon,
    link: "/shop",
    linkText: "Shop Now",
    additionalButtonText: "Add Product",
    additionalButtonIcon: AddIcon,
    additionalOnClick: () => {
      window.location.href = "/home/my-stock/addOneProduct";
    },
  },
  members: {
    title: "Upcoming Birthdays",
    image: "/girl.svg",
    paragraph: "You haven't loaded any members yet.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Team Members",
    additionalButtonIcon: AddIcon,
    additionalButtonText: "Add Team Member",
    additionalOnClick: () => {
      window.location.href = "/home/my-team/addTeam";
    },
  },
};

interface EmptyCardProps {
  type: EmptyCardType;
}

export function EmptyDashboardCard({ type }: EmptyCardProps) {
  const {
    title,
    LinkIcon,
    buttonText,
    image,
    link,
    linkText,
    paragraph,
    additionalButtonText,
    additionalButtonIcon,
    additionalOnClick,
    ButtonIcon,
  } = Config[type];

  const {
    aside: { setAside },
  } = useStore();

  const handleActions = () => {
    if (type === "stock") {
      setAside("LoadStock", "MyStock");
    }

    if (type === "members") setAside("LoadMembers");
  };

  return (
    <div className="flex flex-col items-center gap-3  h-full w-full rounded-xl p-4  border border-border overflow-y-auto scrollbar-custom ">
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
        <div className="w-44 h-44 relative">
          <Image src={image} alt={paragraph} fill />
        </div>
        <p className="text-dark-grey text-sm">{paragraph}</p>
      </div>
      <div className="flex gap-2 ">
        {additionalButtonIcon && (
          <Button
            variant="secondary"
            body={additionalButtonText}
            size="small"
            icon={additionalButtonIcon()}
            className="p-3 rounded-md gap-2"
            onClick={additionalOnClick}
          />
        )}
        {ButtonIcon && (
          <Button
            variant="secondary"
            body={buttonText}
            size="small"
            icon={<ButtonIcon />}
            className="p-3 rounded-md"
            onClick={handleActions}
          />
        )}
      </div>
    </div>
  );
}
