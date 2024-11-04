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
    <div className="flex items-center space-x-4">
      {/* Dropdown for currency code */}
      <DropdownInputProductForm
        title="Currency"
        placeholder="Select currency"
        options={CURRENCY_CODES}
        selectedOption={currencyCode}
        onChange={(option) => onCurrencyChange(option)}
        name="currencyCode"
        className="w-1/3"
        disabled={disabled}
      />
      {/* Input for amount */}
      <InputProductForm
        title="Amount"
        placeholder="Enter amount"
        type="number"
        value={amount.toString()}
        onChange={(e) => onAmountChange(parseFloat(e.target.value))}
        name="amount"
        className="w-2/3"
        disabled={disabled}
      />
    </div>
  );
};

export default PriceInput;
