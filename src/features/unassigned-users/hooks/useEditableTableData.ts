"use client";

import { useState, useCallback } from "react";
// Using any type for flexibility with transformed data
export const useEditableTableData = (initialUsers: any[]) => {
  const [editableUsers, setEditableUsers] = useState<any[]>(initialUsers);

  const updateUserField = useCallback(
    (userId: string, field: string, value: string) => {
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
