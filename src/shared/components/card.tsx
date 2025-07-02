"use client";
import React, { MouseEvent, ReactNode } from "react";
import { Button, InfoCircle } from "@/shared";
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
      className={`flex flex-col rounded-xl p-4 border border-border relative ${className}`}
    >
      <div className={`${Title ? "h-[14%] " : "h-0"}`}>
        {Title && (
          <header className="flex justify-between items-center h-full text-white">
            {handleSwapy && (
              <div className="mr-2 handle" data-swapy-handle></div>
            )}
            <h2 className="flex-1 font-montserrat font-bold text-[20px] text-black md:text-sm lg:text-xl">
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
                      className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                    >
                      Only the birthdays of team members with complete
                      information and a birthday within the next 30 days are
                      displayed.
                      <TooltipArrow className="fill-blue/80" />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {Title === "Latest Activity" && (
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
                      className="z-50 bg-blue/80 p-2 rounded-md font-normal text-white text-xs"
                    >
                      The &apos;Details&apos; button is available only for
                      activity from the past 7 days. To view details of earlier
                      actions, please visit the Activity section.
                      <TooltipArrow className="fill-blue/80" />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </h2>
            <div className="flex flex-col justify-center items-center">
              {RightContent && <div>{RightContent}</div>}
              {FooterContent && (
                <div className="font-medium text-dark-grey text-sm">
                  {FooterContent}
                </div>
              )}
            </div>

            {titleButton && <div>{RightContent}</div> && (
              <Button
                icon={icon}
                className="p-2 rounded-md whitespace-nowrap"
                body={titleButton}
                size="small"
                variant="secondary"
                onClick={onClick}
              />
            )}
          </header>
        )}
      </div>
      <div className="relative flex-grow h-[85%] max-h-[85%]">
        {children ? (
          <div className={`absolute w-full h-full`}>{children}</div>
        ) : (
          imageBottom && (
            <div className="top-0 right-0 -z-10 absolute place-items-center grid w-full h-full">
              <div className="flex flex-col">
                <div className="relative h-52">
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
