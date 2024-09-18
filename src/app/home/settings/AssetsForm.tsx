import { Controller } from "react-hook-form";
import * as Switch from "@radix-ui/react-switch";
import { CATEGORIES } from "@/types";
import { useStore } from "@/models";
import { useEffect, useState } from "react";
import { UserServices } from "@/services/user.services";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "@radix-ui/react-tooltip";
import { InfoCircle } from "../../../common/Icons";

export default function AssetsForm({ form }: { form: any }) {
  const { control, reset } = form;

  const {
    user: { user },
  } = useStore();
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
            isRecoverableConfig: recoverableConfig,
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
      <section className="w-full flex flex-col gap-4 border rounded-md p-4">
        <div className="flex items-center">
          <h2 className="text-xl font-montserrat font-bold text-black">
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
              className="bg-blue/80 text-white p-2 rounded-md text-sm"
            >
              The products in each category that are created will be configured
              by default based on your selection.
              <TooltipArrow className="fill-blue/80" />
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-wrap gap-10 justify-between">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex flex-col items-center">
              <span className="text-sm font-medium">{category}</span>
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
}
