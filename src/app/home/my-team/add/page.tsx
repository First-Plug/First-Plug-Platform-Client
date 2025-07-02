"use client";
import { MemberForm } from "@/features/members";
import { EditMemberAside } from "@/shared";
import { useAsideStore } from "@/shared";

export default function AddMemberPage() {
  const { type } = useAsideStore();

  return <>{type === "EditMember" ? <EditMemberAside /> : <MemberForm />}</>;
}
