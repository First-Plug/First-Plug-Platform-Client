import Link from "next/link";
import { ReactNode } from "react";

interface SidebarLinkProps {
  isSmall?: boolean;
  isActive?: boolean;
  icon: ReactNode;
  title: string;
  className?: string
  href: string
}

export function SidebarLink({
  isSmall,
  isActive,
  icon,
  title,
  className,
  href,
} : SidebarLinkProps) {
  return (
    <Link
      href={`${href}`}
      className={`flex items-center h-12 ${
        isActive ? "text-blue" : undefined
      } ${className}`}
    >
      {isActive && <div className="h-full w-1 bg-blue rounded-lg"></div>}

      <div className={`flex gap-2 ${isActive ? "pl-[26px]" : "p-[30px]"}`}>
        {icon}
        <span
          className={`${
            isActive
              ? "text-lg font-bold text-blue"
              : "font-medium text-dark-grey"
          } ${isSmall && "hidden"}`}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}
