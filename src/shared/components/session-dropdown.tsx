"use client";
import { signOut, useSession } from "next-auth/react";
import { NavButtonIcon } from "@/shared";
import { useRouter } from "next/navigation";
import { LogOut, Mail, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const SessionDropdown = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  const handleLogOut = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }

    queryClient.clear();
    queryClient.removeQueries();
    localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");

    // localStorage.removeItem("reactQueryCache");
    // sessionStorage.removeItem("reactQueryCache");

    const checkCacheClear = setInterval(() => {
      const isCacheCleared = queryClient.getQueryCache().getAll().length === 0;
      if (isCacheCleared) {
        clearInterval(checkCacheClear);

        // queryClient.getQueryCache().clear();
        if (session.status === "authenticated") {
          signOut({ callbackUrl: "http://localhost:3000/login" });
        } else {
          router.push("/login");
        }
      }
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0">
          <NavButtonIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white mr-4 w-56">
        <DropdownMenuLabel>
          <div className="flex items-center text-md">
            <Users className="h-4" />{" "}
            {session?.data?.user?.name || session?.data?.user?.name}
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-3" />
            {session?.data?.user?.email}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuLabel className="hover:bg-light-grey p-0 text-red-600 transition-all duration-150">
          <Button
            variant="ghost"
            className="w-full h-full text-start"
            onClick={handleLogOut}
          >
            <LogOut className="mr-2 w-4 h-4" />
            <span>Log out</span>
          </Button>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
