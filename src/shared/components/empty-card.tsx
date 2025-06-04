"use client";
import Image from "next/image";
import { useStore } from "@/models";
import {
  Button,
  AddIcon,
  ShopIcon,
  UploadIcon,
  ComputerIcon,
  ExclamationIcon,
  CustomLink,
} from "@/shared";

import { signOut, useSession } from "next-auth/react";
import { CATALOGO_FIRST_PLUG } from "@/config/constanst";
import { UserServices } from "@/services/user.services";
type EmptyCardType =
  | "stock"
  | "members"
  | "shipments"
  | "orders"
  | "registerok"
  | "loginerror"
  | "registererror"
  | "noStockMember"
  | "actionHistory";

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
    link: "/my-stock",
    linkText: "Stock",
    additionalButtonText: "Add Product",
    // additionalButtonIcon: AddIcon,
  },
  stock: {
    image: "/office.svg",
    paragraph: "You don't have any products.",
    ButtonIcon: () => <UploadIcon />,
    buttonText: "Load Assets",
    LinkIcon: () => <ShopIcon />,
    link: CATALOGO_FIRST_PLUG,
    linkText: "Shop Now",
    additionalButtonText: "Add Product",
    additionalButtonIcon: () => <AddIcon />,
    additionalOnClick: () => {
      window.location.href = "/my-stock/addOneProduct";
    },
  },
  members: {
    image: "/girl.svg",
    paragraph: "You haven't load any employees yet.",
    ButtonIcon: () => <UploadIcon />,
    buttonText: "Load Team Members",
    additionalButtonIcon: () => <AddIcon />,
    additionalOnClick: () => {
      window.location.href = "/home/my-team/add";
    },
    additionalButtonText: "Add Team Member",
  },
  orders: {
    image: "/Orders.svg",
    paragraph: "You don't have any orders.",
    LinkIcon: () => <ShopIcon />,
    link: "/shop",
    linkText: "Shop Now",
  },
  shipments: {
    image: "/world.svg",
    paragraph: "You haven't made any shipments yet.",
    LinkIcon: () => <UploadIcon />,
    link: "/my-stock",
    linkText: "Shop Now",
  },
  registerok: {
    image: "/world.svg",
    paragraphstrong: "Congratulations!",
    paragraph: "Soon you will be able to access the platform.",
    paragraph2: "Your account has been successfully created.",
    buttonText: "Log In",
    ButtonIcon: () => <ComputerIcon />,
    // link: "/login",
  },
  loginerror: {
    image: "/alert.svg",
    paragraphstrong: "Oops!",
    paragraph: "Please verify your information or Sign Up.",
    paragraph2: "Invalid Credentials.",
    LinkIcon: () => <ExclamationIcon />,
    link: "/login",
    linkText: "Try Again",
  },
  registererror: {
    image: "/alert.svg",
    paragraphstrong: "Oops!",
    paragraph: "Please try again or Sign In.",
    paragraph2: "User already exists.",
    LinkIcon: () => <ExclamationIcon />,
    link: "/register",
    linkText: "Try Again",
  },
  actionHistory: {
    image: "/office.svg",
    paragraph: "You don't have any actions in your history.",
  },
};

interface EmptyCardProps {
  type: EmptyCardType;
}

export const EmptyCard = ({ type }: EmptyCardProps) => {
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
    if (type === "registerok") {
      return signOut({ callbackUrl: "http://localhost:3000/login" });
    }
  };

  const { data } = useSession();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col items-center mt-[-50px]">
        <div
          className={` ${
            type === "noStockMember" ? "w-32 h-32" : "w-52 h-52"
          } relative`}
        >
          <Image src={image} alt={paragraph} fill />
        </div>
        {paragraphstrong && (
          <p className="mb-2 font-semibold text-black text-xl">
            {paragraphstrong}
          </p>
        )}
        {paragraph2 && <p className="mb-4 text-dark-grey">{paragraph2}</p>}
        <p className="text-dark-grey">{paragraph}</p>
      </div>
      <div className="flex gap-2">
        {additionalButtonIcon && (
          <Button
            variant="secondary"
            body={additionalButtonText}
            size="big"
            icon={additionalButtonIcon()}
            className="gap-2 p-3 rounded-md"
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
            className="flex gap-2 rounded-md"
            href={link}
            onClick={
              CATALOGO_FIRST_PLUG === link
                ? () => {
                    const {
                      user: { email, tenantName },
                    } = data;

                    window.open(CATALOGO_FIRST_PLUG, "_blank");
                    UserServices.notifyShop(email, tenantName);
                  }
                : null
            }
          >
            <LinkIcon /> {linkText}
          </CustomLink>
        )}
      </div>
    </div>
  );
};
