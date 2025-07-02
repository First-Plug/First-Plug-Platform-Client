import React from "react";
import Image from "next/image";
import logo from "../../../public/logo1.png";
import { SearchInput, CustomLink } from "@/shared";
import { Navbar, ChevronRight } from "@/shared";
import waveBottom from "../../../public/waves/Header shape 1.svg";
import waveTop from "../../../public/waves/Header shape 2.svg";
import girlPc from "../../../public/svg/Frame 427321382.svg";
import bagImage from "../../../public/svg/Frame 2608568.svg";
import arrowIcon from "../../../public/svg/Frame 427321381.svg";
import rectangle from "../../../public/svg/Rectangle 518.svg";

export default function Shop() {
  return (
    <>
      <div>
        <nav className="top-0 right-0 left-0 fixed flex justify-between items-center bg-white px-[2.5rem] py-[1.25rem] w-full h-[5.5rem]">
          <div className="flex items-center gap-[1.5rem]">
            <CustomLink href="/home/dashboard">
              <Image
                src={logo}
                alt="logoFirstPlug"
                width={193}
                height={210}
                priority
              />
            </CustomLink>
            <SearchInput
              placeholder="Search by Team, Name or ID Number"
              width={332}
              height={48}
            />
          </div>
          <Navbar />
        </nav>
        <div className="flex">
          <div className="w-1/2 h-screen">
            <section className="mt-[14rem] ml-[9rem] w-[38rem] h-[14rem]">
              <h1 className="gap-[1rem] font-montserrat font-bold text-[3rem] text-black">
                Coming Soon!
              </h1>
              <p className="mt-[1rem] mb-[1.5rem] font-inter text-[1.25rem] text-dark-grey">
                We`re excited to reveal that the Firstplug shop is coming soon!
                Our dedicated team is hard at work, handpicking the very best
                products for you.
              </p>
              <CustomLink
                variant="primary"
                size="big"
                className="flex rounded-lg w-[10rem] h-[3rem]"
                href="/home/dashboard"
              >
                <ChevronRight /> Dashboard
              </CustomLink>
            </section>
          </div>

          <div className="flex w-1/2 h-screen">
            <div className="relative mx-auto my-auto ml-0 w-[50rem] h-[31.25rem]">
              <Image
                src={rectangle}
                alt="rectangle"
                height={50}
                className="top-[14rem] left-[12rem] z-0 absolute"
              />
              <Image
                src={girlPc}
                alt="girlPc"
                height={500}
                className="top-7 right-3 absolute"
              />
              <Image
                src={bagImage}
                alt="bagImage"
                className="top-4 right-[25rem] absolute"
              />
              <Image
                src={arrowIcon}
                alt="arrowIcon"
                className="left-[23rem] absolute"
              />
            </div>
            <div className="top-0 right-0 -z-10 absolute">
              <Image src={waveTop} alt="waveTop" width={500} />
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="bottom-0 left-0 z-0 absolute">
            <Image src={waveBottom} alt="waveBottom" width={600} />
          </div>
        </div>
      </div>
    </>
  );
}
