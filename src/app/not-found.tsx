"use client";
import { CustomLink, Layout } from "@/common";
import Image from "next/image";
import notFound from "../../public/svg/not-found.svg";
import { Navbar } from "@/components";

export default function NotFount() {
  return (
    <Layout>
      <Navbar title="logo" />

      <div className="flex flex-col justify-center items-center   gap-8 mx-[40px] my-[32px] border border-boder rounded-lg shadow-md">
        <Image src={notFound} alt="alerts" width={221} height={220} />
        <h2 className="font-montserrat font-bold text-[64px] text-dark-grey">
          404
        </h2>
        <p className="font-xl font-inter text-center text-dark-grey">
          Sorry! Something went wrong. Please try again
        </p>

        <CustomLink
          href="/home/dashboard"
          variant="primary"
          className="w-32 h-12 text-lg rounded-md grid place-items-center"
        >
          Go Home
        </CustomLink>
      </div>
    </Layout>
  );
}
