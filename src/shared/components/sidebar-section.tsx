"use client";
import { useState, ReactNode, MouseEventHandler, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  return (
    <div className="flex flex-col">
      <button
        onClick={toggleExpanded}
        className={`flex items-center h-12 transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${
          hasActiveSubSection ? "text-blue" : undefined
        }`}
      >
        {hasActiveSubSection && (
          <div className="bg-blue rounded-lg w-1 h-full transition-all duration-300 ease-in-out"></div>
        )}

        <div
          className={`flex justify-between gap-2 items-center transition-all duration-300 ease-in-out w-full ${
            hasActiveSubSection ? "pl-[26px] pr-[30px]" : "p-[30px]"
          }`}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span
              className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
                hasActiveSubSection
                  ? "text-lg font-bold text-blue"
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
          {!isSmall && (
            <div>
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
      </button>

      {!isSmall && isExpanded && (
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
        className={`flex gap-2 transition-all duration-300 ease-in-out ${
          isActive ? "pl-[30px]" : "pl-[30px]"
        }`}
      >
        {icon}
        <span
          className={`transition-all duration-300 ease-in-out whitespace-nowrap text-sm ${
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
