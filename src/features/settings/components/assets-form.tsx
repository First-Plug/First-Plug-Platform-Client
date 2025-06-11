import { Controller } from "react-hook-form";
import * as Switch from "@radix-ui/react-switch";
import { CATEGORIES } from "@/features/assets/interfaces/product";

import { useEffect, useState } from "react";
import { UserServices } from "@/services/user.services";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { InfoCircle } from "@/shared";
import { useSession } from "next-auth/react";

export const AssetsForm = ({ form }: { form: any }) => {
  const { control, reset } = form;

  const {
    data: { user },
  } = useSession();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    async function fetchRecoverableConfig() {
      if (user.tenantName && !initialDataLoaded) {
        try {
          const recoverableConfig = await UserServices.getRecoverableConfig(
            user.tenantName
          );

          reset((formValues) => ({
            ...formValues,
            // isRecoverableConfig: recoverableConfig,
          }));

          setInitialDataLoaded(true);
        } catch (error) {
          console.error("Error fetching recoverable config", error);
        }
      }
    }

    fetchRecoverableConfig();
  }, [user, reset, initialDataLoaded]);

  return (
    <TooltipProvider>
      <section className="flex flex-col gap-4 p-4 border rounded-md w-full">
        <div className="flex items-center">
          <h2 className="font-montserrat font-bold text-black text-xl">
            Recoverable Configuration
          </h2>

          {/* Tooltip for info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-2 p-1 text-blue/80">
                <InfoCircle />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              align="center"
              className="bg-blue/80 p-2 rounded-md text-white text-sm"
            >
              The products created in each category will be automatically
              configured based on the option you choose
              <TooltipArrow className="fill-blue/80" />
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-wrap justify-between gap-10">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex flex-col items-center">
              <span className="mb-2 font-medium text-sm">{category}</span>
              <Controller
                name={`isRecoverableConfig.${category}`}
                control={control}
                render={({ field }) => {
                  return (
                    <Switch.Root
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        form.trigger();
                      }}
                      onBlur={() => form.trigger()}
                      className={`w-10 h-6 bg-blue/80 rounded-full relative transition-colors duration-200
                        ${field.value ? "bg-blue/80" : "bg-gray-300"}`}
                    >
                      <Switch.Thumb
                        className={`block w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 transform-gpu
                          ${field.value ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </Switch.Root>
                  );
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </TooltipProvider>
  );
};
