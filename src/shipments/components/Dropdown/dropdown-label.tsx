import { useDropdown } from "./context/dropdown-context";

export const DropdownLabel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { color } = useDropdown();

  return (
    <label
      className={`block ml-2 font-semibold ${className} ${
        color !== "normal" && `text-${color}`
      }`}
    >
      {children}
    </label>
  );
};
