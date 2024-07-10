"use client";
import Image from "next/image";
import { Button } from "./Button";
import {
  AddIcon,
  ShopIcon,
  UploadIcon,
  ComputerIcon,
  ExclamationIcon,
} from "./Icons";
import { CustomLink } from "./CustomLink";
import { useStore } from "@/models";

type EmptyCardType =
  | "stock"
  | "members"
  | "shipments"
  | "orders"
  | "registerok"
  | "loginerror"
  | "registererror"
  | "noStockMember";

type TConfig = {
  image: string;
  paragraph: string;
  paragraphstrong?: string;
  paragraph2?: string;
  ButtonIcon?: () => JSX.Element;
  buttonText?: string;
  LinkIcon?: () => JSX.Element;
  linkText?: string;
  link?: string;
  additionalButton?: () => JSX.Element;
  additionalButtonText?: string;
  additionalButtonIcon?: () => JSX.Element;
  additionalOnClick?: () => void;
};

const Config: Record<EmptyCardType, TConfig> = {
  noStockMember: {
    image: "/office.svg",
    paragraph: "This member doesn't have any items.",
    // ButtonIcon: () => <div>🔗</div>,
    // buttonText: "Stock",
    LinkIcon: () => <div>🔗</div>,
    link: "/home/my-stock",
    linkText: "Stock",
    additionalButtonText: "Add Product",
    // additionalButtonIcon: AddIcon,
  },
  stock: {
    image: "/office.svg",
    paragraph: "You don't have any products.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Stock",
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
    image: "/girl.svg",
    paragraph: "You haven't loaded any employees yet.",
    ButtonIcon: UploadIcon,
    buttonText: "Load Team Members",
    LinkIcon: AddIcon,
    link: "/home/my-team/addTeam",
    linkText: "Add Team Member",
  },
  orders: {
    image: "/orders.svg",
    paragraph: "You don't have any orders.",
    LinkIcon: ShopIcon,
    link: "/shop",
    linkText: "Shop Now",
  },
  shipments: {
    image: "/world.svg",
    paragraph: "You haven't made any shipments yet.",
    LinkIcon: UploadIcon,
    link: "/home/my-stock",
    linkText: "Shop Now",
  },
  registerok: {
    image: "/world.svg",
    paragraphstrong: "Congratulations!",
    paragraph: "Soon you will be able to access the platform.",
    paragraph2: "Your account has been successfully created.",
    LinkIcon: ComputerIcon,
    link: "https://firstplug.co/",
    linkText: "Home Page",
  },
  loginerror: {
    image: "/alert.svg",
    paragraphstrong: "Oops!",
    paragraph: "Please verify your information or Sign Up.",
    paragraph2: "Invalid Credentials.",
    LinkIcon: ExclamationIcon,
    link: "/login",
    linkText: "Try Again",
  },
  registererror: {
    image: "/alert.svg",
    paragraphstrong: "Oops!",
    paragraph: "Please try again or Sign In.",
    paragraph2: "User already exists.",
    LinkIcon: ExclamationIcon,
    link: "/register",
    linkText: "Try Again",
  },
};

interface EmptyCardProps {
  type: EmptyCardType;
}

export function EmptyCard({ type }: EmptyCardProps) {
  const {
    ButtonIcon,
    LinkIcon,
    buttonText,
    image,
    link,
    linkText,
    paragraphstrong,
    paragraph,
    paragraph2,
    additionalButtonIcon,
    additionalButtonText,
    additionalOnClick,
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
    <div className="flex flex-col items-center gap-3 ">
      <div className="flex flex-col items-center mt-[-50px]">
        <div
          className={` ${
            type === "noStockMember" ? "w-32 h-32" : "w-52 h-52"
          } relative`}
        >
          <Image src={image} alt={paragraph} fill />
        </div>
        {paragraphstrong && (
          <p className="text-xl text-black font-semibold mb-2">
            {paragraphstrong}
          </p>
        )}
        {paragraph2 && <p className="text-dark-grey mb-4">{paragraph2}</p>}
        <p className="text-dark-grey">{paragraph}</p>
      </div>
      <div className="flex gap-2 ">
        {additionalButtonIcon && (
          <Button
            variant="secondary"
            body={additionalButtonText}
            size="big"
            icon={additionalButtonIcon()}
            className="p-3 rounded-md gap-2"
            onClick={additionalOnClick}
          />
        )}
        {ButtonIcon && (
          <Button
            variant="secondary"
            body={buttonText}
            size="big"
            icon={<ButtonIcon />}
            className="p-3 rounded-md"
            onClick={handleActions}
          />
        )}

        {LinkIcon && (
          <CustomLink
            variant="primary"
            size="big"
            className="rounded-md flex gap-2"
            href={link}
          >
            <LinkIcon /> {linkText}
          </CustomLink>
        )}
      </div>
    </div>
  );
}
