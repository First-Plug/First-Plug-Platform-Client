"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { MinusIcon, AddIcon } from "@/shared";

interface ComputerExpirationConfigProps {
  form: any;
}

export const ComputerExpirationConfig = ({ form }: ComputerExpirationConfigProps) => {
  const { control } = form;

  return (
    <section className="flex flex-col gap-4 p-6 w-full">
      <div>
        <h2 className="font-montserrat font-bold text-black text-xl">
          Computer Expiration Settings{" "}
          <span className="font-normal text-base">(years)</span>
        </h2>
      </div>

      <Controller
        name="computerExpiration"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col items-start">
            <div className="flex items-center p-4 border rounded-xl h-14 text-black">
              <button
                type="button"
                onClick={() => field.onChange(Math.max(0.5, field.value - 0.5))}
                className="px-2"
              >
                <MinusIcon />
              </button>
              <input
                type="number"
                value={field.value || 2}
                readOnly
                className="justify-center items-center ml-4 w-10 font-montserrat font-semibold text-md text-center tracking-wide appearance-none"
              />
              <button
                type="button"
                onClick={() => field.onChange(Math.min(10, field.value + 0.5))}
                className="px-2"
              >
                <AddIcon />
              </button>
            </div>
          </div>
        )}
      />
    </section>
  );
};
