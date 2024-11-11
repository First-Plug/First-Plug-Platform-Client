import React, { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useStore } from "@/models";
import { useFetchUserSettings } from "../settings/hooks/useFetchUserSettings";

interface RecoverableSwitchProps {
  selectedCategory: string;
  onRecoverableChange: (value: boolean) => void;
  isUpdate?: boolean;
  formValues: any;
  setFormValues: React.Dispatch<React.SetStateAction<any>>;
  manualChange?: boolean;
  setManualChange?: React.Dispatch<React.SetStateAction<boolean>>;
}

const RecoverableSwitch: React.FC<RecoverableSwitchProps> = ({
  selectedCategory,
  onRecoverableChange,
  isUpdate = false,
  formValues,
  setFormValues,
  setManualChange,
  manualChange,
}) => {
  const {
    user: { user },
  } = useStore();
  const { data: userSettings } = useFetchUserSettings(user?.tenantName);
  const [isRecoverable, setIsRecoverable] = useState(false);

  useEffect(() => {
    if (isUpdate && formValues?.recoverable !== undefined) {
      if (formValues.recoverable !== isRecoverable) {
        setIsRecoverable(formValues.recoverable);
        onRecoverableChange(formValues.recoverable);
      }
      return;
    }

    if (
      selectedCategory &&
      userSettings?.isRecoverableConfig &&
      !manualChange
    ) {
      const configValue = userSettings.isRecoverableConfig[selectedCategory];

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
    userSettings?.isRecoverableConfig,
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
