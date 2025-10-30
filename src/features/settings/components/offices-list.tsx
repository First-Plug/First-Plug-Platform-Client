"use client";

import { useState, useMemo } from "react";
import { useOffices } from "../hooks/use-offices";
import { OfficeCard } from "./office-card";
import { Button, LoaderSpinner, Input, useAsideStore } from "@/shared";
import { EmptyOffices } from "./empty-offices";
import { Building, Plus, Search } from "lucide-react";
import { Office } from "../types/settings.types";
import { countriesByCode } from "@/shared/constants/country-codes";

export const OfficesList = () => {
  const {
    offices,
    isLoading,
    deleteOffice,
    setDefaultOffice,
    isDeleting,
    isSettingDefault,
  } = useOffices();

  const { pushAside } = useAsideStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOffices: Office[] = useMemo(() => {
    if (!offices || offices.length === 0) return [];

    if (!searchTerm.trim()) return offices;

    const searchTermLower = searchTerm.toLowerCase();

    return offices.filter((office: Office) => {
      const basicMatch =
        office.name.toLowerCase().includes(searchTermLower) ||
        office.city?.toLowerCase().includes(searchTermLower) ||
        office.email?.toLowerCase().includes(searchTermLower);

      const countryCodeMatch = office.country
        ?.toLowerCase()
        .includes(searchTermLower);

      let countryNameMatch = false;
      if (office.country && countriesByCode[office.country]) {
        const fullCountryName = countriesByCode[office.country];
        countryNameMatch = fullCountryName
          .toLowerCase()
          .includes(searchTermLower);
      }

      const stateMatch = office.state?.toLowerCase().includes(searchTermLower);

      return basicMatch || countryCodeMatch || countryNameMatch || stateMatch;
    });
  }, [offices, searchTerm]);

  const handleAddOffice = () => {
    pushAside("CreateOffice");
  };

  const handleDeleteOffice = (id: string) => {
    deleteOffice(id);
  };

  const handleSetDefaultOffice = (id: string) => {
    setDefaultOffice(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderSpinner />
      </div>
    );
  }

  if (!isLoading && (!offices || offices.length === 0)) {
    return <EmptyOffices />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button
          onClick={handleAddOffice}
          variant="secondary"
          size="small"
          className="flex items-center"
        >
          <Plus className="w-4 h-4" />
          Add Office
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
          <Input
            placeholder="Search offices by name, city, country, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-gray-600 text-sm">
          {filteredOffices.length}{" "}
          {filteredOffices.length === 1 ? "office" : "offices"}
        </div>
      </div>

      {/* Offices Grid */}
      {filteredOffices.length === 0 ? (
        <div className="py-12 text-gray-500 text-sm text-center">
          No results for current filters.
        </div>
      ) : (
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {filteredOffices?.map((office: Office) => (
            <OfficeCard
              key={office._id}
              office={office}
              onDelete={handleDeleteOffice}
              onSetDefault={handleSetDefaultOffice}
              isDeleting={isDeleting}
              isSettingDefault={isSettingDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
};
