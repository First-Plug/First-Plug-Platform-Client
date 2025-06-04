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
    <div className="flex justify-end gap-2 w-full">
      <Button
        size="small"
        variant="secondary"
        body="Add Team Member"
        icon={<AddIcon />}
        onClick={() => {
          router.push("/home/my-team/add");
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
