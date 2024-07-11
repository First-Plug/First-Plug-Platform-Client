import { AddIcon, Button, CustomLink, UploadIcon } from "@/common";
import { useStore } from "@/models";
import { useRouter } from "next/navigation";
import React from "react";

export function MyTeamViewHeader() {
  const {
    aside: { setAside },
  } = useStore();
  const router = useRouter();
  return (
    <div className="w-full flex   justify-end gap-2 ">
      <Button
        size="small"
        variant="secondary"
        body="Add Team Member"
        icon={<AddIcon />}
        onClick={() => {
          router.push("/home/my-team/addTeam");
        }}
      />

      <Button
        size="small"
        variant="primary"
        body="Load Team Member"
        icon={<UploadIcon />}
        onClick={() => setAside("LoadMembers")}
      />
    </div>
  );
}
