"use client";

interface InputProps {
  title: string;
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  // required?: string;
  allowFutureDates?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  onWheel?: (event: React.WheelEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputProductForm = ({
  title,
  placeholder,
  type = "text",
  className = "",
  value = "",
  onChange,
  name,
  allowFutureDates = true,
  disabled = false,
  readOnly = false,
  min,
  onWheel,
  onKeyDown,
}: InputProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : e.target.value;
    onChange && onChange({ ...e, target: { ...e.target, value: newValue } });
  };

  const today = new Date().toISOString().split("T")[0];
  const formattedValue = type === "date" && value ? value.split("T")[0] : value;

  return (
    <div className={`relative ${className}`}>
      <label className="block ml-2 font-sans text-dark-grey">{title}</label>
      <input
        name={name}
        type={type}
        value={formattedValue || ""}
        onChange={(e) => {
          onChange(e);
          if (type === "date") {
            handleDateChange(e);
          } else {
            onChange && onChange(e);
          }
        }}
        placeholder={placeholder}
        className={`w-full h-14 py-2 rounded-xl border text-black p-4 font-sans focus:outline-none ${className}`}
        max={type === "date" && !allowFutureDates ? today : undefined}
        disabled={disabled}
        readOnly={readOnly}
        onWheel={onWheel}
        min={min}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
