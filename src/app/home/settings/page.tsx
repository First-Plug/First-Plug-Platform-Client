"use client";
import { PageLayout } from "@/common";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models";
import { getSession, useSession } from "next-auth/react";
import { BarLoader } from "@/components/Loader/BarLoader";

import SettingsForm from "./SettingsForm";
import { AuthServices } from "@/services";
export default observer(function Settings() {
  const {
    user: { user, setUser },
  } = useStore();

  const session = useSession();
  useEffect(() => {
    if (session.data?.user._id) {
      AuthServices.getUserInfro(session.data.user._id).then((res) => {
        setUser(res);
      });
    }
  }, []);

  return (
    <PageLayout>
      {!user ? (
        <BarLoader />
      ) : (
        <section className="h-full flex flex-col gap-2">
          <SettingsForm />
        </section>
      )}
    </PageLayout>
  );
});
