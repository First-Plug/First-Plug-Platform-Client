import React, { useEffect } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { useFormContext } from "react-hook-form";

const CURRENCY_CODES = [
  "USD",
  "ARS",
  "BOB",
  "BRL",
  "CLP",
  "COP",
  "CRC",
  "GTQ",
  "HNL",
  "ILS",
  "MXN",
  "NIO",
  "PAB",
  "PEN",
  "PYG",
  "EUR",
  "UYU",
  "VES",
];

interface PriceInputProps {
  currencyCode: string;
  amount?: number;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: number | undefined) => void;
  disabled?: boolean;
  isUpdate?: boolean;
  formValues?: any;
  initialData?: any;
}

const PriceInput: React.FC<PriceInputProps> = ({
  currencyCode,
  amount,
  onCurrencyChange,
  onAmountChange,
  disabled = false,
  isUpdate = false,
  formValues = {},
  initialData,
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
        className="w-2/5"
        optionClassName="text-sm"
        disabled={disabled}
      />

      <InputProductForm
        title="Price"
        placeholder="Enter price"
        type="number"
        value={amount !== undefined ? amount.toString() : ""}
        onChange={(e) => {
          const value = e.target.value;
          onAmountChange(value ? parseFloat(value) : undefined);
        }}
        name="amount"
        className="w-3/5"
        disabled={disabled}
        min={0}
        onWheel={(e) => e.currentTarget.blur()}
        onKeyDown={(e) => {
          if (e.key === "-" || e.key === "e") {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
};

export default PriceInput;
