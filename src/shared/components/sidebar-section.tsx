"use client";
import { useState, ReactNode, MouseEventHandler, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared";

interface SubSection {
  title: string;
  href: string;
  icon: ReactNode;
  isActive?: boolean;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
}

interface SidebarSectionProps {
  isSmall?: boolean;
  icon: ReactNode;
  title: string;
  subSections: SubSection[];
  defaultExpanded?: boolean;
}

export const SidebarSection = ({
  isSmall,
  icon,
  title,
  subSections,
  defaultExpanded = false,
}: SidebarSectionProps) => {
  const hasActiveSubSection = subSections.some((sub) => sub.isActive);
  const [isExpanded, setIsExpanded] = useState(
    defaultExpanded || hasActiveSubSection
  );

  useEffect(() => {
    if (hasActiveSubSection) {
      setIsExpanded(true);
    }
  }, [hasActiveSubSection]);

  const toggleExpanded = () => {
    if (!isSmall) {
      setIsExpanded(!isExpanded);
    }
  };

  const buttonContent = (
    <>
      {hasActiveSubSection && (
        <div className="bg-blue rounded-lg w-1 h-full transition-all duration-300 ease-in-out flex-shrink-0" />
      )}
      <div
        className={cn(
          "flex justify-between gap-2 items-center transition-all duration-300 ease-in-out w-full",
          hasActiveSubSection ? "pl-[26px] pr-[30px]" : "p-[30px]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span
            className={cn(
              "transition-all duration-300 ease-in-out whitespace-nowrap",
              hasActiveSubSection
                ? "text-lg font-bold text-blue"
                : "font-medium text-dark-grey",
              isSmall
                ? "opacity-0 w-0 max-w-0 overflow-hidden"
                : "opacity-100 w-auto max-w-[200px]"
            )}
          >
            {title}
          </span>
        </div>
        {!isSmall && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown
                size={16}
                className={
                  hasActiveSubSection ? "text-blue" : "text-dark-grey"
                }
              />
            ) : (
              <ChevronRight
                size={16}
                className={
                  hasActiveSubSection ? "text-blue" : "text-dark-grey"
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );

  const buttonClassName = cn(
    "flex items-center h-12 transition-all duration-300 ease-in-out overflow-hidden cursor-pointer w-full",
    hasActiveSubSection && "text-blue"
  );

  if (isSmall) {
    return (
      <div className="flex flex-col">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={buttonClassName}>
              {buttonContent}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="center"
            sideOffset={12}
            avoidCollisions={false}
            className="min-w-[180px] z-[100] shadow-lg border border-gray-200 bg-white"
          >
            {subSections.map((subSection, index) => (
              <DropdownMenuItem key={index} asChild>
                <Link
                  href={subSection.href}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    subSection.isActive && "text-blue font-semibold"
                  )}
                  onMouseEnter={subSection.onMouseEnter}
                >
                  {subSection.icon}
                  {subSection.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={toggleExpanded}
        className={buttonClassName}
      >
        {buttonContent}
      </button>

      {isExpanded && (
        <div className="flex flex-col ml-8">
          {subSections.map((subSection, index) => (
            <SidebarSubLink
              key={index}
              isSmall={isSmall}
              icon={subSection.icon}
              title={subSection.title}
              href={subSection.href}
              isActive={subSection.isActive}
              onMouseEnter={subSection.onMouseEnter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarSubLinkProps {
  isSmall?: boolean;
  isActive?: boolean;
  icon: ReactNode;
  title: string;
  className?: string;
  href: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
}

const SidebarSubLink = ({
  isSmall,
  isActive,
  icon,
  title,
  className,
  href,
  onMouseEnter,
}: SidebarSubLinkProps) => {
  const router = useRouter();

  return (
    <Link
      href={href}
      className={`flex items-center h-10 transition-all duration-300 ease-in-out overflow-hidden ${
        isActive ? "text-blue" : undefined
      } ${className}`}
      onMouseEnter={onMouseEnter}
      onClick={() => router.refresh()}
    >
      <div
        className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
          isActive ? "pl-[20px]" : "pl-[20px]"
        }`}
      >
        {icon}
        <span
          className={`transition-all duration-300 ease-in-out whitespace-nowrap  ${
            isActive
              ? "text-base font-bold text-blue"
              : "font-medium text-dark-grey"
          } ${
            isSmall
              ? "opacity-0 w-0 max-w-0"
              : "opacity-100 w-auto max-w-[200px]"
          }`}
        >
          {title}
        </span>
      </div>
    </Link>
  );
};
