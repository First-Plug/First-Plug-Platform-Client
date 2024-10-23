"use client";
import Image from "next/image";
import { Button, Input, LoaderSpinner } from "@/common";
import { Form } from "@/components";
import { useRouter } from "next/navigation";
import useInput from "@/hooks/useInput";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const emailInput = useInput("", "email");
  const passWordInput = useInput("", "password");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const handleSumbit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: emailInput.value.toLowerCase(),
        password: passWordInput.value,
        redirect: false,
      });

      if (!res.ok) {
        throw new Error(res.error);
      }
      router.push("/home/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Credential",
        description: "Invalid username or password. Please try again.",
        // duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex">
      <Image
        src="/svg/loginSvg.svg"
        alt="img"
        width={540}
        height={960}
        className="w-[50%] h-screen p-15 object-cover"
        priority
      />

      <article className="w-[50%] h-screen flex justify-center ">
        <Form title="Welcome Back!" login onSubmit={handleSumbit}>
          <div className="text-md">
            <Input
              title="Email"
              placeholder="user@mail.com"
              {...emailInput}
              required
            />

            <Input
              isLogin
              title="Password"
              type="password"
              placeholder="Password"
              {...passWordInput}
              required
            />
          </div>

          <div className=" flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger className=" w-1/3">
                <Button variant="text">Forgot Password ?</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="font-inter">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <h2 className="text-xl text-black font-semibold ">
                      Forgot Password ?
                    </h2>
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <div className="text-md ">
                      <p>
                        Looks like you&apos;ve forgotten your password.
                        Don&apos;t worry, we&apos;ve got you covered. Simply
                        send an email to
                        <b className="text-black "> hola@firstplug.co </b>
                        requesting a password reset, and we&apos;ll get you back
                        into your account in no time.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Button
            type="submit"
            disabled={
              isLoading ||
              !emailInput.value ||
              !passWordInput.value ||
              emailInput.error !== null
            }
            variant={isLoading ? "text" : "primary"}
            className="rounded-md "
          >
            {isLoading && <LoaderSpinner />}
            Log In
          </Button>
        </Form>
      </article>
    </section>
  );
}
