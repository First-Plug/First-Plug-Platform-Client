"use client";
import { observer } from "mobx-react-lite";
import { useStore } from "@/models/root.store";
import { GridTeam, TableTeam } from "./";
import { DisplayView } from "@/types";

interface TeamMembersProps {
  display?: DisplayView;
}

export const TeamMembers = observer(function ({ display }: TeamMembersProps) {
  const {
    members: { members },
  } = useStore();
  return (
    <section className="flex flex-col gap-4">
      {display === "grid" ? <GridTeam members={members} /> : <TableTeam />}
    </section>
  );
});
