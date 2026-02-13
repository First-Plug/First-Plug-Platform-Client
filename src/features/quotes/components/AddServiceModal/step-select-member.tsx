"use client";

import * as React from "react";
import { SearchInput, CountryFlag } from "@/shared";
import { useFetchMembers } from "@/features/members";
import type { Member } from "@/features/members";
import { cn } from "@/shared";
import { Check } from "lucide-react";
import { countriesByCode } from "@/shared/constants/country-codes";

/** Cuenta solo productos recuperables (recoverable === true) para offboarding */
function getRecoverableAssetCount(member: Member): number {
  const products = member.products || [];
  return products.filter((p) => p.recoverable === true).length;
}

interface StepSelectMemberProps {
  selectedMemberId: string | null;
  onMemberSelect: (memberId: string | null) => void;
}

export const StepSelectMember: React.FC<StepSelectMemberProps> = ({
  selectedMemberId,
  onMemberSelect,
}) => {
  const { data: membersData, isLoading } = useFetchMembers();
  const [searchQuery, setSearchQuery] = React.useState("");

  const members = React.useMemo(() => {
    if (!membersData || !Array.isArray(membersData)) return [];
    return membersData;
  }, [membersData]);

  const filteredMembers = React.useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      const name = `${(m.firstName || "").toLowerCase()} ${(m.lastName || "").toLowerCase()}`.trim();
      const email = (m.email || "").toLowerCase();
      const department = (typeof m.team === "string" ? m.team : m.team?.name || "").toLowerCase();
      const fullName = (m.fullName || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        department.includes(q) ||
        fullName.includes(q)
      );
    });
  }, [members, searchQuery]);

  const getLocationLabel = (member: Member): string => {
    if (member.city) return `Remote - ${member.city}`;
    const country = member.country ? countriesByCode[member.country] || member.country : "";
    return country || "—";
  };

  const getRecoverableAssetLabel = (count: number): string =>
    count === 1 ? "1 recoverable asset" : `${count} recoverable assets`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full">
        <SearchInput
          placeholder="Search by name, email, department..."
          onSearch={setSearchQuery}
        />
      </div>

      <div className="flex flex-col gap-3 pr-2 max-h-[340px] overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col justify-center items-center gap-4 py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No members found matching your search."
                : "No members available."}
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const recoverableCount = getRecoverableAssetCount(member);
            const isSelected = selectedMemberId === member._id;
            const department =
              typeof member.team === "string"
                ? member.team
                : member.team?.name || "";
            const locationLabel = getLocationLabel(member);

            return (
              <button
                key={member._id}
                type="button"
                onClick={() =>
                  onMemberSelect(isSelected ? null : member._id || null)
                }
                className={cn(
                  "flex items-start gap-4 w-full text-left p-4 border-2 rounded-lg transition-all",
                  isSelected
                    ? "border-blue bg-blue/5"
                    : "border-gray-200 hover:border-blue/50"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isSelected ? (
                    <div className="flex justify-center items-center bg-blue rounded-full w-8 h-8">
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8">
                      <span className="text-gray-600 text-sm font-medium">
                        {(member.firstName?.[0] || member.email?.[0] || "?").toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-bold text-sm">
                    {member.firstName} {member.lastName}
                    {department ? ` (${department})` : ""}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    {member.country && (
                      <CountryFlag
                        countryName={member.country}
                        size={18}
                        className="rounded-sm shrink-0"
                      />
                    )}
                    {member.country && locationLabel && (
                      <span className="text-muted-foreground"> - </span>
                    )}
                    <span>{locationLabel}</span>
                  </div>
                  {member.email && (
                    <div className="text-gray-600 text-xs truncate">
                      {member.email}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-right text-gray-600 text-xs">
                  {getRecoverableAssetLabel(recoverableCount)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
