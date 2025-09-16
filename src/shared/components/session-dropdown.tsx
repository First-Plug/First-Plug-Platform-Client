"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOut, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { NavButtonIcon } from "../icons/icons";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";

export const SessionDropdown = () => {
  const router = useRouter();
  const session = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogOut = () => {
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }

    queryClient.clear();
    queryClient.removeQueries();
    localStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");

    const checkCacheClear = setInterval(() => {
      const isCacheCleared = queryClient.getQueryCache().getAll().length === 0;
      if (isCacheCleared) {
        clearInterval(checkCacheClear);

        if (session.status === "authenticated") {
          signOut({ callbackUrl: "http://localhost:3000/login" });
        } else {
          router.push("/login");
        }
      }
    }, 100);
  };

  return (
    <div ref={dropdownRef} className="inline-block relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="text" className="p-0" onClick={() => setOpen(!open)}>
            <NavButtonIcon />
          </Button>
        </DropdownMenuTrigger>
        {open && (
          <div className="top-12 right-0 z-[100] absolute bg-white shadow-lg p-2 border border-gray-200 rounded-md w-56 item">
            <div className="flex flex-col justify-center items-start">
              <div className="flex items-center gap-2 text-md">
                <Users className="w-5 h-5" />
                <span className="font-semibold">
                  {session?.data?.user?.name || session?.data?.user?.name}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-sm">
                <span>{session?.data?.user?.email}</span>
              </div>
            </div>

            <div className="mt-2 p-0">
              <Button
                variant="text"
                className="hover:bg-gray-100 p-2 rounded-md w-full h-full text-red-600 text-sm text-start"
                onClick={handleLogOut}
              >
                <LogOut className="mr-2 w-4 h-4" />
                <span>Log out</span>
              </Button>
            </div>
          </div>
        )}
      </DropdownMenu>
    </div>
  );
};
