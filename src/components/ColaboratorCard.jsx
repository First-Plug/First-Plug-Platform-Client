"use client";
import React from "react";
import Photo from "../../public/employees/member.jpg";
import Image from "next/image";
import Button from "@/common/Button";
import TeamCard from "@/common/TeamCard";
import { PenIcon, StatusCircleIcon, TrashIcon } from "@/common/Icons";
import useModal from "@/hooks/useModal";
import Aside from "./Aside";
import MemberAsideDetails from "./MemberAsideDetails";

export default function ColaboratorCard({
  member,
  name,
  lastName,
  id,
  img,
  jobPosition,
  products,
  shimentsDetails = "incomplete",
  team,
  className,
}) {
  const { closeModal, openModal, isModalOpen } = useModal();

  return (
    <div
      className={`flex flex-col gap-2  mx-auto rounded-lg border border-border p-4 font-inter ${className}`}
      onClick={openModal}
    >
      <header className="flex justify-between items-start">
        <div className="flex gap-2">
          <Image
            src={img || Photo}
            alt="colabPhoto"
            className="w-1/3 object-cover rounded-md"
          />

          <div className="ml-1 flex flex-col  items-start">
            <TeamCard team={team} />
            <h1 className="text-black font-bold">
              {name} {lastName}
            </h1>
            <b className="text-dark-grey">{id}</b>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            icon={
              <PenIcon
                stroke={2}
                className="text-dark-grey w-[1.2rem] h-[1.2rem]"
              />
            }
          />
          <Button
            body={
              <TrashIcon
                stroke={2}
                className=" text-dark-grey w-[1.2rem] h-[1.2rem]"
              />
            }
          />
        </div>
      </header>
      <section className="flex flex-col gap-2 justify-start">
        <div className="flex   items-center gap-3">
          <h2 className="font-semibold text-lg">Job Position: </h2>
          <p>{jobPosition}</p>
        </div>
        <div className="flex items-center  gap-3">
          <h2 className="font-semibold text-lg">Products</h2>
          <p className="bg-border  rounded-full h-6 w-6 text-center  grid place-items-center items text-sm">
            {products.length}
          </p>
        </div>
        <div className="flex  items-center gap-3">
          <h2 className="font-semibold">Shipment Details:</h2>
          <p className="flex items-center gap-2">
            <StatusCircleIcon status={shimentsDetails} />

            {shimentsDetails
              .slice(0, 1)
              .toUpperCase()
              .concat(shimentsDetails.slice(1))}
          </p>
        </div>
      </section>

      {isModalOpen && (
        <Aside title={"tt"} closeModal={closeModal}>
          <MemberAsideDetails member={member} />
        </Aside>
      )}
    </div>
  );
}
