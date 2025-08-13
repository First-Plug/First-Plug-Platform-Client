"use client";

import { PageLayout } from "@/shared";

export default function AssignedUsersPage() {
  return (
    <PageLayout>
      <div className="flex flex-col h-full max-h-full">
        <div className="flex items-center mb-4 max-h-[50%]">
          <h1 className="font-bold text-gray-900 text-2xl">Assigned Users</h1>
        </div>

        <div className="flex-1 min-h-0">
          <div className="bg-white shadow p-6 rounded-lg">
            <p className="py-8 text-gray-600 text-center">
              Esta página mostrará los usuarios que han sido asignados
              exitosamente.
              <br />
              <span className="text-gray-500 text-sm">
                Los usuarios se moverán aquí después de completar el proceso de
                asignación.
              </span>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
