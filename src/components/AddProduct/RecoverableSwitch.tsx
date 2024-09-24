import React, { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useStore } from "@/models";

interface RecoverableSwitchProps {
  selectedCategory: string;
  onRecoverableChange: (value: boolean) => void;
  isUpdate?: boolean;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
}

const RecoverableSwitch: React.FC<RecoverableSwitchProps> = ({
  selectedCategory,
  onRecoverableChange,
  isUpdate = false,
  formValues,
  setFormValues,
}) => {
  const {
    user: { user },
  } = useStore();
  const [isRecoverable, setIsRecoverable] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [manualChange, setManualChange] = useState(false);

  useEffect(() => {
    if (isUpdate && formValues?.recoverable !== undefined) {
      if (formValues.recoverable !== isRecoverable) {
        setIsRecoverable(formValues.recoverable);
        onRecoverableChange(formValues.recoverable);
      }
      return;
    }

    if (selectedCategory && user?.isRecoverableConfig && !manualChange) {
      const configValue = user.isRecoverableConfig.get(selectedCategory);

      if (configValue !== undefined && configValue !== isRecoverable) {
        setIsRecoverable(configValue);
        onRecoverableChange(configValue);
      } else if (configValue === undefined && isRecoverable) {
        setIsRecoverable(false);
        onRecoverableChange(false);
      }
    }
  }, [
    selectedCategory,
    user?.isRecoverableConfig,
    onRecoverableChange,
    manualChange,
    isUpdate,
    formValues?.recoverable,
    isRecoverable,
  ]);

  const handleToggle = (checked: boolean) => {
    setIsRecoverable(checked);
    setManualChange(true);
    onRecoverableChange(checked);

    setFormValues({
      ...formValues,
      recoverable: checked,
    });
  };

  return (
    <div className="flex flex-col space-y-2 mb-10">
      <label htmlFor="recoverable" className="text-dark-grey font-sans">
        Recoverable
      </label>
      <Switch.Root
        id="recoverable"
        checked={isRecoverable}
        onCheckedChange={handleToggle}
        className={`${
          isRecoverable ? "bg-blue/80" : "bg-gray-300"
        } relative inline-flex h-8 w-14 items-center rounded-full `}
      >
        <Switch.Thumb
          className={`${
            isRecoverable ? "translate-x-6" : "translate-x-1"
          } inline-block h-6 w-6 transform bg-white rounded-full transition`}
        />
      </Switch.Root>
    </div>
  );
};

export default RecoverableSwitch;
