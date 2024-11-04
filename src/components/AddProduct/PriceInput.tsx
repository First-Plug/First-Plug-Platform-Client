import React from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";

const CURRENCY_CODES = ["USD", "ARS", "BRL", "CLP", "COP", "MXN", "PEN", "UYU"];

interface PriceInputProps {
  currencyCode: string;
  amount: number;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: number) => void;
  disabled?: boolean;
}

const PriceInput: React.FC<PriceInputProps> = ({
  currencyCode,
  amount,
  onCurrencyChange,
  onAmountChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-4 h-14 pr-0">
      <DropdownInputProductForm
        title="Currency"
        placeholder="Select currency"
        options={CURRENCY_CODES}
        selectedOption={currencyCode}
        onChange={(option) => onCurrencyChange(option)}
        name="currencyCode"
        className="w-1/3 text-sm"
        disabled={disabled}
      />
      {/* Input for amount */}
      <InputProductForm
        title="Amount"
        placeholder="Enter amount"
        type="number"
        value={amount.toString()}
        onChange={(e) =>
          onAmountChange(Math.max(0, parseFloat(e.target.value) || 0))
        }
        name="amount"
        className="w-2/3"
        disabled={disabled}
        min={0}
      />
    </div>
  );
};

export default PriceInput;
