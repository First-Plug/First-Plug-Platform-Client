"use client";

import { useState, useCallback } from "react";
import { UnassignedUser } from "../interfaces/unassigned-user.interface";

export const useEditableTableData = (initialUsers: UnassignedUser[]) => {
  const [editableUsers, setEditableUsers] =
    useState<UnassignedUser[]>(initialUsers);

  const updateUserField = useCallback(
    (userId: string, field: keyof UnassignedUser, value: string) => {
      setEditableUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, [field]: value } : user
        )
      );
    },
    []
  );

  const resetToInitial = useCallback(() => {
    setEditableUsers(initialUsers);
  }, [initialUsers]);

  const getEditableUsers = useCallback(() => editableUsers, [editableUsers]);

  return {
    editableUsers,
    updateUserField,
    resetToInitial,
    getEditableUsers,
  };
};
