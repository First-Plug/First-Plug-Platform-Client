"use client";
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useStore } from "@/models";
import { UserServices } from "@/services/user.services";
import { MinusIcon, AddIcon } from "@/common";

export default function ComputerExpirationForm({ form }: { form: any }) {
  const { control, reset, setValue } = form;
  const {
    user: { user },
    products: { tableProducts },
  } = useStore();
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
    <section className="w-full flex flex-col gap-4 md p-4">
      <div>
        <h2 className="text-xl font-montserrat font-bold text-black">
          Computer Expiration Settings
        </h2>
      </div>

      <Controller
        name="computerExpiration"
        control={control}
        defaultValue={user.computerExpiration}
        render={({ field }) => (
          <div className="flex flex-col items-start">
            <div className="flex items-center h-14 border rounded-xl p-4 text-black">
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
                className="w-12 text-center mx-2 tracking-wide font-montserrat font-semibold text-md"
              />
              <button
                type="button"
                onClick={() => field.onChange(Math.min(10, field.value + 0.5))}
                className="px-2"
              >
                <AddIcon />
              </button>
            </div>
            <p className="block font-montserrat text-sm font-semibold text-dark-grey mb-2">
              Set Expiration Period (Years)
            </p>
          </div>
        )}
      />
    </section>
  );
}
