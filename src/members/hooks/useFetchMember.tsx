import { useQuery } from "@tanstack/react-query";
import { getMember } from "../actions";

export const useFetchMember = (id?: string) => {
  return useQuery({
    queryKey: ["members", id],
    queryFn: () => {
      if (!id) throw new Error("No valid member ID provided"); // Validación extra
      return getMember(id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos "obsoletos"
    enabled: !!id, // Habilita la query solo si el ID es válido
  });
};
