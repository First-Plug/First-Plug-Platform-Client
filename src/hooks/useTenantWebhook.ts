// src/hooks/useTenantWebSocket.ts
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

let socket: Socket | null = null;

export function useTenantWebSocket(tenantId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    socket = io(process.env.NEXT_PUBLIC_API || "", {
      query: { tenantId },
    });

    socket.on("connect", () => {
      console.log("Connected to socket for tenant");
    });

    socket.on("data-changed", () => {
      console.log("data-changed");
      queryClient.invalidateQueries(); // Invalida todas las queries en el cache
      queryClient.refetchQueries(); // Refresca todas las queries en el cache
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [tenantId]);
}
