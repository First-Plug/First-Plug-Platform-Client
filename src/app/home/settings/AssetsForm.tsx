import { Controller } from "react-hook-form";
import { Button } from "@/common";
import * as Switch from "@radix-ui/react-switch";
import { CATEGORIES } from "@/types";

export default function AssetsForm({ form }: { form: any }) {
  const { control } = form;

  return (
    <section className="w-full flex flex-col gap-5 border rounded-md p-4">
      <h2 className="text-xl font-montserrat font-bold text-black">
        Assets Recoverable Settings
      </h2>
      {CATEGORIES.map((category) => (
        <div key={category} className="flex items-center justify-between">
          <span>{category}</span>
          <Controller
            name={`isRecoverableConfig.${category}`}
            control={control}
            render={({ field }) => (
              <Switch.Root
                checked={field.value}
                onCheckedChange={field.onChange}
                className="w-10 h-6 bg-gray-300 rounded-full relative"
              >
                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md transition-transform transform-gpu translate-x-1 data-[state=checked]:translate-x-5" />
              </Switch.Root>
            )}
          />
        </div>
      ))}
    </section>
  );
}
