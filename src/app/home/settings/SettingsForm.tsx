import { BillingForm, CompanyForm, AccessForm } from "@/components";
import { Button, LoaderSpinner } from "@/common";
import { Form } from "@/components/ui/form";
import { useStore } from "@/models";
import { UserZod, UserZodSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { UserServices } from "@/services/user.services";
import { useState } from "react";
import { AuthServices } from "@/services";
import { useSession } from "next-auth/react";
import { setAuthInterceptor } from "@/config/axios.config";
import { z } from "zod";

export default function SettingsForm() {
  const {
    user: { user },
    alerts: { setAlert },
  } = useStore();
  const form = useForm<z.infer<typeof UserZodSchema>>({
    resolver: zodResolver(UserZodSchema),
    mode: "onChange",
    defaultValues: { ...user },
  });
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const onSubmit = async (values: UserZod) => {
    if (session.data.backendTokens.refreshToken) {
      setIsLoading(true);
      try {
        await UserServices.updateUser(values);
        const refreshData = await AuthServices.refreshToken(
          session.data.backendTokens.refreshToken
        );
        setAuthInterceptor(refreshData.backendTokens.accessToken);

        setAlert("userUpdatedSuccesfully");
      } catch (error) {
        console.log(error);
        setAlert("errorUpdateTeam");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const noChanges = Object.keys(form.formState.dirtyFields).length === 0;
  const isAble = noChanges || !form.formState.isValid;
  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full flex flex-col gap-2"
      >
        <div className="flex flex-col gap-4  h-[90%] max-h-[90%] overflow-y-auto">
          <div className="flex w-full gap-4 ">
            <CompanyForm form={form} />
            <AccessForm form={form} />
          </div>
          <BillingForm form={form} />
        </div>

        <section className="flex h-[10%] py-6 items-center justify-end border-t relative">
          <Dialog>
            <DialogTrigger>
              <Button
                body="Cancel"
                variant="secondary"
                className="mr-[20px] w-[200px] h-[40px] rounded-lg"
                disabled={noChanges || isLoading}
              />
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="text-xl">Caution ⚠️</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset the form? All changes will be
                lost.
              </DialogDescription>

              <DialogTrigger
                className=" bg-blue rounded-md py-1 text-white"
                onClick={() => {
                  form.reset(user);
                }}
              >
                Confirm
              </DialogTrigger>
            </DialogContent>
          </Dialog>

          <Button
            variant="primary"
            className="mr-[39px] w-[200px] h-[40px] rounded-lg"
            type="submit"
            disabled={isAble || isLoading}
          >
            {isLoading ? <LoaderSpinner /> : "save"}
          </Button>
        </section>
      </form>
    </Form>
  );
}
