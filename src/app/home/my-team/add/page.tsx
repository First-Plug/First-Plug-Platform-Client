"use client";
import { MemberForm } from "@/features/members";
import { EditMemberAside } from "@/shared";
import { useAsideStore } from "@/shared";

export default function AddMemberPage() {
  const { getCurrentAside } = useAsideStore();
  const currentAside = getCurrentAside();
  const type = currentAside?.type;

  return <>{type === "EditMember" ? <EditMemberAside /> : <MemberForm />}</>;
}
