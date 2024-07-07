"use client";
import {
  Button,
  EmptyCard,
  EmptyCardLayout,
  IconX,
  ImgPorfile,
  PageLayout,
  SessionDropdownButton,
} from "@/common";
import Image from "next/image";

export default function Page() {
  return (
    <section className="h-[100vh] ">
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

        <div className="flex items-center rounded-md gap-2 hover:bg-light-grey ">
          <div className="relative w-10 h-10 ">
            <ImgPorfile />
          </div>
          <SessionDropdownButton />
        </div>
      </header>
      <section className="h-[90%] p-8 ">
        <EmptyCardLayout>
          <EmptyCard type="registerok" />
        </EmptyCardLayout>
      </section>
    </section>
  );
}
