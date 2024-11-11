"use client";
import { Button, CustomLink } from "@/common";
import { AppleIcon, GoogleIcon, MicrosoftIcon } from "@/common/Icons";
import { BASE_URL } from "@/config/axios.config";
import { signIn } from "next-auth/react";
import { FormEvent, ReactNode } from "react";

interface FormProps {
  title: string;
  children: ReactNode;
  login?: boolean;
  register?: boolean;
  onSubmit: (e: FormEvent) => void;
  className?: string | "";
}

export const Form = function ({
  title,
  children,
  login = false,
  register = false,
  onSubmit,
  className,
}: FormProps) {
  return (
    <form
      className={`py-40 min-w-1/2 w-2/3  h-screen flex flex-col justify-center gap-6 my-4 text-md ${className}`}
      onSubmit={onSubmit}
    >
      <h2 className="text-black font-bold text-2xl font-montserrat">{title}</h2>

      {children}

      <div className="flex justify-center items-center gap-4">
        <hr className="border-grey flex-1 " />
        <span className="text-dark-grey flex-2">Or continue with</span>
        <hr className="border-grey  flex-1 " />
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={(e) => {
            e.preventDefault();
            return signIn("google", {
              callbackUrl: `${process.env.NEXT_PUBLIC_URL}/home/dashboard`,
            });
          }}
          variant="secondary"
          icon={<GoogleIcon className="w-7 h-7" />}
          className="border-none w-10 h-10 rounded-full"
        />

        <Button
          onClick={(e) => {
            e.preventDefault();
            return signIn("azure-ad", {
              callbackUrl: `${process.env.NEXT_PUBLIC_URL}/home/dashboard`,
            });
          }}
          variant="secondary"
          icon={<MicrosoftIcon className="w-7 h-7" />}
          className="border-none w-10 h-10 rounded-full"
        />
      </div>

      <div className="flex justify-center items-center gap-2">
        {login && (
          <>
            <p>Don`t have an account</p>
            <CustomLink href="/register">Sign Up</CustomLink>
          </>
        )}

        {register && (
          <>
            <p>Already have an account?</p>
            <CustomLink href="/login">Log In</CustomLink>
          </>
        )}
      </div>
    </form>
  );
};
