import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAsideStore } from "../stores/aside.store";

let socket: Socket | null = null;

export function useTenantWebSocket(tenantId: string) {
  const queryClient = useQueryClient();
  const { closeAside } = useAsideStore();
  useEffect(() => {
    if (!tenantId) return;

    try {
      socket = io(process.env.NEXT_PUBLIC_API || "", {
        query: { tenantId: tenantId },
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("data-changed", () => {
        queryClient.invalidateQueries();
        queryClient.refetchQueries();
      });

      socket.on("shipments-update", (data) => {
        queryClient.invalidateQueries({ queryKey: ["shipments"] });
        queryClient.refetchQueries({ queryKey: ["shipments"] });
      });

      socket.on("company-updated", (data) => {
        queryClient.invalidateQueries({ queryKey: ["tenantConfig"] });
        queryClient.refetchQueries({ queryKey: ["tenantConfig"] });
      });

      socket.on("office-updated", (data) => {
        queryClient.invalidateQueries({ queryKey: ["officeDefault"] });
        queryClient.refetchQueries({ queryKey: ["officeDefault"] });
      });

      socket.on("user-profile-updated", (data) => {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        queryClient.refetchQueries({ queryKey: ["userProfile"] });
      });

      socket.on("superadmin", (data) => {
        queryClient.invalidateQueries();
        queryClient.refetchQueries().then(() => {
          closeAside();
        });
      });

      return () => {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      };
    } catch (error) {
      console.error("Error setting up websocket:", error);
    }
  }, [tenantId, queryClient]);
}
