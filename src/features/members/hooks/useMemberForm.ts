"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Member, zodCreateMemberModel } from "@/features/members";

export const useMemberForm = (initialData?: Member) => {
  const methods = useForm({
    resolver: zodResolver(zodCreateMemberModel),
    mode: "onChange",
    defaultValues: {
      ...initialData,
      dni: initialData?.dni === undefined ? "" : initialData.dni,
    },
  });

  const searchParams = useSearchParams();
  const assignerEmail = searchParams.get("email");

  useEffect(() => {
    if (assignerEmail) {
      methods.setValue("email", assignerEmail);
    }
  }, [assignerEmail, methods]);

  return {
    methods,
    assignerEmail,
    hasChanges: methods.formState.isDirty,
    handleSubmit: methods.handleSubmit,
    formState: methods.formState,
  };
};
