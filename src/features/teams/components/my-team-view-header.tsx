import { AddIcon, Button, CustomLink, UploadIcon } from "@/shared";

import { useRouter } from "next/navigation";
import React from "react";
import { useAsideStore } from "@/shared";

export function MyTeamViewHeader() {
  const { setAside } = useAsideStore();
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
