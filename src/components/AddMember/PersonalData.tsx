"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { observer } from "mobx-react-lite";
import personalData from "./JSON/personaldata.json";
import { InputProductForm } from "../AddProduct/InputProductForm";
import { useFormContext, Controller } from "react-hook-form";
//testing

const PersonalData = function ({ memberImage, isUpdate, initialData }) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  useEffect(() => {
    if (isUpdate) {
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
      <div className="relative w-1/4 h-auto rounded-[30px] mt-4">
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
                      onChange={(e) =>
                        field.name === "dni"
                          ? controllerField.onChange(
                              e.target.value !== ""
                                ? parseInt(e.target.value, 10)
                                : undefined
                            )
                          : controllerField.onChange(e.target.value)
                      }
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
};

export default observer(PersonalData);
