"use client";
import { useEffect } from "react";
import Image, { type StaticImageData } from "next/image";
import { observer } from "mobx-react-lite";
import { useFormContext, Controller } from "react-hook-form";

import { type Member, personalData } from "@/features/members";

import { InputProductForm } from "@/features/assets";

interface Props {
  memberImage: StaticImageData;
  isUpdate: boolean;
  initialData: Member;
}

export const PersonalData = observer(
  ({ memberImage, isUpdate, initialData }: Props) => {
    const {
      control,
      formState: { errors },
      setValue,
    } = useFormContext();

    useEffect(() => {
      if (isUpdate && initialData) {
        Object.keys(initialData).forEach((key) => {
          if (key === "birthDate" && initialData[key]) {
            const date = new Date(initialData[key]);
            setValue(key, date.toISOString().split("T")[0]);
          } else if (key === "dni" && initialData[key]) {
            setValue(key, initialData[key].toString());
          } else {
            setValue(key, initialData[key]);
          }
        });
      }
    }, [isUpdate, initialData, setValue]);

    return (
      <div className="flex items-start gap-7">
        <div className="relative mt-4 rounded-[30px] w-1/4 h-auto">
          <Image
            src={memberImage}
            alt="emptyImage"
            objectFit="cover"
            className="rounded-[20px]"
          />
        </div>
        <div className="w-full lg:w-full">
          <div
            className={`grid gap-4 ${
              isUpdate
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 lg:grid-cols-3"
            }`}
          >
            {personalData.fields.map((field, index) => (
              <div className="w-full lg:w-full" key={index}>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => (
                    <>
                      <InputProductForm
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        title={field.title}
                        value={controllerField.value || ""}
                        onChange={(e) => {
                          controllerField.onChange(e.target.value);
                        }}
                        allowFutureDates={false}
                      />
                      <div className="min-h-[24px]">
                        {errors[field.name] && (
                          <p className="text-red-500">
                            {String(
                              errors[field.name]?.message || field.errorMessage
                            )}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
