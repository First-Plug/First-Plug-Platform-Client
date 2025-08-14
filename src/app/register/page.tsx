"use client";

import { Button, LoaderSpinner, AuthForm, useToast } from "@/shared";
import Image from "next/image";
import { Input } from "../login/Input";
import useInput from "@/shared/hooks/useInput";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthServices } from "@/features/auth";

export default function Register() {
  const { toast } = useToast();
  const router = useRouter();

  const firstNameInput = useInput("", "userName");
  const lastNameInput = useInput("", "userName");
  const emailInput = useInput("", "email");
  const passwordInput = useInput("", "password");
  const confirmPasswordInput = useInput(
    "",
    "confirmPassowrd",
    false,
    passwordInput.value
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Usar el servicio original que ya funcionaba
      await AuthServices.register({
        name: `${firstNameInput.value} ${lastNameInput.value}`,
        email: emailInput.value.toLowerCase(),
        password: passwordInput.value,
        tenantName: "",
        accountProvider: "credentials",
      });

      toast({
        variant: "success",
        title: "Registration Successful!",
        description: "Your account has been created.",
      });

      // Redirect to success page como era antes
      router.push("/register/success");
    } catch (error: any) {
      console.error("Registration error:", error);

      if (
        error?.response?.data?.message === "Email Already in Use" ||
        error?.message === "Email Already in Use"
      ) {
        emailInput.setExternalError("Email Already in Use");
        toast({
          variant: "destructive",
          title: "Email Already in Use",
          description:
            "This email is already registered. Please use a different email or try logging in.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description:
            "An error occurred during registration. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const submitValidation = () => {
    return (
      firstNameInput.error !== null ||
      lastNameInput.error !== null ||
      emailInput.error !== null ||
      passwordInput.error !== null ||
      confirmPasswordInput.error !== null ||
      !firstNameInput.value ||
      !lastNameInput.value ||
      !emailInput.value ||
      !passwordInput.value ||
      !confirmPasswordInput.value
    );
  };

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
        <AuthForm title="Welcome!" register onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  title="First Name"
                  placeholder="First Name"
                  {...firstNameInput}
                />
              </div>
              <div className="flex-1">
                <Input
                  title="Last Name"
                  placeholder="Last Name"
                  {...lastNameInput}
                />
              </div>
            </div>

            <Input
              title="Email"
              placeholder="user@mail.com"
              type="email"
              {...emailInput}
            />

            <Input
              title="Password"
              placeholder="Password"
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
            disabled={submitValidation() || isLoading}
            variant={isLoading ? "text" : "primary"}
            className="rounded-md"
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
