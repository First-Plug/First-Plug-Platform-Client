"use client";
import Image from "next/image";
import { Button, Layout } from "@/common";
import { IconX } from "../../common/Icons";
import { CreationTeamMember } from "@/types";
import { useCallback, useState } from "react";
import { AccessForm, BillingForm, CompanyForm } from "@/components";

export default function UserRegister() {
  const [state, setState] = useState<CreationTeamMember>({
    firstName: "",
    picture: "",
    lastName: "",
    birthDate: "",
    phone: "",
    email: "",
    position: "",
    city: "",
    zipCode: "",
    address: "",
    apartment: "",
    startDate: "",
    team: "",
    personalEmail: "",
    country: "",
    additionalInfo: "",
    teamId: "",
    isDeleted: false,
  });
  const handleInput = useCallback((key: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);
  return (
    <section className="flex flex-col justify-between   ">
      <header className="  py-4 px-6  flex justify-between items-center  ">
        <div className="relative">
          <Image
            src="/logo1.png"
            alt="logoFirstPlug"
            width={200}
            height={100}
            priority
          />
        </div>
        <Button
          icon={<IconX />}
          variant="primary"
          className=" rounded-full  w-[10px]  h-[10px] outline"
        />
      </header>

      <section className="   px-6">
        <div className="  flex flex-col gap-4 rounded-xl shadow-lg border border-grey-200 p-5 ">
          <section className="  ">
            <h1 className="font-montserrat text-[32px] font-bold text-black ">
              Welcome!
            </h1>
            <p className="font-inter text-[20px] font-normal text-black">
              Please complete all the required fields to create your account.
            </p>
          </section>
        </div>
      </section>

      <footer className=" absolute  bottom-0  w-full border p-4 flex items-center justify-between bg-white">
        <p className="text-error font-inter font-semibold ml-[20px]">
          *Required fields
        </p>
        <Button body="Continue" variant="primary" disabled={true} />
      </footer>
    </section>
  );
}
