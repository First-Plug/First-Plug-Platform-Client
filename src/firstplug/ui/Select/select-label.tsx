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
    <div className={`block text-dark-grey font-sans ${className}`}>
      {children}
      {required && "*"}
    </div>
  );
};
