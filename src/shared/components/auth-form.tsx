"use client";
import { Button, CustomLink, GoogleIcon, MicrosoftIcon } from "@/shared";

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

export const AuthForm = ({
  title,
  children,
  login = false,
  register = false,
  onSubmit,
  className,
}: FormProps) => {
  return (
    <form
      className={`py-40 min-w-1/2 w-2/3  h-screen flex flex-col justify-center gap-6 my-4 text-md ${className}`}
      onSubmit={onSubmit}
    >
      <h2 className="font-montserrat font-bold text-black text-2xl">{title}</h2>

      {children}

      <div className="flex justify-center items-center gap-4">
        <hr className="flex-1 border-grey" />
        <span className="flex-2 text-dark-grey">Or continue with</span>
        <hr className="flex-1 border-grey" />
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
          className="border-none rounded-full w-10 h-10"
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
          className="border-none rounded-full w-10 h-10"
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
