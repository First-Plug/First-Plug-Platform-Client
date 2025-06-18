"use client";

import { Button, LoaderSpinner, AuthForm } from "@/shared";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthServices } from "@/features/auth";
import useInput from "@/shared/hooks/useInput";
import { FormEvent, useState } from "react";
import { useToast } from "@/shared";
import { Input } from "../login/Input";

export default function Register() {
  const nameInput = useInput("", "userName");
  const emailInput = useInput("", "email");
  const passwordInput = useInput("", "password");
  const confirmPasswordInput = useInput(
    "",
    "confirmPassowrd",
    false,
    passwordInput.value
  );
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await AuthServices.register({
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        tenantName: "",
        accountProvider: "credentials",
      });
      router.push("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sumbtiValidation =
    !nameInput.value ||
    nameInput.error !== null ||
    !emailInput.value ||
    emailInput.error !== null ||
    !passwordInput.value ||
    passwordInput.error !== null ||
    confirmPasswordInput.value !== passwordInput.value;

  return (
    <section className="flex">
      <Image
        src="/svg/loginSvg.svg"
        alt="img"
        width={540}
        height={960}
        className="w-[50%] h-screen object-cover"
        priority
      />

      <article className="flex justify-center w-[50%] h-screen">
        <AuthForm title="Welcome Back!" register onSubmit={handleSubmit}>
          <div>
            <Input title="Full Name" placeholder="Placeholder" {...nameInput} />

            <Input title="Email" placeholder="user@mail.com" {...emailInput} />

            <Input
              title="Password"
              placeholder="Passworad"
              type="password"
              {...passwordInput}
            />

            <Input
              title="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              {...confirmPasswordInput}
            />
          </div>

          <Button
            disabled={sumbtiValidation}
            variant={isLoading ? "text" : "primary"}
            className="rounded-md"
            size="big"
            type="submit"
          >
            {isLoading && <LoaderSpinner />}
            Create Account
          </Button>
        </AuthForm>
      </article>
    </section>
  );
}
