"use client";

import { useMemo } from "react";
import { Row } from "@tanstack/react-table";
import CreateAssetsTable from "../components/table/assets/CreateAssetTable";
import CreateMembersTable from "../components/table/members/CreateMemberTable";
import CreateTeamsTable from "../components/table/teams/CreateTeamTable";
import DeleteAssetsTable from "../components/table/assets/DeleteAssetTable";
import DeleteTeamsTable from "../components/table/teams/DeleteTeamTable";
import DeleteMembersTable from "../components/table/members/DeleteMemberTable";
import ActionAssetTable from "../components/table/assets/ActionAssetTable";
import ActionTeamsTable from "../components/table/teams/ActionTeamTable";
import OffboardingMembersTable from "../components/table/members/OffboardingMemberTable";
import UpdateTeamsTable from "../components/table/teams/UpdateTeamTable";
import UpdateMembersTable from "../components/table/members/UpdateMemberTable";
import UpdateAssetsTable from "../components/table/assets/UpdateAssetTable";
import UpdateShipmentsTable from "../components/table/shipments/UpdateShipmentsTable";
import CancelShipmentsTable from "../components/table/shipments/CancelShipmentsTable";
import ConsolidateShipmentsTable from "../components/table/shipments/ConsolidateShipmentsTable";
import CreateShipmentsTable from "../components/table/shipments/CreateShipmentsTable";
import UpdateOfficesTable from "../components/table/offices/UpdateOfficeTable";
import CreateOfficesTable from "../components/table/offices/CreateOfficeTable";
import DeleteOfficesTable from "../components/table/offices/DeleteOfficeTable";
import CreateQuotesTable from "../components/table/quotes/CreateQuotesTable";
import CancelQuotesTable from "../components/table/quotes/CancelQuotesTable";

export function useActivitySubtableLogic() {
  const getRowCanExpand = (row: Row<any>) => {
    return true;
  };

  const getRowId = (row: any) => {
    return row._id;
  };

  const renderSubComponent = (row: Row<any>) => {
    const { itemType, actionType, changes } = row.original;

    if (itemType === "assets") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateAssetsTable data={changes.newData || []} />;
      } else if (actionType === "delete") {
        return <DeleteAssetsTable data={changes.oldData || []} />;
      } else if (actionType === "update") {
        return (
          <UpdateAssetsTable data={changes || { oldData: [], newData: [] }} />
        );
      } else if (
        ["return", "reassign", "relocate", "assign"].includes(actionType)
      ) {
        return (
          <ActionAssetTable data={changes || { oldData: [], newData: [] }} />
        );
      }
    } else if (itemType === "members") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateMembersTable data={changes.newData || []} />;
      } else if (actionType === "delete") {
        return <DeleteMembersTable data={changes.oldData || []} />;
      } else if (actionType === "update") {
        return (
          <UpdateMembersTable data={changes || { oldData: [], newData: [] }} />
        );
      } else if (actionType === "offboarding") {
        return (
          <OffboardingMembersTable
            data={changes || { oldData: [], newData: [] }}
          />
        );
      }
    } else if (itemType === "teams") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateTeamsTable data={changes.newData || []} />;
      } else if (actionType === "bulk-delete" || actionType === "delete") {
        return <DeleteTeamsTable data={changes.oldData || []} />;
      } else if (actionType === "update") {
        return (
          <UpdateTeamsTable data={changes || { oldData: [], newData: [] }} />
        );
      } else if (["reassign", "assign", "unassign"].includes(actionType)) {
        return (
          <ActionTeamsTable data={changes || { oldData: [], newData: [] }} />
        );
      }
    } else if (itemType === "shipments") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateShipmentsTable data={changes.newData || []} />;
      } else if (actionType === "update") {
        return (
          <UpdateShipmentsTable
            data={changes || { oldData: [], newData: [] }}
          />
        );
      } else if (actionType === "cancel" || actionType === "delete") {
        return <CancelShipmentsTable data={changes.oldData || []} />;
      } else if (actionType === "consolidate") {
        return (
          <ConsolidateShipmentsTable
            data={changes || { oldData: [], newData: [] }}
          />
        );
      }
    } else if (itemType === "offices") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateOfficesTable data={changes.newData || []} />;
      } else if (actionType === "update") {
        return (
          <UpdateOfficesTable data={changes || { oldData: [], newData: [] }} />
        );
      } else if (actionType === "delete" || actionType === "bulk-delete") {
        return <DeleteOfficesTable data={changes.oldData || []} />;
      }
    } else if (itemType === "quotes") {
      if (actionType === "create" || actionType === "bulk-create") {
        return <CreateQuotesTable data={changes.newData || []} />;
      } else if (actionType === "cancel") {
        return (
          <CancelQuotesTable data={changes || { oldData: {}, newData: {} }} />
        );
      }
    }

    return null;
  };

  const handleClearSubtableFilters = () => {};

  return {
    getRowCanExpand,
    getRowId,
    renderSubComponent,
    handleClearSubtableFilters,
  };
}
