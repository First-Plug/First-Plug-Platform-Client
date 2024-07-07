"use client";
import Image from "next/image";
import React from "react";
import userPhoto from "../../public/UserLogo.jpeg";
import { useSession } from "next-auth/react";
import Avvvatars from "avvvatars-react";
export function ImgPorfile({ size }: { size?: number }) {
  const session = useSession();
  session.data;
  return session.status === "authenticated" && session?.data?.user ? (
    <Avvvatars
      value={session.data.user.email}
      style={"character"}
      size={size || 40}
    />
  ) : null;
}
