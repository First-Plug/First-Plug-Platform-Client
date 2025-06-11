"use client";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

import { UserServices } from "@/services/user.services";
import { MinusIcon, AddIcon } from "@/shared";
import { useSession } from "next-auth/react";

export const ComputerExpirationForm = ({ form }: { form: any }) => {
  const { control, reset, setValue } = form;
  const {
    data: { user },
  } = useSession();
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    async function fetchComputerExpiration() {
      if (user.tenantName && !initialDataLoaded) {
        try {
          const tenantInfo = await UserServices.getRecoverableConfig(
            user.tenantName
          );

          reset((formValues) => ({
            ...formValues,
            computerExpiration: tenantInfo.computerExpiration,
          }));

          setInitialDataLoaded(true);
        } catch (error) {
          console.error("Error fetching computerExpiration", error);
        }
      }
    }

    fetchComputerExpiration();
  }, [user, reset, initialDataLoaded]);

  const handleAvgAgeCalculated = (avgAge: number) => {
    // Actualiza el valor de computerExpiration con el promedio calculado
    setValue("computerExpiration", avgAge);
  };

  return (
    <section className="flex flex-col gap-4 p-4 w-full md">
      <div>
        <h2 className="font-montserrat font-bold text-black text-xl">
          Computer Expiration Settings{" "}
          <span className="font-normal text-base">(years)</span>
        </h2>
      </div>

      <Controller
        name="computerExpiration"
        control={control}
        defaultValue={user.computerExpiration}
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
                value={field.value}
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
