"use client";

import { useEffect, useRef } from "react";
import { PageLayout, BarLoader, Button, PaginationAdvanced } from "@/shared";

import { DataTable } from "@/features/fp-tables";

import {
  EmptyStock,
  NoFilterResults,
  useGetTableAssets,
  useAssetsTable,
  useAssetsTableColumns,
  TableStockActions,
  useSubtableLogic,
  useProductStore,
} from "@/features/assets";

export default function MyAssets() {
  const { data: assets, isLoading } = useGetTableAssets();
  const { setSelectedCountry, selectedSerialNumber, setSelectedSerialNumber } = useProductStore();
  const prevSelectedSerialNumberRef = useRef<string | null>(null);

  const {
    pageIndex,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    handleClearAllFilters,
    paginatedAssets,
    filteredAssets,
    tableContainerRef,
    useAssetsTableFilterStore,
  } = useAssetsTable(assets || []);

  const columns = useAssetsTableColumns({ assets: assets || [] });

  const {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
  } = useSubtableLogic();

  const handleClearAllFiltersExtended = () => {
    handleClearAllFilters();
    handleClearSubtableFilters();
    setSelectedCountry(null);
    setSelectedSerialNumber(null);
  };

  // Expandir automáticamente cuando hay un único resultado después de filtrar por serial number
  useEffect(() => {
    // Solo expandir si hay un serial number seleccionado
    if (selectedSerialNumber && selectedSerialNumber.trim() !== "") {
      // Verificar si hay exactamente un asset filtrado
      if (filteredAssets.length === 1) {
        const singleAsset = filteredAssets[0];
        const rowId = getRowId(singleAsset);
        
        if (rowId) {
          // Expandir la fila única
          useAssetsTableFilterStore.getState().setExpandedRows({ [rowId]: true });
        }
      } else {
        // Si hay más de un resultado o ninguno, colapsar todas las filas
        useAssetsTableFilterStore.getState().collapseAllRows();
      }
    } else {
      // Si no hay serial number seleccionado, colapsar todas las filas
      // Solo si el cambio es desde un serial number a ninguno
      if (prevSelectedSerialNumberRef.current && prevSelectedSerialNumberRef.current.trim() !== "") {
        useAssetsTableFilterStore.getState().collapseAllRows();
      }
    }
    
    prevSelectedSerialNumberRef.current = selectedSerialNumber;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSerialNumber, filteredAssets]);

  return (
    <PageLayout>
      {isLoading && <BarLoader />}

      {!isLoading && assets && assets.length > 0 ? (
        <div className="flex flex-col h-full max-h-full">
          <div className="flex items-center mb-4 max-h-[50%]">
            <Button
              onClick={handleClearAllFiltersExtended}
              variant="secondary"
              size="small"
              className="mr-2 w-36"
            >
              Clear All Filters
            </Button>

            <TableStockActions />
          </div>

          {filteredAssets.length > 0 ? (
            <>
              <div className="flex-1 min-h-0">
                <DataTable
                  columns={columns}
                  data={paginatedAssets}
                  useFilterStore={useAssetsTableFilterStore}
                  rowHeight={56}
                  scrollContainerRef={tableContainerRef}
                  getRowCanExpand={getRowCanExpand}
                  renderSubComponent={renderSubComponent}
                  getRowId={getRowId}
                  adaptiveHeight={false}
                  enableSnapScroll={false}
                />
              </div>

              <div className="mt-2 pt-6">
                <PaginationAdvanced
                  pageIndex={pageIndex}
                  pageCount={totalPages}
                  setPageIndex={handlePageChange}
                  pageSize={pageSize}
                  setPageSize={handlePageSizeChange}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 justify-center items-center">
              <NoFilterResults />
            </div>
          )}
        </div>
      ) : !isLoading && assets && assets.length === 0 ? (
        <EmptyStock />
      ) : null}
    </PageLayout>
  );
}
