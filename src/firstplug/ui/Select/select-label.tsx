interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const SelectLabel = ({
  children,
  className = "",
  required = false,
}: SelectLabelProps) => {
  return (
    <div className={`block text-dark-grey ml-2 font-sans ${className}`}>
      {children}
      {required && "*"}
    </div>
  );
};
