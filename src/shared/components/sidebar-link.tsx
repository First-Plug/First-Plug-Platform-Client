import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEventHandler, ReactNode } from "react";

interface SidebarLinkProps {
  isSmall?: boolean;
  isActive?: boolean;
  icon: ReactNode;
  title: string;
  className?: string;
  href: string;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
}

export const SidebarLink = ({
  isSmall,
  isActive,
  icon,
  title,
  className,
  href,
  onMouseEnter,
}: SidebarLinkProps) => {
  const router = useRouter();

  return (
    <Link
      href={`${href}`}
      className={`flex items-center h-12 transition-all duration-300 ease-in-out overflow-hidden ${
        isActive ? "text-blue" : undefined
      } ${className}`}
      onMouseEnter={onMouseEnter}
      onClick={() => router.refresh()}
    >
      {isActive && (
        <div className="bg-blue rounded-lg w-1 h-full transition-all duration-300 ease-in-out"></div>
      )}

      <div
        className={`flex gap-2 transition-all duration-300 ease-in-out ${
          isActive ? "pl-[26px]" : "p-[30px]"
        }`}
      >
        {icon}
        <span
          className={`transition-all duration-300 ease-in-out whitespace-nowrap ${
            isActive
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
    </Link>
  );
};
