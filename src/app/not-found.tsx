"use client";
import Image from "next/image";
import notFound from "/public/svg/not-found.svg";
import { CustomLink, Layout, Navbar } from "@/shared";
import { useLogisticUser } from "@/shared/hooks/useLogisticUser";

export default function NotFount() {
  const { isLogisticUser } = useLogisticUser();

  const homeRoute = isLogisticUser ? "/home/logistics" : "/home/dashboard";

  return (
    <Layout>
      <Navbar title="logo" />
      <div className="flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-8 h-[80vh]">
          <Image src={notFound} alt="alerts" width={221} height={220} />
          <h2 className="font-montserrat font-bold text-[64px] text-dark-grey">
            404
          </h2>
          <p className="font-inter font-xl text-dark-grey text-center">
            Sorry! Something went wrong. Please try again
          </p>

          <CustomLink
            href={homeRoute}
            variant="primary"
            className="place-items-center grid rounded-md w-32 h-12 text-lg"
          >
            Go Home
          </CustomLink>
        </div>
      </div>
    </Layout>
  );
}
