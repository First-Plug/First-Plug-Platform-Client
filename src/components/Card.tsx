"use client";
import React, { MouseEvent, ReactNode } from "react";
import { Button, InfoCircle } from "@/common";
import Image from "next/image";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface CardProps {
  children?: ReactNode;
  Title?: string;
  titleButton?: string;
  imageBottom?: string;
  paragraph?: string;
  icon?: JSX.Element;
  altImage?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  RightContent?: ReactNode;
  FooterContent?: ReactNode;
  handleSwapy?: boolean;
}

export const Card = function ({
  children,
  Title,
  titleButton,
  imageBottom,
  paragraph,
  icon,
  altImage,
  className = "",
  onClick,
  RightContent,
  FooterContent,
  handleSwapy = false,
}: CardProps) {
  return (
    <article
      className={`flex flex-col  rounded-xl p-4  border border-border   relative ${className}`}
    >
      <div className={`${Title ? "h-[14%] " : "h-0"}`}>
        {Title && (
          <header className="  flex justify-between  items-center h-full  text-white   ">
            {handleSwapy && <div className="handle" data-swapy-handle></div>}

            <h2 className="text-[20px]  text-black font-montserrat font-bold flex-1 md:text-sm lg:text-xl">
              {Title}
              {Title === "Upcoming Birthdays" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-4 p-1 text-blue/80">
                        <InfoCircle />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="center"
                      className="bg-blue/80 text-white p-2 rounded-md text-xs font-normal z-50"
                    >
                      Only the birthdays of team members with complete
                      information and a birthday within the next 30 days are
                      displayed.
                      <TooltipArrow className="fill-blue/80" />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h2>
            <div className="flex flex-col justify-center items-center ">
              {RightContent && <div>{RightContent}</div>}
              {FooterContent && (
                <div className="text-dark-grey font-medium text-sm">
                  {FooterContent}
                </div>
              )}
            </div>

            {titleButton && <div>{RightContent}</div> && (
              <Button
                icon={icon}
                className=" p-2 whitespace-nowrap rounded-md"
                body={titleButton}
                size="small"
                variant="secondary"
                onClick={onClick}
              />
            )}
          </header>
        )}
      </div>
      <div className=" max-h-[85%] h-[85%] flex-grow  relative">
        {children ? (
          <div className={`absolute    w-full   h-full     `}>{children}</div>
        ) : (
          imageBottom && (
            <div className="absolute top-0 right-0 h-full w-full -z-10  grid place-items-center">
              <div className="flex flex-col ">
                <div className="h-52  relative">
                  <Image
                    src={imageBottom}
                    alt={altImage}
                    fill
                    priority
                    className="aspec"
                    objectFit="contain"
                  />
                </div>
                <p className="text-dark-grey">{paragraph}</p>
              </div>
            </div>
          )
        )}
      </div>
    </article>
  );
};
