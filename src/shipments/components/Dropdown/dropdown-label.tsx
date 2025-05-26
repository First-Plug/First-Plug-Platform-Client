import { useDropdown } from "./context/dropdown-context";

export const DropdownLabel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`ml-2 ${className}`}>{children}</div>;
};
