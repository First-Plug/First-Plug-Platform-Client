"use client";

import { useState, useMemo } from "react";
import { useOffices } from "../hooks/use-offices";
import { OfficeCard } from "./office-card";
import { Button, LoaderSpinner, Input, useAsideStore } from "@/shared";
import { Building, Plus, Search } from "lucide-react";
import { Office } from "../types/settings.types";

export const OfficesList = () => {
  const { offices, isLoading, deleteOffice, isDeleting } = useOffices();

  const { setAside } = useAsideStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar oficinas basado en el término de búsqueda
  const filteredOffices: Office[] = useMemo(() => {
    if (!offices || offices.length === 0) return [];

    if (!searchTerm.trim()) return offices;

    return offices.filter(
      (office: Office) =>
        office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [offices, searchTerm]);

  const handleAddOffice = () => {
    setAside("CreateOffice");
  };

  const handleDeleteOffice = (id: string) => {
    deleteOffice(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button
          onClick={handleAddOffice}
          variant="primary"
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
            placeholder="Search offices by name, city, or country..."
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
        <div className="py-12 text-center">
          <Building className="mx-auto w-12 h-12 text-gray-400" />
          <h3 className="mt-2 font-medium text-gray-900 text-sm">
            {searchTerm ? "No offices found" : "No offices yet"}
          </h3>
          <p className="mt-1 text-gray-500 text-sm">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding your first office location."}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddOffice} variant="primary">
                <Plus className="mr-2 w-4 h-4" />
                Add Office
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {filteredOffices?.map((office: Office) => (
            <OfficeCard
              key={office._id}
              office={office}
              onDelete={handleDeleteOffice}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
