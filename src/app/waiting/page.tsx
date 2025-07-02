"use client";
import {
  ImageProfile,
  SessionDropdown,
  EmptyCard,
  EmptyCardLayout,
} from "@/shared";

import Image from "next/image";

export default function Page() {
  return (
    <section className="h-[100vh]">
      <header className="flex justify-between items-center px-6 py-4">
        <div className="relative">
          <Image
            src="/logo1.png"
            alt="logoFirstPlug"
            width={200}
            height={100}
            priority
          />
        </div>

        <div className="flex items-center gap-2 hover:bg-light-grey rounded-md">
          <div className="relative w-10 h-10">
            <ImageProfile />
          </div>
          <SessionDropdown />
        </div>
      </header>
      <section className="p-8 h-[90%]">
        <EmptyCardLayout>
          <EmptyCard type="registerok" />
        </EmptyCardLayout>
      </section>
    </section>
  );
}
