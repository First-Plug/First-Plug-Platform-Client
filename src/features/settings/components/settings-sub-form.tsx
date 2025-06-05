import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared";
import { Input } from "@/shared";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/shared";
import { SettingsFormConfig, SettingsFormKeys } from "@/types";
import { UseFormReturn } from "react-hook-form";
export function SettingsSubForm({
  keyValue,
  form,
}: {
  keyValue: SettingsFormKeys;
  form: UseFormReturn;
}) {
  const data = SettingsFormConfig[keyValue];
  return (
    <FormField
      control={form.control}
      name={data?.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{data?.label}</FormLabel>
          <FormControl>
            {data.tpye === "select" ? (
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="py-2 w-full h-14 text-lg">
                    {field.value ? (
                      <SelectValue
                        placeholder="Select Country"
                        className="opacity-10"
                      />
                    ) : (
                      <span className="text-grey">Select Country</span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    <SelectLabel>Location</SelectLabel>
                    {data.options?.map((option) => (
                      <SelectItem value={option} key={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={data?.placeholder}
                {...field}
                readOnly={data.readonly}
                className={`w-full  h-14 py-2 text-lg ${
                  data.readonly
                    ? " rounded-xl border  text-black p-4 bg-disabled/50 select-none cursor-default  focus:outline-none"
                    : ""
                }`}
              />
            )}
          </FormControl>
          <FormDescription>{data?.subMessage}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
