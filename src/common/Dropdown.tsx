"use client";
import { signOut, useSession } from "next-auth/react";
import { NavButtonIcon } from "./Icons";
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

export function SessionDropdownButton() {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();

  const handleLogOut = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }

    queryClient.clear();

    localStorage.removeItem("reactQueryCache");
    sessionStorage.removeItem("reactQueryCache");

    router.push("/login");
    if (session.status === "authenticated") {
      signOut({ callbackUrl: "http://localhost:3000/login" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0">
          <NavButtonIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white mr-4">
        <DropdownMenuLabel>
          <div className="text-md  flex items-center  ">
            <Users className="h-4" />{" "}
            {session?.data?.user?.name || session?.data?.user?.name}
          </div>
          <div className="text-sm flex items-center ">
            <Mail className="h-3" />
            {session?.data?.user?.email}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuLabel className=" p-0 hover:bg-light-grey transition-all duration-150 text-red-600">
          <Button
            variant="ghost"
            className="h-full w-full text-start"
            onClick={handleLogOut}
          >
            <LogOut className="mr-2 h-4 w-4 " />
            <span>Log out</span>
          </Button>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
