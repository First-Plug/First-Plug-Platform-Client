import React, { useEffect } from "react";
import { DropdownInputProductForm } from "./DropDownProductForm";
import { InputProductForm } from "./InputProductForm";
import { useFormContext } from "react-hook-form";

const CURRENCY_CODES = ["USD", "ARS", "BRL", "CLP", "COP", "MXN", "PEN", "UYU"];

interface PriceInputProps {
  currencyCode: string;
  amount: number;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: number) => void;
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
  const { setValue } = useFormContext();

  // useEffect(() => {
  //   if (isUpdate && formValues.price) {
  //     setValue("price.currencyCode", formValues.price.currencyCode || "USD");
  //     setValue("price.amount", formValues.price.amount || 0);
  //   }
  //   console.log("formValues?.price?.amount", formValues?.price?.amount);
  // }, [isUpdate, formValues, setValue]);

  return (
    <div className="flex items-center space-x-4 h-14 pr-0">
      <DropdownInputProductForm
        title="Currency"
        placeholder="Select currency"
        options={CURRENCY_CODES}
        selectedOption={currencyCode}
        onChange={(option) => onCurrencyChange(option)}
        name="currencyCode"
        className="w-18"
        optionClassName="text-sm"
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
        className="w-18"
        disabled={disabled}
        min={0}
      />
    </div>
  );
};

export default PriceInput;
