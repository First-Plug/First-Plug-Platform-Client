import React, { useEffect, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { useStore } from "@/models";
import { UserServices } from "@/services/user.services";

interface RecoverableSwitchProps {
  selectedCategory: string;
  onRecoverableChange: (value: boolean) => void;
  isUpdate?: boolean;
}

const RecoverableSwitch: React.FC<RecoverableSwitchProps> = ({
  selectedCategory,
  onRecoverableChange,
  isUpdate = false,
}) => {
  const {
    user: { user, setUserRecoverable },
  } = useStore();
  const [isRecoverable, setIsRecoverable] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    async function fetchRecoverableConfig() {
      if (user?.tenantName && !initialDataLoaded) {
        try {
          const recoverableConfig = await UserServices.getRecoverableConfig(
            user.tenantName
          );

          setUserRecoverable({
            ...user,
            isRecoverableConfig: recoverableConfig,
          });

          setInitialDataLoaded(true);
        } catch (error) {
          console.error("Error fetching recoverable config", error);
        }
      }
    }

    fetchRecoverableConfig();
  }, [user, setUserRecoverable, initialDataLoaded]);

  useEffect(() => {
    if (selectedCategory && user?.isRecoverableConfig) {
      const configValue = user.isRecoverableConfig.get
        ? user.isRecoverableConfig.get(selectedCategory)
        : user.isRecoverableConfig[selectedCategory];

      //   console.log("Selected Category:", selectedCategory);
      //   console.log("Config Value from isRecoverableConfig:", configValue);
      //   console.log(
      //     "Available Categories in isRecoverableConfig:",
      //     user.isRecoverableConfig.get
      //       ? Array.from(user.isRecoverableConfig.keys())
      //       : Object.keys(user.isRecoverableConfig)
      //   );

      setIsRecoverable(configValue ?? false);
      onRecoverableChange(configValue ?? false);
    }
  }, [selectedCategory, user?.isRecoverableConfig, onRecoverableChange]);

  const handleToggle = (checked: boolean) => {
    setIsRecoverable(checked);
    onRecoverableChange(checked);
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
