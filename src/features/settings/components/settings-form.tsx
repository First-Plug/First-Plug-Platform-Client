import { BillingForm, CompanyForm, AccessForm } from "@/components";
import { Button, LoaderSpinner } from "@/common";
import { Form } from "@/shared";
import { useStore } from "@/models";
import { UserZod, UserZodSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/shared";
import { DialogDescription } from "@radix-ui/react-dialog";
import { UserServices } from "@/services/user.services";
import { useState } from "react";
import { AuthServices } from "@/services";
import { useSession } from "next-auth/react";
import { setAuthInterceptor } from "@/config/axios.config";
import { z } from "zod";
import { AssetsForm, ComputerExpirationForm } from "@/features/settings";
import { useQueryClient } from "@tanstack/react-query";

export const SettingsForm = () => {
  const queryClient = useQueryClient();
  const {
    user: { user },
    alerts: { setAlert },
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const form = useForm<z.infer<typeof UserZodSchema>>({
    resolver: zodResolver(UserZodSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: user
      ? {
          ...user,
          computerExpiration: user.computerExpiration,
          isRecoverableConfig: user.isRecoverableConfig
            ? Object.fromEntries(user.isRecoverableConfig.entries())
            : {},
        }
      : {},
  });

  const onSubmit = async (values: UserZod) => {
    const isRecoverableConfigChanged =
      "isRecoverableConfig" in form.formState.dirtyFields;
    const computerExpirationChanged =
      "computerExpiration" in form.formState.dirtyFields;
    const otherFieldsChanged = Object.keys(form.formState.dirtyFields).some(
      (key) => key !== "isRecoverableConfig" && key !== "computerExpiration"
    );

    if (session.data.backendTokens.refreshToken) {
      setIsLoading(true);
      let recoverableUpdated = false;
      let expirationUpdated = false;
      let otherFieldsUpdated = false;
      let refreshData;

      try {
        const accessToken = session.data.backendTokens.accessToken;

        if (isRecoverableConfigChanged) {
          await UserServices.updateRecoverableConfig(
            values.tenantName!,
            values.isRecoverableConfig,
            accessToken
          );
          recoverableUpdated = true;
        }

        if (computerExpirationChanged) {
          await UserServices.updateComputerExpiration(
            values.tenantName!,
            values.computerExpiration,
            accessToken
          );
          expirationUpdated = true;
        }

        if (otherFieldsChanged) {
          await UserServices.updateUser(values);
          refreshData = await AuthServices.refreshToken(
            session.data.backendTokens.refreshToken
          );
          setAuthInterceptor(refreshData.backendTokens.accessToken);
          otherFieldsUpdated = true;

          await session.update({
            backendTokens: refreshData.backendTokens,
            user: {
              ...session.data.user,
              ...refreshData.user,
            },
          });
        }

        if (recoverableUpdated || expirationUpdated || otherFieldsUpdated) {
          queryClient.invalidateQueries({
            queryKey: ["userSettings", values.tenantName],
          });
          setAlert("dataUpdatedSuccessfully");
        }

        queryClient.invalidateQueries({ queryKey: ["assets"] });
      } catch (error) {
        console.error(error);
        setAlert("errorUpdateTeam");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const noChanges = Object.keys(form.formState.dirtyFields).length === 0;
  const isAble = !form.formState.isDirty || isLoading;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 h-full"
      >
        <div className="flex flex-col gap-4 pr-2 h-[90%] max-h-[90%] overflow-y-auto scrollbar-custom">
          <div className="flex gap-4 w-full">
            <CompanyForm form={form} />
            <AccessForm form={form} />
          </div>
          <BillingForm form={form} />
          <div className="gap-4 grid grid-cols-5 w-full h-full">
            {" "}
            <div className="col-span-3 h-full">
              {" "}
              <div className="flex flex-col justify-between border rounded-lg h-full">
                {" "}
                <AssetsForm form={form} />
              </div>
            </div>
            <div className="col-span-2 h-full">
              {" "}
              <div className="flex flex-col justify-between border rounded-lg h-full">
                {" "}
                <ComputerExpirationForm form={form} />
              </div>
            </div>
          </div>
        </div>

        <section className="relative flex justify-end items-center py-6 border-t h-[10%]">
          <Dialog>
            {/* <DialogTrigger>
              <Button
                body="Cancel"
                variant="secondary"
                className="mr-[20px] rounded-lg w-[200px] h-[40px]"
                disabled={noChanges || isLoading}
              />
            </DialogTrigger> */}
            <DialogContent>
              <DialogTitle className="text-xl">Caution ⚠️</DialogTitle>
              <DialogDescription>
                Are you sure you want to reset the form? All changes will be
                lost.
              </DialogDescription>

              <DialogTrigger
                className="bg-blue py-1 rounded-md text-white"
                onClick={() => {
                  form.reset({
                    ...user,
                    isRecoverableConfig: user.isRecoverableConfig
                      ? Object.fromEntries(user.isRecoverableConfig.entries())
                      : {},
                    computerExpiration: user.computerExpiration,
                  });
                }}
              >
                Confirm
              </DialogTrigger>
            </DialogContent>
          </Dialog>

          <Button
            variant="primary"
            className="mr-[39px] rounded-lg w-[200px] h-[40px]"
            type="submit"
            disabled={isAble}
          >
            {isLoading ? <LoaderSpinner /> : "save"}
          </Button>
        </section>
      </form>
    </Form>
  );
};
