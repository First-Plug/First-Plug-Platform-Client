import Button from "@/common/Button";
import Layout from "@/common/Layout";
import Image from "next/image";
import React from "react";
import office from "../../../../public/office.svg";
import Card from "@/components/Card";
import Link from "next/link";

import { ShopIcon } from "../../../common/Icons";

export function UpLoadIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`w-6 h-6 ${className}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
export default function MyStock() {
  return (
    <Layout>
      <div className="border-2 shadow-sm border-border rounded-md h-full grid place-items-center w-full ">
        <div>
          <Card
            imageBottom={office}
            paragraph={"You don't have any items."}
            className={"border-none p-0 m-0"}
          />
        </div>
        <div className="flex gap-2">
          <Link href={"/home/my-stock/data"}>
            <Button
              variant={"secondary"}
              body="Load Stock"
              icon={<UpLoadIcon />}
              className={"p-3 rounded-md"}
            />
          </Link>
          <Button
            variant={"primary"}
            icon={<ShopIcon />}
            body="Shop Now"
            className={"p-3 rounded-md"}
          />
        </div>
      </div>
    </Layout>
  );
}