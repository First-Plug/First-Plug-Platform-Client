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

    socket.on("data-changed", () => {
      queryClient.invalidateQueries();
      queryClient.refetchQueries();
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [tenantId]);
}
